import './FilePreview.css';

export default function FilePreview({ name = '檔案名稱', size = '-', type = '-' }) {
  return (
    <div className="file-preview">
      <div className="file-info">
        <div className="file-name">{name}</div>
        <div className="file-meta">{type} · {size}</div>
      </div>
      <div className="file-actions">
        <button className="admin-btn small">下載</button>
        <button className="admin-btn small">預覽</button>
      </div>
    </div>
  );
}
