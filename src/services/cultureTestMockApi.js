/**
 * 台語文化（test）— 假資料 API
 *
 * ⚠️ 這是開發階段的 mock，尚未串接後端。
 *
 * ── 分類結構 ──
 * 依「影音資料管理總表 - 分類彙整」建置，但**只取前兩層**：
 *   第一層（6 個）＞ 第二層（18 個）
 * 第三層依 PM 決定捨棄，網頁不呈現。
 *
 * 注意「新聞/訪談」在來源表中沒有第二層，第一層即末端，
 * 因此 children 為空陣列，前台下拉必須支援「沒有子選單」的情況。
 *
 * ── 回傳格式 ──
 * 比照「媒體與社群資源」（POST /media）：一次回傳全部資料，
 * 依第一層分組，每筆帶 subcategory（第二層）。
 * 篩選、搜尋、分頁皆由前台處理。
 */

/** 兩層分類（陣列順序即前台顯示順序） */
export const CATEGORY_TREE = [
  { name: '文化', children: ['戲曲', '祭典', '傳統工藝', '地方/產業'] },
  { name: '職業台語', children: ['醫療長照', '行業台語'] },
  { name: '文學', children: ['俗諺語', '文學作品/作家', '兒童文學'] },
  { name: '教育', children: ['百科', '字音字形', '教學', '語文競賽', '笑詼'] },
  { name: '新聞/訪談', children: [] }, // 第一層即末端，無第二層
  { name: '藝術表現', children: ['音樂', '美術', '武術/體育', '戲劇'] },
];

/**
 * 各第二層的取材主題
 *
 * 「文化」底下這幾組原本是第三層分類，捨棄分層後留下來當假標題的素材，
 * 本身不再具備分類意義；其餘分類則依收錄標準的描述取材。
 */
const TOPICS = {
  戲曲: ['歌仔戲', '布袋戲', '唸歌', '皮影戲', '傀儡戲', '恆春民謠'],
  祭典: ['藝閣', '陣頭', '生命禮俗', '二十四節氣', '媽祖遶境', '王船祭典'],
  傳統工藝: ['神像雕刻', '大木作', '竹編', '交趾陶', '剪黏', '錫工藝', '建築彩繪', '纏花'],
  '地方/產業': ['白河蓮藕', '東港黑鮪魚', '鶯歌陶瓷', '三義木雕', '夜市小吃', '端午', '中元'],
  醫療長照: ['糖尿病衛教', '居家照護', '失智照顧', '用藥安全', '長照資源'],
  行業台語: ['市場買賣', '木工現場', '漁港作業', '車行維修', '農事節氣'],
  俗諺語: ['氣候諺語', '人情義理', '勸世諺', '農事諺'],
  '文學作品/作家': ['賴和', '楊逵', '台語詩', '小說選讀'],
  兒童文學: ['囡仔歌', '尪仔冊', '床邊故事', '童謠教唱'],
  百科: ['新詞設定', '名詞定義', '生活常識', '科普短篇'],
  字音字形: ['聲調練習', '拼音入門', '易錯字', '文白異讀'],
  教學: ['情境會話', '教案示範', '主題單元', '課室用語'],
  語文競賽: ['演講技巧', '朗讀指導', '情境式演講', '讀者劇場'],
  笑詼: ['答喙鼓', '相聲段子', '幽默短劇'],
  '新聞/訪談': ['人物專訪', '新聞播報', '談話節目', '對談紀錄'],
  音樂: ['創作曲', '現代流行樂', '饒舌', '西洋器樂', '聲音工作'],
  美術: ['畫作賞析', '漫畫創作', '美展導覽', '藝術節'],
  '武術/體育': ['七崁拳法', '太極', '劍道', '扯鈴', '棒球'],
  戲劇: ['舞台劇', '劇場舞蹈', '電影演出', '劇團排練'],
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
    // 沒有第二層時，以第一層自己當作唯一一組（item.subcategory 留空字串）
    const buckets = node.children.length > 0
      ? node.children.map(name => ({ subcategory: name, topicKey: name }))
      : [{ subcategory: '', topicKey: node.name }];

    const items = [];

    buckets.forEach(({ subcategory, topicKey }) => {
      const topics = TOPICS[topicKey] || [topicKey];
      const count = 20 + Math.floor(random() * 26); // 每組 20~45 筆

      for (let index = 0; index < count; index += 1) {
        const topic = topics[Math.floor(random() * topics.length)];
        const pattern = TITLE_PATTERNS[index % TITLE_PATTERNS.length];
        const round = Math.floor(index / TITLE_PATTERNS.length) + 1;
        items.push({
          id: id++,
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
 *     category_order: ['文化', '職業台語', ...],
 *     data: { 文化: [{ ..., subcategory: '戲曲' }], ... }
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
