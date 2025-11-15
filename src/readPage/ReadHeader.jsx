import React, { useState } from "react";
import "./ReadHeader.css";
import { useFontSize, useLang } from "./ReadPage";

const ReadHeader = () => {
  const { fontSize, setFontSize } = useFontSize();
  const { selectedLang, setSelectedLang } = useLang();
  const [selectedMode, setSelectedMode] = useState("台文漢字");

  const handleModeChange = (event) => {
    setSelectedMode(event.target.value);
    const langMap = {
      "台文漢字": "tb",
      "台羅": "tb",
      "白話字": "tb"
    };
    setSelectedLang(langMap[event.target.value]);
  };

  return (
    <div className="read-header">
      <h3>請使用台語文字輸入</h3>
      <div className="read-mode-area">
        <div className="mode-selection">
          <span>您使用的台語文字是：</span>
          <label>
            <input
              type="radio"
              name="mode"
              value="台文漢字"
              checked={selectedMode === "台文漢字"}
              onChange={handleModeChange}
            />
            台文漢字
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
              className={`font-size-button ${
                fontSize === size ? "selected" : ""
              } ${size}`}
              onClick={() => setFontSize(size)} // 更新字體大小
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadHeader;
