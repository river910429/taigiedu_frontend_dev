
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';
import MultiSelect from '../phrasePage/MultiSelect';

const SearchBar = ({ initialQuery }) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const categories = [
    '台語文數位典藏',
    '台文通訊Bong報',
    '潘科元台語文理補習班',
    '台灣組合',
    '李講古我來聽',
    '國立教育廣播電臺'
  ];
  const [selectedCategories, setSelectedCategories] = useState([...categories]);
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
    setSelectedCategories(selected);
    console.log('已選擇:', selected);
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
          {/* <select className="category-select category-input">
        <option value="all">all</option>
        <option value="other">其他類別</option>
      </select> */}
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