import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./ResourceHeader.css";

const ResourceHeader = ({onUploadOpen}) => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState("階段");
  const [selectedVersion, setSelectedVersion] = useState("版本");
  const [query, setQuery] = React.useState("");
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);

  const handleGradeClick = () => setIsGradeOpen(!isGradeOpen);
  const handleVersionClick = () => setIsVersionOpen(!isVersionOpen);

  const gradeToVersions = {
    國小: ["真平", "康軒"],
    國中: ["真平", "康軒", "奇異果", "師昀", "全華", "豪風", "長鴻"],
    高中: ["真平", "育達", "泰宇", "奇異果", "創新"],
  };

  const allVersions = [
    "真平",
    "康軒",
    "奇異果",
    "師昀",
    "全華",
    "豪風",
    "長鴻",
    "育達",
    "泰宇",
    "創新",
  ];

  const handleGradeChange = (e) => {
    const grade = e.target.value;
    setSelectedGrade(grade);
    setSelectedVersion("版本"); // 重置版本為 "版本"
  };

  const handleVersionChange = (e) => {
    const version = e.target.value;
    setSelectedVersion(version);
  };

  const handleSearch = (e) => {
    e.preventDefault(); // 防止頁面重整
    if (query.trim() === "") return;
  };

  const handleDelete = () => {
    navigate("/delete-resource"); 
  }

  const versionOptions =
    selectedGrade === "階段"
      ? []
      : selectedGrade === "全部"
      ? allVersions
      : gradeToVersions[selectedGrade] || [];

  return (
    <div className="resource-header">
      {/* 階段下拉選單 */}
      <select
        className={`grade-dropdown ${isGradeOpen  ? "open" : ""}`}
        onClick={handleGradeClick}
        value={selectedGrade}
        onChange={handleGradeChange}
      >
        <option value="階段" hidden>
          階段
        </option>
        <option value="全部">全部</option>
        <option value="高中">高中</option>
        <option value="國中">國中</option>
        <option value="國小">國小</option>
      </select>

      {/* 版本下拉選單 */}
      <select
        className={`version-dropdown ${isVersionOpen  ? "open" : ""}`}
        onClick={handleVersionClick}
        value={selectedVersion}
        onChange={handleVersionChange}
        disabled={selectedGrade === "階段"}
      > 
        <option value="版本" hidden>
          版本
        </option>
        {versionOptions.map((version) => (
          <option key={version} value={version}>
            {version}
          </option>
        ))}
      </select>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="res-search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋..."
          className="res-search-input"
        />
        <img
          src="search_logo.svg"
          className="res-search-icon"
          onClick={handleSearch} // 點擊圖片觸發搜尋跳轉
        />
      </form>

      {/* 上傳/刪除我的資源按鈕 */}
      <div className="res-button-container">
        <button className="res-upload-button" onClick={onUploadOpen}>
          上傳我的資源
        </button>

        <button className="res-delete-button" onClick={handleDelete}>
          刪除我的資源
        </button>
      </div>
    </div>
  );
};

export default ResourceHeader;
