import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OccupationDetailPage.css';
import PageLoading from '../components/PageLoading/PageLoading';
import defaultPreviewImage from '../assets/resourcepage/file_preview_demo.png';
import { fetchOccupationResourceById } from '../services/occupationTestMockApi';

/**
 * 職業台語（test）— 資源詳細頁
 *
 * 由列表頁 navigate 過來，**不另開新分頁**，維持站內導覽（含側邊欄與 Header）。
 *
 * 版面比資源共享平台的 FilePreview 精簡：**只有標題與內容**。
 * 日期／點讚數／下載數、AUTHOR、標籤、下載資源與點讚資源按鈕
 * 這頁一律不放（PM 指定），需要時才從 FilePreview 補回來。
 *
 * ⚠️ 資料來自 services/occupationTestMockApi.js 假資料。
 */
const OccupationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        <div className="otd-preview-doc">
          <p className="otd-preview-summary">{resource.summary}</p>

          {(resource.sections || []).map((section, index) => (
            <div key={index} className="otd-preview-section">
              <h2 className="otd-preview-heading">{section.heading}</h2>
              <p className="otd-preview-body">{section.body}</p>
            </div>
          ))}

          <img
            src={resource.imageUrl || defaultPreviewImage}
            alt={resource.title}
            className="otd-preview-image"
            onError={(e) => { e.target.src = defaultPreviewImage; }}
          />
        </div>
      </div>
    </div>
  );
};

export default OccupationDetailPage;
