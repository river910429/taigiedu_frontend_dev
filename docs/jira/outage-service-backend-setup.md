# [BE] 後台串接停電 / 維護公告微服務 (outage-service)

**Type:** Task
**Priority:** High
**Component:** Backend
**Reporter:** ncchen
**Assignee:** _(後端負責人)_
**Related:** `outage-service/`、`src/components/ServiceSuspensionNotice/`

---

## 背景 (Background)

為了讓「停電 / 維護公告」(`ServiceSuspensionNotice`) 在主後端不可用時仍能動態顯示，前端已建置一個獨立於主後端的 Firebase Functions 微服務 `outage-service`，並完成以下工作：

- ✅ Firebase Functions / Firestore 微服務已部署完成並可正常使用。
- ✅ 前端已改用 Firebase Web SDK 直接讀取 Firestore (`system/outage`)，與主後端解耦，已完成測試。
- ✅ 寫入端點 (`POST` / `DELETE /announcement`) 已上線，透過 `X-API-Key` 驗證。

**目前只剩下後端需要協助的部分：在 Admin 後台新增 3 支 API，將請求轉發到 `outage-service`，讓超級使用者可以在後台上下架公告。**

---

## 需要後端做的事 (Scope)

### 1. 新增三支後台 API

| Method | Path                | 權限              | 說明                |
|--------|---------------------|-------------------|---------------------|
| GET    | `/api/admin/outage` | super user only   | 取得目前公告狀態     |
| POST   | `/api/admin/outage` | super user only   | 上架 / 更新公告      |
| DELETE | `/api/admin/outage` | super user only   | 下架公告             |

驗收條件：
- [ ] 僅 super user 通過，其他 role 一律 403。
- [ ] Request body schema 與微服務一致：`mode`、`title`、`content`、`startAt`、`endAt`、`active`，並做基本驗證（時間格式、`endAt > startAt`、字串長度上限）。
- [ ] 將 `updatedBy` 自動補上 `admin:<uid>` 後再轉發。

### 2. 串接 outage-service

微服務 endpoint（已部署完成、可直接呼叫）：

```
https://outage-zwhovrzroa-de.a.run.app/announcement
```

驗收條件：
- [ ] 對上述網址發出 `GET` / `POST` / `DELETE` 請求。
- [ ] 標頭包含：
  - `Content-Type: application/json`
  - `X-API-Key: <OUTAGE_API_KEY>`
- [ ] 處理失敗情境（timeout、4xx / 5xx）並回傳合理錯誤給前端，同時記錄 log。

### 3. API Key 管理

本次串接使用的 `X-API-Key`：

```
taigiedu-w3OLSrpzyHMEoWwwj80T4V3PaYBY1VUK
```

> 此 Key 直接寫在 Jira 是因為這份票卷僅限內部存取，安全性無虞；但 **不可** 出現在前端 bundle、public repo 或 client log 中。

驗收條件：
- [ ] 將上述 Key 設定為環境變數 `OUTAGE_API_KEY`（或既有的 Secret Manager 機制），**禁止 hardcode 進 repo**。
- [ ] 後端程式統一從環境變數讀取，不要在多處複製。
- [ ] 若日後需要 rotation：由前端負責人在 `outage-service` 重新部署新 Key，再請後端同步更新環境變數。

### 4. 測試

- [ ] 單元 / 整合測試：super user 可寫入；一般使用者被擋下。
- [ ] 手動驗證：在 staging 用後台 POST 一則 preview 公告 → 前端 `ServiceSuspensionNotice` 正常顯示。
- [ ] 手動驗證：DELETE 後前端公告消失。
- [ ] 故障演練：把主後端關掉，確認前端仍能讀到公告（這正是這個微服務的核心價值）。

---

## 前端對接現況 (FYI)

前端 `ServiceSuspensionNotice` 已經改成直接以 Firebase Web SDK 讀取 `system/outage`：

- 使用獨立 Firebase App (`src/config/firebaseOutage.js`)，透過 `VITE_OUTAGE_FIREBASE_*` 環境變數連到 `taigiedu-outage` 專案。
- 訂閱 `system/outage` 文件變動 (`onSnapshot`)，公告上下架後使用者重新整理即可看到最新狀態。
- 顯示邏輯：
  1. `active=false` 或無文件 → 不顯示。
  2. 公告 `startAt` 的前 7 天起開始顯示。
  3. 使用者關閉後寫入 `localStorage` (key=`ssn_dismissed_v2`)，同一則公告不再顯示。
  4. 例外：距離 `endAt` 不到 1 天時再次彈出提醒。
  5. `mode=blocking` 且目前處於 `[startAt, endAt]` 區間時，無法關閉。

**也就是說：後端只要寫入 Firestore（透過 admin endpoint 轉發到微服務），前端零發版即可生效。**

---

## 不在本票範圍 (Out of Scope)

- 微服務本身的部署 / 維護（已完成，由前端 owner 維護）。
- 多筆公告 / 排程公告 / 多語系（目前單一文件 `system/outage` 已足夠）。
- 前端公告 Modal 的 UI 樣式調整。

---

## 參考 (References)

- 微服務 endpoint：`https://outage-zwhovrzroa-de.a.run.app/announcement`
- Repo: `outage-service/`
  - `outage-service/index.js`：HTTP Function 實作。
  - `outage-service/firestore.rules`：Firestore 安全規則。
  - `outage-service/README.md`：完整 API 文件與 request/response 規格。
- 前端使用點：`src/components/ServiceSuspensionNotice/ServiceSuspensionNotice.jsx`

## 預估 (Estimate)

0.5 人日（單純 proxy 三支 API + 權限檢查 + 環境變數設定）。
