import ReadOnlyNotice from '../../../components/ReadOnlyNotice/ReadOnlyNotice';
import { useContentEditPermission } from '../../useContentEditPermission';
import './adminCultureTestPage.css';

/**
 * 台語文化（test）— 後台管理頁
 *
 * 這是「節慶飲食」後台（adminFoodPage / adminFestivalPage）的新版重寫，目前僅為空架構頁。
 * 待新版設計與後端 API 完成後，再以本頁取代舊版兩頁；在那之前兩套並存，舊版不動。
 *
 * 依專案慣例，內容管理頁一律用 useContentEditPermission 取得 canEditContent，
 * 用它隱藏新增／編輯／刪除、關閉拖曳排序，並在 handler 內再擋一次。
 * 目前尚無操作可擋，先保留唯讀提示，後續實作時沿用此模式。
 */
const AdminCultureTestPage = () => {
  const canEditContent = useContentEditPermission();

  return (
    <div className="admin-test-page admin-culture-test-page p-4">
      <div className="admin-header-main">
        <h5 className="mb-3 text-secondary">台語文化（test）</h5>
      </div>

      <ReadOnlyNotice show={!canEditContent} />

      <div className="admin-culture-test-placeholder">
        <p className="mb-2">本頁為「節慶飲食」後台的新版開發中頁面，尚未串接後端 API。</p>
        <ul className="mb-0">
          <li>新版資料結構與表格欄位設計</li>
          <li>串接後端 API（取代舊版 /admin/culture/food、/admin/culture/festival）</li>
          <li>完成後移除舊版「節慶飲食」選單與頁面</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminCultureTestPage;
