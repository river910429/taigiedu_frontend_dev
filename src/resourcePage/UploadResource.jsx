import React, { useState, useEffect, useRef } from "react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import loadingImage from "/src/assets/record_loading.svg"; // 處理中圖示
import { useToast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { authenticatedFetch, getAccessToken, refreshToken } from "../services/authService";
import "./UploadResource.css";

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Helper: wrap CJK text for canvas rendering (character-by-character)
const wrapText = (ctx, text, maxWidth) => {
  const lines = [];
  let currentLine = "";
  for (const char of text) {
    if (char === "\n") {
      lines.push(currentLine);
      currentLine = "";
      continue;
    }
    const testLine = currentLine + char;
    if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

const UploadResource = ({ isOpen, onClose, onUploadSuccess }) => {
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
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
  const [versionMapping, setVersionMapping] = useState({}); // 儲存年級與版本的映射

  // ========== 縮圖預覽相關 state ==========
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [customImageName, setCustomImageName] = useState("");
  const imageInputRef = useRef(null);

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

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/resource/versions`);
        const result = await response.json();
        if (response.ok) {
          setVersionMapping(result);
        } else {
          console.error("無法取得版本列表:", result);
        }
      } catch (error) {
        console.error("取得版本列表時發生錯誤:", error);
      }
    };

    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen]);

  // 清除 preview ObjectURL 避免記憶體洩漏
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ========== 縮圖生成函式 ==========

  /** PDF: 使用 pdfjs-dist 渲染第一頁 */
  const generatePdfThumbnail = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
    });
  };

  /** DOCX: 使用 mammoth 提取文字，渲染到 canvas */
  const generateDocxThumbnail = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // 取得純文字
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";

    const canvas = document.createElement("canvas");
    const W = 420;
    const H = 594; // A4 比例
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // 白底
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // 邊框
    ctx.strokeStyle = "#d0d0d0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // 頂部色帶
    ctx.fillStyle = "#2B579A"; // Word 藍
    ctx.fillRect(0, 0, W, 5);

    // 文字內容
    ctx.fillStyle = "#333333";
    ctx.font =
      '14px "Microsoft JhengHei", "Noto Sans TC", "PingFang TC", sans-serif';

    const lines = wrapText(ctx, text.trim(), W - 48);
    const lineHeight = 22;
    const maxLines = Math.floor((H - 60) / lineHeight);

    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      ctx.fillText(lines[i], 24, 40 + i * lineHeight);
    }

    // 底部漸層淡出
    if (lines.length > maxLines) {
      const gradient = ctx.createLinearGradient(0, H - 60, 0, H);
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(1, "rgba(255,255,255,1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, H - 60, W, 60);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
    });
  };

  /** PPT / 不支援格式: 產生佔位縮圖 */
  const generatePlaceholderThumbnail = async (file, type = "PPT") => {
    const canvas = document.createElement("canvas");
    const W = 420;
    const H = type === "PPT" ? 315 : 594; // PPT → 4:3, 其他 → A4
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // 漸層背景
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#f8f9fa");
    bg.addColorStop(1, "#e9ecef");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 邊框
    ctx.strokeStyle = "#d0d0d0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // 圖示底色
    const iconColor = type === "PPT" ? "#D04423" : "#2B579A";
    ctx.fillStyle = iconColor;
    const iconX = W / 2 - 40;
    const iconY = H / 2 - 60;
    ctx.fillRect(iconX, iconY, 80, 80);

    // 圖示文字
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(type, W / 2, H / 2 - 20);

    // 檔案名稱
    ctx.fillStyle = "#666666";
    ctx.font =
      '13px "Microsoft JhengHei", "Noto Sans TC", sans-serif';
    const displayName =
      file.name.length > 35 ? file.name.substring(0, 32) + "..." : file.name;
    ctx.fillText(displayName, W / 2, H / 2 + 48);

    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
    });
  };

  /** 根據檔案類型選擇生成方式 */
  const generateThumbnail = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    console.log("[縮圖] 開始生成縮圖, 檔案:", file.name, "類型:", ext, "大小:", file.size);
    setIsGeneratingPreview(true);
    try {
      let blob = null;
      if (ext === "pdf") {
        console.log("[縮圖] 使用 PDF 渲染方式");
        blob = await generatePdfThumbnail(file);
      } else if (ext === "docx") {
        console.log("[縮圖] 使用 Mammoth DOCX 渲染方式");
        blob = await generateDocxThumbnail(file);
      } else if (ext === "doc") {
        console.log("[縮圖] DOC 格式，使用佔位縮圖");
        blob = await generatePlaceholderThumbnail(file, "DOC");
      } else if (ext === "ppt" || ext === "pptx") {
        console.log("[縮圖] PPT 格式，使用佔位縮圖");
        blob = await generatePlaceholderThumbnail(file, "PPT");
      }

      if (blob) {
        console.log("[縮圖] 生成成功, blob size:", blob.size, "type:", blob.type);
        // 將 Blob 包裝為 File 物件，確保 FormData 能正確傳送檔名與 MIME 類型
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const thumbName = `${baseName}.jpg`;
        const thumbnailFile = new File([blob], thumbName, { type: "image/jpeg" });
        console.log("[縮圖] 已轉換為 File 物件, name:", thumbnailFile.name, "size:", thumbnailFile.size, "type:", thumbnailFile.type);
        setPreviewBlob(thumbnailFile);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(thumbnailFile));
      } else {
        console.warn("[縮圖] 生成結果為 null");
      }
    } catch (error) {
      console.error("[縮圖] 生成失敗:", error);
      // 縮圖為選填，失敗不阻擋上傳
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  /** 手動上傳預覽圖片 */
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("請選擇圖片檔案（JPG、PNG 等）", "error");
        return;
      }
      console.log("[縮圖] 手動上傳預覽圖片:", file.name, "size:", file.size, "type:", file.type);
      setCustomImageName(file.name);
      setPreviewBlob(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /** 清除縮圖 */
  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setCustomImageName("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // 如果年級改變，重置版本
      if (name === "grade") {
        newData.version = "";
        newData.versionOther = "";
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]; // 確認檔案存在
    if (file) {
      setFormData((prev) => ({ ...prev, file: file }));
      setFileName(file.name); // 更新檔案名稱
      // 自動產生縮圖
      clearPreview();
      generateThumbnail(file);
    } else {
      setFormData((prev) => ({ ...prev, file: null })); // 清空檔案
      setFileName("尚未選擇檔案"); // 預設值
      clearPreview();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      showToast("請上傳檔案！", "error");
      return;
    }

    // 檢查用戶是否已登入
    if (!isAuthenticated || !user?.id) {
      showToast("請先登入後再上傳資源", "error");
      return;
    }

    setIsProcessing(true);

    try {
      // 準備 FormData
      const apiFormData = new FormData();

      // 上傳者資訊 - 從 auth context 獲取用戶資訊
      apiFormData.append("uploader_id", user.id);
      apiFormData.append("uploader_name", user.name || user.email?.split('@')[0] || "使用者");

      // 資源資訊
      apiFormData.append("title", formData.name);
      apiFormData.append("grade", formData.grade);

      // 處理版本，如果是其他則使用自定義輸入
      const version = formData.version === "其他" ? formData.versionOther : formData.version;
      apiFormData.append("version", version);

      apiFormData.append("book", formData.book);

      // 處理內容類型，如果是其他則使用自定義輸入
      const contentType = formData.contentType === "其他" ? formData.contentTypeOther : formData.contentType;
      apiFormData.append("contentType", contentType);

      // 從檔案擴展名獲取檔案類型
      const fileType = formData.file.name.split('.').pop().toLowerCase();
      apiFormData.append("fileType", fileType);

      // 初始統計
      apiFormData.append("likes", 0);
      apiFormData.append("downloads", 0);

      // 標籤 (可以從其他字段構建，這裡用名稱和版本作為示例)
      apiFormData.append("tags", `${formData.grade},${version},${contentType}`);

      // 主檔案
      apiFormData.append("file", formData.file);

      // 預覽縮圖（選填）
      if (previewBlob) {
        // 使用手動上傳的名稱或從自動生成取得的名稱，避免固定使用 thumbnail.jpg 造成的覆蓋問題
        const thumbName = customImageName || previewBlob.name || "thumbnail.jpg";
        console.log("[縮圖上傳] 準備附加預覽圖片到 FormData");
        console.log("[縮圖上傳] blob/file info:", {
          name: previewBlob.name || thumbName,
          size: previewBlob.size,
          type: previewBlob.type,
          isFile: previewBlob instanceof File,
          isBlob: previewBlob instanceof Blob,
        });
        apiFormData.append("image", previewBlob, thumbName);
        console.log("[縮圖上傳] 已附加 image 欄位到 FormData");
      } else {
        console.log("[縮圖上傳] 沒有預覽圖片，跳過 image 欄位");
      }

      // Debug: 列出 FormData 所有欄位
      console.log("[上傳] FormData 欄位列表:");
      for (const [key, value] of apiFormData.entries()) {
        if (value instanceof File || value instanceof Blob) {
          console.log(`  ${key}: [File] name=${value.name}, size=${value.size}, type=${value.type}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // 取得 Access Token 並建立帶有 OAuth2 驗證的請求
      let token = getAccessToken();

      // 建立發送請求的函數
      const sendUploadRequest = async (accessToken) => {
        const headers = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return fetch(`${import.meta.env.VITE_API_URL}/api/resource/upload`, {
          method: "POST",
          headers,
          body: apiFormData,
          credentials: 'include', // 確保 cookie 被傳送
        });
      };

      // 發送 API 請求
      console.log("[上傳] 發送 API 請求到:", `${import.meta.env.VITE_API_URL}/api/resource/upload`);
      let response = await sendUploadRequest(token);
      let result = await response.json();
      console.log("[上傳] API 回應 status:", response.status, "body:", result);

      // 處理 401 錯誤或 Missing Authorization Header，嘗試刷新 token 並重試
      if (response.status === 401 ||
        result.message?.includes("Missing Authorization Header") ||
        result.error?.message?.includes("Missing Authorization Header")) {
        console.log("Token 可能已失效，嘗試刷新...");
        const refreshResult = await refreshToken();

        if (refreshResult.success) {
          // 重試上傳請求
          token = getAccessToken();
          response = await sendUploadRequest(token);
          result = await response.json();
        } else {
          // Token 刷新失敗，視為驗證錯誤
          showToast("登入狀態已失效，請重新登入", "error");
          console.error("Token 刷新失敗:", refreshResult.message);
          setIsProcessing(false);
          return;
        }
      }

      // 再次檢查是否有 Missing Authorization Header 錯誤
      const authErrorMessage = result.message || result.error?.message || "";
      if (authErrorMessage.includes("Missing Authorization Header")) {
        showToast("驗證失敗：缺少認證標頭，請重新登入", "error");
        console.error("上傳失敗 - 缺少認證標頭:", result);
        setIsProcessing(false);
        return;
      }

      if (response.ok && result.status === "success") {
        setIsSuccess(true);
        showToast(result.data.message || "資源上傳成功！", "success");

        // 立即發送資源更新事件，讓背景的資源列表可以重新讀取
        window.dispatchEvent(new CustomEvent('resource-updated'));

        // 延遲關閉視窗，讓用戶看到成功訊息
        setTimeout(() => {
          handleClose();
          // 調用 onUploadSuccess 通知父組件
          if (onUploadSuccess) {
            onUploadSuccess();
          }
        }, 2000);
      } else {
        showToast(result.message || "上傳失敗，請檢查輸入內容後重試", "error");
        console.error("上傳失敗:", result);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("上傳過程中發生錯誤:", error);
      showToast("發生網路錯誤，請稍後再試", "error");
      setIsProcessing(false);
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
    clearPreview(); // 清除縮圖預覽
    setCustomImageName("");
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
              disabled={isProcessing || isSuccess}
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
                  disabled={isProcessing || isSuccess}
                />
                高中
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="國中"
                  onChange={handleInputChange}
                  disabled={isProcessing || isSuccess}
                />
                國中
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="國小"
                  onChange={handleInputChange}
                  disabled={isProcessing || isSuccess}
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
              {(versionMapping[formData.grade] || []).map((version) => (
                <label key={version}>
                  <input
                    type="radio"
                    name="version"
                    value={version}
                    checked={formData.version === version}
                    onChange={handleInputChange}
                    required
                    disabled={isProcessing || isSuccess}
                  />
                  {version}
                </label>
              ))}
              <label>
                <input
                  type="radio"
                  name="version"
                  value="其他"
                  checked={formData.version === "其他"}
                  onChange={handleInputChange}
                  disabled={!formData.grade || isProcessing || isSuccess}
                />
                其他
                <input
                  type="text"
                  name="versionOther"
                  value={
                    formData.version === "其他" ? formData.versionOther : ""
                  } // 確保 hooks 行為穩定
                  onChange={handleInputChange}
                  disabled={formData.version !== "其他" || isProcessing || isSuccess}
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
              disabled={isProcessing || isSuccess}
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
                    disabled={isProcessing || isSuccess}
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
                  disabled={isProcessing || isSuccess}
                />
                其他
                <input
                  type="text"
                  name="contentTypeOther"
                  value={formData.contentTypeOther}
                  onChange={handleInputChange}
                  disabled={formData.contentType !== "其他" || isProcessing || isSuccess}
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
              accept=".pdf, .doc, .docx, .ppt, .pptx"
              onChange={handleFileChange}
              required
              disabled={isProcessing || isSuccess}
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

            <p>※限 PDF, PPT, DOC 可上傳，限制 100MB。</p>
          </label>

          {/* ========== 文件縮圖預覽區 ========== */}
          <div className="form-label">
            <span className="form-label-title">預覽縮圖</span>
            <p className="thumbnail-hint">
              系統會依據上傳的檔案自動產生縮圖，也可手動上傳自訂預覽圖片。
            </p>

            <div className="thumbnail-preview-area">
              {/* 生成中的 loading 狀態 */}
              {isGeneratingPreview && (
                <div className="thumbnail-loading">
                  <img src={loadingImage} alt="Generating" className="thumbnail-loading-icon" />
                  <span>縮圖生成中…</span>
                </div>
              )}

              {/* 已產生的縮圖預覽 */}
              {!isGeneratingPreview && previewUrl && (
                <div className="thumbnail-result">
                  <div className="thumbnail-image-wrapper">
                    <img
                      src={previewUrl}
                      alt="文件縮圖預覽"
                      className="thumbnail-image"
                    />
                    <button
                      type="button"
                      className="thumbnail-remove-btn"
                      onClick={clearPreview}
                      title="移除縮圖"
                      disabled={isProcessing || isSuccess}
                    >
                      ✕
                    </button>
                  </div>
                  {customImageName && (
                    <span className="thumbnail-custom-name">{customImageName}</span>
                  )}
                </div>
              )}

              {/* 尚無縮圖時的空白狀態 && 手動上傳按鈕 */}
              {!isGeneratingPreview && !previewUrl && (
                <div className="thumbnail-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>上傳檔案後自動生成縮圖</span>
                </div>
              )}
            </div>

            {/* 手動上傳預覽圖 */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              disabled={isProcessing || isSuccess}
            />
            <button
              type="button"
              className="thumbnail-upload-btn"
              onClick={() => imageInputRef.current?.click()}
              disabled={isProcessing || isSuccess}
            >
              {previewUrl ? "替換預覽圖片" : "手動上傳預覽圖片"}
            </button>
          </div>

          {/* 提交按鈕 */}
          <div className="upload-resource-footer">
            <button
              type="submit"
              className={`submit-button ${isProcessing
                ? "processing"
                : isSuccess
                  ? "success-button"
                  : formData.name &&
                    formData.grade &&
                    formData.version &&
                    formData.book &&
                    formData.contentType &&
                    formData.file
                    ? "enabled"
                    : "disabled"
                }`}
              disabled={isProcessing || isSuccess} // 處理中或成功時禁用按鈕
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
              ) : isSuccess ? (
                "上傳成功！"
              ) : (
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