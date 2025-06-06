import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MultiSelect from './multiselect';
import './PhraseSearchBar.css';
import searchIcon from '../assets/home/search_logo.svg';

const PhraseSearchBar = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categories') ? searchParams.get('categories').split(',') : []
  );
  const navigate = useNavigate();

  // 當 URL 參數變化時更新本地狀態
  useEffect(() => {
    setQuery(searchParams.get('query') || '');
    setSelectedCategories(
      searchParams.get('categories') ? searchParams.get('categories').split(',') : []
    );
  }, [searchParams]);

  const categories = [
    '數字',
    '經濟',
    '地名',
    '氣候',
    '人際關係',
    '社會人文',
    '人與國家',
    '動物',
    '植物',
    '天文',
    '器官與肢體',
    '團隊合作',
    '飲食',
    '家庭倫常',
    '樂器',
    '顏色',
    '戲劇'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    // 構建搜尋參數
    const searchParams = new URLSearchParams();
    if (query.trim() !== '') {
      searchParams.append('query', query);
    }
    if (selectedCategories.length > 0) {
      searchParams.append('categories', selectedCategories.join(','));
    }
    navigate(`/phrase?${searchParams.toString()}`);
  };

  const handleCategoryChange = (selected) => {
    setSelectedCategories(selected);
    console.log('已選擇類別:', selected);
  };

  return (
    <div className="search-Bar">
      <div className="input-container">
        <div className="filter-section">
          <MultiSelect
            options={categories}
            selectedOptions={selectedCategories}
            onChange={handleCategoryChange}
            placeholder="意涵分類"
            displayText="意涵分類"
          />
        </div>
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="phrase-search-input"
            placeholder="輸入關鍵字搜尋成語"
          />
          <img
            src={searchIcon}
            className="search-icon"
            onClick={handleSearch}
            alt="search"
          />
        </form>
      </div>
    </div>
  );
};

export default PhraseSearchBar;