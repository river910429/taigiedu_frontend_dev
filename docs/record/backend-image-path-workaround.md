# 後端圖片路徑不正確：前端修正紀錄

> **狀態**：前端已加上修正（workaround），後端尚未調整。
> **問題核心在後端**，前端僅為暫時性補救。待後端修正回傳格式後，可移除本文件所述的前端處理邏輯。
>
> 最後更新：2026-07-01

---

## 1. 問題摘要

後臺（`adminPage/`）在顯示圖片時，後端 API 回傳的圖片路徑**帶有容器內部檔案系統前綴 `/app`**，且透過新版 `/file_upload` 端點上傳的檔案還會出現**重複的 `uploads/` 片段**。

前端若直接把這些路徑接在 API base 後面，就會組出對外不存在的 URL，導致圖片顯示 **404 Not Found**。

- **前台（公開頁面）**可正常顯示：路徑已在該處被正規化。
- **後台（管理頁面）**無法顯示：`getFullImageUrl` 原本直接沿用後端回傳值。

---

## 2. 根本原因（後端）

後端把圖片的**實體儲存路徑**（含容器工作目錄 `/app`）直接寫進資料庫並回傳，而非回傳「對外可存取的 URL 相對路徑」。

觀察到的兩種回傳格式：

| 類型 | 後端回傳的 `image` / `figure` 值 | 說明 |
| --- | --- | --- |
| 既有靜態圖片 | `/app/static/exam/4.jpg` | 夾帶 `/app` 前綴 |
| 新上傳檔案 | `/app/uploads/uploads/<hash>.png` | 夾帶 `/app` 前綴 **且** `uploads/` 重複 |

> `uploads/` 重複的成因：`/file_upload` 回傳 `/uploads/<hash>.png`，前端原封不動存入 `figure`；後端儲存時又在前面加上自己的儲存根目錄 `/app/uploads`，變成 `/app/uploads` + `/uploads/<hash>.png` = `/app/uploads/uploads/<hash>.png`。

### 對外實際服務位置（以 curl 實測，2026-07-01）

以 base URL `https://api.taigiedu.com` 實測：

| 後端回傳值 | ❌ 直接接 base（會 404） | ✅ 對外正確 URL（200） |
| --- | --- | --- |
| `/app/static/exam/4.jpg` | `…/backend/app/static/exam/4.jpg` | `…/backend/static/exam/4.jpg` |
| `/app/uploads/uploads/<hash>.png` | `…/backend/app/uploads/uploads/<hash>.png` | `…/backend/uploads/<hash>.png` |

實測補充：`…/static/exam/4.jpg`、`…/backend/static/exam/4.jpg`、`…/uploads/<hash>.png`、`…/backend/uploads/<hash>.png` 皆回傳 200；只要帶上 `/app` 前綴或重複的 `uploads/` 就會 404。

---

## 3. 前端修正（workaround）

集中在共用函式 [`resolveFileUrl`](../../src/services/uploadService.js)（`src/services/uploadService.js`），在把路徑接上 API base 之前先做正規化：

1. `http(s):` / `data:` / `blob:` 開頭：視為完整位址，直接回傳。
2. 路徑含 `uploads/`：只保留**最後一段** `uploads/` 之後的內容
   （`app/uploads/uploads/x.png` → `uploads/x.png`）。
3. 否則若以 `app/` 開頭：去掉開頭的 `app/`
   （`app/static/exam/4.jpg` → `static/exam/4.jpg`）。
4. 最後與 `API_BASE_URL` 組合成最終 URL。

各後臺頁面的 `getFullImageUrl` 皆呼叫此共用函式，因此一處修正即同時涵蓋所有頁面。

### 正規化對照（皆為實測 200 的 URL）

| 輸入（後端回傳值） | 輸出（dev, base=`/backend`） |
| --- | --- |
| `/app/static/exam/4.jpg` | `/backend/static/exam/4.jpg` |
| `/app/uploads/uploads/<hash>.png` | `/backend/uploads/<hash>.png` |
| `/uploads/<hash>.png` | `/backend/uploads/<hash>.png` |
| `/app/static/food/x.jpg` | `/backend/static/food/x.jpg` |
| `https://…/uploads/x.png` | （原樣回傳） |

---

## 4. 影響範圍

共用修正函式：

- `src/services/uploadService.js` — `resolveFileUrl()`

透過 `getFullImageUrl()` 使用該函式的後臺頁面：

- `src/adminPage/adminContent/adminHome/adminFoodPage.jsx`（飲食）
- `src/adminPage/adminContent/adminHome/adminFestivalPage.jsx`（節慶）
- `src/adminPage/adminContent/adminHome/examPage/adminExamInfo.jsx`（推薦用書／教育頻道／認證類型）
- `src/adminPage/adminContent/adminHome/adminSocialmediaPage.jsx`（媒體與社群資源）

---

## 5. 後端理想上應如何修正（本次未做）

待後端有空調整時，建議擇一：

1. **回傳對外相對路徑**：儲存與回傳時去除容器前綴 `/app`，例如回傳 `static/exam/4.jpg`、`uploads/<hash>.png`。
2. **不要對已是 `/uploads/...` 的值再次前綴**：避免 `uploads/uploads/` 重複。
3. **統一回傳完整可存取 URL**，讓前端不需拼接。

後端修正並上線後，前端可簡化 `resolveFileUrl`（移除去 `app/` 前綴與去重複 `uploads/` 的處理），僅保留單純的 base 拼接。

---

## 6. 已知的髒資料

`認證類型` 清單中的 id=41 記錄：

```
"image": "/app/uploads/data:image/png;base64,iVBORw0KGgo..."
```

這是舊版 Base64 上傳流程殘留的損壞資料（Base64 內容被當成檔名接在 `/app/uploads/` 後）。該筆資料 `status` 為 `deleted`，本身不會顯示，因此**未特別處理**。若日後需要清理，屬後端／資料庫層面的工作。
