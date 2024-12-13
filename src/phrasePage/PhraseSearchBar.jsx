import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiSel from './multiselect';
import './PhraseSearchBar.css';



const PhraseSearchBar = () => {
  
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === '') return;
    navigate(`/phrase?query=${query}`);
  };
  

  return (
    <div className="search-Bar">
      <div className="input-container">
      <div className="px-2">
        <MultiSel />
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
            alt="search"
          />
        </form>
      </div>
      </div>  
  );
};

export default PhraseSearchBar;