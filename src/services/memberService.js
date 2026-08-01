/**
 * 後台會員管理 API
 *
 * 權限說明：
 * - POST /admin/member/flags  需要 SYSTEM_MANAGER 權限（設定後台權限 flags）
 * - POST /admin/member/status 需要 CONTENT_MANAGER 權限（停用／恢復會員，切換 isSuspended）
 *
 * 註：flags（後台權限）與 isSuspended（帳號啟用狀態）是兩件獨立的事，
 *     分別由上面兩支 API 管理，不要用其中一支去推導另一個。
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
 * 更新會員帳號狀態（停用／恢復；後端據此設定 isSuspended、suspendAt、suspendReason）
 * @param {Object} params
 * @param {string|number} params.id
 * @param {string} params.action - '停用會員'（isSuspended = true）| '恢復會員'（isSuspended = false）
 * @param {string} [params.reason] - 停用理由，會寫入 suspendReason
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
