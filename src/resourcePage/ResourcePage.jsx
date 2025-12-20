import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResourceHeader from "./ResourceHeader";
import ResourceContent from "./ResourceContent";
import UploadResource from "./UploadResource";
import "./ResourcePage.css";

const ResourcePage = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchParams, setSearchParams] = useState({
    stage: "",
    version: "",
    contentType: ["學習單", "簡報", "教案", "其他"], // 預設包含所有內容類型
    keyword: "",
    searchContent: ""
  });

  // 初始化時從 localStorage 檢查登入狀態
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true" && !isLoggedIn && typeof setIsLoggedIn === 'function') {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn, setIsLoggedIn]);

  const handleUploadOpen = () => {
    setIsUploadOpen(true);
  };

  const handleUploadClose = () => {
    setIsUploadOpen(false);
  };

  // 處理上傳成功後的重新載入
  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1); // 增加 refreshKey 觸發重新載入
    setIsUploadOpen(false);
  };

  // 處理搜索請求
  const handleSearch = (params) => {
    setSearchParams(params);
  };
  // const navigate = useNavigate();
  // const handleCardClick = (card) => {
  //   navigate("/file-preview", {
  //     state: { ...card }, // 傳遞所有卡片資料到目標頁面
  //   });
  // };

  // const handleCardClick = (card) => {
  //   const previewUrl = `/file-preview?title=${encodeURIComponent(card.title)}&imageUrl=${encodeURIComponent(card.imageUrl)}&fileType=${encodeURIComponent(card.fileType)}&likes=${card.likes}&downloads=${card.downloads}&uploader=${encodeURIComponent(card.uploader)}&tags=${encodeURIComponent(JSON.stringify(card.tags))}&date=${encodeURIComponent(card.date)}`;
  //   window.open(previewUrl, '_blank');
  // };

  // 處理資源卡片點擊 - 在新分頁開啟並傳遞完整數據
  const handleCardClick = (resource) => {
    try {
      // 處理圖片 URL
      const getFullImageUrl = (url) => {
        if (!url || url === "/src/assets/resourcepage/file_preview_demo.png") {
          return "/src/assets/resourcepage/file_preview_demo.png";
        }
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        return `${import.meta.env.VITE_API_URL}/${url}`;
      };

      // 處理檔案 URL
      const getFullFileUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        return `${import.meta.env.VITE_API_URL}/${url}`;
      };

      // 確保所有數據都被正確編碼並傳遞
      const tagsString = encodeURIComponent(JSON.stringify(resource.tags || []));

      // 完整的資源 URL，包含所有必要參數
      const previewUrl = `${window.location.origin}/file-preview?` +
        `title=${encodeURIComponent(resource.title || '無標題資源')}` +
        `&imageUrl=${encodeURIComponent(getFullImageUrl(resource.imageUrl))}` +
        `&fileType=${encodeURIComponent(resource.fileType || 'PDF')}` +
        `&likes=${resource.likes || 0}` +
        `&downloads=${resource.downloads || 0}` +
        `&uploader=${encodeURIComponent(resource.uploader_name || '匿名上傳者')}` +
        `&tags=${tagsString}` +
        `&date=${encodeURIComponent(resource.date || '')}` +
        `&fileUrl=${encodeURIComponent(getFullFileUrl(resource.fileUrl))}` +
        `&id=${encodeURIComponent(resource.id || '')}`;

      // 在新分頁中打開預覽頁面
      window.open(previewUrl, '_blank', 'noopener,noreferrer');

      console.log("開啟預覽頁面:", previewUrl);
    } catch (error) {
      console.error("處理卡片點擊時發生錯誤:", error);
    }
  };

  // const handleCardClick = (card) => {
  //   const tags = JSON.stringify(card.tags);
  //   const previewUrl = `${window.location.protocol}/${window.location.host}/file-preview?title=${encodeURIComponent(card.title)}&imageUrl=${encodeURIComponent(card.imageUrl)}&fileType=${encodeURIComponent(card.fileType)}&likes=${card.likes}&downloads=${card.downloads}&uploader=${encodeURIComponent(card.uploader)}&tags=${encodeURIComponent(tags)}&date=${encodeURIComponent(card.date)}`;
  //   window.open(previewUrl, '_blank', 'noopener,noreferrer');
  //   console.log("網址："+previewUrl);
  // };

  return (
    <div className="resource-page">
      <ResourceHeader
        onUploadOpen={handleUploadOpen}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        onSearch={handleSearch}
      />
      <ResourceContent
        key={refreshKey}
        searchParams={searchParams}
        onCardClick={handleCardClick}
      />
      <UploadResource
        isOpen={isUploadOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default ResourcePage;