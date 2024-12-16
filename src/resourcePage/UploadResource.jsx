import React, { useState, useEffect } from "react";
import loadingImage from "/src/assets/record_loading.svg"; // 處理中圖示
import "./UploadResource.css";

const UploadResource = ({ isOpen, onClose }) => {
  const [fileName, setFileName] = useState(""); // 儲存檔案名稱
  const [isProcessing, setIsProcessing] = useState(false); // 控制處理中的狀態
  const [isSuccess, setIsSuccess] = useState(false); // 上傳成功狀態
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    version: "",
    versionOther: "",
    book: "",
    contentType: "",
    contentTypeOther: "",
    file: null,
  });

  useEffect(() => {
    const handlePopState = (event) => {
      if (isOpen) {
        event.preventDefault();
        window.history.pushState(null, "", window.location.href); // 保持當前狀態
      }
    };

    if (isOpen) {
      window.history.pushState(null, "", window.location.href); // 添加歷史記錄條目
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      if (isOpen) {
        window.history.replaceState(null, "", window.location.href);
      }
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]; // 確認檔案存在
    if (file) {
      setFormData((prev) => ({ ...prev, file: file }));
      setFileName(file.name); // 更新檔案名稱
    } else {
      setFormData((prev) => ({ ...prev, file: null })); // 清空檔案
      setFileName("尚未選擇檔案"); // 預設值
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.file) {
      alert("請上傳檔案！");
    } else {
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);// 處理成功後設置為 true
        alert("表單已成功提交！"); // 清空表單並關閉模態框
      }, 3000);

      console.log("Submitted Data:", formData);
      // 處理表單提交邏輯
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      grade: "",
      version: "",
      versionOther: "",
      book: "",
      contentType: "",
      contentTypeOther: "",
      file: null,
    }); // 清空表單數據
    setFileName(""); // 清空檔案名稱
    setIsProcessing(false); // 重置處理狀態
    setIsSuccess(false); // 重置成功狀態
    onClose(); // 調用父組件的 onClose 關閉模態框
  };

  if (!isOpen) return null;

  return (
    <div className="upload-resource-overlay">
      <div className="upload-resource-container">
        <div className="upload-resource-header">
          <div>上傳資源</div>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <form className="upload-resource-form" onSubmit={handleSubmit}>
          {/* 資源名稱 */}
          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>名稱
            </span>
            <input
              type="text"
              name="name"
              placeholder="字數最多28字"
              maxLength="28"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </label>

          {/* 階段 */}
          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>階段
            </span>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="高中"
                  onChange={handleInputChange}
                  required
                />
                高中
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="國中"
                  onChange={handleInputChange}
                />
                國中
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="國小"
                  onChange={handleInputChange}
                />
                國小
              </label>
            </div>
          </label>

          {/* 版本 */}
          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>版本
            </span>
            <div className="radio-group">
              {["真平", "育達", "泰宇", "奇異果", "創新"].map((version) => (
                <label key={version}>
                  <input
                    type="radio"
                    name="version"
                    value={version}
                    onChange={handleInputChange}
                    required
                  />
                  {version}
                </label>
              ))}
              <label>
                <input
                  type="radio"
                  name="version"
                  value="其他"
                  onChange={handleInputChange}
                />
                其他
                <input
                  type="text"
                  name="versionOther"
                  value={
                    formData.version === "其他" ? formData.versionOther : ""
                  } // 確保 hooks 行為穩定
                  onChange={handleInputChange}
                  disabled={formData.version !== "其他"}
                />
              </label>
            </div>
          </label>

          {/* 冊別 */}
          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>冊別
            </span>
            <p>※例如： 113 上冊</p>
            <input
              type="text"
              name="book"
              value={formData.book}
              onChange={handleInputChange}
              required
            />
          </label>

          {/* 內容類型 */}
          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>內容類型
            </span>
            <div className="radio-group">
              {["學習單", "簡報", "教案"].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="contentType"
                    value={type}
                    onChange={handleInputChange}
                    required
                  />
                  {type}
                </label>
              ))}
              <label>
                <input
                  type="radio"
                  name="contentType"
                  value="其他"
                  onChange={handleInputChange}
                />
                其他
                <input
                  type="text"
                  name="contentTypeOther"
                  value={formData.contentTypeOther}
                  onChange={handleInputChange}
                  disabled={formData.contentType !== "其他"}
                />
              </label>
            </div>
          </label>

          {/* 上傳檔案 */}
          <label className="form-label">
            <input
              className="file-upload"
              type="file"
              name="file"
              accept=".pdf, .doc, .ppt"
              onChange={handleFileChange}
              require
            />
            <div className="upload-button-wrapper">
              <span
                type="button"
                className={`upload-button ${fileName ? "uploaded" : ""}`}
              >
                {fileName ? "已上傳檔案！" : "上傳檔案"}
              </span>
              <span className="file-name">{fileName || "尚未選擇檔案"}</span>
            </div>

            <p>※限 PDF, PTT, DOC 可上傳，限制 100MB。</p>
          </label>

          {/* 提交按鈕 */}
          <div className="upload-resource-footer">
            <button
              type="submit"
              className={`submit-button ${
                isProcessing
                  ? "processing"
                  : formData.name &&
                    formData.grade &&
                    formData.version &&
                    formData.book &&
                    formData.contentType &&
                    formData.file
                  ? "enabled"
                  : "disabled"
              }${
                isSuccess ? "success-button" : ""
              }`}
              disabled={isProcessing || isSuccess} // 處理中時禁用按鈕
            >
              {isProcessing ? (
                <>
                  <span>處理中</span>
                  <img
                    src={loadingImage} // 自定義圖片
                    alt="Processing"
                    className="loading-icon"
                  />
                </>
              )  : isSuccess ? (
                "上傳成功！"
              ): (
                "送出"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadResource;
