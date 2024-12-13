
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim() === '') return;
    navigate(`/search?query=${query}`);
  };

  return (
    <div className="search-bar">

      <div className="input-container">
      <div className="px-2">
      <select className="category-select category-input">
        <option value="all">all</option>
        <option value="other">其他類別</option>
      </select>
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
            src="search_logo.svg" 
            className="search-icon"
            onClick={handleSearch} // 點擊圖片觸發搜尋跳轉
          />
        </form>
      </div>
    </div>
  );
};

export default SearchBar;