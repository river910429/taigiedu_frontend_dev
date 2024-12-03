import React, { createContext, useContext, useState } from "react";
import "./readPage.css";

import ReadHeader from "./ReadHeader";
import ReadContent from "./ReadContent";

// 創建字體大小的 Context
const FontSizeContext = createContext();

// 自定義 Hook，方便在其他組件中訪問字體大小
export const useFontSize = () => useContext(FontSizeContext);

const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState("小"); // 預設字體大小為中

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

const ReadPage = () => {

  return (
    <div className="read-page">
      <FontSizeProvider>
        <ReadHeader />
        <ReadContent />
      </FontSizeProvider>
    </div>
  );
};

export default ReadPage;
