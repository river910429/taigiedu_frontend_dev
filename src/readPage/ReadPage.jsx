import React, { createContext, useContext, useState } from "react";
import "./ReadPage.css";

import ReadHeader from "./ReadHeader";
import ReadContent from "./ReadContent";

// 創建字體大小的 Context
const FontSizeContext = createContext();
const LangContext = createContext(); 

// 自定義 Hook，方便在其他組件中訪問字體大小
export const useFontSize = () => useContext(FontSizeContext);
export const useLang = () => useContext(LangContext); // 新增


const LangProvider = ({ children }) => {
  const [selectedLang, setSelectedLang] = useState("tb"); // 預設漢羅

  return (
    <LangContext.Provider value={{ selectedLang, setSelectedLang }}>
      {children}
    </LangContext.Provider>
  );
};
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
      <LangProvider>
        <FontSizeProvider>
          <ReadHeader />
          <ReadContent />
        </FontSizeProvider>
      </LangProvider>
    </div>
  );
};

export default ReadPage;
