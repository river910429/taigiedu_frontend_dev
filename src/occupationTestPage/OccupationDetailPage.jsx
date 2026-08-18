import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OccupationDetailPage.css';
import PageLoading from '../components/PageLoading/PageLoading';
import { useToast } from '../components/Toast';
import defaultPreviewImage from '../assets/resourcepage/file_preview_demo.png';
import readAllIcon from '../assets/resourcepage/Vector (Stroke).svg';
import { fetchOccupationResourceById } from '../services/occupationTestMockApi';

/**
 * 職業台語（test）— 資源詳細頁
 *
 * 由列表頁 navigate 過來，**不另開新分頁**，維持站內導覽（含側邊欄與 Header）。
 *
 * 版面比照資源共享平台的 FilePreview：**檔案預覽圖 + 底部「閱讀全部」按鈕**，
 * 預覽區裁切圖片下緣，點「閱讀全部」導到 /download 看完整檔案。
 * 說明文字（summary／sections）、日期／點讚數／下載數、AUTHOR、標籤、
 * 「下載資源」與「點讚資源」按鈕這頁一律不放（PM 指定），需要時才從 FilePreview 補回來。
 *
 * ⚠️ 資料來自 services/occupationTestMockApi.js 假資料，尚無實際檔案（fileUrl 為空）。
 */
const OccupationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      const data = await fetchOccupationResourceById(id);
      if (cancelled) return;
      setResource(data);
      setIsLoading(false);
    };

    load();
    window.scrollTo({ top: 0 });
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="occupation-detail-page">
        <PageLoading text="載入資源中..." />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="occupation-detail-page">
        <div className="otd-empty">
          <p>找不到這筆資源</p>
          <button type="button" className="otd-back-button" onClick={() => navigate('/occupation-test')}>
            返回職業台語列表
          </button>
        </div>
      </div>
    );
  }

  // 比照 FilePreview 的「閱讀全部」：帶著檔案資訊導到 /download 看完整內容
  const handleViewDownloadPage = () => {
    if (!resource.fileUrl) {
      showToast('無法查看此資源，檔案連結不可用', 'error');
      return;
    }

    navigate('/download', {
      state: {
        fileName: resource.title,
        pdfUrl: resource.fileUrl,
        fileType: resource.fileType,
      },
    });
  };

  return (
    <div className="occupation-detail-page">
      <button type="button" className="otd-back-button" onClick={() => navigate('/occupation-test')}>
        ‹ 返回職業台語列表
      </button>

      <div className="otd-header">
        <h1 className="otd-title">{resource.title}</h1>
        <div className="otd-separator">&nbsp;</div>
      </div>

      <div className="otd-preview">
        <div className="otd-preview-image">
          <img
            src={resource.imageUrl || defaultPreviewImage}
            alt={resource.title}
            onError={(e) => { e.target.src = defaultPreviewImage; }}
          />
        </div>

        <div className="otd-bottom-fixed" onClick={handleViewDownloadPage}>
          <img src={readAllIcon} alt="閱讀全部" />
          閱讀全部
        </div>
      </div>
    </div>
  );
};

export default OccupationDetailPage;
