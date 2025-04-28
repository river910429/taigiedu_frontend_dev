import React, { useState, useEffect } from "react";
import "./TranslateTarget.css";
import speakerIcon from "../assets/speaker-wave.svg";
import chevronUpIcon from "../assets/chevron-up.svg";

const TranslateTarget = ({
  isEditable,
  content,
  setTargetLanguage,
  onFeedbackOpen,
  availableLanguages,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("台羅");
  const [isCopied, setIsCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 當 availableLanguages 改變時，選擇對應的第一個可用語言
  useEffect(() => {
    if (availableLanguages.length > 0) {
      setSelectedLanguage(availableLanguages[0]);
      setTargetLanguage(availableLanguages[0]);
    }
  }, [availableLanguages, setTargetLanguage]);

  const handleCopy = () => {
    if (content.trim() === "") return;
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch((err) => {
        console.error("複製失敗:", err);
      });
  };

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    setTargetLanguage(language);
  };

  const dropdownStyle = {
    backgroundImage: `url(${chevronUpIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'calc(100% - 16px) center',
    backgroundSize: '20px 20px'
  };


  const handlePlayAudio = async () => {
    if (!content.trim()) {
      alert("沒有可播放的內容！");
      return;
    }
  
    setIsPlaying(true); // 設定播放中狀態
  
    try {
      let ttsLang = "tb"; // 預設是漢羅
    
      switch (selectedLanguage) {
        case "台羅":
          ttsLang = "tl";
          break;
        case "漢羅":
          ttsLang = "tb";
          break;
        case "白話字":
          ttsLang = "poj";
          break;
        default:
          ttsLang = "tb"; // 預設漢羅
      }
      const response = await fetch("https://dev.taigiedu.com/backend/synthesize_speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tts_lang: ttsLang, 
          tts_data: content,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
      }
  
      const synthesizedAudioBase64 = await response.text(); // API 回傳 Base64 音訊
  
      // 創建並播放音頻，監聽播放結束事件
      const audioSrc = `data:audio/wav;base64,${synthesizedAudioBase64}`;
      const audio = new Audio(audioSrc);
      
      // 設置音訊事件處理
      audio.onloadeddata = () => {
        audio.play().catch(err => {
          console.error("播放音訊時發生錯誤:", err);
          setIsPlaying(false);
        });
      };
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        console.error("音頻載入失敗");
        setIsPlaying(false);
      };
      
    } catch (error) {
      console.error("語音合成失敗:", error);
      alert("語音合成失敗，請稍後再試");
      setIsPlaying(false);
    }
  };

  return (
    <div className="translate-content">
      <select
        className="language-dropdown"
        value={selectedLanguage}
        onChange={handleLanguageChange}
        style={dropdownStyle}
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <div className="target-content-container">
        <div
          className={`target-display-box ${
            isEditable ? "editable" : "non-editable"
          }`}
        >
          {content || <span className="tran-placeholder">轉換內容</span>}

          {isEditable && (
            <button 
              className={`play-audio-button ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlayAudio} 
              disabled={isPlaying}
              aria-label="播放音訊"
            >
              <img 
                src={speakerIcon} 
                className="play-icon" 
                alt="播放"
              />
            </button>
          )}
        </div>

        <button
          className={`copy-button-translate ${isCopied ? "copied" : ""}`}
          disabled={!isEditable || content.trim() === ""}
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