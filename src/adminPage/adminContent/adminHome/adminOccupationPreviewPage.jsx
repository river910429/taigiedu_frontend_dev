import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './adminOccupationPreviewPage.css';

import defaultPreviewImage from '../../../assets/resourcepage/file_preview_demo.png';

/**
 * 職業台語（test）— 後台檔案預覽頁
 *
 * 版面比照資源共享平台的後台預覽（adminresourcePage/AdminFilePreview）：
 * 管理員檢視提示橫幅 + 紅色標題 + AUTHOR + 置中的預覽圖。
 *
 * ⚠️ **刻意不共用 `AdminFilePreview`**，而是另寫一份，原因：
 *   1. 那頁的「下架資源」按鈕打 `/admin/resource/status`（資源共享平台的端點），
 *      職業台語的資料不在那組 API 裡，按下去會送出對不上的 id；
 *   2. 本頁需要「返回列表」，那頁是另開分頁進來的、沒有返回的對象。
 * 要在那支加開關就得改到共用檔案，因此改為各自維護（PM 指定）。
 * 代價是兩邊的樣式要各自更新，調整時請留意。
 *
 * 資料全部從 query string 讀（由 adminOccupationTestPage 的「預覽」帶入），
 * 本頁不打任何 API，重新整理也不會掉資料。
 */

const AdminOccupationPreviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resource = useMemo(() => ({
    title: searchParams.get('title') || '無標題資源',
    imageUrl: searchParams.get('imageUrl') || defaultPreviewImage,
    fileType: searchParams.get('fileType') || '',
    uploader: searchParams.get('uploader') || '匿名上傳者',
    category: searchParams.get('category') || '',
  }), [searchParams]);

  return (
    <div className="oap-page">
      <button type="button" className="oap-back-button" onClick={() => navigate('/admin/occupation-test')}>
        ‹ 返回職業台語列表
      </button>

      <div className="oap-view-banner">
        <span className="oap-view-dot"></span>
        您現在使用管理員權限檢視角度
      </div>

      <div className="oap-header">
        <h1 className="oap-title">{resource.title}</h1>

        <div className="oap-info">
          <span className="oap-uploader">AUTHOR：{resource.uploader}</span>
          {resource.category && <span className="oap-meta">類別：{resource.category}</span>}
          {resource.fileType && <span className="oap-meta">檔案：{resource.fileType.toUpperCase()}</span>}
        </div>
      </div>

      <div className="oap-image">
        <img src={resource.imageUrl} alt={resource.title} />
      </div>
    </div>
  );
};

export default AdminOccupationPreviewPage;
