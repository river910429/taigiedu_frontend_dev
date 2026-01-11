import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import "./FilePreview.css";
import likesIcon from "../assets/resourcepage/Union (Stroke)(black).svg";
import downloadsIcon from "../assets/resourcepage/Subtract(black).svg";
import readAllIcon from "../assets/resourcepage/Vector (Stroke).svg";
import reportIcon from "../assets/report1.svg";
import defaultPreviewImage from "../assets/resourcepage/file_preview_demo.png";

const FilePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("不雅內容");
  const [resourceData, setResourceData] = useState({
    imageUrl: "",
    fileType: "",
    title: "",
    uploader: "",
    date: "",
    fileUrl: "",
    resourceId: "",
    tags: []
  });

  // 檢舉理由選項
  const reportReasons = [
    "不雅內容",
    "涉及著作權疑慮",
    "政治不中立",
    "非台語文相關",
    "重複上傳",
    "廣告內容",
    "推廣管制商品",
    "涉及隱私",
    "涉及詐騙、詐欺或假冒"
  ];

  // 從 URL 查詢參數取得資料
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);

      // 解析標籤
      let parsedTags = [];
      try {
        parsedTags = JSON.parse(decodeURIComponent(searchParams.get("tags") || "[]"));
      } catch (e) {
        console.error("解析標籤錯誤:", e);
        parsedTags = [];
      }

      // 處理圖片和檔案 URL 的函數
      const getFullUrl = (url, isImage = false) => {
        if (!url) {
          return isImage ? defaultPreviewImage : "";
        }
        // 如果是本地預設圖片路徑，使用 import 的圖片
        if (url === "/src/assets/resourcepage/file_preview_demo.png") {
          return defaultPreviewImage;
        }
        // 如果已經是完整的 HTTP/HTTPS URL，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        // 否則添加 base URL
        return `https://dev.taigiedu.com/backend/${url}`;
      };

      // 設置資源數據
      setResourceData({
        imageUrl: getFullUrl(searchParams.get("imageUrl"), true),
        fileType: searchParams.get("fileType") || "PDF",
        title: searchParams.get("title") || "無標題資源",
        uploader: searchParams.get("uploader") || "匿名上傳者",
        date: searchParams.get("date") || "未知日期",
        fileUrl: getFullUrl(searchParams.get("fileUrl")),
        resourceId: searchParams.get("id") || "",
        tags: parsedTags
      });

      // 設置計數器
      setLikesCount(parseInt(searchParams.get("likes") || "0", 10));
      setDownloadsCount(parseInt(searchParams.get("downloads") || "0", 10));

      // 檢查用戶是否已點讚
      const likedResources = JSON.parse(localStorage.getItem("likedResources") || "[]");
      setIsLiked(likedResources.includes(searchParams.get("id")));

      setIsLoading(false);
    } catch (error) {
      console.error("解析 URL 參數時發生錯誤:", error);
      setIsLoading(false);
    }
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="file-preview-loading">
        <div className="loading-spinner"></div>
        <p>載入資源預覽中...</p>
      </div>
    );
  }

  const handleViewDownloadPage = () => {
    if (!resourceData.fileUrl) {
      showToast("無法查看此資源，檔案連結不可用", "error");
      return;
    }

    navigate("/download", {
      state: {
        fileName: resourceData.title,
        pdfUrl: resourceData.fileUrl, // 這裡的 fileUrl 已經是完整的 URL
      },
    });
  };

  const handleDownload = async () => {
    if (!resourceData.fileUrl) {
      showToast("無法下載此資源，檔案連結不可用", "error");
      return;
    }

    try {
      // 如果有資源 ID，記錄下載
      if (resourceData.resourceId) {
        await fetch(`https://dev.taigiedu.com/backend/api/resource/download/${resourceData.resourceId}`, {
          method: "GET",
        });
      }

      // 使用 fetch 下載檔案並保持在當前頁面
      const response = await fetch(resourceData.fileUrl);
      const blob = await response.blob();

      // 創建下載連結
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${resourceData.title}.${resourceData.fileType.toLowerCase()}`);
      link.style.display = 'none';

      // 執行下載
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理 URL 物件
      window.URL.revokeObjectURL(downloadUrl);

      // 更新下載計數
      setDownloadsCount(prev => prev + 1);
      showToast("資源下載已開始", "success");
    } catch (error) {
      console.error("下載資源錯誤:", error);
      showToast("下載過程中發生錯誤，請稍後再試", "error");
    }
  };

  const handleLike = async () => {
    if (!resourceData.resourceId) {
      showToast("無法點讚此資源", "error");
      return;
    }

    try {
      // 如果已經點讚，不再重複點讚
      if (isLiked) {
        showToast("您已經點讚過此資源", "info");
        return;
      }

      // 準備點讚請求參數
      const parameters = {
        id: parseInt(resourceData.resourceId, 10)  // 確保 ID 是整數
      };

      // 發送點讚請求
      const response = await fetch("https://dev.taigiedu.com/backend/api/resource/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parameters)
      });

      const result = await response.json();
      console.log("點讚回應:", result);

      // 處理回應結果
      if (response.ok) {
        // 更新本地存儲記錄已點讚的資源
        const likedResources = JSON.parse(localStorage.getItem("likedResources") || "[]");
        likedResources.push(resourceData.resourceId);
        localStorage.setItem("likedResources", JSON.stringify(likedResources));

        // 更新 UI 狀態
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        showToast("已成功點讚此資源", "success");
      } else {
        showToast(result.message || "點讚失敗，請稍後再試", "error");
      }
    } catch (error) {
      console.error("點讚操作錯誤:", error);
      showToast("網絡連接錯誤，請稍後再試", "error");
    }
  };

  // 檢舉功能 - 開啟 modal
  const handleReport = () => {
    setShowReportModal(true);
  };

  // 確認檢舉
  const handleConfirmReport = () => {
    // 這裡可以加入 API 調用將檢舉資料送到後端
    console.log("檢舉資料:", {
      resourceId: resourceData.resourceId,
      title: resourceData.title,
      reason: reportReason,
      reportedAt: new Date().toISOString()
    });

    setShowReportModal(false);
    showToast("檢舉已提交，感謝您的回報", "success");
  };

  return (
    <div className="file-preview-page">
      <div className="file-preview-header">
        <h1 className="file-title">{resourceData.title}</h1>

        <div className="file-separator">&nbsp;</div>

        <div className="file-info">
          <span>{resourceData.date}</span>

          <div className="file-likes">
            <img
              src={likesIcon}
              alt="Likes"
              className="file-likes-icon"
            />
            <span>{likesCount}</span>
          </div>
          <div className="file-downloads">
            <img
              src={downloadsIcon}
              alt="Downloads"
              className="file-downloads-icon"
            />
            <span>{downloadsCount}</span>
          </div>
        </div>

        <div className="file-uploader">AUTHOR：{resourceData.uploader}</div>

        <div className="file-tags">
          {resourceData.tags.map((tag, index) => (
            <span key={index} className="file-tag">
              {tag}
            </span>
          ))}
        </div>

        <button className="file-download-button" onClick={handleDownload}>
          下載資源
        </button>

        <button
          className={`file-like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? '已點讚' : '點讚資源'}
        </button>
      </div>

      <div className="file-preview-image">
        <img src={resourceData.imageUrl} alt={resourceData.title} />
      </div>

      {/* 檢舉按鈕 - 右下角 */}
      <button className="file-report-button" onClick={handleReport}>
        <img src={reportIcon} alt="檢舉" className="report-icon" />
        <span>檢舉資源</span>
      </button>

      <div className="file-bottom-fixed" onClick={handleViewDownloadPage}>
        <img src={readAllIcon} alt="閱讀全部" />
        閱讀全部
      </div>

      {/* 檢舉 Modal */}
      {showReportModal && (
        <div className="report-modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <button className="report-modal-close" onClick={() => setShowReportModal(false)}>
              ×
            </button>
            <div className="report-modal-title">
              <span className="required">*</span>檢舉理由：
            </div>
            <div className="report-modal-options">
              {reportReasons.map((reason) => (
                <label key={reason} className="report-option">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <button className="report-modal-submit" onClick={handleConfirmReport}>
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;