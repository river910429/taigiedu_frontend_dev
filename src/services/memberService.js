/**
 * 後台會員管理 API
 *
 * 權限說明：
 * - POST /admin/member/flags  需要 SYSTEM_MANAGER 權限（指派管理員身分）
 * - POST /admin/member/status 需要 CONTENT_MANAGER 權限（停用／恢復會員上傳資格）
 *
 * 註：/admin/member/status 的 action 為 binary（設置管理員／恢復會員），
 *     無法指定要給哪一種身分，因此指派管理員一律改用 /admin/member/flags。
 */

import envConfig from '../config';
import { authenticatedFetch } from './authService';

const API_BASE_URL = envConfig.apiUrl;

/**
 * 設定會員的權限 flags
 * @param {string|number} id - 會員 ID
 * @param {number} flags     - 0=會員 / 1=內容管理員 / 2=系統管理員 / 3=兩者皆是
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const updateMemberFlags = async (id, flags) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/member/flags`, {
    method: 'POST',
    body: JSON.stringify({
      id: String(id),
      flags: Number(flags),
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || result.error || '設定管理員身分失敗');
  }

  return result;
};

/**
 * 更新會員狀態（停用／恢復上傳資格）
 * @param {Object} params
 * @param {string|number} params.id
 * @param {string} params.action - '停用會員' | '恢復會員'
 * @param {string} [params.reason]
 * @param {string} [params.detail]
 */
export const updateMemberStatus = async ({ id, action, reason = '', detail = '' }) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/member/status`, {
    method: 'POST',
    body: JSON.stringify({
      id: String(id),
      action,
      reason,
      detail,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || result.error || `${action}失敗`);
  }

  return result;
};

export default { updateMemberFlags, updateMemberStatus };
