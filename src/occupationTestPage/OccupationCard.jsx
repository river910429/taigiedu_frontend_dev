import envConfig from '../config';
import defaultPreviewImage from '../assets/resourcepage/file_preview_demo.png';

/**
 * 職業台語（test）— 資源卡片
 *
 * ⚠️ 這頁**不使用** resourcePage/ResourceCard，也**不得修改**那個共用元件。
 * 兩邊需求不同（本頁不顯示點讚數與下載次數），所以在這裡獨立實作一份，
 * 樣式在 OccupationTestPage.css。
 *
 * 卡片內容：預覽圖 + 檔案類型標籤 + 標題 + 上傳者 + 標籤。
 */
const OccupationCard = ({ imageUrl, fileType, title, uploader, tags = [], onCardClick }) => {
  const resolveImageUrl = (url) => {
    if (!url) return defaultPreviewImage;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = String(envConfig.apiUrl || '').replace(/\/+$/, '');
    return `${base}/${String(url).replace(/^\/+/, '')}`;
  };

  return (
    <div className="otp-card" onClick={onCardClick}>
      <div
        className="otp-card-header"
        style={{ backgroundImage: `url(${resolveImageUrl(imageUrl)})` }}
      >
        <div className="otp-card-filetype">{fileType}</div>
      </div>

      <div className="otp-card-content">
        <h3 className="otp-card-title">{title}</h3>
        <p className="otp-card-uploader">上傳者：{uploader}</p>
        <div className="otp-card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="otp-card-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccupationCard;
