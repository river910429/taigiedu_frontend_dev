import { useAuth } from '../contexts/AuthContext';

/** 無編輯權限時的統一提示文字 */
export const NO_EDIT_PERMISSION_MESSAGE = '您沒有編輯內容的權限（需要內容管理員）';

/**
 * 內容管理頁的編輯權限
 *
 * 依權限表：「新增／修改／刪除內容」僅限 CONTENT_MANAGER。
 * 純 SYSTEM_MANAGER（flags = 2）可以進後台、可以查看內容，但不能編輯；
 * 超級管理員（flags = 3）同時具備 CONTENT_MANAGER 故不受影響。
 *
 * @returns {boolean} 是否可以新增／修改／刪除內容
 *
 * @example
 *   const canEditContent = useContentEditPermission();
 *   {canEditContent && <button>新增項目</button>}
 */
export function useContentEditPermission() {
  const { isContentManager } = useAuth();
  return isContentManager();
}

export default useContentEditPermission;
