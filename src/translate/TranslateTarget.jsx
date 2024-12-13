import React, { useState } from "react";
import "./TranslateTarget.css";
import TranslateFeedback from "./TranslateFeedback";

const TranslateTarget = ({
  isEditable,
  content,
  setTargetLanguage,
  onFeedbackOpen,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("目標語言"); // 預設下拉選單值
  const [isCopied, setIsCopied] = useState(false); // 控制複製按鈕狀態

  const handleCopy = () => {
    if (content.trim() === "") return; // 防止複製空內容
    navigator.clipboard
      .writeText(content) // 修正複製功能
      .then(() => {
        setIsCopied(true); // 更新按鈕狀態
        setTimeout(() => setIsCopied(false), 3000); // 3秒後恢復按鈕狀態
      })
      .catch((err) => {
        console.error("複製失敗:", err);
      });
  };

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    setTargetLanguage(language); // 更新父層狀態
  };

  const handlePlayAudio = () => {
    alert("播放文字內容：\n" + content);
    // 模擬播放功能，可以替換為實際的音頻生成和播放邏輯
  };

  return (
    <div className="translate-content">
      {/* 下拉選單 */}
      <select
        className="language-dropdown"
        value={selectedLanguage}
        onChange={handleLanguageChange}
      >
        <option value="目標語言" hidden>
          目標語言
        </option>
        <option value="漢羅">漢羅</option>
        <option value="台文">台文</option>
        <option value="台羅">台羅</option>
        <option value="白話字">白話字</option>
      </select>

      <div className="target-content-container">
        {/*  顯示區*/}
        <div
          className={`target-display-box ${
            isEditable ? "editable" : "non-editable"
          }`}
        >
          {content || <span className="placeholder">轉換內容</span>}

          {isEditable && (
            <button className="play-audio-button" onClick={handlePlayAudio}>
              <img src="src/assets/speaker-wave.svg" className="play-icon" />
            </button>
          )}
        </div>

        <button
          className={`copy-button-translate ${isCopied ? "copied" : ""}`} // 動態添加 copied 樣式
          disabled={!isEditable || content.trim() === ""} // 背景為灰色或無內容時禁用按鈕
          onClick={handleCopy}
        >
          {isCopied ? "文字已複製！" : "複製全文"}
        </button>
      </div>

      <button
        className="tran-feedback-button"
        disabled={!isEditable}
        onClick={onFeedbackOpen}
      >
        內容修正回饋
      </button>

    </div>
  );
};

export default TranslateTarget;
