// components/TranscriptContent.jsx
import React, { useState } from "react";
import "./TranscriptContent.css";

const TranscriptContent = () => {
  const [activeTab, setActiveTab] = useState("漢羅");
  const [isCopied, setIsCopied] = useState(false); // 控制複製按鈕狀態
  const [content, setContent] = useState({
    漢羅: "這是漢羅的範例文字。",
    台羅: "Tāi-lô ê páng-lí bûn-tê.",
    白話字: "Bái-uē-jī ê bun-tê.",
  });

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleCopy = () => {
    navigator.clipboard.writeText(content[activeTab]);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 10000); // 3秒後回復按鈕狀態
   
  };

  return (
    <div>
      <div className="transcript-content">
        {/* Tabs */}
        <div className="tabs">
          {["漢羅", "台羅", "白話字"].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="content-display">
          <p>{content[activeTab]}</p>
        </div>


        <div className="button-container">
          <button
            className={`copy-button ${isCopied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {isCopied ? "文字已複製!" : "複製全文"}
          </button>
        </div>
      </div>
      <button className="feedback-button">內容修正回饋</button>
    </div>
  );
};

export default TranscriptContent;
