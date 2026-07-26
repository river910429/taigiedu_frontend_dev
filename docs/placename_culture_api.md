# 台語地名與文化 API 設計說明（給後端同仁）

> 對象：後端開發者
> 對應前端頁面：`/placename-culture`（`src/placenameCulturePage/PlacenameCulturePage.jsx`）
> 目前狀態：**前端已完成，資料全部走 mock**（`src/services/placenameCultureMockApi.js`）
> 相關檔案：`docs/openapi/placename-culture.draft.openapi.json`（可直接匯入 Apidog 的草稿規格）

---

## 1. 這個功能在做什麼

臺南市 37 個行政區的地名由來與台語發音，共兩層畫面：

| 層級 | 網址 | 畫面 | 需要的資料 |
|---|---|---|---|
| 第一層 | `/placename-culture` | 臺南全圖。**滑鼠移過**某個行政區，右側即時換成該區簡介 | 區名、台羅、簡介、代表圖 |
| 第二層 | `/placename-culture?district=安平區` | 該區放大圖 + 完整介紹 | 上述 + 古地名、完整長文、發音音檔、里舊名清單 |
| 彈窗 | （第二層點「里舊名」） | 懸浮視窗 | 里舊名、台羅、說明、發音音檔 |

上方三個下拉選單（地區 / 縣市 / 區域）是**為了未來擴增到其他縣市預留的**，目前只開放「南部地區 → 臺南市」。

地圖本身是前端的靜態 SVG（`src/placenameCulturePage/tainanMapData.js`，由設計稿匯出），**後端不需要提供任何圖資**，只要文字與音檔。

---

## 2. 最重要的一件事：hover 不能每次打 API

第一層是「滑鼠移過就顯示」，使用者掃過地圖時，一秒可能觸發十幾次。**請不要設計成「每 hover 一次打一支 API」。**

建議做法：**前端進頁面時一次撈回整個縣市 37 區的簡介，之後 hover 都吃前端快取。**
所以第一層那支 API 是「清單」而不是「單筆」，回傳整包（估算 37 筆 × 約 400 字 ≈ 60 KB，可接受）。

第二層的長文（可能好幾千字）+ 里舊名才另外用單筆 API 取，因為使用者一次只會看一區。

---

## 3. 沿用既有慣例

這頁的資料結構跟「台灣文化－飲食 / 節慶」幾乎一樣（名稱 + 台羅 + 華文釋義 + 圖片 + 音檔），**請直接比照 `/culture/food` 與 `/admin/culture/food` 那組來做**，前端才能重用既有的處理邏輯。

沿用的部分：

- **前台讀取用 `POST`**（專案既有慣例，如 `/culture/food`、`/celebrity/detail`）
- **後台用 `GET` 列表 + `POST .../add` + `POST .../modify`**，`modify` 以 `action` 欄位區分 `1=刪除 / 2=復原 / 3=修改`
- **後台端點需要 `BearerAuth`**，前台不需要
- **錯誤回應**沿用 `components/schemas/ErrorResponse`（`{ "error": { "code", "message" } }`）
- **成功訊息**沿用 `components/responses/SuccessMessage`（`{ "success": true, "message": "..." }`）
- **圖片**：回傳路徑字串（如 `/backend/static/placename/安平區.jpg`），前端用 `resolveFileUrl()` 補完整網址
- **音檔**：欄位名一律叫 `audio_data`，可以是 **Base64 字串**或**檔案路徑**，前端 `getFullAudioUrl()` 兩種都吃得下（見第 7 節）

---

## 4. 資料表建議

三張表。`region` / `county` 資料量小又幾乎不變，也可以先寫死在程式裡，不一定要開表。

### 4.1 `placename_district`（行政區）

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | PK | |
| `county` | varchar(20) | 縣市，目前固定 `臺南市` |
| `code` | varchar(10) | 行政區代碼（如安平區 `67000350`），建議加，方便日後對接政府資料 |
| `name` | varchar(20) | **區名，必須與前端地圖圖層名完全一致**（見第 8 節的 37 個固定值） |
| `name_tl` | varchar(60) | 台羅拼音，如 `An-pîng-khu` |
| `old_name` | varchar(60) | 古地名，如 `大員`；可為空 |
| `summary` | text | 簡介（第一層 hover 用，建議 200–400 字） |
| `description` | longtext | 完整介紹（第二層用，可能數千字） |
| `figure` | varchar(255) | 代表圖路徑（設計稿保留 80×80 的位置） |
| `audio_data` | longtext | 區名發音（Base64 或路徑） |
| `sort_order` | int | 排序用 |
| `status` | varchar(10) | 沿用既有的上下架狀態 enum |
| `timestamp` | datetime | |

**`name` 是前端的關聯鍵**：前端地圖的 37 個圖層名就是 `七股區`、`安平區`⋯，網址也是 `?district=安平區`。如果後端回傳的 `name` 對不上（例如寫成 `台南市安平區` 或 `安平`），該區就會查不到資料。第 8 節附了完整清單，**請直接照抄建表**。

### 4.2 `placename_village`（里舊名）

第二層底下「里舊名：大員Tāi-Uân、安順（庄）An-sūn」，點下去開懸浮視窗。一個行政區可有 0～N 筆。

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | PK | |
| `district_id` | FK → `placename_district.id` | |
| `name` | varchar(40) | 如 `大員` |
| `name_tl` | varchar(60) | 如 `Tāi-Uân` |
| `description` | longtext | 懸浮視窗內文 |
| `audio_data` | longtext | 發音（Base64 或路徑），可為空 |
| `sort_order` | int | |
| `status` | varchar(10) | |
| `timestamp` | datetime | |

### 4.3 `placename_county`（縣市，選配）

`region`（北部/中部/南部/東部/離島）+ `county`。目前只有一筆有資料的 `南部地區 / 臺南市`。
**若暫時不開表，前端會用寫死的清單，等其他縣市的地圖做好再回來補。**

---

## 5. 前台 API

### 5.1 `POST /placename/counties` — 地區與縣市清單

給上方前兩個下拉選單用。若第 4.3 節不開表，這支可以先不做。

**Request**：無

**Response 200**
```json
[
  { "region": "北部地區", "counties": [] },
  { "region": "中部地區", "counties": [] },
  { "region": "南部地區", "counties": ["臺南市"] },
  { "region": "東部地區", "counties": [] },
  { "region": "離島地區", "counties": [] }
]
```

> `counties` 為空陣列代表該地區的地圖還沒做，前端第二個下拉會是空的。

---

### 5.2 `POST /placename/districts` — 行政區清單（含簡介）

**第一層的主力 API。** 前端進頁面時呼叫一次，之後所有 hover 都吃這包快取，不再打後端。
同時也餵給第三個下拉選單「區域」。

**Request**
```json
{ "county": "臺南市" }
```

**Response 200**
```json
[
  {
    "name": "安平區",
    "code": "67000350",
    "name_tl": "An-pîng-khu",
    "old_name": "大員",
    "summary": "「大員」又稱「臺員」是一個古地名，原指臺南市安平區「臺江內海」⋯（約 200–400 字）",
    "figure": "/backend/static/placename/安平區.jpg",
    "audio_data": "GkXfo59ChoEBQveBAULygQRC84EI..."
  }
]
```

**注意事項**

- 這支**不要回 `description`**（完整長文）。37 區的長文加起來可能好幾 MB，會拖垮第一層。
- `summary` 若後台沒填，可回傳 `description` 的前 N 字，或直接回空字串（前端會顯示空白，不會壞掉）。
- 陣列請照 `sort_order` 排；前端不會再排序。
- 只回 `status` 為上架的資料。

---

### 5.3 `POST /placename/district/detail` — 單一行政區完整資料

**第二層的 API。** 使用者點下某區（或用網址直接進來）時呼叫一次。

**Request**
```json
{ "county": "臺南市", "name": "安平區" }
```

> 也可以改用 `code` 當參數，但 `name` 是前端手上一定有的值（網址就是 `?district=安平區`），用 `name` 前端最省事。若後端偏好 `code`，請在 5.2 的清單回傳 `code`，前端會改帶 `code`。

**Response 200**
```json
{
  "name": "安平區",
  "code": "67000350",
  "name_tl": "An-pîng-khu",
  "old_name": "大員",
  "figure": "/backend/static/placename/安平區.jpg",
  "audio_data": "GkXfo59ChoEBQveBAULygQRC84EI...",
  "description": [
    "【「大員」、「台灣」與大武壠族「臺窩灣社」⋯】",
    "「大員」又稱「臺員」是一個古地名，原指臺南市安平區「臺江內海」。⋯",
    "早在荷蘭人之前，漢人就在海上並且在赤崁（今台南市中西區）至魍港⋯"
  ],
  "old_village_names": [
    {
      "name": "大員",
      "name_tl": "Tāi-Uân",
      "audio_data": null,
      "description": [
        "「大員」又稱「臺員」，是一個古地名⋯",
        "關於「大員」之由來，一種普遍的說法是此詞來自臺灣大武壠族大灣社⋯"
      ]
    },
    {
      "name": "安順（庄）",
      "name_tl": "An-sūn",
      "audio_data": null,
      "description": ["「安順」為今日安南區的舊稱⋯"]
    }
  ]
}
```

**關於 `description` 是陣列**

前端把每個元素當**一個段落**渲染（`<p>`），所以斷行/分段是後端說了算，前端不做任何字串切割。

如果後端 DB 存的是單一 `text` 欄位，兩種做法都可以，請擇一並告知：

- **（建議）後端切好再回**：以 `\n\n` 或 `\n` 切開成陣列回傳，前端不用改。
- **回單一字串**：那前端會自己用 `\n` 切；但請**務必在資料裡保留換行**。設計稿的長文有明顯分段，若回傳的是沒有換行的一大坨字，畫面會變成一整片文字牆。

**查無資料**：回 `404` + `ErrorResponse`，前端會顯示「查無「安平區」的資料。」

---

## 6. 後台 API（管理介面用）

比照 `/admin/culture/food` 那組。全部需要 `Authorization: Bearer <token>`。
**後台頁面前端尚未製作**，這組可以排在前台之後。

### 6.1 行政區

| Method | Path | 說明 |
|---|---|---|
| `GET` | `/admin/placename/district` | 列表（含 `description`、`status`、`timestamp`） |
| `POST` | `/admin/placename/district/add` | 新增 |
| `POST` | `/admin/placename/district/modify` | `action` = `1` 刪除 / `2` 復原 / `3` 修改 |

`GET` 回應沿用飲食頁的包裝：
```json
{ "success": true, "totalCount": 37, "district_data": [ /* ... */ ] }
```

`add` / `modify` 的 payload（`DistrictPayload`）：
```json
{
  "county": "臺南市",
  "code": "67000350",
  "name": "安平區",
  "name_tl": "An-pîng-khu",
  "old_name": "大員",
  "summary": "⋯",
  "description": "⋯",
  "figure": "/backend/static/placename/安平區.jpg",
  "audio_data": "（Base64）",
  "sort_order": 5
}
```

`modify` 時再加上 `{ "id": "...", "action": "3" }`（與 `/admin/culture/food/modify` 同結構）。

### 6.2 里舊名

| Method | Path | 說明 |
|---|---|---|
| `GET` | `/admin/placename/village?district_id=5` | 某區的里舊名列表 |
| `POST` | `/admin/placename/village/add` | 新增 |
| `POST` | `/admin/placename/village/modify` | 同上的 `action` 規則 |

Payload：`{ district_id, name, name_tl, description, audio_data, sort_order }`

---

## 7. 音檔怎麼給

前端的 `getFullAudioUrl()`（見 `src/culture/food/FoodModal.jsx`）已經支援三種形式，**後端挑一種即可**：

| 形式 | 範例 | 前端行為 |
|---|---|---|
| Base64 字串 | `"GkXfo59ChoEBQveBAULygQRC84EI..."` | 自動偵測 webm / wav / mp3 並轉成 `data:` URI |
| 相對路徑 | `"/backend/static/placename/安平區.mp3"` | 用 `resolveFileUrl()` 補成完整網址 |
| 完整網址 | `"https://api.taigiedu.com/..."` | 直接播 |

**建議用路徑**：Base64 會讓 5.2 的清單 API 膨脹很多（37 個音檔全塞在同一包）。若要用 Base64，請只放在 5.3 的單筆 API，5.2 的清單回 `null`。

**沒有音檔時**請回 `null`（不要回空字串 `""`）。前端會把發音按鈕變成停用狀態，不會壞掉。

**TTS 備援**：飲食頁的做法是沒有 `audio_data` 時，改打 `POST /synthesize_speech`（`{ "tts_lang": "tb", "tts_data": "<台羅>" }`）即時合成。這頁目前**尚未接**這條備援；若後端傾向不逐區錄音、一律走 TTS，請告知，前端會照飲食頁的模式補上。

---

## 8. 建表用的 37 區清單

`name` 欄位**必須完全等於下表第二欄**（前端地圖圖層名）。台羅與古地名是前端 mock 階段自行整理的，**請以貴方的正式資料為準覆寫**，此處僅供建表 seed 參考。

| # | name（勿改） | name_tl | old_name |
|---|---|---|---|
| 1 | 中西區 | Tiong-se-khu | 赤崁 |
| 2 | 東區 | Tang-khu | 大東門外 |
| 3 | 南區 | Lâm-khu | 鹽埕 |
| 4 | 北區 | Pak-khu | 三分子 |
| 5 | 安平區 | An-pîng-khu | 大員 |
| 6 | 安南區 | An-lâm-khu | 安順 |
| 7 | 永康區 | Íng-khong-khu | 埔羌頭 |
| 8 | 歸仁區 | Kui-jîn-khu | 歸仁北里 |
| 9 | 新化區 | Sin-huà-khu | 大目降 |
| 10 | 左鎮區 | Tsó-tìn-khu | 拔馬 |
| 11 | 玉井區 | Gio̍k-tsénn-khu | 噍吧哖 |
| 12 | 楠西區 | Lâm-se-khu | 茄拔 |
| 13 | 南化區 | Lâm-huà-khu | 南庄 |
| 14 | 仁德區 | Jîn-tik-khu | 塗庫 |
| 15 | 關廟區 | Kuan-biō-khu | 香洋仔 |
| 16 | 龍崎區 | Liông-khi-khu | 番社 |
| 17 | 官田區 | Kuan-tiân-khu | 官佃 |
| 18 | 麻豆區 | Muâ-tāu-khu | 蔴荳 |
| 19 | 佳里區 | Ka-lí-khu | 蕭壠 |
| 20 | 西港區 | Se-káng-khu | 西港仔 |
| 21 | 七股區 | Tshit-kóo-khu | 七股寮 |
| 22 | 將軍區 | Tsiong-kun-khu | 漚汪 |
| 23 | 學甲區 | Ha̍k-kah-khu | 學甲寮 |
| 24 | 北門區 | Pak-mn̂g-khu | 北門嶼 |
| 25 | 新營區 | Sin-iânn-khu | 新營庄 |
| 26 | 後壁區 | Āu-piah-khu | 後壁寮 |
| 27 | 白河區 | Pe̍h-hô-khu | 店仔口 |
| 28 | 東山區 | Tang-suann-khu | 番仔田 |
| 29 | 六甲區 | La̍k-kah-khu | 六甲庄 |
| 30 | 下營區 | Ē-iânn-khu | 海墘營 |
| 31 | 柳營區 | Liú-iânn-khu | 查畝營 |
| 32 | 鹽水區 | Kiâm-tsuí-khu | 月津 |
| 33 | 善化區 | Siān-huà-khu | 目加溜灣 |
| 34 | 大內區 | Tuā-lāi-khu | 內庄 |
| 35 | 山上區 | Suann-siōng-khu | 山仔頂 |
| 36 | 新市區 | Sin-tshī-khu | 新港社 |
| 37 | 安定區 | An-tīng-khu | 直加弄 |

> 注意台羅的變調符號（`Íng`、`Gio̍k`、`Pe̍h`、`Ha̍k`、`Āu`、`mn̂g`）與**組合附加符號**。資料庫請用 `utf8mb4`，並統一以 **NFC** 正規化後存入，否則同一個字可能存成兩種位元組序列，查詢時會對不上。

---

## 9. 前端串接時會動到的檔案

後端做好後，前端只需改一個檔案，頁面元件完全不用動：

- `src/services/placenameCultureMockApi.js` — 把 `getRegions` / `getCounties` / `getDistrictList` / `getDistrictBrief` / `getDistrictDetail` 五個函式的實作換成真正的 `fetch`。
  - 其中 `getDistrictBrief` 會改為「從 5.2 撈回的清單快取中查表」，不再是一支獨立的 API。

現有 mock 的回傳格式是 `{ status: 'success', data }`，串接時 service 層會負責把後端格式轉成元件要的形狀，**後端不需要遷就這個包裝**。

---

## 10. 待確認事項

請後端同仁回覆以下幾點，前端好決定 service 層怎麼寫：

1. `description` 要回**段落陣列**還是**含換行的單一字串**？
2. `audio_data` 用**路徑**還是 **Base64**？逐區錄音，還是一律走 `/synthesize_speech` TTS？
3. 第二層要用 `name` 還是 `code` 當查詢鍵？
4. 第 4.3 節的 `region` / `county` 要開表嗎？還是前端先寫死？
5. 37 區的**內文與音檔由誰產製**、預計什麼時候可以進資料庫？（目前 mock 只有安平區、七股區、安南區三筆是設計稿的真實文案，其餘 34 區是樣板文字）
