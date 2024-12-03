
import React, { useState } from "react";
import "./ReadHeader.css";
import { useFontSize } from "./ReadPage"; 

const ReadHeader = () => {
  const { fontSize, setFontSize } = useFontSize();
  const [selectedMode, setSelectedMode] = useState("漢羅"); 

  const handleModeChange = (event) => {
    setSelectedMode(event.target.value);
  };

  return (
    <div className="read-header">
      <div className="mode-selection">
        <span>使用台語文字：</span>
        <label>
          <input
            type="radio"
            name="mode"
            value="漢羅"
            checked={selectedMode === "漢羅"}
            onChange={handleModeChange}
          />
          漢羅
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="台羅"
            checked={selectedMode === "台羅"}
            onChange={handleModeChange}
          />
          台羅
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="白話字"
            checked={selectedMode === "白話字"}
            onChange={handleModeChange}
          />
          白話字
        </label>
      </div>

      <div className="font-size-control">
        {["小", "中", "大"].map((size) => (
          <button
            key={size}
            className={`font-size-button ${fontSize === size ? "selected" : ""} ${size}`}
            onClick={() => setFontSize(size)} // 更新字體大小
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReadHeader;
