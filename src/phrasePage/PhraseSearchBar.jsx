import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiSelect from './MultiSelect';
import './PhraseSearchBar.css';

const PhraseSearchBar = () => {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

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
    if (query.trim() === '') return;
    
    // 構建搜尋參數
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
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
          />
          <img
            src="search_logo.svg"
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
