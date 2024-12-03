import React, { useState } from "react";
import "./ReadContent.css";
import { useFontSize } from "./ReadPage";

const ReadContent = () => {
  const { fontSize } = useFontSize(); // 獲取當前字體大小

  const maxCharLimit = 500; // 最大字數限制
  const [content, setContent] = useState(""); // 輸入框內容
  const [remainingChars, setRemainingChars] = useState(maxCharLimit); // 剩餘字數

  const handleInputChange = (e) => {
    const text = e.target.value;
    setContent(text);
    setRemainingChars(maxCharLimit - text.length);
  };

  const handleGenerateAudio = () => {
    if (content.trim() === "") return; // 防止生成空內容
    alert(`產生音檔中...\n\n內容：${content}`);
  };

  return (
    <div className="read-content">
      {/* 大輸入框 */}
      <textarea
        className={`input-box ${fontSize}`} // 根據字體大小動態
        placeholder="請在此輸入文字..."
        value={content}
        onChange={handleInputChange}
        maxLength={maxCharLimit}
      />

      {/* 剩餘字數 */}
      <div className={`remaining-chars ${remainingChars <= 50 ? "low" : ""}`}>
        剩餘字數：{remainingChars}
      </div>

      {/* 按鈕區域 */}
      <div className="button-container">
        <button
          className={`generate-audio-button ${
            content.trim() === "" ? "disabled" : "enabled"
          }`}
          onClick={handleGenerateAudio}
          disabled={content.trim() === ""}
        >
          產生音檔
        </button>
      </div>
    </div>
  );
};

export default ReadContent;
