import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DownloadPage.css";

const DownloadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { fileName, pdfUrl } = location.state || {}; // 接收傳遞的檔案名稱和 PDF 連結

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
      {/* 滿版 PDF 顯示 */}
      <iframe
        src={pdfUrl}
        title={fileName}
        className="pdf-viewer"
        frameBorder="0"
      />
    </div>
  );
};

export default DownloadPage;
