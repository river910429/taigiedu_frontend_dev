import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FilePreview.css";

const FilePreview = () => {
  const navigate = useNavigate();

  // 從 URL 查詢參數取得資料
  const searchParams = new URLSearchParams(window.location.search);
  const imageUrl = searchParams.get("imageUrl");
  const fileType = searchParams.get("fileType");
  const likes = searchParams.get("likes");
  const downloads = searchParams.get("downloads");
  const title = searchParams.get("title");
  const uploader = searchParams.get("uploader");
  const tags = JSON.parse(searchParams.get("tags") || "[]");
  const date = searchParams.get("date");

  if (!title) {
    return <div>Loading file preview...</div>;
  }

  const handleViewDownloadPage = () => {
    navigate("/download", {
      state: {
        fileName: title,
        pdfUrl: "/src/assets/resourcepage/download_test_file.pdf", 
      },
    });
  };

  //直接開pdf預覽
  // const handleDownload = () => {
  //   const pdfUrl = "/src/assets/resourcepage/download_test_file.pdf";
  //   window.open(pdfUrl, '_blank');
  // };
  
  // const handleViewDownloadPage = () => {
  //   window.location.href = "/download";
  // };
  const handleDownload = () => {
    const pdfUrl = "/src/assets/resourcepage/download_test_file.pdf";
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', `${title}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



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

        <button className="file-download-button" onClick={handleDownload}>
          下載資源
        </button>

        <button className="file-like-button">
          點讚資源
        </button>

      </div>

      <div className="file-preview-image">
        <img src={imageUrl} alt={title} />
      </div>

      <div className="file-bottom-fixed" onClick={handleViewDownloadPage}>
        <img src="/src/assets/resourcepage/Vector (Stroke).svg" />
        閱讀全部
      </div>
    </div>
  );
};
export default FilePreview;
