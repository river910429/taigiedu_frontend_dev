# [BE] 新增前台「回報問題」端點 `POST /issue_report`

**Type:** Task
**Priority:** Medium
**Component:** Backend
**Reporter:** ncchen
**Assignee:** _(後端負責人)_
**Related:** Figma `PD 台語文 workshop - WF paper prototype 2025` node `2946-3629`、`src/components/ReportIssue/`、`docs/report_issue_api.md`

---

## 背景 (Background)

PM 提出的「回報問題」流程已依 Figma 完成前端，**目前 5 個前台頁面都已經上線可用**：
台語俗諺語、節慶飲食（飲食／節慶）、媒體與社群資源、認證考試。

使用者在頁面內容區最下方會看到「如有任何問題，請點此 **回報問題**」，點擊後跳出彈窗填寫，
內容包含問題類別（兩層）、問題名稱、問題描述與選填的圖片附件。

**目前唯一缺的就是後端端點。** 前端 `src/services/reportIssueService.js` 暫時走 mock
（只在 console 印出 payload 並回傳成功），後端上線後只要把 `.env` 的
`VITE_ENABLE_REPORT_ISSUE_MOCK` 設為 `false` 就會改打真實 API，**前端不需要改任何程式碼、不需要重新調整介面**。

> 完整的前端流程、欄位對照與範例 payload 已整理在 repo 的 `docs/report_issue_api.md`，
> 這張票是從後端角度整理「要做什麼、建議怎麼設計」。

---

## 需要後端做的事 (Scope)

### 1. 新增端點

```
POST {API_BASE}/issue_report
Content-Type: application/json
Authorization: Bearer <accessToken>   # 未登入時不帶
```

**⚠️ 請允許未登入者送出。** 這是給一般民眾回報內容錯誤用的，強制登入會大幅降低回報量；
若擔心濫用，請走下面第 4 點的防濫用機制，而不是擋登入。

#### Request body

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `page` | string | ✓ | 頁面代碼：`phrase` / `cultureFood` / `cultureFestival` / `socialmedia` / `exam` |
| `page_label` | string | ✓ | 使用者當下的功能名稱（＝彈窗標題後綴，如「台語俗諺語」） |
| `page_path` | string | ✓ | 前台完整路徑含 query string，例：`/socialmedia?category=社群` |
| `issue_type` | string | ✓ | `問題回報` 或 `其他` |
| `issue_category` | string | ✓ | 第二層細項；`issue_type` 為「其他」時**必為空字串** |
| `title` | string | ✓ | 問題名稱 |
| `description` | string | ✓ | 問題描述 |
| `attachment` | string | ✓ | 圖片路徑（前端先打 `POST /file_upload` 取得）；未上傳為空字串 |
| `username` | string | ✓ | 回報者；未登入為空字串 |
| `created_at` | string | ✓ | ISO 8601 字串（前端送出時間，僅供參考） |

範例：

```json
{
  "page": "phrase",
  "page_label": "台語俗諺語",
  "page_path": "/phrase",
  "issue_type": "問題回報",
  "issue_category": "文字 / 拼音標示錯誤",
  "title": "風的台羅拼音有誤",
  "description": "原本寫法是 hong，但在某某地區也有不同的讀音…",
  "attachment": "/uploads/9f2c1b….jpg",
  "username": "user123",
  "created_at": "2026-08-14T08:00:00.000Z"
}
```

#### Response

```json
{
  "success": true,
  "message": "已收到您的回報，感謝您的協助",
  "report_id": "1"
}
```

前端判定成功的條件是 `response.ok && (success === true || status === 'success')`；
失敗時會把 `message` 原字串顯示在 Toast 上，**請回可以直接給使用者看的中文訊息**。

驗收條件：
- [ ] 未登入也能成功送出，`username` 為空字串時不報錯。
- [ ] 已登入時，後端以 token 內的使用者為準寫入（不要信任 body 的 `username`，見第 3 點）。
- [ ] 回應格式如上，錯誤時 `message` 為可直接顯示的中文。

### 2. 資料表建議

```sql
CREATE TABLE issue_report (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  page           VARCHAR(32)  NOT NULL,   -- phrase / cultureFood / ...
  page_label     VARCHAR(64)  NOT NULL,   -- 台語俗諺語 / 飲食 / ...
  page_path      VARCHAR(255) NOT NULL,   -- /socialmedia?category=社群
  issue_type     VARCHAR(16)  NOT NULL,   -- 問題回報 / 其他
  issue_category VARCHAR(32)  NOT NULL DEFAULT '',
  title          VARCHAR(255) NOT NULL,
  description    TEXT         NOT NULL,
  attachment     VARCHAR(255) NOT NULL DEFAULT '',
  user_id        BIGINT       NULL,       -- 未登入為 NULL
  username       VARCHAR(64)  NOT NULL DEFAULT '',
  status         VARCHAR(16)  NOT NULL DEFAULT 'open',  -- open / in_progress / resolved / rejected
  created_at     DATETIME     NOT NULL,
  updated_at     DATETIME     NOT NULL,
  INDEX idx_page_created (page, created_at),
  INDEX idx_status (status)
);
```

設計說明：
- **`page_label` / `page_path` 要一起存，不要只存 `page`。** 這是 PM 在設計稿上特別標註的需求
  （「回報問題後面接上目前畫面的功能，一併傳給後台和工程師」）——工程師要能直接從紀錄知道
  使用者當時在哪一頁、開了什麼篩選條件，否則很多回報無法重現。
- `status` 現在前端用不到，但建議一開始就留，之後做後台管理才不用改表。
- `issue_category` 允許空字串（選「其他」時），不要設成 NOT NULL 又不給預設值。

驗收條件：
- [ ] 資料表建立完成，欄位涵蓋上表所有內容。
- [ ] `page_label`、`page_path` 確實有落地，不要在寫入時捨棄。

### 3. 驗證與資料清理

驗收條件：
- [ ] `page` 只接受白名單值（見上表 5 種），不在白名單一律 400。
- [ ] `issue_type` 只接受 `問題回報` / `其他`。
- [ ] `issue_type = 其他` 時，`issue_category` 強制清成空字串（不要信任前端）。
- [ ] `title` / `description` trim 後不可為空；建議上限 `title` 255 字、`description` 5000 字。
- [ ] `description` 原樣存字串即可，**不要**做 HTML 解析；後台顯示時請 escape，避免 XSS。
- [ ] `username` 不可信任：有帶 token 時以 token 的使用者為準覆寫，未登入時存空字串。
- [ ] `attachment` 只接受本站 `/file_upload` 回傳的路徑格式，拒絕外部 URL。

### 4. 防濫用 (Rate limiting)

因為開放未登入回報，請加上基本防護。建議做法（實際手段後端自行決定）：

- [ ] 同一 IP 每小時最多 N 筆（建議 N = 10），超過回 429 並帶中文 `message`。
- [ ] 完全相同的 `page` + `title` + `description` 在短時間內重複送出時視為重複，可直接回成功但不重複寫入。

### 5. 附件

沿用既有的 `POST /file_upload`，前端已經先上傳、再把回傳路徑放進 `attachment`。

驗收條件：
- [ ] 後端仍需驗證 `attachment` 檔案實際存在且為圖片（前端只擋 JPG／PNG 與 100MB，不能當作安全邊界）。

---

## 待確認 / 需要 PM 或後端拍板 (Open Questions)

1. **通知管道**：設計稿註記「一併傳給後台和工程師」。要不要在收到回報時寄 Email／發 Slack？
   如果要，通知對象是誰、要不要依 `page` 分流？（目前前端沒有做任何通知。）
2. **後台管理介面**：這張票只做「收下並存起來」。要不要另開一張票做後台列表／狀態流轉／指派？
   （若要做，前端會需要 `GET /admin/issue_report`＋`POST /admin/issue_report/status` 兩支，可另議。）
3. **`issue_category` 的來源**：目前選項寫死在前端 `src/components/ReportIssue/reportIssueConfig.js`。
   若後端希望改成由 API 提供分類表（方便日後不發版就能調整），請提出，前端只要換掉那支 config 的資料來源即可。
4. **是否要限制未登入**：目前設計是開放。若 PM 決定要求登入，前端需要多做一段「請先登入」的導流，請先告知。
5. **端點命名**：目前前端寫的是 `POST /issue_report`（與既有的 `/submit_tc_feedback`、`/file_upload`
   同層）。若後端希望改成 `/api/issue/report` 或掛在其他前綴下，直接說一聲，前端改一行常數即可。
   注意這**不是**既有的 `/api/resource/report`（那是教學資源的「檢舉」，情境與欄位都不同，請勿共用）。

---

## 不在本票範圍 (Out of Scope)

- 後台管理介面與相關 API（待第 2 點確認後另開票）。
- 前端 UI 調整（已依 Figma 完成並驗證）。
- 教學資源共享平台的「檢舉資源」`POST /api/resource/report`（既有功能，不受影響）。

---

## 參考 (References)

- 前端 API 規格與範例：`docs/report_issue_api.md`
- 前端元件：`src/components/ReportIssue/`（`ReportIssueLink` / `ReportIssueModal` / `reportIssueConfig`）
- 前端送出邏輯：`src/services/reportIssueService.js`
- 附件上傳：`src/services/uploadService.js` → `POST /file_upload`
- Figma：`PD 台語文 workshop - WF paper prototype 2025`，node `2946-3629`

## 預估 (Estimate)

1 人日（單一 POST 端點 + 資料表 + 驗證 + rate limit；不含通知與後台管理）。
