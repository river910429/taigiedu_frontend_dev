# 「回報問題」後端 API 需求規格 (Report Issue API)

前台的「回報問題」功能已依 Figma（PD 台語文 workshop － WF paper prototype 2025，
node `2946-3629`）完成，但**後端端點尚未實作**。本文件說明前台會送出的內容與期望的回應格式。

目前前台預設走 mock：`src/services/reportIssueService.js` 只在 console 印出 payload 並回傳成功。
後端完成後，把 `.env` 的 `VITE_ENABLE_REPORT_ISSUE_MOCK` 設為 `false` 即改打真實 API，元件不需修改。

---

## 1. 前台流程摘要

1. 使用者在頁面內容區最下方看到「如有任何問題，請點此 **回報問題**」。
2. 點擊後跳出彈窗，標題為「回報問題 - {當下的功能名稱}」（例：回報問題 - 台語俗諺語）。
3. 表單欄位：
   - **問題類別**（必填，第一層）：`問題回報` / `其他`
   - **問題細項**（第二層）：**只有選「問題回報」時才出現**，選項依頁面而異（見下表）
   - **問題名稱**（必填）
   - **問題描述**（必填）
   - **上傳檔案**（非必填）：僅限 JPG／PNG，上限 100MB
4. 送出後按鈕變成「已送出!」，約 1.2 秒後關閉彈窗。

### 各頁面的第二層選項

| 頁面 | `page` | `page_label` | 第二層選項 |
| --- | --- | --- | --- |
| 台語俗諺語 | `phrase` | 台語俗諺語 | 文字 / 拼音標示錯誤、解讀錯誤、其它 |
| 節慶飲食－飲食 | `cultureFood` | 飲食 | 文字 / 拼音標示錯誤、釋義錯誤、其它 |
| 節慶飲食－節慶 | `cultureFestival` | 節慶 | 文字 / 拼音標示錯誤、釋義錯誤、其它 |
| 媒體與社群資源 | `socialmedia` | 媒體與社群資源 | 連結名稱有誤、分類有誤、外部連結失效、外部連結網址有誤、其它 |
| 認證考試 | `exam` | 認證考試 | 連結名稱有誤、分類有誤、外部連結失效、外部連結網址有誤、其它 |

> 對照表定義在 `src/components/ReportIssue/reportIssueConfig.js`，日後新增頁面只要加一筆設定。
> 若後端要把選項改成由 API 提供，這份 config 就是替換點。

---

## 2. 端點

```
POST {API_BASE}/issue_report
Content-Type: application/json
Authorization: Bearer <accessToken>   # 未登入時不帶，仍應允許送出
```

### Request body

| 欄位 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `page` | string | ✓ | 頁面代碼，見上表 |
| `page_label` | string | ✓ | 使用者當下的功能名稱（即彈窗標題後綴） |
| `page_path` | string | ✓ | 前台完整路徑含 query string，例：`/socialmedia?category=社群` |
| `issue_type` | string | ✓ | `問題回報` 或 `其他` |
| `issue_category` | string | ✓ | 第二層細項；`issue_type` 為「其他」時是空字串 |
| `title` | string | ✓ | 問題名稱 |
| `description` | string | ✓ | 問題描述 |
| `attachment` | string | ✓ | 附件路徑（先呼叫 `POST /file_upload` 取得），未上傳時為空字串 |
| `username` | string | ✓ | 回報者；未登入為空字串 |
| `created_at` | string | ✓ | ISO 8601 時間字串 |

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

### Response

```json
{
  "success": true,
  "message": "已收到您的回報，感謝您的協助",
  "report_id": "1"
}
```

前台判定成功的條件是 `response.ok && (success === true || status === 'success')`；
失敗時會把 `message` 直接顯示在 Toast 上。

---

## 3. 附件上傳

沿用既有的 `POST /file_upload`（`src/services/uploadService.js` 的 `uploadFile()`），
上傳成功後把回傳的檔名／路徑放進 `attachment` 一起送出。前台已擋掉非 JPG／PNG 與超過 100MB 的檔案，
後端仍請自行驗證。

---

## 4. 待確認事項

- 是否需要後台管理介面（列表／狀態／指派）？目前只做前台送出。
- 是否需要限制未登入者回報（例如加上 captcha 或頻率限制）？現行設計未登入也能送。
- `issue_category` 的選項要留在前端 config，還是改由後端提供分類表？
- Figma 中「媒體與社群資源」那張圖的上傳提示寫成 PDF／PPT／DOC，與流程圖註記「上傳檔案格式只有圖片檔」
  衝突；前台目前一律以註記為準只收圖片，若 PM 另有決定需同步調整。
