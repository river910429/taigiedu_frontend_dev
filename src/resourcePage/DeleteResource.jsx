import React, { useState } from "react";
import "./DeleteResource.css";
import ResourceContent from "./ResourceContent";
import ResourceCard from "./ResourceCard";
import ConfirmDialog from "./ConfirmDialog";

const DeleteResource = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); 
  const [selectedCard, setSelectedCard] = useState(null); 

  const handleDeleteDialog = (cardIndex) => {
    setSelectedCard("113台語輔助真平資源"); 
    setIsDialogOpen(true); 
  };

  const handleConfirm = () => {
    console.log(`刪除檔案: ${selectedCard}`);
    alert("刪除成功！");
    setIsDialogOpen(false); // 關閉模態框
    // 在此處處理刪除邏輯，例如從列表中刪除該卡片
  };

  const handleCancel = () => {
    setIsDialogOpen(false); // 關閉模態框
  };

  // 自定義渲染卡片邏輯
  const renderCard = (card, index) => (
    <div key={index} className="delete-card-wrapper">
      
      <ResourceCard {...card} onCardClick={null} /> {/* 關閉跳轉 */}
      <div className="delete-overlay"></div>
      <button className="delete-button" onClick={() => handleDeleteDialog(index)}>
        <img
          src="/src/assets/resourcepage/delete-icon.svg"
          alt="Delete"
          className="delete-icon"
        />
        <span>刪除</span>
      </button>
    </div>
  );

  return (
    <div className="delete-resource-page">
      <button className="back-button" onClick={() => window.history.back()}>
        <img
          src="/src/assets/resourcepage/arrow-left-circle.svg"
          alt="Back"
          className="back-icon"
        />
        <span className="back-text">回到前頁</span>
      </button>

      <div className="file-separator">&nbsp;</div>
      <div className="delete-resource-title">我的已上傳資源</div>

      {/* 使用 ResourceContent 並傳入自定義點擊事件 */}
      <ResourceContent numberOfCards={10} renderCard={renderCard} />

      <ConfirmDialog
        isOpen={isDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        fileName={`${selectedCard}`}
      />

    </div>
  );
};
export default DeleteResource;
