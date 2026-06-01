import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DownloadPage.css";

const DownloadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewerUrl, setViewerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { fileName, pdfUrl } = location.state || {}; // 接收傳遞的檔案名稱和 PDF 連結

  // 1. 設定 document.title 讓瀏覽器 PDF 閱讀器下載時能抓到正確的中文名稱
  useEffect(() => {
    if (fileName) {
      const originalTitle = document.title;
      document.title = fileName;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [fileName]);

  // 2. 將 PDF 網址透過 Fetch 轉成本地 Blob URL，以配合 document.title 達成正確下載檔名
  useEffect(() => {
    let active = true;
    let localBlobUrl = "";

    const fetchPdfBlob = async () => {
      if (!pdfUrl) return;
      try {
        setIsLoading(true);
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        if (active) {
          localBlobUrl = URL.createObjectURL(blob);
          setViewerUrl(localBlobUrl);
        }
      } catch (error) {
        console.error("預讀 PDF 失敗，降級使用原始連結:", error);
        if (active) {
          setViewerUrl(pdfUrl);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchPdfBlob();

    return () => {
      active = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [pdfUrl]);

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
      {isLoading ? (
        <div className="download-loading">
          <div className="loading-spinner"></div>
          <p>載入 PDF 文件中...</p>
        </div>
      ) : (
        /* 滿版 PDF 顯示 */
        <iframe
          src={viewerUrl}
          title={fileName}
          className="pdf-viewer"
          frameBorder="0"
        />
      )}
    </div>
  );
};

export default DownloadPage;
