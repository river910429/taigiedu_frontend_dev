import React, { useState, useEffect } from "react";
import "./TranslateTarget.css";

const TranslateTarget = ({
  isEditable,
  content,
  setTargetLanguage,
  onFeedbackOpen,
  availableLanguages,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("台羅"); // 預設下拉選單值
  const [isCopied, setIsCopied] = useState(false); // 控制複製按鈕狀態
  const [isPlaying, setIsPlaying] = useState(false); // 控制播放按鈕狀態

  // 當 availableLanguages 改變時，選擇對應的第一個可用語言
  useEffect(() => {
    if (availableLanguages.length > 0) {
      setSelectedLanguage(availableLanguages[0]);
      setTargetLanguage(availableLanguages[0]); // 更新父層狀態
    }
  }, [availableLanguages, setTargetLanguage]);

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

  // const handlePlayAudio = () => {
  //   alert("播放文字內容：\n" + content);
  //   // 模擬播放功能，可以替換為實際的音頻生成和播放邏輯
  // };

  const handlePlayAudio = async () => {
    if (!content.trim()) {
      alert("沒有可播放的內容！");
      return;
    }

    setIsPlaying(true); // 設定播放中狀態

    try {
      const response = await fetch("https://dev.taigiedu.com/backend/synthesize_speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tts_lang: "tb", // 假設 API 使用 "tb" 表示漢羅
          tts_data: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
      }

      const synthesizedAudioBase64 = await response.text(); // API 回傳 Base64 音訊

      playAudio(synthesizedAudioBase64); // 播放音訊
    } catch (error) {
      console.error("語音合成失敗:", error);
      alert("語音合成失敗，請稍後再試");
    } finally {
      setIsPlaying(false); // 恢復按鈕狀態
    }
  };

  const playAudio = (base64Audio) => {
    const audioSrc = `data:audio/wav;base64,${base64Audio}`;
    const audio = new Audio(audioSrc);
    audio.play().catch((err) => console.error("播放音訊時發生錯誤:", err));
  };

  return (
    <div className="translate-content">
      {/* 下拉選單 */}
      <select
        className="language-dropdown"
        value={selectedLanguage}
        onChange={handleLanguageChange}
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <div className="target-content-container">
        {/*  顯示區*/}
        <div
          className={`target-display-box ${
            isEditable ? "editable" : "non-editable"
          }`}
        >
          {content || <span className="tran-placeholder">轉換內容</span>}

          {isEditable && (
            <button className="play-audio-button" onClick={handlePlayAudio} disabled={isPlaying} >
               {isPlaying ? "播放中..." : <img src="src/assets/speaker-wave.svg" className="play-icon" />}
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
