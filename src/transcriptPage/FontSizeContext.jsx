// contexts/FontSizeContext.jsx
import React, { createContext, useContext, useState } from "react";

// 創建字體大小的 Context
const FontSizeContext = createContext();

// 創建一個自定義 Hook 來方便訪問 Context
export const useFontSize = () => useContext(FontSizeContext);

// 提供者組件，用於包裝需要訪問字體大小的組件
export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState("中"); // 預設字體大小

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};
