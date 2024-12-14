import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FilePreview.css";

const FilePreview = () => {
  const location = useLocation(); // 用來接收數據
  const navigate = useNavigate(); // 用來返回上一頁

  const { imageUrl, fileType, likes, downloads, title, uploader, tags, date } =
    location.state || {}; // 解構數據，設置預設值

  return (
    <div className="file-preview-page">
      <div className="file-preview-header">
        <h1 className="file-title">{title}</h1>

        <div className="file-separator">&nbsp;</div>

        <div className="file-info">
          <span>2週前</span>

          <div className="file-likes">
            <img
              src="/src/assets/resourcepage/Union (Stroke)(black).svg"
              alt="Likes"
              className="file-likes-icon"
            />
            <span>{likes}</span>
          </div>
          <div className="file-downloads">
            <img
              src="/src/assets/resourcepage/Subtract(black).svg"
              alt="Downloads"
              className="file-downloads-icon"
            />
            <span>{downloads}</span>
          </div>
        </div>

        <div className="file-uploader">AUTHOR：{uploader}</div>

        <div className="file-tags">
          {tags.map((tag, index) => (
            <span key={index} className="file-tag">
              {tag}
            </span>
          ))}
        </div>

        <button className="file-like-button">點讚資源</button>
      </div>

      <div className="file-preview-image">
        <img src={imageUrl} alt={title} />
      </div>

      <div className="file-bottom-fixed" onClick={() => alert("點擊事件觸發")}>
      <img src="/src/assets/resourcepage/Vector (Stroke).svg" />
        閱讀全部
      </div>
    </div>
  );
};
export default FilePreview;
