# [後端] `/admin/socialmedia/modify` 的 `action=3`（修改）必定 500 — NameError

**類型**：Bug
**優先度**：最高（後台「媒體與社群資源」完全無法編輯，功能等同壞掉）
**元件**：Backend
**回報**：ncchen
**相關**：`POST /admin/socialmedia/modify`、前台 `/socialmedia`、後台 `/admin/socialmedia`

---

## 問題現象

後台「媒體與社群資源」點編輯、改完按送出，一律失敗，前端只會跳「操作失敗: 更新失敗」。

實際打 API 確認（2026-08-14，測試帳號 `flags=3`）：**只要 `action="3"`，一律 HTTP 500，`error_type` 為 `NameError`。**

```bash
curl -X POST https://api.taigiedu.com/backend/admin/socialmedia/modify \
  -H "Authorization: Bearer <access_token>" \
  -H 'Content-Type: application/json' \
  -d '{"id":"759","action":"3","name":"測試","link":"https://ii.com","category":"工具","figure":"/app/uploads/a35...png"}'
```

回傳：

```json
{"error":{"code":"INTERNAL_SERVER_ERROR",
          "details":{"error_type":"NameError"},
          "message":"系統發生未預期的錯誤",
          "trace_id":"d5c3a534-e91d-491d-a3a9-f88d8616f756"}}
```

trace_id 樣本（每次都必現）：

| trace_id | 測試對象 |
|---|---|
| `33d9feeb-cac3-4070-bcc9-0fb75337d963` | id=762，帶原值的 no-op 編輯 |
| `d5c3a534-e91d-491d-a3a9-f88d8616f756` | id=759，帶原值的 no-op 編輯，`figure` 有值 |

---

## 定位：錯誤發生在參數驗證「之後」

同一支端點的其他分支都是好的，可以據此縮小範圍：

| 請求 | 結果 | 判讀 |
|---|---|---|
| `{"id":"99999999","action":"3", ...}` | `400 {"message":"Invalid ID"}` | id 檢查正常，且在 action 分支之前 |
| `{"id":"759","action":"3"}`（缺 name） | `400 {"message":"field: 'name' should not be empty"}` | 欄位驗證正常 |
| `{"id":"759","action":"3"}` + 完整合法欄位 | **500 NameError** | ← 壞在這裡 |
| `{"id":"99999999"}`（缺 action） | `500 KeyError` | 另一個小問題，見下方「附帶」 |

**結論**：`action=3` 通過驗證後、實際寫 DB 的那段程式碼引用了未定義的變數（Python `NameError`）。看起來這條路徑從未被執行成功過。

驗證過資料完全沒有被寫入：三次 500 前後各拉一次完整列表比對，760 筆、0 筆變動、0 筆新增。

---

## 需要後端做的事

1. 修掉 `action=3` 分支的 `NameError`（請直接看 server log 的 traceback，trace_id 如上）。
2. 補一個 `action=3` 的整合測試 —— 這條路徑目前顯然沒有任何測試覆蓋。
3. **附帶**：缺 `action` 欄位時應回 `400`（欄位驗證），目前是 `500 KeyError`。

---

## 驗收條件

- [ ] 帶完整欄位的 `action=3` 回 `200 {"success":true}`
- [ ] 重新 `GET /admin/socialmedia` 後，該筆的 `name` / `link` / `category` / `figure` 確實更新
- [ ] 缺 `action` 時回 400 而非 500
- [ ] 後台「媒體與社群資源」→ 編輯 → 送出，可以正常存檔
