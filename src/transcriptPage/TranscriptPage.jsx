import React, { createContext, useContext, useState } from "react";
import "./TranscriptPage.css";

import TranscriptHeader from "./TranscriptHeader";
import TranscriptContent from "./TranscriptContent";

// 創建字體大小的 Context
const FontSizeContext = createContext();

// 自定義 Hook，方便在其他組件中訪問字體大小
export const useFontSize = () => useContext(FontSizeContext);

const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState("中"); // 預設字體大小為中

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

const TranscriptPage = () => {
  return (
    <div className="transcript-page">
      <FontSizeProvider>
        <TranscriptHeader />
        <TranscriptContent />
      </FontSizeProvider>
    </div>
  );
};

export default TranscriptPage;
