# [後端] `GET /auth/me` 必定 500 — `'User' object has no attribute 'is_suspended'`

**類型**：Bug
**優先度**：高（目前靠 `/auth/refresh` 的回傳矇混過去，隨時可能整個後台進不去）
**元件**：Backend
**回報**：ncchen
**相關**：`GET /auth/me`、`POST /auth/refresh`、`POST /api/user/login`、`docs/tickets/backend-member-flags-cleanup.md`

---

## 問題現象

```bash
curl https://api.taigiedu.com/backend/auth/me -H "Authorization: Bearer <access_token>"
```

```json
{"error":{"code":"INTERNAL_SERVER_ERROR",
          "details":null,
          "message":"取得使用者資訊失敗: 'User' object has no attribute 'is_suspended'",
          "trace_id":"97818398-d03b-4dea-b529-d1b440702e37"}}
```

HTTP 500。用有效且未過期的 token（`flags=3`）實測，必現。

後端的 User model 少了 `is_suspended` 欄位，但 `/auth/me` 的 serializer 已經在讀它 —— 看起來是「停用會員」功能的 migration 沒有跟著上。

---

## 為什麼這件事比看起來嚴重

`/auth/me` 是**每次登入、每次重新整理頁面都會呼叫**的：

- `AuthContext.login()`（`src/contexts/AuthContext.jsx:98`）
- `AuthContext` 初始化流程（`src/contexts/AuthContext.jsx:217`）

現在它一律失敗，前端會 fallback 去用 `/api/user/login` 或 `/auth/refresh` 回傳的 user 物件。而使用者的 `flags` 就是從那個物件來的（`src/config/permissions.js` 的 `getUserFlags`）。

**也就是說：整個後台的權限判斷，目前完全靠 `/auth/refresh` 有沒有記得帶 `flags`。** 一旦它哪次沒帶：

- `getUserFlags(user)` → `0`
- `isAdmin()` → `false`
- `AdminRoute`（`src/components/ProtectedRoute.jsx`）→ 把管理員直接踢回首頁

管理員會莫名其妙進不了後台，而且原因完全不會顯示在畫面上。這是個沒有安全網的單點。

⚠️ 注意 `flags` **不是**從 JWT payload 讀的（雖然 token 裡確實有 `"flags":3`），前端只認 user 物件上的欄位。

---

## 需要後端做的事

1. 補上 User model 的 `is_suspended` 欄位與對應 migration（連同 `suspend_at` / `suspend_reason`，權限設計文件裡是一組的）。
2. 確認 `/auth/me` 回 200，且 payload 含 `flags`、`isSuspended`。
3. 一併確認 `/api/user/login`、`/auth/refresh`、`/auth/me`、`/admin/member/list` **四支都有回 `flags`**（這點與 `backend-member-flags-cleanup.md` 是同一件事，目前 `/admin/member/list` 已知沒有回）。

---

## 驗收條件

- [ ] `GET /auth/me` 回 200
- [ ] 回傳含 `flags`（整數）與 `isSuspended`（布林）
- [ ] 上述四支 API 回傳的身分欄位一致
- [ ] 後台重新整理頁面後不會被踢回首頁
