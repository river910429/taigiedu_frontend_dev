import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./ResourceHeader.css";
import MultiSelect from '../phrasePage/MultiSelect';

const ResourceHeader = ({onUploadOpen}) => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState("階段");
  const [query, setQuery] = React.useState("");
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [isMultiSelectEnabled, setIsMultiSelectEnabled] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); //多選下拉選單


  const gradeToVersions = {
    國小: ["真平", "康軒"],
    國中: ["真平", "康軒", "奇異果", "師昀", "全華", "豪風", "長鴻"],
    高中: ["真平", "育達", "泰宇", "奇異果", "創新"],
  };

  const getVersionOptions = (grade) => {
    if (grade === "全部") {
      // return Object.values(gradeToVersions).flat();
      return allVersions;
    }
    return gradeToVersions[grade] || [];
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
  const handleCategoryChange = (selected) => {
    setSelectedCategories(selected);
  };

  const handleGradeChange = (e) => {
    const grade = e.target.value;
    setSelectedGrade(grade);
    // 強制清空已選版本
    setSelectedCategories([]);
    setIsMultiSelectEnabled(grade !== "階段");
  };

  const handleSearch = (e) => {
    e.preventDefault(); // 防止頁面重整
    if (query.trim() === "") return;
  };

  const handleDelete = () => {
    navigate("/delete-resource"); 
  }



  return (
    <div className="resource-header">
      {/* 階段下拉選單 */}
      <select
        className={`grade-dropdown ${isGradeOpen ? "open" : ""}`}
        onClick={() => setIsGradeOpen(!isGradeOpen)}
        value={selectedGrade}
        onChange={handleGradeChange}
      >
        <option hidden>
          階段
        </option>
        <option value="全部">全部</option>
        <option value="高中">高中</option>
        <option value="國中">國中</option>
        <option value="國小">國小</option>
      </select>



<div className={`multiselect-wrapper ${isMultiSelectEnabled ? 'enabled' : 'disabled'} resource-multi`}>
      <MultiSelect
        key={selectedGrade}
        options={getVersionOptions(selectedGrade)}
        selectedOptions={selectedCategories}
        onChange={handleCategoryChange}
        placeholder="版本"
        displayText="已選擇版本"
      />
    </div>

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
