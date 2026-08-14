/**
 * 「回報問題」送出服務 (Report Issue Service)
 *
 * ⚠️ 後端 `POST /issue_report` 目前尚未實作（API 規格見 docs/report_issue_api.md）。
 * 為了讓前台流程可以完整運作，預設走 mock：只在 console 印出 payload 並回傳成功。
 * 後端上線後，把 .env 的 VITE_ENABLE_REPORT_ISSUE_MOCK 設為 'false'（或直接移除
 * 下方 USE_MOCK 判斷），即可改打真實 API，元件端不需要任何修改。
 */

import envConfig from '../config';
import { authenticatedFetch } from './authService';

const API_BASE_URL = envConfig.apiUrl;

// 預設為 mock；明確設成 'false' 才會打真實 API
const USE_MOCK = import.meta.env.VITE_ENABLE_REPORT_ISSUE_MOCK !== 'false';

/**
 * 送出問題回報
 * @param {Object} payload
 * @param {string} payload.page            頁面代碼（reportIssueConfig 的 key，如 'phrase'）
 * @param {string} payload.page_label      頁面／功能名稱（彈窗標題後綴，如 '台語俗諺語'）
 * @param {string} payload.page_path       使用者當下的完整路徑（含 query string）
 * @param {string} payload.issue_type      第一層問題類別（問題回報 / 其他）
 * @param {string} payload.issue_category  第二層問題細項；選「其他」時為空字串
 * @param {string} payload.title           問題名稱
 * @param {string} payload.description     問題描述
 * @param {string} payload.attachment      附件檔名／路徑；未上傳時為空字串
 * @param {string} payload.username        回報者（未登入為空字串）
 * @param {string} payload.created_at      ISO 8601 時間字串
 * @returns {Promise<{ success: boolean, message?: string, report_id?: string }>}
 */
export const submitIssueReport = async (payload) => {
    if (USE_MOCK) {
        console.info('[reportIssueService] mock 送出問題回報：', payload);
        await new Promise((resolve) => setTimeout(resolve, 400));
        return { success: true, message: '已收到您的回報，感謝您的協助' };
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/issue_report`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !(result?.success || result?.status === 'success')) {
        throw new Error(result?.message || '回報失敗，請稍後再試');
    }

    return {
        success: true,
        message: result?.message,
        report_id: result?.report_id,
    };
};

export default { submitIssueReport };
