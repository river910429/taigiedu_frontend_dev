/**
 * 「回報問題」各頁面設定 (Report Issue Page Config)
 *
 * 依 Figma「PD 台語文 workshop - WF paper prototype 2025」回報問題流程建立。
 * 每個前台頁面只要在 REPORT_PAGE_CONFIG 加一筆設定，就能沿用同一套彈窗；
 * 彈窗標題為「回報問題 - {label}」，第二層下拉的選項則由 detailOptions 決定。
 *
 * 設計備註：
 * - 第一層「問題類別」全站共用（問題回報 / 其他）。
 * - 只有選「問題回報」時才會出現第二層下拉；選「其他」時第二層不出現（Figma 註記：
 *   「第一欄如果點問題回報才會跳出第二欄類別選擇，反之如果點其它，後面第二欄不會出來」）。
 * - 上傳檔案非必填，且**只收圖片檔**（Figma 註記：「上傳檔案格式只有圖片檔」）。
 *   設計稿中「媒體與社群資源」那張圖的提示文字寫成 PDF/PPT/DOC，應為沿用資源平台的殘留，
 *   此處一律以註記為準統一為 JPG／PNG。
 */

/** 第一層「問題類別」選項 */
export const ISSUE_TYPE_PROBLEM = '問題回報';
export const ISSUE_TYPE_OTHER = '其他';
export const ISSUE_TYPE_OPTIONS = [ISSUE_TYPE_PROBLEM, ISSUE_TYPE_OTHER];

/** 上傳檔案限制（僅圖片檔） */
export const UPLOAD_ACCEPT = 'image/jpeg,image/png';
export const UPLOAD_MAX_BYTES = 100 * 1024 * 1024; // 100MB
export const UPLOAD_HINT = '※限 JPG、PNG可上傳，限制 100MB。';

/**
 * 第二層「問題細項」共用選項組
 * 字詞解釋類：條目本身的文字／拼音／釋義有誤
 * 內容資料類：卡片連結、分類、外部連結相關
 */
const WORD_DETAIL_OPTIONS = ['文字 / 拼音標示錯誤', '解讀錯誤', '其它'];
const CULTURE_DETAIL_OPTIONS = ['文字 / 拼音標示錯誤', '釋義錯誤', '其它'];
const LINK_DETAIL_OPTIONS = [
    '連結名稱有誤',
    '分類有誤',
    '外部連結失效',
    '外部連結網址有誤',
    '其它',
];

/**
 * 各頁面設定
 * key    ：呼叫端使用的頁面代碼，同時當作送給後端的 page 欄位
 * label  ：彈窗標題後綴，也就是使用者當下所在的功能名稱
 * detailOptions：選「問題回報」後第二層下拉的選項
 */
export const REPORT_PAGE_CONFIG = {
    phrase: {
        label: '台語俗諺語',
        detailOptions: WORD_DETAIL_OPTIONS,
    },
    cultureFood: {
        label: '飲食',
        detailOptions: CULTURE_DETAIL_OPTIONS,
    },
    cultureFestival: {
        label: '節慶',
        detailOptions: CULTURE_DETAIL_OPTIONS,
    },
    socialmedia: {
        label: '媒體與社群資源',
        detailOptions: LINK_DETAIL_OPTIONS,
    },
    exam: {
        label: '認證考試',
        detailOptions: LINK_DETAIL_OPTIONS,
    },
};

/**
 * 取得單一頁面設定；未登錄的 pageKey 會回傳只有標題的預設值，避免整頁壞掉
 * @param {string} pageKey
 * @param {{ label?: string, detailOptions?: string[] }} [overrides] 呼叫端可臨時覆寫
 */
export const getReportPageConfig = (pageKey, overrides = {}) => {
    const base = REPORT_PAGE_CONFIG[pageKey] || { label: '', detailOptions: [] };
    return {
        pageKey,
        label: overrides.label ?? base.label,
        detailOptions: overrides.detailOptions ?? base.detailOptions ?? [],
    };
};

export default REPORT_PAGE_CONFIG;
