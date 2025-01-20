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

  const navigate = useNavigate();
  const handleCardClick = (card) => {
    navigate("/file-preview", {
      state: { ...card }, // 傳遞所有卡片資料到目標頁面
    });
  };

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