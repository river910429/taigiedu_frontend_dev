import React, { useState, useEffect } from "react";
import "./ReadContent.css";
import { useFontSize } from "./ReadPage";
import loadingImage from "/src/assets/record_loading.svg"; // 處理中圖示

const ReadContent = () => {
  const { fontSize } = useFontSize(); // 獲取當前字體大小

  const maxCharLimit = 500; // 最大字數限制
  const [content, setContent] = useState(""); // 輸入框內容
  const [remainingChars, setRemainingChars] = useState(maxCharLimit); // 剩餘字數
  const [audioSrc, setAudioSrc] = useState(null); // 音檔的 URL
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // 按鈕禁用狀態
  const [initialContent, setInitialContent] = useState(""); // 音檔生成時的文字
  const [isProcessing, setIsProcessing] = useState(false); // 處理中狀態

  const handleInputChange = (e) => {
    const text = e.target.value;
    setContent(text);
    setRemainingChars(maxCharLimit - text.length);

    // 如果文字内容不同于生成音档时的内容，则启用按钮
    if (text !== initialContent) {
      setIsButtonDisabled(false);
    }
  };

  const handleGenerateAudio = () => {
    if (content.trim() === "") return; // 防止生成空內容

    setIsProcessing(true); // 顯示“處理中”
    setIsButtonDisabled(true); // 禁用按钮
    setAudioSrc(null); // 隐藏语音条

    setTimeout(() => {
      const generatedAudioUrl = "/src/assets/海豬救援隊.mp3"; // 模拟生成音档的 URL
      setAudioSrc(generatedAudioUrl); // 设置音档 URL
      setIsProcessing(false); // 取消“處理中”
      setInitialContent(content); // 保存生成音档时的内容
    }, 3000); // 模拟生成过程需要 3 秒
  };

  // 音檔生成後的檢查
  useEffect(() => {
    if (audioSrc) {
      console.log("音檔生成:", audioSrc);
    }
  }, [audioSrc]);

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
      <div className="audio-button-container">
        <button
          className={`generate-audio-button ${
            isProcessing
              ? "processing"
              : content.trim() === "" || isButtonDisabled
              ? "disabled"
              : "enabled"
          }`}
          onClick={handleGenerateAudio}
          disabled={isProcessing || content.trim() === "" || isButtonDisabled}
        >
          {isProcessing ? (
            <>
              <span>處理中</span>
              <img
                src={loadingImage}
                alt="Processing"
                className="loading-icon"
              />
            </>
          ) : (
            "產生音檔"
          )}
        </button>
        {/* 音檔播放條 */}
        {audioSrc && !isProcessing && (
          <audio controls>
            <source src={audioSrc} type="audio/mpeg" />
            您的瀏覽器不支援音檔播放。
          </audio>
        )}
      </div>
    </div>
  );
};

export default ReadContent;
