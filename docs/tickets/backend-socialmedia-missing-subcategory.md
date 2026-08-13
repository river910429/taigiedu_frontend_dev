# [後端] `/admin/socialmedia` 沒有回 subcategory，後台看不到也存不了子分類

**類型**：Bug / API 契約不一致
**優先度**：中高（等 `modify` 的 500 修好之後，這個會變成資料損毀）
**元件**：Backend
**回報**：ncchen
**相關**：`GET /admin/socialmedia`、`POST /admin/socialmedia/add`、`POST /admin/socialmedia/modify`、`POST /media`

---

## 問題現象

同一批資料，公開 API 有子分類，後台 API 沒有。

**公開 `POST /media`** —— `category` 是 key，`subcategory` 是獨立欄位：

```json
{"id": 1, "subcategory": "辭典或翻譯", "image": "/backend/static/media/A1-001.jpg",
 "title": "教育部臺灣台語常用詞辭典", "url": "https://sutian.moe.edu.tw/zh-hant/"}
```

**後台 `GET /admin/socialmedia`** —— 同一筆（id=1），子分類整個不見：

```json
{"id": "1", "category": "工具", "figure": "/app/static/media/A1-001.jpg",
 "name": "教育部臺灣台語常用詞辭典", "link": "https://sutian.moe.edu.tw/zh-hant/",
 "status": "publish", "timestamp": "2025/08/28 06:54:44"}
```

實測 760 筆全部資料：**`category` 含 `>` 的有 0 筆，也沒有 `subcategory` 欄位**。

而公開 API 顯示子分類確實存在且有在用：

| 第一層 | 子分類 |
|---|---|
| 工具（94 筆） | 辭典或翻譯 30、字體或輸入法 36、其他 26、(無) 2 |
| 社群（225 筆） | Facebook Page 99、Instagram 48、Blog 39、Facebook Home 20、Facebook Groups 19 |
| 教育機構（63 筆） | 中央 34、地方 29 |

---

## 影響

1. 後台**完全看不到**子分類，第二層篩選下拉永遠不會出現。
2. 更嚴重：等 `modify` 的 500 修好之後（見 `backend-socialmedia-modify-500.md`），後台送出的 `category` 只會有第一層。**任何一次編輯都會把該筆的子分類洗掉**，前台分類頁就會少一筆。
3. 已經有髒資料了 —— id=761 的 `category` 是 `"其他, Podcast"`，是前端多選類別時 `join(', ')` 寫進去的，後端照單全收。

---

## 需要後端做的事

**先決定一種格式，兩邊統一。** 前端已按 B 案實作（`父>子` 字串，多筆以 `, ` 分隔，`adminSocialmediaPage.jsx` 的 `parseCategories` / `serializeCategories`），採 A 案的話前端再配合改。

### A 案：獨立欄位（與公開 `/media` 一致，較推薦）

- `GET /admin/socialmedia` 每筆補上 `subcategory`
- `add` / `modify` 的 payload 接受 `subcategory`

### B 案：`父>子` 合併字串

- `GET /admin/socialmedia` 的 `category` 回 `"工具>辭典或翻譯"`
- `add` / `modify` 沿用同格式解析

### 兩案都要處理

- 一筆資料是否允許屬於多個類別？請明確定義。若允許，分隔符要定死（目前前端用 `, `）；若不允許，`add` / `modify` 應對多類別回 400，而不是把 `"其他, Podcast"` 直接存進 DB。
- 子分類「其他」同時存在於多個第一層底下，**資料表唯一鍵必須是 `(parent_id, name)`**，不能只用 name。
- 順手清掉 id=761 的髒資料。

---

## 附帶：figure 路徑格式

`GET /admin/socialmedia` 回的 `figure` 帶了容器內部路徑前綴，前端得在 `uploadService.resolveFileUrl` 裡特別處理才不會 404：

| 樣式 | 筆數 |
|---|---|
| `/app/static/media/xxx.jpg` | 749 |
| `/app/uploads/xxx.png` | 3 |
| `/app/uploads//uploads/xxx.png` | 1 ← 路徑重複 |
| `""`（空） | 7 |

建議回傳對外可直接存取的路徑（`/static/...`、`/uploads/...`），不要外洩 `app/`，並修掉重複的 `uploads//uploads/`。

---

## 驗收條件

- [ ] 後台 API 拿得到子分類，且與 `POST /media` 的資料一致
- [ ] 編輯一筆有子分類的資料並存檔後，子分類沒有消失
- [ ] 多類別的行為有明確定義（允許 → 分隔符定死；不允許 → 回 400）
- [ ] id=761 的 `"其他, Podcast"` 已清理
