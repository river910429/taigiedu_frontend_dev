import React, { useState } from "react";
import "./TranslateOriginal.css";
import chevronUpIcon from "../assets/chevron-up.svg";

const TranslateOriginal = ({ setOriginalContent, setOriginalLanguage, onContentChange }) => {
  const [content, setContent] = useState(""); // 輸入框內容
  const [selectedLanguage, setSelectedLanguage] = useState("華文"); // 預設下拉選單值

  const handleInputChange = (e) => {
    const text = e.target.value;
    setContent(text);
    setOriginalContent(text); // 更新傳入的父層狀態
    if (onContentChange) {
      onContentChange(); // 通知父層內容已改變
    }
  };
 
  const handleLanguageChange = (e) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    setOriginalLanguage(language); // 更新父層狀態
  };

  return (
    <div className="translate-content">
      {/* 下拉選單 */}
      <div className="dropdown-container">
        <select
          className="language-dropdown"
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          <option value="台文漢字">台文漢字</option>
          <option value="華文">華文</option>
          <option value="台羅">台羅</option>
          <option value="白話字">白話字</option>
        </select>
        <img 
          src={chevronUpIcon} 
          alt="dropdown arrow" 
          className="dropdown-arrow"
        />
      </div>

      <div className="original-content-container">
      {/* 大輸入框 */}
      <textarea
        className={`original-input-box`} // 根據字體大小動態
        placeholder="請輸入文字內容"
        value={content}
        onChange={handleInputChange}
      />
      </div>
    </div>
  );
};

export default TranslateOriginal;