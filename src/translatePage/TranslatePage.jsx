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

//漢羅（tb）、台羅（tl）、白話字（poj）
const conversionModes = {
  "漢羅": { "台羅": "tbn2tl" , "白話字": "tbn2poj" },
  "台羅": { "白話字": "tl2poj", "台羅": "tl2tl" },
  "白話字": { "台羅": "poj2tl" },
};

const TranslatePage = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [originalContent, setOriginalContent] = useState(""); // 原文內容
  const [translatedContent, setTranslatedContent] = useState(""); // 翻譯後的內容
  const [originalLanguage, setOriginalLanguage] = useState("華文"); // 原始語言
  const [targetLanguage, setTargetLanguage] = useState(languageOptions["華文"][1]); // 目標語言
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); // 控制回饋頁面
  const [loading, setLoading] = useState(false); // 控制翻譯請求的 loading 狀態

  // 當原始語言變更時，重置目標語言
  const handleOriginalLanguageChange = (language) => {
    setOriginalLanguage(language);
    setTargetLanguage(""); // 重置目標語言
  };


  const handleTranslate = async () => {
    if (!originalContent.trim() || !originalLanguage || !targetLanguage) {
      return;
    }

    const conversionMode = conversionModes[originalLanguage]?.[targetLanguage];

    if (!conversionMode) {
      alert("不支援此語言轉換");
      return;
    }

    setLoading(true); // 開啟 loading 狀態

    try {
      const response = await fetch("https://dev.taigiedu.com/backend/convert_taibun", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taibun_mode: conversionMode,
          taibun_data: originalContent,
        }),
      });

      const translatedText = await response.text(); // API 回傳的是純文字

      setTranslatedContent(translatedText);
      setIsEditable(true); // 啟用目標內容的狀態
    } catch (error) {
      console.error("翻譯失敗:", error);
      alert("翻譯過程發生錯誤，請稍後再試");
    } finally {
      setLoading(false); // 關閉 loading 狀態
    }
  };

  const handleFeedbackOpen = () => {
    setIsFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setIsFeedbackOpen(false);
  };

  const handleFeedbackContentUpdate = (updatedContent) => {
    setTranslatedContent(updatedContent); // 更新翻譯內容
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
         {loading ? "翻譯中..." : "翻譯"}
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
        onContentUpdate={handleFeedbackContentUpdate} // 新增這行
      />
    </div>
  );
};

export default TranslatePage;
