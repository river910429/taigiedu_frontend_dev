import React, { useState, useEffect } from "react";
import "./ConfirmDialog.css";

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, fileName }) => {
 
  if (!isOpen) return null; // 如果未開啟，則不渲染

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog-container">
        <h3>您確認要刪除這筆資料？</h3>
        <p>檔案名稱：{fileName}</p>
        <div className="confirm-dialog-buttons">
          <button className="confirm-button" onClick={onConfirm}>
            <img
              src="/src/assets/resourcepage/delete-icon.svg"
              alt="Delete"
              className="delete-icon"
            />
            刪除
          </button>
          <button className="cancel-button" onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
