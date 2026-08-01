/**
 * 權限配置表 (Permission Config)
 *
 * ─── Flag 定義（bitmask，可疊加）─────────────────────────
 *  CONTENT_MANAGER = 1  新增/修改/刪除內容、管理會員上傳資格
 *  SYSTEM_MANAGER  = 2  權限管理、系統設定、升級管理員、Popup公告
 *
 *  後端已全面改用 flags，不再回傳 role 字串（SUPER_ADMIN 這個角色也已移除）。
 *  所有回傳使用者身分的 API（/api/user/login、/auth/refresh、/auth/me、
 *  /admin/member/list）都會帶 flags 整數。
 *
 * ─── 使用方式 ──────────────────────────────────────────
 *  import { FLAGS, hasFlag } from '../config/permissions';
 *  import { useAuth } from '../contexts/AuthContext';
 *
 *  const { user } = useAuth();
 *  if (hasFlag(user?.flags, FLAGS.SYSTEM_MANAGER)) { ... }
 *
 * ─── 設計說明 ──────────────────────────────────────────
 *  - 採用「白名單」設計：flags = 0 表示無任何後台權限
 *  - flags 可疊加：同時有兩種身份只需 OR 運算，例如 1 | 2 = 3
 * ───────────────────────────────────────────────────────
 */

/** Flag 常數 */
export const FLAGS = {
  CONTENT_MANAGER: 1,
  SYSTEM_MANAGER: 2,
};

/**
 * 身分選項（供後台「設定管理員身分」下拉/單選使用）
 * value 直接對應 POST /admin/member/flags 的 flags 整數
 */
export const FLAG_OPTIONS = [
  { value: 0, label: '會員', description: '無任何後台權限' },
  { value: FLAGS.CONTENT_MANAGER, label: '內容管理員', description: '新增／修改／刪除內容、管理會員上傳資格' },
  { value: FLAGS.SYSTEM_MANAGER, label: '系統管理員', description: '公告管理、權限管理、系統設定' },
  { value: FLAGS.CONTENT_MANAGER | FLAGS.SYSTEM_MANAGER, label: '超級管理員', description: '同時具備內容管理員與系統管理員權限' },
];

/**
 * 將 flags 整數轉為顯示用的身分名稱
 * @param {number} flags
 * @returns {string}
 */
export function flagsToRoleLabel(flags) {
  const isSystem = hasFlag(flags, FLAGS.SYSTEM_MANAGER);
  const isContent = hasFlag(flags, FLAGS.CONTENT_MANAGER);
  if (isSystem && isContent) return '超級管理員';
  if (isSystem) return '系統管理員';
  if (isContent) return '內容管理員';
  return '會員';
}

/**
 * 取得 user 的有效 flags
 *
 * flags 是唯一的權限來源；取不到（未登入、或資料尚未載入）一律視為 0（無後台權限）。
 * @param {{ flags?: number }|null|undefined} user
 * @returns {number}
 */
export function getUserFlags(user) {
  const flags = Number(user?.flags);
  return Number.isFinite(flags) ? flags : 0;
}

/**
 * 查詢 user 是否擁有指定 flag
 * @param {number} flags   - 使用者的 flags 整數
 * @param {number} flag    - 要查詢的 FLAG 常數
 * @returns {boolean}
 *
 * @example
 *   hasFlag(3, FLAGS.SYSTEM_MANAGER)   // true
 *   hasFlag(1, FLAGS.SYSTEM_MANAGER)   // false
 *   hasFlag(0, FLAGS.CONTENT_MANAGER)  // false
 */
export function hasFlag(flags, flag) {
  return (flags & flag) !== 0;
}

/**
 * 查詢 user 是否擁有任何後台權限（進入後台的最低門檻）
 * @param {number} flags
 * @returns {boolean}
 */
export function hasAnyAdminAccess(flags) {
  return flags > 0;
}

export default FLAGS;
