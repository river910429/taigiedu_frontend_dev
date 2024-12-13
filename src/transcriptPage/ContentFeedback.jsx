import React, { useState, useEffect } from "react";
import "./ContentFeedback.css";

const ContentFeedback = ({ isOpen, onClose, content, onSubmit  }) => {
  const [editableContent, setEditableContent] = useState(content || ""); // 預設為傳遞的內容

  useEffect(() => {
    const handlePopState = (event) => {
      if (isOpen) {
        // 阻止返回頁面行為
        event.preventDefault();
        window.history.pushState(null, "", window.location.href); // 重新添加條目
      }
    };

    if (isOpen) {
      // 初始化內容
      setEditableContent(content);
      // 添加一個新的歷史記錄條目
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      if (isOpen) {
        window.history.replaceState(null, "", window.location.href);
      }

      // 滾動到頁面頂部
      window.scrollTo(0, 0);

      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, content]);

  const handleContentChange = (event) => {
    setEditableContent(event.target.value); // 更新可編輯內容
  };

  const handleSubmit = () => {
    onSubmit(editableContent); // 傳遞更新的內容給父組件
    onClose(); // 關閉彈窗
  };

  if (!isOpen) return null; // 如果視窗未打開，不渲染任何內容

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        <p>語音：</p>
        <p>正確文字：</p>
        <textarea
          className="feedback-textarea"
          value={editableContent} // 綁定到可編輯的內容
          onChange={handleContentChange} // 更新內容
          placeholder="請輸入您的回饋內容..."
        ></textarea>

        <div className="modal-actions">
          <button className="modal-button" onClick={handleSubmit}>送出</button>
        </div>
      </div>
    </div>
  );
};

export default ContentFeedback;
