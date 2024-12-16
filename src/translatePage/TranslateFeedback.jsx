import React, { useState, useEffect  } from "react";
import "./TranslateFeedback.css";

const TranslateFeedback = ({
  isOpen,
  onClose,
  originalContent,
  originalLanguage,
  translatedContent,
  translatedLanguage,
}) => {

  const [feedbackTranslated, setFeedbackTranslated] = useState(translatedContent);

  useEffect(() => {
    const handlePopState = (event) => {
      if (isOpen) {
        event.preventDefault();
        window.history.pushState(null, "", window.location.href); // 保持當前狀態
      }
    };

    if (isOpen) {
      window.history.pushState(null, "", window.location.href); // 添加歷史記錄條目
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      if (isOpen) {
        window.history.replaceState(null, "", window.location.href);
      }
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen]);

  

  const handleTranslatedChange = (e) => {
    setFeedbackTranslated(e.target.value);
  };

  const handleSubmit = () => {
    alert(
      `回饋提交成功！\n原始內容：${feedbackOriginal}\n翻譯內容：${feedbackTranslated}`
    );
    onClose(); // 关闭弹窗
  };

  if (!isOpen) return null; 

  return (
    <div className="tran-feedback-overlay">
      <div className="tran-feedback-modal">
        <div className="tran-feedback-header">
          <div>內容修正回饋</div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="feedback-body">
          {/* 左右區域 */}
          <div className="feedback-original">
            <div className="feedback-language-display">{originalLanguage}</div>
            <div className="feedback-content-container">
              <div className="feedback-text-display">{originalContent}</div>
            </div>
          </div>

          <div className="feedback-target">
            <div className="feedback-language-display">{translatedLanguage}</div>
            <div className="feedback-content-container"><textarea
              className="feedback-text-input"
              placeholder="請輸入修正後的內容..."
              defaultValue={translatedContent}
            /></div>
            
          </div>
        </div>

        <div className="feedback-footer">
          <button className="feedback-submit-button" onClick={onClose}>
            提交
          </button>
        </div>
      </div>
    </div>
  );
};
export default TranslateFeedback;
