import './ReadOnlyNotice.css';

/**
 * 唯讀提示橫幅
 *
 * 用於內容管理頁：當使用者只有 SYSTEM_MANAGER 權限時，
 * 說明為什麼看不到新增／修改／刪除的操作。
 *
 * @param {Object} props
 * @param {boolean} props.show - 是否顯示（通常傳 !canEditContent）
 * @param {string} [props.message]
 */
const ReadOnlyNotice = ({
  show,
  message = '您目前的權限僅能檢視內容，新增／修改／刪除需要「內容管理員」權限。',
}) => {
  if (!show) return null;

  return (
    <div className="read-only-notice" role="status">
      <span className="read-only-notice-icon" aria-hidden="true">🔒</span>
      <span>{message}</span>
    </div>
  );
};

export default ReadOnlyNotice;
