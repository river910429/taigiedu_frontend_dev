/**
 * 台語文化（test）— 假資料 API
 *
 * ⚠️ 這是開發階段的 mock，尚未串接後端。
 * 分類樹（CATEGORY_TREE）是依「影音資料管理總表 - 分類彙整」建的真實分類，
 * 影音項目則是依分類自動生成的假資料（見 buildMockItems）。
 * 接上真實 API 時，把 getCategoryTree / getItems 換成實際請求即可，頁面不需改動。
 *
 * ── 分類結構重點 ──
 * 這棵樹是「不規則」的，深度 1~3 都有：
 *   文化 > 戲曲 > 歌仔戲        （三層）
 *   藝術表現 > 音樂             （兩層，第二層即末端）
 *   新聞/訪談                   （一層，第一層即末端）
 * 因此前台必須「有子分類才顯示 chip 列」，不能假設一律三層。
 *
 * desc = 分類收錄標準，用於前台說明列與 chip tooltip。
 * 只有末端分類有收錄標準；中間層（如「戲曲」「傳統工藝」）在來源表中沒有定義。
 */

/** 三層分類樹（順序即前台顯示順序） */
export const CATEGORY_TREE = [
  {
    name: '文化',
    children: [
      {
        name: '戲曲',
        children: [
          { name: '歌仔戲', desc: '專指以歌仔戲為表現形式的影音。' },
          { name: '布袋戲', desc: '專指以布袋戲為表現形式的影音。' },
          { name: '歌詩', desc: '包含各地方唸謠、民謠（如恆春民謠）、褒歌（如澎湖褒歌）等傳統民間口傳文學。' },
          { name: '其他偶戲', desc: '收錄非屬「布袋戲」，其他以操作偶為表現方式的戲種。常見如：皮影戲、魁儡戲等。' },
        ],
      },
      {
        name: '祭典',
        children: [
          { name: '藝閣/陣頭', desc: '專指陣頭、藝閣等活動。常見藝陣類型有：宋江陣、跳鼓陣、家將陣、車鼓陣、蜈蚣陣、十二婆姐陣、跑旱船、公央婆、藝閣、音樂軒社等。' },
          { name: '禮俗/儀式', desc: '收錄非屬「藝閣/陣頭」、「媽祖信仰」、「王爺信仰」的禮俗活動。包含生命禮俗（如抓周、牽亡歌）、二十四節氣活動、各宗教活動及其他民俗活動、牽墓仔歌。' },
          { name: '媽祖', desc: '收錄與媽祖信仰相關之整體活動。包含媽祖文化、進香繞境、娘傘組介紹等。若僅單獨介紹陣頭表演，則優先歸入「藝閣/陣頭」。' },
          { name: '王爺', desc: '收錄與王爺信仰相關之整體活動，如王爺文化、出巡繞境、燒王船介紹等。若僅單獨介紹表演項目，則優先歸入「藝閣/陣頭」。' },
        ],
      },
      {
        name: '傳統工藝',
        children: [
          { name: '雕塑類', desc: '於傳統工藝範疇中，在不同材質上進行雕刻塑形。' },
          { name: '木藝類', desc: '於傳統工藝範疇中，以木為媒材塑形。常見如：粧佛、木作、木雕等。' },
          { name: '竹藝類', desc: '於傳統工藝範疇中，以竹為媒材塑形。常見如：竹雕、竹編等。' },
          { name: '製陶/剪黏/窯藝/泥作類', desc: '於傳統工藝範疇中，以泥土為媒材塑形。常見如：陶藝、交趾陶、剪黏、泥塑、窯藝等。' },
          { name: '金工類', desc: '於傳統工藝範疇中，以金屬為媒材塑形。常見如：金屬工藝、錫工藝、金雕、大甲鐵壺等。' },
          { name: '漆藝/彩繪類', desc: '於傳統工藝範疇中，以漆或其他塗料製品或彩繪裝飾。常見如：漆器、漆工藝、建築彩繪、燈籠彩繪、門神彩繪、布景彩繪、粧佛等。' },
          { name: '編織/刺繡類', desc: '於傳統工藝範疇中，編織或刺繡成品。常見如：纏花、竹編、緙絲、藺草編織、繡黼、立體繡、刺繡等。' },
          { name: '其他類', desc: '非屬上述所列舉之其他傳統工藝。如：紙藝、製香、製墨、製偶、獅頭製作等。' },
        ],
      },
      {
        name: '地方/產業',
        children: [
          { name: '自然資源', desc: '地方特殊自然環境、景觀與其發展出具特色的資源。常見如：白河蓮藕、花蓮石材、東港黑鮪魚等。' },
          { name: '人造物品', desc: '具有區域歷史性或獨特性。如：鶯歌陶瓷、三義木雕、鹿港宗教文物雕刻；或可發展為區域特色之產業。常見如：白米社區木屐、竹山竹器。' },
          { name: '飲食', desc: '飲食相關文化，含食譜、料理方式、地方特色小吃及夜市飲食。' },
          { name: '節慶', desc: '台灣傳統節慶活動介紹（如春節、端午、教師節等），包含節慶由來、文化特色及相關活動。' },
          { name: '其他類', desc: '其他非屬第二層「戲曲」、「祭典」、「傳統工藝」分類之有形、無形文化資產，包括古蹟、歷史/紀念建築、聚落建築群、史蹟、考古遺址、文化景觀、古物、口述傳統等。' },
        ],
      },
    ],
  },
  {
    name: '職業台語',
    children: [
      { name: '醫療長照', desc: '專指醫病衛教與長期照護類影音。範圍涵蓋疾病介紹、保健衛教、醫療照護技巧及疾病預防等資訊。' },
      { name: '行業台語', desc: '介紹各行各業之專業術語、職業文化及產業概況。' },
    ],
  },
  {
    name: '文學',
    children: [
      { name: '俗諺語', desc: '專指以俗諺語為題材之影音內容。' },
      { name: '文學作品/作家', desc: '專指以台語作家、台語文學著作為題材之影音內容。' },
      { name: '兒童文學', desc: '針對青少年以下所創作之台語文學影音內容，包含囡仔歌、尪仔冊等。' },
    ],
  },
  {
    name: '教育',
    children: [
      { name: '百科', desc: '收錄以普及性知識、名詞定義與新詞設定為題材之影音內容。' },
      { name: '字音字形', desc: '收錄針對單字之發音、拼音、字義進行教學為題材之影音內容。' },
      { name: '教學', desc: '其他非屬第二層「百科」、「字音字形」、「演講」等分類之教學性影音內容。包含語言學習、各式主題教學等。' },
      { name: '語文競賽', desc: '關於演講、朗讀、情境式演講、讀者劇場等語文競賽項目之準備技巧、比賽紀錄或演講稿之教學影音內容。' },
      {
        name: '笑詼',
        children: [
          { name: '答喙鼓', desc: '收錄喜劇表演形式的影音。如：答喙鼓' },
        ],
      },
    ],
  },
  {
    // 第一層即末端，沒有任何子分類
    name: '新聞/訪談',
    desc: '收錄以新聞播報、人物訪談或對談為主的影音內容。若不屬於上述四類專業分類之綜藝節目、談話性節目，亦歸入此類。',
  },
  {
    name: '藝術表現',
    children: [
      { name: '音樂', desc: '著重聲音藝術與專業技巧。含作詞曲、饒舌、現代流行樂、創作曲、西洋器樂、音樂學理及聲音工作。' },
      { name: '美術', desc: '著重視覺藝術表現。包含畫作、漫畫、美展、藝術節介紹。' },
      { name: '武術/體育', desc: '含傳統武術（如七崁拳法）、太極、劍道、扯鈴，並涵蓋現代體育項目（如體操、棒球等）。' },
      { name: '戲劇', desc: '演繹類演出形式。包含舞台劇、劇場舞蹈、電影演出、劇團排練等非戲曲類演出。' },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   分類樹工具（前台也會用到，故一併匯出）
   ──────────────────────────────────────────────────────────── */

/** 依 [第一層, 第二層, 第三層] 路徑取出節點；path 可只給前面幾層 */
export const findNode = (path = []) => {
  let nodes = CATEGORY_TREE;
  let node = null;
  for (const name of path) {
    if (!name) break;
    node = (nodes || []).find(candidate => candidate.name === name);
    if (!node) return null;
    nodes = node.children;
  }
  return node;
};

/** 取得某節點的子分類清單（沒有子分類回空陣列） */
export const getChildren = (path = []) => {
  if (path.filter(Boolean).length === 0) return CATEGORY_TREE;
  return findNode(path)?.children || [];
};

/** 收集某節點底下所有末端分類的完整路徑，例如 [['文化','戲曲','歌仔戲'], ...] */
const collectLeafPaths = (node, prefix = []) => {
  const path = [...prefix, node.name];
  if (!node.children || node.children.length === 0) return [path];
  return node.children.flatMap(child => collectLeafPaths(child, path));
};

/** 全站所有末端分類路徑（36 筆） */
const ALL_LEAF_PATHS = CATEGORY_TREE.flatMap(node => collectLeafPaths(node));

/* ────────────────────────────────────────────────────────────
   假影音資料
   每個末端分類自動生成 20~45 筆，貼近實際「平均幾十筆」的量級。
   標題與連結皆為示意用，接上真實 API 後整段可刪。
   ──────────────────────────────────────────────────────────── */

// 固定種子的偽亂數，確保每次重整看到的假資料一致（方便比對畫面）
const seededRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
};

const TITLE_PATTERNS = [
  name => `${name}專題報導`,
  name => `認識${name}：入門介紹`,
  name => `${name}的歷史與演變`,
  name => `職人專訪：${name}的傳承`,
  name => `${name}實作紀錄`,
  name => `校園走讀：${name}`,
  name => `${name}與台語詞彙教學`,
  name => `地方誌：${name}的在地故事`,
  name => `${name}紀錄片精選`,
  name => `${name}主題講座`,
];

const buildMockItems = () => {
  const random = seededRandom(20260807);
  const items = [];
  let id = 1;

  ALL_LEAF_PATHS.forEach(path => {
    const leafName = path[path.length - 1];
    // 每類 20~45 筆
    const count = 20 + Math.floor(random() * 26);

    for (let index = 0; index < count; index += 1) {
      const pattern = TITLE_PATTERNS[index % TITLE_PATTERNS.length];
      const suffix = index >= TITLE_PATTERNS.length ? `（${Math.floor(index / TITLE_PATTERNS.length) + 1}）` : '';
      items.push({
        id: id++,
        level1: path[0] || '',
        level2: path[1] || '',
        level3: path[2] || '',
        title: `${pattern(leafName)}${suffix}`,
        // 尚無圖片資料，前台會顯示預設佔位圖；接上 API 後改放實際縮圖路徑
        image: null,
        url: `https://example.com/video/${id}`,
      });
    }
  });

  return items;
};

const MOCK_ITEMS = buildMockItems();

/* ────────────────────────────────────────────────────────────
   對外 API
   ──────────────────────────────────────────────────────────── */

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

/** 取得完整分類樹 */
export const getCategoryTree = async () => {
  await delay();
  return { status: 'success', data: CATEGORY_TREE };
};

/**
 * 取得影音列表
 *
 * 分類條件是「該節點底下全部」：只給 level1 就回傳整個第一層底下的所有影音，
 * 給到 level3 就只回傳該末端分類的影音。
 *
 * @param {Object} params
 * @param {string} [params.level1]
 * @param {string} [params.level2]
 * @param {string} [params.level3]
 * @param {string} [params.keyword]  關鍵字（比對標題與各層分類名稱）
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=20]
 */
export const getItems = async ({
  level1 = '',
  level2 = '',
  level3 = '',
  keyword = '',
  page = 1,
  pageSize = 20,
} = {}) => {
  await delay();

  const term = String(keyword || '').trim().toLowerCase();

  const matched = MOCK_ITEMS.filter(item => {
    if (level1 && item.level1 !== level1) return false;
    if (level2 && item.level2 !== level2) return false;
    if (level3 && item.level3 !== level3) return false;
    if (term) {
      const haystack = [item.title, item.level1, item.level2, item.level3]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    status: 'success',
    data: matched.slice(start, start + pageSize),
    total,
    page: safePage,
    totalPages,
  };
};

export default getItems;
