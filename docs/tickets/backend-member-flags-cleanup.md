# [後端] 權限全面改用 flags，清掉殘留的 role / SUPER_ADMIN 舊資料

**類型**：Bug / 技術債清理
**優先度**：高（前端已完成 flags 改版，目前靠 fallback 硬撐）
**相關**：Taigie-180（flags 定義）、`POST /admin/member/flags`

---

## 背景

前端後台已全面改用 bitmask flags 判斷權限：

| flags | 身分 | 權限 |
|---|---|---|
| 0 | 會員 | 無後台權限 |
| 1 | 內容管理員 CONTENT_MANAGER | 新增／修改／刪除內容、管理會員上傳資格 |
| 2 | 系統管理員 SYSTEM_MANAGER | 公告管理、權限管理、系統設定、升級管理員 |
| 3 | 兩者皆是 | 以上全部 |

但實測後發現後端各支 API 回傳的身分資訊**彼此不一致**，而且還混著舊的 role 字串。

---

## 問題現象（2026-07-27 直接打 API 實測，測試帳號 id 52 / 53）

### 1. `GET /admin/member/list` 完全沒有 `flags`

實際回傳（119 筆，欄位聯集只有這 8 個）：

```json
{
  "dept": "成大",
  "email": "ncchen99@blondmail.com",
  "id": "52",
  "name": "帥氣的測試員",
  "reason": "[{\"type\": \"備課\"}, {\"type\": \"自學\"}]",
  "role": "ADMIN",          // ← 只有舊的 role 字串
  "status": "管理員",        // ← 另一套中文身分字串
  "timestamp": "2026-01-31 14:59:35"
}
```

這是**最要命的一支**：後台會員管理頁完全靠這支渲染，但它沒有 flags，前端只能用 `role` 反推
（`SUPER_ADMIN → 3`、`ADMIN → 1`）。而舊 role **沒有任何值對應 flags = 2**，
所以帳號 52 實際是 flags = 2（系統管理員），在會員列表上卻只能顯示成「內容管理員」。
**只要 flags 沒進到這支 API，後台就永遠分不出「系統管理員」和「內容管理員」。**

### 2. `role` / `status` 沒有跟著 flags 走

用 `POST /admin/member/flags` 把帳號 52 從 flags=2 改成 1、再改回 2，
`/admin/member/list` 回傳的 `role` 一直都是 `"ADMIN"`、`status` 一直都是 `"管理員"`，沒有任何變化。

代表 flags 和 role/status 是**兩套各自獨立儲存的資料**，已經開始不同步。
請擇一為 source of truth（建議 flags），另一套移除或改成由 flags 推導。

### 3. `SUPER_ADMIN` / 「超級管理員」仍然存在

`status` 的實際分布：`會員 111`、`超級管理員 3`、`管理員 3`、`被停用 2`
`role` 的實際分布：`MEMBER 111`、`SUPER_ADMIN 3`、`ADMIN 3`、`SUSPENDED 2`

`SUPER_ADMIN` 在 flags 模型裡已經不存在（應該是 flags = 3），請一併移除。

### 4. 兩支 API 的欄位名稱不一致

| 意義 | `GET /auth/me` | `GET /admin/member/list` |
|---|---|---|
| 服務單位 | `organization` | `dept` |
| 職稱／使用動機 | `profession` | `reason` |
| 帳號狀態 | （無） | `status` |
| 建立時間 | （無） | `timestamp` |
| flags | ✅ 有 | ❌ **沒有** |

`/auth/me` 現在會回 `flags` 了（實測 `{"email":"...","flags":2,"id":52,"role":"ADMIN","organization":"成大","profession":"測試工程師"}`），
但欄位名跟 list 對不起來，同一個使用者在兩支 API 長得完全不一樣。

### 5. 停用相關欄位缺漏

前端「停用會員名單」要顯示**停用理由**與**停用時間**，但 list 沒有回對應欄位
（沒有 `archivedReason` / `archivedAt` 之類），畫面上這兩欄永遠是空的。

---

## 希望的修正方向

1. **所有回傳使用者身分的 API 一律帶 `flags`（整數）**：
   - `POST /api/user/login` ✅ 已有
   - `POST /auth/refresh` ✅ 已有
   - `GET /auth/me` ✅ 已有
   - `GET /admin/member/list` ❌ **目前缺，最優先**（每一筆會員都要有）
2. **移除 `role` 欄位與 `SUPER_ADMIN` 這個角色概念**（或至少標記為 deprecated 並保證與 flags 同步）。DB 裡若還有 `role` 欄位，建議做一次 migration：
   - `MEMBER` → `flags = 0`
   - `ADMIN` → `flags = 1`
   - `SUPER_ADMIN` → `flags = 3`
   之後權限判斷全部改讀 flags。
3. **統一欄位命名**：`/admin/member/list`（`dept`／`reason`）與 `/auth/me`（`organization`／`profession`）請取一致的名稱（前端目前吃 `dept`、`reason`）。
   另外 list 請補上停用理由與停用時間欄位，「停用會員名單」才顯示得出來。
4. **`status`（會員／管理員／停用）與 `flags` 的職責請切開**：
   - `flags` = 後台權限
   - `status` = 帳號啟用狀態（正常／停用）
   目前 `status: "管理員"` 同時混了權限資訊，flags 上線後會重複且可能互相矛盾。
5. **後端要自己擋權限，不能只靠前端**。前端已依權限表隱藏 UI，但 API 仍需驗證：
   - `POST /admin/member/flags` → 需 SYSTEM_MANAGER（flags & 2）
   - `POST /admin/member/status`（停用／恢復會員）→ 需 CONTENT_MANAGER（flags & 1）
   - 內容類 API（`/admin/main-search/*`、`/admin/culture/*`、`/admin/socialmedia/*`、`/admin/resource/*`、`/admin/exam/*` 的 add / modify / change）→ 需 CONTENT_MANAGER
   - 公告相關（Popup 公告）→ 需 SYSTEM_MANAGER

---

## 驗收方式

準備三個測試帳號：flags = 1、flags = 2、flags = 3，然後確認：

- [ ] `/auth/me`、`/auth/refresh`、`/api/user/login`、`/admin/member/list` 四支的 `flags` 值一致且正確
- [ ] 回傳中不再出現 `role` / `SUPER_ADMIN`（或與 flags 保證同步）
- [ ] flags = 2 的帳號呼叫內容類 add/modify API 會被擋（403）
- [ ] flags = 1 的帳號呼叫 `/admin/member/flags` 會被擋（403）
- [ ] `/admin/member/list` 的欄位名稱與 `/auth/me` 一致

---

## 前端現況（給後端參考）

- 權限判斷集中在 `src/config/permissions.js`；`getUserFlags(user)` 會優先讀 `user.flags`，讀不到才 fallback 到 `legacyRoleToFlags(user.role)`。
- 登入本人的權限（Header 身分標籤、側邊欄、各頁編輯權限）走 `/auth/me` 的 flags，**已實測正確**：
  flags=2 只能檢視內容 + 可進公告管理；flags=1 可編輯內容 + 看不到公告管理；flags=3 兩者皆可。
- **會員列表**因為 list 沒有 flags，只能用 role 推導，所以列表的「身份」欄目前分不出系統管理員（flags=2 會被顯示成內容管理員）。
  這是目前唯一還對不上權限表的地方，等這支 API 補上 flags 就會自動正確。
- 前端已相容 `status` 的實際值（`被停用`、`超級管理員`），但仍建議後端統一用 flags + 布林的停用狀態，不要用中文字串當身分判斷依據。
