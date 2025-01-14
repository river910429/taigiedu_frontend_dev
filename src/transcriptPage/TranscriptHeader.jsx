// components/TranscriptHeader.jsx
import React, { useState, useRef } from "react";
import "./TranscriptHeader.css";
import recordImage from "/src/assets/record.svg";
import stopImage from "/src/assets/record_stop.svg"; // 錄音中的圖示
import loadingImage from "/src/assets/record_loading.svg"; // 處理中圖示

const TranscriptHeader = ({
  isRecording,
  isProcessing,
  onRecordClick,
  fontSize,
  onFontSizeChange,
  onFileUpload,
}) => {
  const [isChecked, setIsChecked] = useState(false); // 模式切換的開關狀態
  const toggleSwitch = () => setIsChecked(!isChecked);

  const [fileName, setFileName] = useState("");
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFileName(file.name);
      setIsFileProcessing(true);
      await onFileUpload(file);
      // Simulate processing time
      try {
        // await onFileUpload(file); // Future implementation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsFileProcessing(false);
      } catch (error) {
        console.error('File processing failed:', error);
        setIsFileProcessing(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <div className="transcript-header">
      <div className="transcript-mode-selection">
        <span>選擇模式：</span>
        <span className={`mode-option ${!isChecked ? "active" : ""}`}>錄音</span>
        <label className="switch">
          <input type="checkbox" checked={isChecked} onChange={toggleSwitch} />
          <span className="slider" />
        </label>
        <span className={`mode-option ${isChecked ? "active" : ""}`}>上傳音檔</span>
        <div className="vertical-divider" />

        {isChecked ? (
          <div className="upload-button-wrapper">
            <input
              ref={fileInputRef}
              className="file-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
            />
            <span 
  className={`upload-button ${
    isFileProcessing 
      ? "processing" 
      : fileName 
        ? "uploaded with-icon" 
        : "with-icon"
  }`}
  onClick={() => !isFileProcessing && fileInputRef.current?.click()}
>
              {isFileProcessing ? (
                <>
                  處理中
                  <img src={loadingImage} alt="Processing" className="loading-icon" />
                </>
              ) : fileName ? (
                "已上傳檔案！"
              ) : (
                "上傳檔案"
              )}
            </span>
            <span className="file-name">
              {isFileProcessing ? "" : fileName || "尚未選擇檔案"}
            </span>
          </div>
        ) : (
          <button
            className={`record-button ${
              isProcessing ? "processing" : isRecording ? "recording" : ""
            }`}
            onClick={onRecordClick}
          >
            {isProcessing ? (
              <>
                <span>處理中</span>
                <img src={loadingImage} alt="Processing" className="loading-icon" />
              </>
            ) : isRecording ? (
              <>
                <span>錄音中</span>
                <img src={stopImage} alt="Stop Recording" className="recording-icon" />
              </>
            ) : (
              <img src={recordImage} alt="Start Recording" className="record-icon" />
            )}
          </button>
        )}
      </div>


      <div className="font-size-control">
        {["小", "中", "大"].map((size) => (
          <button
            key={size}
            className={`font-size-button ${
              fontSize === size ? "selected" : ""
            } ${size}`}
            onClick={() => onFontSizeChange(size)} // 呼叫父層的字體大小變更函數
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TranscriptHeader;
