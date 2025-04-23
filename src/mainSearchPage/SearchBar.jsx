import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';
import MultiSelect from '../phrasePage/multiselect';
import searchIcon from '../assets/home/search_logo.svg';

const SearchBar = ({ initialQuery = '', categories = [], selectedCategories = [], onCategoryChange }) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  // 當 initialQuery 變更時更新狀態
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === '') return;

    // 構建搜尋參數
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    if (selectedCategories.length > 0) {
      searchParams.append('categories', selectedCategories.join(','));
    }
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleCategoryChange = (selected) => {
    // 通知父組件分類已更改
    if (onCategoryChange) {
      onCategoryChange(selected);
    }
  };

  return (
    <div className="search-bar">
      <div className="input-container">
        <div className="px-2 bar-selectspace">
          <MultiSelect
            options={categories}
            selectedOptions={selectedCategories}
            onChange={handleCategoryChange}
            placeholder="資料出處"
            displayText="資料出處"
          />
        </div>
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋..."
            className="search-input"
          />
          <img
            src={searchIcon}
            className="search-icon"
            onClick={handleSearch}
          />
        </form>
      </div>
    </div>
  );
};

export default SearchBar;