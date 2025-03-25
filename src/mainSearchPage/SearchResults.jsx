import React, { useState, useEffect } from 'react';
import './SearchResults.css';

const SearchResults = ({ results = [], isLoading = false, error = null, keyword = '', totalItems = 0 }) => {
  // Pagination State
  const ITEMS_PER_PAGE = 16;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const VISIBLE_PAGES = 10;

  // 計算總頁數
  useEffect(() => {
    setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
    // 當結果變化時，重置到第一頁
    setCurrentPage(1);
  }, [results]);

  // Get current page results
  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return results.slice(startIndex, endIndex);
  };

  // Split current page results into left and right columns
  const currentResults = getCurrentPageResults();
  const leftResults = currentResults.slice(0, Math.ceil(currentResults.length / 2));
  const rightResults = currentResults.slice(Math.ceil(currentResults.length / 2));

  // Pagination functions
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculate visible page numbers
  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 4);
    let end = Math.min(totalPages, start + VISIBLE_PAGES - 1);

    // Adjust start if we're near the end
    if (end === totalPages) {
      start = Math.max(1, end - VISIBLE_PAGES + 1);
    }

    // Adjust end if we're near the start
    if (start === 1) {
      end = Math.min(totalPages, VISIBLE_PAGES);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Render search result content with HTML
  const renderContent = (content) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="container-fluid">
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">載入搜尋結果中...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger my-5" role="alert">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center my-5">
          <p>未找到符合 "{keyword}" 的搜尋結果</p>
        </div>
      ) : (
        <div className="row">
          <div className="search-summary mb-3">
            找到 {totalItems} 筆含有 "{keyword}" 的搜尋結果
          </div>
          
          {/* 左欄位 */}
          <div className="col-6">
            <div className="row titleCard cardContainer">
              <div className="col-3 p-0">資源出處</div>
              <div className="col-9 p-0">內容</div>
            </div>
            {leftResults.map((result) => (
              <a
                key={result.id}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="row px-3 py-3 sentenceCard cardContainer">
                  <div className="col-3 p-0 sentenceTitle">
                    {result.resource}
                  </div>
                  <div className="col-9 p-0 sentenceContent">
                    {renderContent(result.content)}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* 右欄位 */}
          <div className="col-6">
            {rightResults.length > 0 && (
              <>
                <div className="row titleCard cardContainer">
                  <div className="col-3 p-0">資源出處</div>
                  <div className="col-9 p-0">內容</div>
                </div>
                {rightResults.map((result) => (
                  <a
                    key={result.id}
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="row px-3 py-3 sentenceCard cardContainer">
                      <div className="col-3 p-0 sentenceTitle">
                        {result.resource}
                      </div>
                      <div className="col-9 p-0 sentenceContent">
                        {renderContent(result.content)}
                      </div>
                    </div>
                  </a>
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <ul className="pagination">
                <li className="page-item back-button">
                  <a className={`page-link wide-link ${currentPage <= 1 ? 'invisible' : ''}`}
                    onClick={handlePreviousPage}>
                    《 Back
                  </a>
                </li>

                {getPageNumbers().map(number => (
                  <li key={number}
                    className={`page-item ${currentPage === number ? 'active' : ''}`}>
                    <a className="page-link"
                      onClick={() => handlePageChange(number)}>
                      {number}
                    </a>
                  </li>
                ))}

                <li className="page-item next-button">
                  <a className={`page-link wide-link ${currentPage >= totalPages ? 'invisible' : ''}`}
                    onClick={handleNextPage}>
                    Next 》
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;