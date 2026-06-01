import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import "./DownloadPage.css";

const DownloadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const { fileName, pdfUrl, fileType } = location.state || {}; // 接收傳遞的檔案名稱、PDF 連結與檔案類型

  const handleDownload = async () => {
    if (!pdfUrl) {
      showToast("無法下載檔案，連結無效", "error");
      return;
    }

    try {
      setIsDownloading(true);
      showToast("正在下載資源...", "info");

      // 使用 fetch 下載檔案
      const response = await fetch(pdfUrl);
      const blob = await response.blob();

      // 創建下載連結
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // 決定副檔名，預設為 pdf
      const ext = fileType ? fileType.toLowerCase() : "pdf";
      link.setAttribute('download', `${fileName}.${ext}`);
      link.style.display = 'none';

      // 執行下載
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理 URL 物件
      window.URL.revokeObjectURL(downloadUrl);
      showToast("資源下載已開始", "success");
    } catch (error) {
      console.error("下載資源錯誤:", error);
      showToast("下載過程中發生錯誤，請稍後再試", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  // 如果沒有收到必要的數據，顯示錯誤訊息或重定向
  if (!fileName || !pdfUrl) {
    return (
      <div className="download-page">
        <div className="error-message">
          <h2>無法載入檔案</h2>
          <button onClick={() => navigate(-1)}>返回上一頁</button>
        </div>
      </div>
    );
  }

  return (
    <div className="download-page">
      {/* 頂部懸浮控制列 */}
      <div className="download-header-bar">
        <button className="back-btn" onClick={() => navigate(-1)} title="返回上一頁">
          <span className="back-icon">←</span>
          <span className="back-text">返回</span>
        </button>

        <h1 className="download-title">{fileName}</h1>

        <button
          className={`download-btn ${isDownloading ? 'downloading' : ''}`}
          onClick={handleDownload}
          disabled={isDownloading}
          title="下載資源檔案"
        >
          <svg className="download-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="download-text">{isDownloading ? "下載中..." : "下載檔案"}</span>
        </button>
      </div>

      {/* PDF 顯示區 */}
      <div className="pdf-viewer-container">
        <iframe
          src={pdfUrl}
          title={fileName}
          className="pdf-viewer"
          frameBorder="0"
        />
      </div>
    </div>
  );
};

export default DownloadPage;
