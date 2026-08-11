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
- **主題融入資源 (`/topic-integration`)**: `featuredResourcePage/TopicIntegrationPage`。
- **台語地名與文化 (`/placename-culture`)**: `placenameCulturePage/PlacenameCulturePage.jsx`，臺南市 37 個行政區的地名由來與台語發音。
  - 兩層導覽以 query string 切換：無參數為臺南全圖（滑過行政區看簡介），`?district=安平區` 為單一行政區的完整介紹。
  - 地圖為 SVG，路徑資料在 `placenameCulturePage/tainanMapData.js`（自 Figma 設計稿匯出後轉檔，勿手改），由 `TainanMap.jsx` 依 `full` / `mini` / `single` 三種形態渲染。
  - ⚠️ **內容目前來自 `services/placenameCultureMockApi.js` 假資料**；上方三個下拉選單為未來擴增其他縣市地圖保留，現階段僅開放臺南市。
  - 由 `VITE_ENABLE_PLACENAME_CULTURE_FEATURE` 控制側邊欄與路由是否顯示。
  - 後端 API 設計說明見 `docs/placename_culture_api.md`，草稿規格見 `docs/openapi/placename-culture.draft.openapi.json`。
- **名人堂/台語人物 (`/celebrity`, `/celebrity/detail`)**: `celebrity/CelebrityPage.jsx` 與 `CelebrityDetails.jsx`，展示推廣台語或相關文化的人物介紹。
- **文化介紹 (`/culture/food`, `/culture/festival`)**: 介紹台灣在地美食 (`CultureFood`) 與節慶 (`CultureFestival`)。
- **台語文化（test） (`/culture-test`)**: `cultureTestPage/CultureTestPage.jsx`，影音資料庫的分類瀏覽頁，也是「節慶飲食」的**新版重寫**（舊版兩頁在新分類中併入 `文化 > 地方/產業`）。
  - **分類只收來源表第一層的「文化」這一支，並取其後兩層**（2026-08 PM 調整，前一版是「取前兩層、涵蓋 6 個第一層」）：
    - 篩選第一層 ＝ 來源表第二層：戲曲、祭典、傳統工藝、地方/產業（4 項）
    - 篩選第二層 ＝ 來源表第三層「列舉細項」：歌仔戲、布袋戲…（合計 21 項）
    - 來源表第一層（固定「文化」）**不出現在畫面上**，只留在 `parent` / `parent_category` 欄位供後端對照。
    - **其餘 A 分類（職業台語、文學、教育、新聞/訪談、藝術表現）PM 確認本頁不收**，已從假資料整批移除，勿再加回。
  - ⚠️ 第三層的「其他類」**同時屬於「傳統工藝」與「地方/產業」**，名稱不唯一。前端因為是在同一個第二層內比對才沒事；後端資料表的唯一鍵必須是 `(parent_id, name)`。
  - 下拉仍保留「無子選單分類」的分支（父項本身即可勾選），目前四類都有第三層，留作日後分類調整的防呆。
  - **篩選與呈現整套比照「媒體與社群資源」**（`socialmediaPage/`）：
    - 頁首白底橫幅：分類下拉（第一層 + 第二層飛出子選單，可跨第一層複選）+ 關鍵字搜尋
    - 點第一層＝該層底下第二層全選／全不選；已選狀態顯示於下拉按鈕文字
    - 未篩選也未搜尋 → 依第一層分區預覽，每區顯示第一列 4 筆、附「共 N 筆」與「查看全部」
    - 有篩選或搜尋 → 攤平成完整列表 + 分頁（每頁 20 筆，4 欄 × 5 列），並提供「返回全部類別」
    - 卡片為「圖片 + 主標」，點擊開新分頁到該筆影音
  - **手機版（`max-width: 768px`）的分類篩選改為 bottom sheet**，與桌機下拉是兩套 UI，由 `matchMedia` 在 JS 端擇一渲染（不是純 CSS 切換），因為兩者行為不同：
    - 由下往上滑出，高度上限 `70vh`，選項區可捲動、底部 56px 操作列固定；點遮罩、下滑手勢皆等同取消
    - **選擇暫存在 `draftSelected`，按「確認」才寫回 `selectedItems`**；桌機下拉則是點了就即時套用
    - 父分類在此為**不可選的 sticky 標題**（灰色小字加粗），只有子項可勾選；若某分類沒有子項，父項本身仍會渲染成可勾選項目（目前四類都有子項，此分支為防呆）
    - 觸發器文字：未選為 placeholder「選擇分類」、選 1 項顯示該項名稱、多項顯示「首項 +N」（桌機沿用原本的「N 個選項」規則）
    - ⚠️ 「確認」在未選任何項目時 disabled，因此**無法在面板內把已選條件清成空**（按了「清除」後確認鈕就 disabled，這次清空送不出去）；要清空需用列表上方的「返回全部類別」。
      **這是 PM 確認過要保留的行為，不是 bug，請勿自行改成「有變更就可送出」。**
    - 選取狀態的異動邏輯抽成 `withCategoryToggled` / `withAllSubsToggled` / `withSubToggled` 三個純函式，桌機套用到 `selectedItems`、手機套用到 `draftSelected`。
  - 媒體與社群資源在手機版是直接把子選單 `display: none`（等於選不到第二層），此頁刻意不沿用該行為。
  - ⚠️ **內容目前來自 `services/cultureTestMockApi.js` 假資料**：`CATEGORY_TREE` 為上述兩層分類，影音由 `buildMockData()` 依第三層生成（每組 20~45 筆，合計約 660 筆）。回傳格式刻意比照 `POST /media`：`{ category_order, data: { 篩選第一層: [{ ..., subcategory }] } }`，一次給全部，篩選／搜尋／分頁皆由前台處理。接上真實 API 時換掉 `fetchCultureItems()` 即可，頁面不需改動。
  - **後端 API 需求規格見 `docs/culture_test_api.md`**（含前台 `POST /culture-media`、後台影音與分類 CRUD、資料表建議、待確認事項）。
  - 新舊兩套**刻意並存**，待新版 API 完成後才會取代舊版並移除 `/culture/food`、`/culture/festival`（舊版兩頁在新分類中對應到「地方/產業 > 飲食」與「地方/產業 > 節慶」）。
  - ⚠️ 開發中頁面，但**未加 feature toggle**，前台側邊欄一律顯示（含正式環境）。
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

> **權限模型**：後台採 bitmask flags（`config/permissions.js`）：`CONTENT_MANAGER = 1`（內容增刪修、管理會員上傳資格）、`SYSTEM_MANAGER = 2`（公告管理、權限管理、系統設定）。flags 由 `/api/user/login`、`/auth/refresh`、`/auth/me`、`/admin/member/list` 回傳，是唯一的權限來源；舊的 `role` 字串與 `SUPER_ADMIN` 角色前後端皆已移除，勿再新增相關判斷。路由層以 `<ProtectedRoute requiredFlag={FLAGS.X}>` 控管，元件層用 `useAuth()` 的 `isSuperAdmin()`（= SYSTEM_MANAGER）／`isContentManager()`。
>
> **權限 vs 帳號狀態**：兩者職責分開——flags 是後台權限，`isSuspended`（布林）是帳號啟用狀態，停用時另有 `suspendAt` / `suspendReason`。不要用其中一個推導另一個。
>
> **內容頁唯讀**：「新增／修改／刪除內容」僅限 CONTENT_MANAGER。所有內容管理頁一律用 `adminPage/useContentEditPermission.js` 取得 `canEditContent`，用它同時（1）隱藏新增鈕與表格的編輯／刪除欄、（2）關閉拖曳排序、（3）在送出的 handler 內再擋一次並吐 `NO_EDIT_PERMISSION_MESSAGE`，並在表格上方放 `components/ReadOnlyNotice`。新增內容管理頁時請沿用這個模式。
>
> **手機版**：`AdminSidebar` 與前台 `Sidebar` 一樣是滑入式抽屜，由 `Header` 漢堡鈕透過 `AppLayout` 的 `sidebarOpen` 控制（樣式在 `adminSidebar.css` 的 `.sidebar.admin-sidebar` media query）。

- **首頁面板 (`/admin`)**: `adminMain.jsx`。
- **主頁搜尋管理**:
  - 考試資訊 (`/admin/main-search/test`): `adminTestPage.jsx`。
  - 活動快訊 (`/admin/main-search/news`): `adminNewsPage.jsx`。
- **節慶飲食管理 (`/admin/culture/food`, `/admin/culture/festival`)**: `adminFoodPage.jsx` / `adminFestivalPage.jsx`。
- **台語文化（test）管理 (`/admin/culture-test`)**: `adminCultureTestPage.jsx`，上述節慶飲食後台的**新版重寫**。
  - ⚠️ 空架構頁，尚未串接 API；與舊版並存，無 feature toggle，所有管理員皆可見。
- **認證考試管理 (`/admin/exam/info`)**: `examPage/adminExamInfo.jsx`，編輯考試基本資訊。
  - 註：`examPage/` 下另有 `adminExamBooks.jsx`、`adminExamChannels.jsx`，但目前尚未在 `App.jsx` 中掛載路由。
- **媒體與社群資源管理 (`/admin/socialmedia`)**: `adminSocialmediaPage.jsx`，編輯與新增推薦的影音/Podcast連結。
  - 類別下拉選單由 API 資料動態產生（`item.category`，支援 `父>子` 格式）。支援 `?category=社群` 參數，後台首頁的類別連結即以此帶入預設篩選。
- **教學資源平台管理**:
  - 審核/上傳資源 (`/admin/resource`, `/admin/resource/upload`): `adminresourcePage/AdminResourcePage.jsx`。
  - 編輯課本選單/首圖 (`/admin/resource/header`): `adminresourcePage/ResourceHeaderPage.jsx`。
- **會員管理 (`/admin/member`)**: `adminMemberPage.jsx`，管理網站後台/前台會員權限。
  - 「停用／恢復上傳資格」走 `POST /admin/member/status`（需 CONTENT_MANAGER，後端據 `action` 設定 `isSuspended`、`suspendAt`、`suspendReason`）；「設定管理員身分」走 `POST /admin/member/flags`（需 SYSTEM_MANAGER，直接帶 flags 整數）。兩者封裝在 `services/memberService.js`。
  - 三個視圖的分流依據：管理員名單 = `!isSuspended && flags > 0`、會員名單 = `!isSuspended && flags === 0`、停用會員名單 = `isSuspended`（並顯示 `suspendReason` / `suspendAt`）。
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
