# 專案架構與頁面導覽指南 (Project Architecture & Page Guide)

這份文件旨在幫助 AI 或新加入的開發者快速掌握 `taiwaneseOMG` 專案的前端架構、目錄結構以及各個頁面的功能與路由連接方式。
在開始工作前閱讀此文件，將大幅減少熟悉專案所需的時間。

## 1. 專案技術棧 (Tech Stack)
- **核心框架**: React (使用 Vite 構建)
- **路由管理**: `react-router-dom` (BrowserRouter)
- **資料表格**: `@tanstack/react-table`（後台管理表格，如公告管理頁的 `AdminDataTable` 元件）。
- **狀態與上下文**:
  - `AuthContext` (`AuthProvider`): 處理使用者登入與權限狀態（搭配 `services/authService.js` 的 JWT Token 管理與自動刷新）。
  - `ToastProvider`: 全局提示訊息管理。
- **即時資料**: Firebase Firestore（透過 `config/firebaseOutage.js` 連線，用於停機/維護公告的即時同步）。
- **樣式**: Vanilla CSS（全局與模組化樣式結合，如 `global.css` 與各元件的 `.css` 檔）。

## 2. 核心版面結構 (Layout Structure)
應用程式由 `AppLayout` 進行組裝（位於 `src/App.jsx`），負責決定在不同路由下應該顯示哪些佈局元素：
- **`OutageTopBanner`**: 全站頂部停機/維護橫幅，會動態同步高度至 CSS 變數供版面調整。
- **`ServiceSuspensionNotice`**: 全站服務暫停公告元件（`components/Announcement/`），用於顯示停機或維護通知。
- **`GeneralAnnouncementModal`**: 一般公告彈窗（`components/Announcement/`），於前台顯示管理員發布的一般公告。
- **`Header`**: 頂部導覽列，包含漢堡選單（可觸發側邊欄）。
- **`Sidebar`**: 主網站的側邊導覽列（在特定頁面如管理後台會隱藏）。
- **`AdminSidebar`**: 專為 `/admin` 網址下的管理員後台顯示的側邊欄。
- **`MainContent`**: 各網頁內容的主要渲染區域，並處理了一些全屏展示（如 `isPreviewPage`）的預覽邏輯。
- **`Footer`**: 網頁最底部的頁腳。

## 3. 主要路由與頁面功能說明 (Routes & Pages)

專案路由主要分為三大類：**公開頁面 (Public Pages)**、**會員/保護頁面 (Protected Pages)** 以及 **管理員後台 (Admin Pages)**。

### 3.1. 公開頁面 (Public)
不需登入即可瀏覽的使用者前台頁面。對應的資料夾多位於 `src/` 根目錄或各自的功能資料夾中：

- **首頁 (`/`)**: 由預設的 `MainContent` 驅動，可能展示最新消息或是網站功能入口。
- **搜尋 (`/search`)**: `mainSearchPage/MainSearchPage.jsx`，提供站內的各類資源與資料搜尋。
- **拼音/文字 (`/transcript`)**: `transcriptPage/TranscriptPage.jsx`。
- **單字/語句 (`/phrase`)**: `phrasePage/PhrasePage.jsx`。
- **閱讀 (`/read`)**: `readPage/ReadPage.jsx`，提供閩南語文章或相關文本的閱讀模組。
- **翻譯 (`/translate`)**: `translatePage/TranslatePage.jsx`，可能是提供中台翻譯功能的工具。
- **教學資源 (`/resource`)**: `resourcePage/ResourcePage.jsx`，讓使用者尋找、下載教學檔案。內含 `/file-preview` 與 `/download` 分支功能。
- **主題融入資源 (`/featured-resource/topic-integration`)**: `featuredResourcePage/TopicIntegrationPage`。
- **名人堂/台語人物 (`/celebrity`, `/celebrity/detail`)**: `celebrity/CelebrityPage.jsx` 與 `CelebrityDetails.jsx`，展示推廣台語或相關文化的人物介紹。
- **文化介紹 (`/culture/food`, `/culture/festival`)**: 介紹台灣在地美食 (`CultureFood`) 與節慶 (`CultureFestival`)。
- **社群媒體/影音 (`/socialmedia`)**: `socialmediaPage/SocialmediaPage`，整合外部平台（如 YouTube/Podcast）的影音資源。
- **認證考試 (`/exam`)**: `examPage/ExamPage`，提供台語認證的相關資訊。
- **親屬關係計算機 (`/relative-calculator`)**: `relativeCalculatorPage/RelativeCalculatorPage.jsx`，提供親屬稱謂查詢與計算功能。
- **驗證登入 (`/login`, `/register`)**: 使用者登入註冊頁面 (`resourcePage/` 目錄內，`LoginPage.jsx` / `RegisterPage.jsx`)。
- **其他靜態頁面**:
  - `/terms` (服務條款，`TermsPage.jsx`)
  - `/policy` (隱私權政策，`PolicyPage.jsx`)
  - `/team` (團隊介紹，`TeamPage.jsx`)

### 3.2. 會員/保護頁面 (Protected - requireAuth)
需要一般會員登入才能操作的路由（透過 `ProtectedRoute` 封裝）：
- **`/upload-resource`**: `UploadResource.jsx`，允許使用者上傳教學資源。
- **`/delete-resource`**: `DeleteResource.jsx`，資源管理邏輯。

### 3.3. 管理員後台頁面 (Admin - AdminRoute)
需具備管理員權限，所有路由以 `/admin` 開頭，主要集中在 `src/adminPage/` 資料夾下，並有獨立的 `AdminSidebar` 導覽系統（選單定義於 `adminSidebar.jsx`）。各頁面元件多位於 `adminPage/adminContent/adminHome/`。主要功能為**網站內容建置與管理**：

- **首頁面板 (`/admin`)**: `adminMain.jsx`。
- **主頁搜尋管理**:
  - 考試資訊 (`/admin/main-search/test`): `adminTestPage.jsx`。
  - 活動快訊 (`/admin/main-search/news`): `adminNewsPage.jsx`。
- **節慶飲食管理 (`/admin/culture/food`, `/admin/culture/festival`)**: `adminFoodPage.jsx` / `adminFestivalPage.jsx`。
- **認證考試管理 (`/admin/exam/info`)**: `examPage/adminExamInfo.jsx`，編輯考試基本資訊。
  - 註：`examPage/` 下另有 `adminExamBooks.jsx`、`adminExamChannels.jsx`，但目前尚未在 `App.jsx` 中掛載路由。
- **媒體與社群資源管理 (`/admin/socialmedia`)**: `adminSocialmediaPage.jsx`，編輯與新增推薦的影音/Podcast連結。
- **教學資源平台管理**:
  - 審核/上傳資源 (`/admin/resource`, `/admin/resource/upload`): `adminresourcePage/AdminResourcePage.jsx`。
  - 編輯課本選單/首圖 (`/admin/resource/header`): `adminresourcePage/ResourceHeaderPage.jsx`。
- **會員管理 (`/admin/member`)**: `adminMemberPage.jsx`，管理網站後台/前台會員權限。
- **檔案預覽 (`/admin/file-preview`)**: 後台專屬預覽介面，`adminresourcePage/AdminFilePreview.jsx`。
- **公告管理 (`/admin/announcement`)**: `adminAnnouncementPage.jsx`，管理一般公告與停機公告（含上架/排程/下架狀態）。
  - ⚠️ **目前此頁仍使用內建 `MOCK_DATA` 假資料，尚未串接後端 API**；新增/編輯/刪除僅更新本地 state，重整即重置。

## 4. 專案目錄結構 (Directory Structure)
主要開發均在 `src/` 下，採用**按功能或模組(Feature-based)**來劃分資料夾，而不是單純依類型（components, views）劃分：
```text
src/
 ├── adminPage/          # 所有後台管理的介面與邏輯元件
 │    ├── adminMain.jsx        # 後台首頁面板
 │    ├── adminSidebar.jsx     # 後台側邊欄選單定義
 │    └── adminContent/adminHome/  # 各後台管理頁（公告、會員、資源、考試、節慶飲食…）
 ├── assets/             # 靜態圖片、圖示資源
 ├── components/         # 共用 UI 元件，重要子目錄：
 │    ├── Announcement/        # 前台公告：ServiceSuspensionNotice、GeneralAnnouncementModal
 │    ├── OutageTopBanner/     # 全站停機頂部橫幅
 │    ├── AdminDataTable/      # 後台資料表格（tanstack table 封裝）
 │    ├── AdminModal/          # 後台彈窗
 │    ├── DatePicker/          # 日期選擇器
 │    ├── DragConfirmButton/   # 拖曳確認按鈕
 │    ├── HorizontalScrollRow/ # 水平捲動列
 │    ├── UnifiedModal/        # 通用 Modal
 │    ├── ProtectedRoute.jsx   # 路由守衛（含 AdminRoute）
 │    └── Toast.jsx            # 全局提示
 ├── config/             # 環境/全域設置：index.js、permissions.js、firebaseOutage.js
 ├── contexts/           # React Context (AuthContext.jsx)
 ├── services/           # 後端串接：authService.js（JWT）、outageService.js（Firestore 停機公告）、featuredResourceMockApi.js
 ├── shared/             # 跨元件共用狀態，如 resourceStore.js
 ├── relativeCalculatorPage/ # 親屬關係計算機頁面與樣式
 ├── styles/             # 全局樣式 (`global.css`)
 └── [各功能資料夾]/       # 如 readPage, resourcePage, culture, examPage 等，各自包含 JSX 與專屬 CSS 樣式
```

## 5. 公告與停機系統 (Announcement & Outage System)
本專案的公告功能橫跨前後台，串接方式不一致，接手時請特別留意：
- **停機/維護公告（前台顯示）**: 透過 `services/outageService.js` 訂閱 Firebase Firestore (`config/firebaseOutage.js`) 即時資料，由 `OutageTopBanner` 與 `ServiceSuspensionNotice` 呈現。
- **一般公告（前台顯示）**: 由 `components/Announcement/GeneralAnnouncementModal.jsx` 呈現。
- **公告管理（後台）**: `adminAnnouncementPage.jsx` 目前為 **mock 階段**，尚未與上述前台資料來源（Firestore/API）打通。若要正式上線，需在 `services/` 新增公告 API 模組並替換頁內的 `MOCK_DATA` 與本地 state 操作。

## 6. 常見工作流程建議 (Workflow Tips)
- **新增公開頁面**: 在 `src/` 下建立對應的資料夾與元件，於 `App.jsx` 引入並添加 `<Route>`，並視情況更新 `Sidebar.jsx` 的選單路徑。
- **新增後台管理項目**: 於 `src/adminPage/adminContent/adminHome/` 建立管理面板，在 `App.jsx` 使用 `<AdminRoute>` 添加路由，最後更新 `adminSidebar.jsx` 的選單陣列。
- **API 串接**: 若要讀取或更新資料，請先檢視 `src/services/` 下是否已有相關模組（多透過 `authService.js` 的 `authenticatedFetch` 帶 Token 發送請求），並注意在元件中妥善處理 loading／error 等異步狀態。部分頁面（如公告管理）仍為 mock，串接時需自行補上 service 層。
