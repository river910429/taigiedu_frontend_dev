import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResourcePage.css";

import ResourceHeader from "./ResourceHeader";
import ResourceContent from "./ResourceContent";
import UploadResource from "./UploadResource";

const ResourcePage = ({isLoggedIn, setIsLoggedIn  }) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false); // 控制上傳頁面

  const handleUploadOpen = () => {
    setIsUploadOpen(true);
  };

  const handleUploadClose = () => {
    setIsUploadOpen(false);
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

  
  const handleCardClick = (card) => {
    const tags = JSON.stringify(card.tags);
    // 構建正確的 URL
    const previewUrl = `${window.location.origin}/file-preview?title=${encodeURIComponent(card.title)}&imageUrl=${encodeURIComponent(card.imageUrl)}&fileType=${encodeURIComponent(card.fileType)}&likes=${card.likes}&downloads=${card.downloads}&uploader=${encodeURIComponent(card.uploader)}&tags=${encodeURIComponent(tags)}&date=${encodeURIComponent(card.date)}`;
    
    // 打開新窗口
    const newWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
    console.log("網址："+previewUrl);
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
      />
      <ResourceContent
        numberOfCards={241}
        onCardClick={(card) => handleCardClick(card)}
      />
      <UploadResource isOpen={isUploadOpen} onClose={handleUploadClose} />
    </div>
  );
};

export default ResourcePage;