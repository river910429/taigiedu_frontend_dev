import React from 'react';
import './SearchResults.css';

const SearchResults = ({ resultsLeft, resultsRight }) => {
  return (
    <div className="search-results">
      <div className="results-table">
        <div className="table-header">
          <span>資料來源</span>
          <span>內容</span>
        </div>
        {resultsLeft.map((result, index) => (
          <div className="table-row" key={index}>
            <span>{result.source}</span>
            <span>{result.content}</span>
          </div>
        ))}
      </div>

      <div className="results-table">
        <div className="table-header">
          <span>資料來源</span>
          <span>內容</span>
        </div>
        {resultsRight.map((result, index) => (
          <div className="table-row" key={index}>
            <span>{result.source}</span>
            <span>{result.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;