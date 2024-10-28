
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
      <select className="category-select">
        <option value="all">all</option>
        <option value="other">其他類別</option>
      </select>
      <div className="input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="輸入關鍵字..."
          className="search-input"
        />
        <button className="search-button" onClick={handleSearch}>
          <img src="/search_logo.svg" alt="搜尋" className="search-icon" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;