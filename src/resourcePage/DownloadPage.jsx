import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DownloadPage.css";

const DownloadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { fileName, pdfUrl } = location.state || {}; // 接收傳遞的檔案名稱和 PDF 連結

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
