// src/mainsearchpage/MainSearchPage.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import Pagination from './Pagination';
import './MainSearchPage.css';

const MainSearchPage = () => {
  const [resultsLeft, setResultsLeft] = useState([
    { source: '台語文數位典藏資料庫', content: '台灣女性做人的條件...' },
    { source: '台文通訊Bong報', content: '分享王育德小說內涵的女性角色...' },
  ]);
  const [resultsRight, setResultsRight] = useState([
    { source: '國立教育廣播電台', content: '台語女性身分...' },
    { source: '台灣組合', content: '探索女性文化的轉變...' },
  ]);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // TODO: 在這裡加入 API 請求或資料更新邏輯
  };
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  return (
    <div className="main-search-page">
      <SearchBar initialQuery={initialQuery}/>
      <div className="results-container">
        <SearchResults resultsLeft={resultsLeft} resultsRight={resultsRight} />
      </div>
      {/* <Pagination
        currentPage={currentPage}
        totalPages={25}
        onPageChange={handlePageChange}
      /> */}
    </div>
  );
};

export default MainSearchPage;