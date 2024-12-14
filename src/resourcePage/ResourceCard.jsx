import React from "react";
import { useNavigate } from "react-router-dom";
import "./ResourceCard.css";

const ResourceCard = ({
  imageUrl,
  fileType,
  likes,
  downloads,
  title,
  uploader,
  tags = [],
  date,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate("/file-preview", {
      state: {
        imageUrl,
        fileType,
        likes,
        downloads,
        title,
        uploader,
        tags,
        date,
      },
    });
  };

  return (
    <div className="resource-card"  onClick={handleCardClick}>
      {/* 卡片標頭區域，背景圖片 */}
      <div
        className="card-header"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="file-type">{fileType}</div>
        <div className="stats">
          <div className="likes">
            <img
              src="/src/assets/Union (Stroke).svg"
              alt="Likes"
              className="likes-icon"
            />
            <span>{likes}</span>
          </div>
          <div className="downloads">
            <img
              src="/src/assets/arrow-down-circle.svg"
              alt="Downloads"
              className="downloads-icon"
            />
            <span>{downloads}</span>
          </div>
        </div>
      </div>

      {/* 卡片內容 */}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-uploader">上傳者：{uploader}</p>
        <div className="card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="card-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
