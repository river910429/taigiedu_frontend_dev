// components/TranscriptHeader.jsx
import React, { useState } from "react";
import "./TranscriptHeader.css";
import recordImage from "/src/assets/record.svg";

const TranscriptHeader = () => {
  const [isChecked, setIsChecked] = useState(true); // 模式切換的開關狀態
  const [fontSize, setFontSize] = useState("中"); // 預設字體大小

  const toggleSwitch = () => setIsChecked(!isChecked);

  const handleFontSizeChange = (size) => setFontSize(size);

  return (
    <div className="transcript-header">
      <div className="mode-selection">
        <span>選擇模式：</span>
        <span className={`mode-option ${isChecked ? "active" : ""}`}>錄音</span>
        <label className="switch">
          <input type="checkbox" checked={isChecked} onChange={toggleSwitch} />
          <span className="slider" />
        </label>
        <span className={`mode-option ${!isChecked ? "active" : ""}`}>上傳音檔</span>
        <div className="vertical-divider" />
        <img
            src={recordImage}
            className="record-button"
          />
      </div>

      <div className="font-size-control">
        {["小", "中", "大"].map((size) => (
          <button
            key={size}
            className={`font-size-button ${fontSize === size ? "selected" : ""} ${size}`}
            onClick={() => handleFontSizeChange(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TranscriptHeader;
