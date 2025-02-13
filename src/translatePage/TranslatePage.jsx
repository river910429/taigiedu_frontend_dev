import React, { useState } from "react";
import "./TranslatePage.css";

import TranslateOriginal from "./TranslateOriginal";
import TranslateTarget from "./TranslateTarget";
import TranslateFeedback from "./TranslateFeedback";

const languageOptions = {
  漢羅: ["台羅", "漢羅",  "華文", "白話字"],
  華文: ["台羅", "漢羅", "華文", "白話字"],
  台羅: ["白話字", "台羅" ],
  白話字: ["台羅", "白話字"],
};

const TranslatePage = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [originalContent, setOriginalContent] = useState(""); // 原文內容
  const [translatedContent, setTranslatedContent] = useState(""); // 翻譯後的內容
  const [originalLanguage, setOriginalLanguage] = useState("華文"); // 原始語言
  const [targetLanguage, setTargetLanguage] = useState(languageOptions["華文"][1]); // 目標語言
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); // 控制回饋頁面

  // 當原始語言變更時，重置目標語言
  const handleOriginalLanguageChange = (language) => {
    setOriginalLanguage(language);
    setTargetLanguage(""); // 重置目標語言
  };

  const handleTranslate = () => {
    setTranslatedContent(originalContent);
    setIsEditable(true); // 啟用目標內容的狀態
  };

  const handleFeedbackOpen = () => {
    setIsFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setIsFeedbackOpen(false);
  };

  return (
    <div className="translate-page">
      {/* 原始輸入區 */}
      <TranslateOriginal
        setOriginalContent={setOriginalContent}
        setOriginalLanguage={handleOriginalLanguageChange}
      />

      {/* 翻譯按鈕 */}
      <button
        className="translate-button"
        onClick={handleTranslate}
        disabled={
          originalContent.trim() === "" ||
          originalLanguage === "" || // 必須選擇原始語言
          targetLanguage === "" // 必須選擇目標語言
        }
      >
        翻譯
      </button>

      {/* 翻譯後顯示區 */}
      <TranslateTarget
        isEditable={isEditable}
        content={translatedContent}
        setTargetLanguage={setTargetLanguage}
        targetLanguage={targetLanguage}
        availableLanguages={languageOptions[originalLanguage] || []} // 根據原始語言過濾可選擇的目標語言
        onFeedbackOpen={handleFeedbackOpen} // 傳遞開啟回饋頁面的函數
      />

      {/* 回饋頁面 */}
      <TranslateFeedback
        isOpen={isFeedbackOpen}
        onClose={handleFeedbackClose}
        originalContent={originalContent}
        originalLanguage={originalLanguage}
        translatedContent={translatedContent}
        translatedLanguage={targetLanguage}
      />
    </div>
  );
};

export default TranslatePage;
