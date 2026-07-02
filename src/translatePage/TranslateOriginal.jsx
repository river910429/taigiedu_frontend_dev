import React, { useState } from "react";
import "./TranslateOriginal.css";
import CustomSelect from "../components/CustomSelect/CustomSelect";

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

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setOriginalLanguage(language); // 更新父層狀態
  };

  return (
    <div className="translate-content">
      {/* 下拉選單 */}
      <div className="translate-select">
        <CustomSelect
          options={["台文漢字", "華文", "台羅", "白話字"]}
          value={selectedLanguage}
          onChange={handleLanguageChange}
        />
      </div>

      {/* 大輸入框 */}
      <textarea
        className="original-input-box"
        placeholder="請輸入文字內容"
        value={content}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default TranslateOriginal;
