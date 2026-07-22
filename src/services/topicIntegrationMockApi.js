// 議題融入（三層導覽）Mock API
// ------------------------------------------------------------------
// 之後串接後端時，只需替換此檔內三個函式的實作（改為打真正的 API），
// 元件端不需變動。回傳格式刻意模擬後端 { status, data, ... } 結構。
//
// 對應（預期）後端端點：
//   getTopics()                         -> GET /api/topic-integration/topics
//   getSubTopics(topicName)             -> GET /api/topic-integration/:topic/sub-topics
//   getResources({ topic, subTopic, keyword, page, pageSize })
//                                       -> GET /api/topic-integration/resources
// ------------------------------------------------------------------

// 108 課綱 19 項議題（第一層按鈕 / 第一個下拉選單）
const MOCK_TOPICS = [
  "性別平等",
  "人權",
  "環境",
  "海洋",
  "科技",
  "能源",
  "家庭教育",
  "原住民族教育",
  "品德",
  "生命",
  "法治",
  "資訊",
  "安全",
  "防災",
  "生涯規劃",
  "多元文化",
  "閱讀素養",
  "戶外教育",
  "國際教育",
];

// 各議題的次分類（第二層 chip / 第二個下拉選單）
// 未特別定義者，使用 DEFAULT_SUB_TOPICS 產生通用次分類。
const SUB_TOPICS_MAP = {
  性別平等: [
    "生理性別",
    "性別特質",
    "性別認同",
    "性別氣質",
    "性傾向",
    "身體自主",
    "性別權益",
    "性別分工",
    "情感教育",
    "性別文化",
    "多元性別",
    "性騷擾防治",
    "性別平權行動",
    "職場性別",
  ],
  人權: ["兒童權利", "基本人權", "平等尊重", "隱私權", "表意自由", "國際人權", "勞動人權"],
  環境: ["環境倫理", "永續發展", "氣候變遷", "資源循環", "生物多樣性", "環境行動", "綠色消費"],
  海洋: ["海洋資源", "海洋生態", "海洋文化", "海洋休閒", "海洋安全", "海洋保育"],
  能源: ["再生能源", "節約能源", "能源轉型", "能源安全", "能源科技"],
};

const DEFAULT_SUB_TOPICS = ["基礎概念", "教學實踐", "生活應用", "延伸探究", "評量回饋", "跨域整合"];

const getSubTopicNames = (topic) => SUB_TOPICS_MAP[topic] || DEFAULT_SUB_TOPICS;

// ------------------------------------------------------------------
// 資源列表 mock 產生器
// 依 (topic, subTopic) 生成一批可分頁的假資料，內容含 rich text 反白關鍵字。
// ------------------------------------------------------------------
const RESOURCE_TITLE_TEMPLATES = [
  "台灣文教學內容平台議題融入教案",
  "台語課堂議題融入活動設計",
  "台文本土語文議題融入教材",
  "教師共備議題融入討論指引",
  "議題融入主題式學習模組",
  "台語繪本議題融入延伸教學",
  "議題融入情境對話練習包",
  "本土語文議題融入評量範例",
];

const CONTENT_KEYWORDS = ["台語", "本土語文", "議題融入", "跨領域", "情境", "共備", "教學設計"];

const escapeHtml = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// 將指定關鍵字以紅色反白（回傳可交由 dangerouslySetInnerHTML 渲染的 HTML）
const highlight = (text, keywords = CONTENT_KEYWORDS) => {
  let html = escapeHtml(text);
  keywords.forEach((kw) => {
    if (!kw) return;
    const pattern = new RegExp(`(${kw})`, "g");
    html = html.replace(pattern, '<span class="ti-highlight">$1</span>');
  });
  return html;
};

// 以字串做穩定 hash，讓同一 (topic, subTopic) 每次得到一致的資料量
const stableCount = (seed, min, max) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  const range = max - min + 1;
  return min + (Math.abs(hash) % range);
};

const buildResources = (topic, subTopic) => {
  const scope = subTopic || topic;
  const seed = `${topic}::${subTopic || "ALL"}`;
  const total = stableCount(seed, 23, 68);

  return Array.from({ length: total }, (_, index) => {
    const n = index + 1;
    const titleBase = RESOURCE_TITLE_TEMPLATES[index % RESOURCE_TITLE_TEMPLATES.length];
    const resourceName = `${titleBase}（${scope}）第 ${n} 則`;
    const contentText =
      `以「${scope}」為主題，透過台語與本土語文的情境對話帶入議題融入的討論，` +
      `設計適合課堂使用的跨領域教學設計，並提供教師共備時可延伸的提問與活動流程。`;

    return {
      id: `${topic}-${subTopic || "all"}-${n}`,
      resource: resourceName,
      // content 為含反白標記的 rich text（HTML 字串）
      content: highlight(contentText),
      url: `https://example.com/topic-integration/${encodeURIComponent(topic)}/${n}`,
    };
  });
};

const includesIgnoreCase = (text, keyword) =>
  String(text || "").toLowerCase().includes(String(keyword || "").toLowerCase());

const delay = (value, ms = 300) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ------------------------------------------------------------------
// 對外 API
// ------------------------------------------------------------------

// 第一層：取得所有議題
export const getTopics = async () =>
  delay({ status: "success", data: MOCK_TOPICS }, 200);

// 第二層：取得某議題下的次分類
export const getSubTopics = async (topic) =>
  delay({ status: "success", data: topic ? getSubTopicNames(topic) : [] }, 200);

// 第二 / 三層：取得資源列表（含分頁）
export const getResources = async ({
  topic,
  subTopic = "",
  keyword = "",
  page = 1,
  pageSize = 15,
} = {}) => {
  if (!topic) {
    return delay({ status: "success", data: [], total: 0, page: 1, pageSize }, 200);
  }

  const all = buildResources(topic, subTopic);
  const trimmedKeyword = String(keyword || "").trim();

  const filtered = trimmedKeyword
    ? all.filter(
        (item) =>
          includesIgnoreCase(item.resource, trimmedKeyword) ||
          includesIgnoreCase(item.content, trimmedKeyword)
      )
    : all;

  // 若有關鍵字，額外把關鍵字也反白
  const decorated = trimmedKeyword
    ? filtered.map((item) => ({
        ...item,
        content: highlight(
          item.content.replace(/<\/?span[^>]*>/g, ""),
          [...CONTENT_KEYWORDS, trimmedKeyword]
        ),
      }))
    : filtered;

  const total = decorated.length;
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;
  const data = decorated.slice(start, start + safePageSize);

  return delay(
    { status: "success", data, total, page: safePage, pageSize: safePageSize, totalPages },
    350
  );
};
