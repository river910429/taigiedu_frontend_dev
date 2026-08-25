/**
 * 職業台語（test）— 假資料 API
 *
 * ⚠️ 這是開發階段的 mock，尚未串接後端。前台（/occupation-test）與後台（/admin/occupation-test）
 * 共用本檔的同一份記憶體資料，因此在後台新增／修改／刪除後，切到前台即可看到結果
 * （重整頁面就會回到初始假資料）。
 *
 * ── 與「台語教學資源共享平台」的差異 ──
 * 版面沿用資源共享平台（卡片牆 + 篩選列 + 分頁），但：
 *   1. 篩選只有**一個**分類下拉（目前為「醫療長照 / 行業台語」兩項），沒有階段／版本／內容類型
 *   2. 卡片點擊**不另開新分頁**，直接在站內導到 /occupation-test/:id
 *   3. **不記錄點讚數與下載次數**，因此沒有 likes / downloads 欄位
 *
 * 分類清單日後改由後端提供（見 fetchOccupationCategories），
 * 屆時把這支檔案的 CATEGORY_OPTIONS 換成 API 回傳即可，頁面不需改動。
 */

/** 篩選分類（陣列順序即下拉顯示順序）。日後改由後端資料庫匯入。 */
export const CATEGORY_OPTIONS = ['醫療長照', '行業台語'];

/** 各分類的取材主題（純粹讓假資料看起來像真的，不具分類意義） */
const TOPICS = {
  醫療長照: [
    '看診對話',
    '身體部位講法',
    '居家照顧日常',
    '藥物與用藥說明',
    '長照機構溝通',
    '復健與行動輔具',
    '量血壓與生命徵象',
    '失智照護應對',
    '陪同就醫流程',
    '急症與求助用語',
  ],
  行業台語: [
    '市場買賣',
    '餐飲點餐',
    '水電修繕',
    '農漁業作息',
    '木工與土水',
    '美容美髮',
    '交通運輸',
    '公務洽公',
    '零售結帳',
    '工地安全宣導',
  ],
};

const TITLE_PATTERNS = [
  topic => `【教案】${topic}台語會話`,
  topic => `【學習單】${topic}常用詞彙`,
  topic => `【簡報】${topic}情境教學`,
  topic => `${topic}：職場台語入門`,
  topic => `${topic}實務對話練習`,
  topic => `${topic}台語單字卡`,
];

const UPLOADERS = ['Tshuì水團隊', '台語教研小組', '林老師', '陳老師', '職場台語工作坊'];
const FILE_TYPES = ['pdf', 'ppt', 'doc'];

/** 固定種子的偽亂數，確保每次重整看到的假資料一致（方便比對畫面） */
const seededRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
};

const pick = (random, list) => list[Math.floor(random() * list.length)];

const buildMockData = () => {
  const random = seededRandom(20260815);
  const items = [];
  let id = 1;

  CATEGORY_OPTIONS.forEach(category => {
    const topics = TOPICS[category] || [category];

    // 每個分類 18 筆，剛好超過一頁（12 筆）方便驗證分頁
    for (let index = 0; index < 18; index += 1) {
      const topic = topics[index % topics.length];
      const pattern = TITLE_PATTERNS[index % TITLE_PATTERNS.length];
      const round = Math.floor(index / TITLE_PATTERNS.length) + 1;
      const month = 1 + Math.floor(random() * 12);
      const day = 1 + Math.floor(random() * 28);

      items.push({
        id: id++,
        category,
        topic,
        title: `${pattern(topic)}${round > 1 ? `（${round}）` : ''}`,
        uploader: pick(random, UPLOADERS),
        fileType: pick(random, FILE_TYPES),
        // 本功能不記錄點讚數與下載次數，故不提供 likes / downloads 欄位
        date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} 09:00:00`,
        // 尚無圖片與檔案，前台會顯示預設佔位圖；接上 API 後改放實際路徑
        imageUrl: null,
        fileUrl: '',
        fileName: '',
        // 詳細頁只放檔案預覽圖與「閱讀全部」，不再有說明文字，故不提供 summary / sections
        // 以下為後台管理欄位，前台不使用
        is_deleted: false,
        created_at: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00:00Z`,
      });
    }
  });

  return items;
};

// 記憶體資料表：前台讀未刪除的、後台讀全部，後台的異動直接改這個陣列
let MOCK_ITEMS = buildMockData();
let nextItemId = MOCK_ITEMS.length + 1;

const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 取得職業台語資源清單（mock）
 *
 * 一次回傳全部資料，篩選／搜尋／分頁皆由前台處理，
 * 與「台語文化（test）」相同；接上真實 API 後只需改這裡。
 */
export const fetchOccupationResources = async () => {
  await delay();
  return {
    categories: [...CATEGORY_OPTIONS],
    data: MOCK_ITEMS.filter(item => !item.is_deleted),
  };
};

/** 取得單筆資源（mock），供詳細頁使用 */
export const fetchOccupationResourceById = async (id) => {
  await delay(150);
  return MOCK_ITEMS.find(item => String(item.id) === String(id) && !item.is_deleted) || null;
};

/** 取得分類清單（mock）。後端完成後改打 API，前台不需改動。 */
export const fetchOccupationCategories = async () => {
  await delay(100);
  return [...CATEGORY_OPTIONS];
};

/**
 * 【後台】取得資源列表（mock，對應 GET /admin/occupation-resource）
 *
 * 回傳攤平陣列且**包含已刪除的資料**（後台以 is_deleted 分成「目前資源／刪除紀錄」兩個視圖）。
 */
export const fetchAdminOccupationResources = async () => {
  await delay();
  return MOCK_ITEMS.map(item => ({ ...item }));
};

/**
 * 【後台】新增一筆（mock，對應 POST /admin/occupation-resource/add）
 *
 * ⚠️ `uploader` 在真實 API 應由後端依 Bearer Token 判定登入者後寫入，
 * 前端不該送這個欄位；mock 沒有 Token，暫時由呼叫端帶入 AuthContext 的使用者名稱。
 */
export const addOccupationResource = async (payload) => {
  await delay(200);
  if (!CATEGORY_OPTIONS.includes(payload.category)) throw new Error('分類不存在');

  MOCK_ITEMS.push({
    id: nextItemId++,
    category: payload.category,
    // topic 只用於前台搜尋的比對字串，後台沒有這個欄位，新資料留空
    topic: '',
    title: payload.title,
    uploader: payload.uploader || '',
    fileType: payload.fileType || '',
    date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    imageUrl: payload.imageUrl || null,
    fileUrl: payload.fileUrl || '',
    fileName: payload.fileName || '',
    is_deleted: false,
    created_at: new Date().toISOString(),
  });

  return { success: true, message: '新增成功' };
};

/**
 * 【後台】修改／刪除／復原（mock，對應 POST /admin/occupation-resource/modify）
 *
 * action: '1' = 刪除（軟刪除）／'2' = 復原／'3' = 修改
 */
export const modifyOccupationResource = async ({ id, action, ...payload }) => {
  await delay(200);
  const target = MOCK_ITEMS.find(item => String(item.id) === String(id));
  if (!target) throw new Error('找不到該筆資料');

  if (action === '1') {
    target.is_deleted = true;
  } else if (action === '2') {
    target.is_deleted = false;
  } else if (action === '3') {
    if (!CATEGORY_OPTIONS.includes(payload.category)) throw new Error('分類不存在');
    Object.assign(target, {
      category: payload.category,
      title: payload.title,
      uploader: payload.uploader || '',
      fileType: payload.fileType || '',
      imageUrl: payload.imageUrl || null,
      fileUrl: payload.fileUrl || '',
      fileName: payload.fileName || '',
    });
  } else {
    throw new Error('未知的 action');
  }

  return { success: true, message: '更新成功' };
};

/** 測試／開發用：把假資料重設回初始狀態 */
export const resetOccupationMockData = () => {
  MOCK_ITEMS = buildMockData();
  nextItemId = MOCK_ITEMS.length + 1;
};

export default fetchOccupationResources;
