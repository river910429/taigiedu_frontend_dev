// components/TranscriptHeader.jsx
import React, { useState } from "react";
import "./TranscriptHeader.css";
import recordImage from "/src/assets/record.svg";
import stopImage from "/src/assets/record_stop.svg"; // 錄音中的圖示
import loadingImage from "/src/assets/record_loading.svg"; // 處理中圖示

const TranscriptHeader = ({
  isRecording,
  isProcessing,
  onRecordClick,
  fontSize,
  onFontSizeChange,
}) => {
  const [isChecked, setIsChecked] = useState(true); // 模式切換的開關狀態
  const toggleSwitch = () => setIsChecked(!isChecked);

  return (
    <div className="transcript-header">
      <div className="mode-selection">
        <span>選擇模式：</span>
        <span className={`mode-option ${isChecked ? "active" : ""}`}>錄音</span>
        <label className="switch">
          <input type="checkbox" checked={isChecked} onChange={toggleSwitch} />
          <span className="slider" />
        </label>
        <span className={`mode-option ${!isChecked ? "active" : ""}`}>
          上傳音檔
        </span>
        <div className="vertical-divider" />

        <button
          className={`record-button ${
            isProcessing ? "processing" : isRecording ? "recording" : ""
          }`}
          onClick={onRecordClick}
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
          ) : isRecording ? (
            <>
              <span>錄音中</span>
              <img
                src={stopImage}
                alt="Stop Recording"
                className="record-icon"
              />
            </>
          ) : (
            <>
              <img
                src={recordImage}
                alt="Start Recording"
                className="record-icon"
              />
            </>
          )}
        </button>
      </div>

      <div className="font-size-control">
        {["小", "中", "大"].map((size) => (
          <button
            key={size}
            className={`font-size-button ${
              fontSize === size ? "selected" : ""
            } ${size}`}
            onClick={() => onFontSizeChange(size)} // 呼叫父層的字體大小變更函數
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TranscriptHeader;
