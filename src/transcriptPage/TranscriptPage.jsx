import React, { createContext, useContext, useState } from "react";
import "./TranscriptPage.css";

import TranscriptHeader from "./TranscriptHeader";
import TranscriptContent from "./TranscriptContent";

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

const TranscriptPage = () => {
  const [isRecording, setIsRecording] = useState(false); // 錄音狀態
  const [isProcessing, setIsProcessing] = useState(false); // 處理中狀態
  const [isEditable, setIsEditable] = useState(false); // 背景狀態（灰或白）
  const [fontSize, setFontSize] = useState("小"); // 字體大小

  const handleFontSizeChange = (size) => {
    setFontSize(size); // 改變字體大小
  };
  
  const handleRecordClick = () => {
    if (isProcessing) return; // 禁止在處理中操作
    if (isRecording) {
      // 停止錄音並開始處理
      setIsRecording(false);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false); // 處理完成
        setIsEditable(true); // 背景變白
      }, 3000);
    } else {
      // 開始錄音
      setIsRecording(true);
      setIsEditable(false); // 背景為灰色
    }
  };
  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setIsEditable(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsProcessing(false);
      setIsEditable(true);
    } catch (error) {
      console.error('File processing failed:', error);
      setIsProcessing(false);
    }
  };
  return (
    <div className="transcript-page">
      <FontSizeProvider>
        <TranscriptHeader
          isRecording={isRecording}
          isProcessing={isProcessing}
          fontSize={fontSize}
          onRecordClick={handleRecordClick}
          onFontSizeChange={handleFontSizeChange}
          onFileUpload={handleFileUpload}
        />
        <TranscriptContent isEditable={isEditable} fontSize={fontSize} />
      </FontSizeProvider>
    </div>
  );
};

export default TranscriptPage;
