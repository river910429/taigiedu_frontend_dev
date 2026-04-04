const MOCK_SOURCES = [
  "YouTube",
  "Podcast",
  "社群",
  "教育部資源網",
  "教學部落格",
  "線上研習平台",
  "學校社團網站",
  "電子報",
  "影音課程平台",
  "地方文史站",
];

const MOCK_TOPICS = [
  "科技",
  "親子",
  "文化",
  "語言學習",
  "教育",
  "健康",
  "職涯",
  "藝術",
  "旅遊",
  "永續",
];

const MOCK_ITEMS = [
  { id: 1, source: "YouTube", topic: "科技", title: "AI 入門教學：從生活案例理解人工智慧", snippet: "整理 AI 基礎概念，適合教師帶學生討論技術如何改變學習方式。", url: "https://example.com/feature/1" },
  { id: 2, source: "Podcast", topic: "親子", title: "親子共學台語：家庭對話練習", snippet: "透過日常情境讓家長與孩子共同練習台語表達，建立家庭語言環境。", url: "https://example.com/feature/2" },
  { id: 3, source: "社群", topic: "文化", title: "在地文化採集筆記：市場語言觀察", snippet: "分享地方社群的語言採集心得，延伸課堂議題討論。", url: "https://example.com/feature/3" },
  { id: 4, source: "教育部資源網", topic: "教育", title: "議題融入教案設計範本", snippet: "提供可直接套用的教案框架，協助教師快速完成課程規劃。", url: "https://example.com/feature/4" },
  { id: 5, source: "教學部落格", topic: "語言學習", title: "多語教室活動：角色扮演任務", snippet: "以任務導向教學提升學生口說動機與情境應用能力。", url: "https://example.com/feature/5" },
  { id: 6, source: "線上研習平台", topic: "職涯", title: "教師專業成長：跨域課程實作", snippet: "聚焦跨域合作與專題式學習，適合校內共備。", url: "https://example.com/feature/6" },
  { id: 7, source: "學校社團網站", topic: "藝術", title: "台語戲劇社成果：議題短劇示例", snippet: "社團演出紀錄可作為課堂討論素材，訓練觀察與詮釋。", url: "https://example.com/feature/7" },
  { id: 8, source: "電子報", topic: "健康", title: "校園健康促進週：溝通教材整理", snippet: "收錄健康議題文本，適合搭配閱讀理解活動。", url: "https://example.com/feature/8" },
  { id: 9, source: "影音課程平台", topic: "旅遊", title: "地方走讀課程：語言與地景", snippet: "結合旅遊敘事與地方語言，建立跨領域學習脈絡。", url: "https://example.com/feature/9" },
  { id: 10, source: "地方文史站", topic: "永續", title: "社區永續故事：地方知識教材", snippet: "以社區案例引導學生思考永續與文化保存的關係。", url: "https://example.com/feature/10" },
  { id: 11, source: "YouTube", topic: "教育", title: "翻轉教室工具：課堂互動示範", snippet: "示範如何在課堂中設計提問節奏與回饋機制。", url: "https://example.com/feature/11" },
  { id: 12, source: "Podcast", topic: "科技", title: "數位素養與媒體識讀專題", snippet: "討論資訊辨識與平台內容判讀策略，適合高中以上。", url: "https://example.com/feature/12" },
  { id: 13, source: "社群", topic: "親子", title: "家長共備社群：週末共學活動", snippet: "整理社群常用活動流程與注意事項，便於快速上手。", url: "https://example.com/feature/13" },
  { id: 14, source: "教育部資源網", topic: "文化", title: "本土語文文化素材包", snippet: "含課前暖身、文本導讀與課後延伸活動建議。", url: "https://example.com/feature/14" },
  { id: 15, source: "教學部落格", topic: "永續", title: "永續議題課堂討論提問庫", snippet: "提供層次化提問範例，幫助學生從觀察走向行動。", url: "https://example.com/feature/15" },
];

const includesIgnoreCase = (text, keyword) => {
  if (!keyword) return true;
  return String(text || "").toLowerCase().includes(String(keyword).toLowerCase());
};

const escapeRegExp = (text) =>
  String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightKeyword = (text, keyword) => {
  const safeText = String(text || "");
  const trimmedKeyword = String(keyword || "").trim();
  if (!trimmedKeyword) return safeText;

  const pattern = new RegExp(`(${escapeRegExp(trimmedKeyword)})`, "gi");
  return safeText.replace(pattern, "<b style='color:#d84040;'>$1</b>");
};

export const getFeaturedResourceFilters = async () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        sources: MOCK_SOURCES,
        topics: MOCK_TOPICS,
      });
    }, 200);
  });

export const searchFeaturedResources = async ({
  source = [],
  topic = [],
  keyword = "",
} = {}) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const selectedSources = Array.isArray(source)
        ? source
        : source
          ? [source]
          : [];
      const selectedTopics = Array.isArray(topic)
        ? topic
        : topic
          ? [topic]
          : [];

      const filtered = MOCK_ITEMS.filter((item) => {
        const matchSource =
          selectedSources.length === 0 || selectedSources.includes(item.source);
        const matchTopic =
          selectedTopics.length === 0 || selectedTopics.includes(item.topic);
        const matchKeyword =
          !keyword ||
          includesIgnoreCase(item.title, keyword) ||
          includesIgnoreCase(item.snippet, keyword) ||
          includesIgnoreCase(item.source, keyword) ||
          includesIgnoreCase(item.topic, keyword);

        return matchSource && matchTopic && matchKeyword;
      });

      resolve({
        status: "success",
        data: filtered.map((item) => ({
          id: item.id,
          resource: `${item.source} / ${item.topic}`,
          content: `${highlightKeyword(item.title, keyword)}：${highlightKeyword(item.snippet, keyword)}`,
          url: item.url,
        })),
      });
    }, 450);
  });
