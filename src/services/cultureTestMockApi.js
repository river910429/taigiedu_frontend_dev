/**
 * 台語文化（test）— 假資料 API
 *
 * ⚠️ 這是開發階段的 mock，尚未串接後端。
 *
 * ── 分類結構（2026-08 依 PM 指示調整）──
 * 來源表（影音資料管理總表 - 分類彙整）有三層，本頁**只收第一層的「文化」這一支**，
 * 並取其後兩層當作篩選：
 *   篩選第一層 = 來源表第二層（B 欄）：戲曲 / 祭典 / 傳統工藝 / 地方,產業
 *   篩選第二層 = 來源表第三層（C 欄「列舉細項」）：歌仔戲 / 布袋戲 / …
 *
 * 來源表第一層（A 欄）不出現在篩選與畫面上；本頁範圍內固定是「文化」，
 * 僅保留在 `parent` / `parent_category` 欄位供後端對照。
 *
 * ⚠️ 其餘 A 分類（職業台語、文學、教育、新聞/訪談、藝術表現）**PM 確認本頁不收**，
 * 因此原本那些分類與其假資料已整批移除，不要再加回來。
 *
 * ── 回傳格式 ──
 * 比照「媒體與社群資源」（POST /media）：一次回傳全部資料，
 * 依篩選第一層分組，每筆帶 subcategory（篩選第二層）。
 * 篩選、搜尋、分頁皆由前台處理。
 */

/**
 * 兩層分類（陣列順序即前台顯示順序）
 *
 * name     = 來源表第二層（篩選第一層）
 * parent   = 來源表第一層（A 欄，畫面不顯示，保留給後端對照）
 * children = 來源表第三層（篩選第二層）
 */
export const CATEGORY_TREE = [
  {
    name: '戲曲',
    parent: '文化',
    children: ['歌仔戲', '布袋戲', '歌詩', '其他偶戲'],
  },
  {
    name: '祭典',
    parent: '文化',
    children: ['藝閣/陣頭', '禮俗/儀式', '媽祖', '王爺'],
  },
  {
    name: '傳統工藝',
    parent: '文化',
    children: [
      '雕塑類',
      '木藝類',
      '竹藝類',
      '製陶/剪黏/窯藝/泥作類',
      '金工類',
      '漆藝/彩繪類',
      '編織/刺繡類',
      '其他類',
    ],
  },
  {
    name: '地方/產業',
    parent: '文化',
    children: ['自然資源', '人造物品', '飲食', '節慶', '其他類'],
  },
];

/**
 * 假標題的取材主題（純粹為了讓 mock 標題看起來像真的，不具分類意義）
 *
 * key 用「第二層>第三層」全路徑，因為「其他類」同時出現在
 * 「傳統工藝」與「地方/產業」底下，只用第三層名稱會撞。
 */
const TOPICS = {
  // 戲曲
  '戲曲>歌仔戲': ['歌仔戲身段', '歌仔戲曲調', '野台歌仔戲', '內台歌仔戲'],
  '戲曲>布袋戲': ['金光布袋戲', '傳統掌中戲', '戲偶雕刻', '口白藝術'],
  '戲曲>歌詩': ['唸歌', '月琴說唱', '台語歌詩吟唱'],
  '戲曲>其他偶戲': ['皮影戲', '傀儡戲', '懸絲偶戲'],

  // 祭典
  '祭典>藝閣/陣頭': ['藝閣遶境', '宋江陣', '八家將', '官將首'],
  '祭典>禮俗/儀式': ['生命禮俗', '歲時節俗', '二十四節氣', '婚喪喜慶'],
  '祭典>媽祖': ['大甲媽祖遶境', '白沙屯進香', '媽祖信仰'],
  '祭典>王爺': ['王船祭典', '燒王船', '五府千歲'],

  // 傳統工藝
  '傳統工藝>雕塑類': ['神像雕刻', '石雕', '泥塑'],
  '傳統工藝>木藝類': ['大木作', '小木作', '三義木雕', '傳統家具'],
  '傳統工藝>竹藝類': ['竹編', '竹管厝', '竹製生活器物'],
  '傳統工藝>製陶/剪黏/窯藝/泥作類': ['交趾陶', '剪黏', '鶯歌陶瓷', '磚瓦窯'],
  '傳統工藝>金工類': ['錫工藝', '打鐵', '金銀細工'],
  '傳統工藝>漆藝/彩繪類': ['建築彩繪', '門神彩繪', '漆器'],
  '傳統工藝>編織/刺繡類': ['纏花', '傳統刺繡', '藺草編'],
  '傳統工藝>其他類': ['紙紮', '燈籠', '製香'],

  // 地方/產業
  '地方/產業>自然資源': ['鹽田', '潟湖', '溫泉', '林業'],
  '地方/產業>人造物品': ['老街建築', '糖廠', '古橋', '水圳'],
  '地方/產業>飲食': ['夜市小吃', '白河蓮藕', '東港黑鮪魚', '辦桌菜'],
  '地方/產業>節慶': ['端午', '中元', '元宵', '中秋'],
  '地方/產業>其他類': ['在地信仰', '聚落故事', '產業轉型'],
};

const TITLE_PATTERNS = [
  topic => `${topic}專題報導`,
  topic => `認識${topic}：入門介紹`,
  topic => `${topic}的歷史與演變`,
  topic => `職人專訪：${topic}的傳承`,
  topic => `${topic}實作紀錄`,
  topic => `校園走讀：${topic}`,
  topic => `${topic}與台語詞彙教學`,
  topic => `地方誌：${topic}的在地故事`,
  topic => `${topic}紀錄片精選`,
  topic => `${topic}主題講座`,
];

// 固定種子的偽亂數，確保每次重整看到的假資料一致（方便比對畫面）
const seededRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
};

const buildMockData = () => {
  const random = seededRandom(20260807);
  const data = {};
  let id = 1;

  CATEGORY_TREE.forEach(node => {
    // 目前四個分類都有第三層；仍保留無子項的分支，避免日後分類調整時壞掉
    const buckets = node.children.length > 0
      ? node.children.map(name => ({ subcategory: name, topicKey: `${node.name}>${name}` }))
      : [{ subcategory: '', topicKey: node.name }];

    const items = [];

    buckets.forEach(({ subcategory, topicKey }) => {
      const topics = TOPICS[topicKey] || [subcategory || node.name];
      const count = 20 + Math.floor(random() * 26); // 每組 20~45 筆

      for (let index = 0; index < count; index += 1) {
        const topic = topics[Math.floor(random() * topics.length)];
        const pattern = TITLE_PATTERNS[index % TITLE_PATTERNS.length];
        const round = Math.floor(index / TITLE_PATTERNS.length) + 1;
        items.push({
          id: id++,
          // A 欄，畫面不顯示，保留供後端對照
          parent_category: node.parent,
          category: node.name,
          subcategory,
          title: `${pattern(topic)}${round > 1 ? `（${round}）` : ''}`,
          // 尚無圖片資料，前台會顯示預設佔位圖；接上 API 後改放縮圖路徑
          image: null,
          url: `https://example.com/video/${id}`,
        });
      }
    });

    data[node.name] = items;
  });

  return data;
};

const MOCK_DATA = buildMockData();

const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 取得台語文化影音（mock）
 *
 * 回傳格式比照 POST /media：
 *   {
 *     category_order: ['戲曲', '祭典', '傳統工藝', '地方/產業'],  // 篩選第一層
 *     data: { 戲曲: [{ ..., subcategory: '歌仔戲' }], ... }
 *   }
 */
export const fetchCultureItems = async () => {
  await delay();
  return {
    category_order: CATEGORY_TREE.map(node => node.name),
    data: MOCK_DATA,
  };
};

export default fetchCultureItems;
