// components/TranscriptContent.jsx
import React, { useState } from "react";
import "./TranscriptContent.css";
import ContentFeedback from "./ContentFeedback";

const TranscriptContent = ({ isEditable, fontSize, content, setContent, audioSource, showToast  }) => {
  const [activeTab, setActiveTab] = useState("台文漢字");
  const [isCopied, setIsCopied] = useState(false); // 控制複製按鈕狀態
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); // 控制彈窗顯示

  // const [content, setContent] = useState({
  //   漢羅: "這站仔，阮兜附近的榮星公園實在是有夠鬧熱的啦！ 因為舊矸仔貯新酒、舊店仔賣新貨！市政府佇舊年尾，共 耍甲強強欲臭殕去的兒童遊樂區，攏重整理過，真緊就隨 閣開放予逐家𨑨迌矣！ 新的設施，毋但有規大片的塑膠地毯、一大窟的幼沙 仔，閣有增加誠濟好耍的物件，親像講上蓋新型的趨流籠、 空中行吊索、吊雙環啦……，有幾若項，攏是囡仔人上佮 意耍的。 這層予人歡喜的代誌，電視新聞嘛有報過幾若擺。來 遮耍過的人閣常在佇網路頂懸食好鬥相報，所以講，無論 是遠路抑近路、大漢抑細漢，誠濟人攏會曉欲𤆬囡仔來遮 𨑨迌，逐个攏嘛耍甲歡頭喜面笑咍咍。",
  //   台羅: "Tāi-lô ê páng-lí bûn-tê.這站仔，阮兜附近的榮星公園實在是有夠鬧熱的啦！ 因為舊矸仔貯新酒、舊店仔賣新貨！市政府佇舊年尾，共 耍甲強強欲臭殕去的兒童遊樂區，攏重整理過，真緊就隨 閣開放予逐家𨑨迌矣！ 新的設施，毋但有規大片的塑膠地毯、一大窟的幼沙 仔，閣有增加誠濟好耍的物件，親像講上蓋新型的趨流籠、 空中行吊索、吊雙環啦……，有幾若項，攏是囡仔人上佮 意耍的。 這層予人歡喜的代誌，電視新聞嘛有報過幾若擺。來 遮耍過的人閣常在佇網路頂懸食好鬥相報，所以講，無論 是遠路抑近路、大漢抑細漢，誠濟人攏會曉欲𤆬囡仔來遮 𨑨迌，逐个攏嘛耍甲歡頭喜面笑咍咍。",
  //   白話字:
  //     "Bái-uē-jī ê bun-tê.這站仔，阮兜附近的榮星公園實在是有夠鬧熱的啦！ 因為舊矸仔貯新酒、舊店仔賣新貨！市政府佇舊年尾，共 耍甲強強欲臭殕去的兒童遊樂區，攏重整理過，真緊就隨 閣開放予逐家𨑨迌矣！ 新的設施，毋但有規大片的塑膠地毯、一大窟的幼沙 仔，閣有增加誠濟好耍的物件，親像講上蓋新型的趨流籠、 空中行吊索、吊雙環啦……，有幾若項，攏是囡仔人上佮 意耍的。 這層予人歡喜的代誌，電視新聞嘛有報過幾若擺。來 遮耍過的人閣常在佇網路頂懸食好鬥相報，所以講，無論 是遠路抑近路、大漢抑細漢，誠濟人攏會曉欲𤆬囡仔來遮 𨑨迌，逐个攏嘛耍甲歡頭喜面笑咍咍。",
  // });

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleCopy = () => {
    navigator.clipboard.writeText(content[activeTab]);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 5000);
  };

  const handleFeedbackOpen = () => {
    setIsFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setIsFeedbackOpen(false);
  };

  const handleFeedbackSubmit = (updatedContent) => {
    // 更新當前選擇的 Tab 的內容
    setContent((prevContent) => ({
      ...prevContent,
      [activeTab]: updatedContent,
    }));
    setIsFeedbackOpen(false); // 關閉彈窗
  };

  return (
    <div className="transcript-overlay">
      <div className="transcript-content">
        {/* Tabs */}
        <div className="tabs">
          {["台文漢字", "台羅", "白話字"].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="content-container">
          <div
            className={`content-display ${
              isEditable ? "editable" : "non-editable"
            } ${fontSize}`}
          >
            {isEditable ? <p>{content[activeTab]}</p> : null}
          </div>

          <div className="button-container">
            <button
              className={`copy-button ${isCopied ? "copied" : ""}`} // 動態添加 copied 樣式
              disabled={!isEditable} // 背景為灰色時禁用按鈕
              onClick={handleCopy}
            >
              {isCopied ? "文字已複製！" : "複製全文"}
            </button>
          </div>
        </div>
      </div>

      <div className="button-container">
        <button
          className="feedback-button"
          disabled={!isEditable}
          onClick={handleFeedbackOpen}
        >
          內容修正回饋
        </button>
      </div>

      <ContentFeedback
        isOpen={isFeedbackOpen}
        onClose={handleFeedbackClose}
        content={content[activeTab]}
        onSubmit={handleFeedbackSubmit}
        audioSource={audioSource}
        activeTab={activeTab}
        showToast={showToast}
      />
    </div>
  );
};

export default TranscriptContent;
