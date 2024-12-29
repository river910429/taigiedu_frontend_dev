import React, { useState } from 'react';
import './SearchResults.css';

const SearchResults = () => {
  const searchResults = [
    {
      id: 1,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/1"
    },
    {
      id: 2,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/2"
    },
    {
      id: 3,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/3"
    },
    {
      id: 4,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/4"
    },
    {
      id: 5,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/5"
    },
    {
      id: 6,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/6"
    },
    {
      id: 7,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/7"
    },
    {
      id: 8,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/8"
    },
    {
      id: 9,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/9"
    },
    {
      id: 10,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/10"
    },
    {
      id: 11,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/11"
    },
    {
      id: 12,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/12"
    },
    {
      id: 13,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/13"
    },
    {
      id: 14,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/14"
    },
    {
      id: 15,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/15"
    },
    {
      id: 16,
      resource: "潘科元台語文理想國",
      content: "真濟儂不准阮稱呼家己个語言是台語，怹个理由是：原住民、客家人[hag2 ga24 ngin11] 嘛有權利稱呼家己个語言是台語，是按怎恁有權獨佔即个名稱？阮嘛歡迎原住民、客儂稱呼家己个話是台語。",
      url: "https://example.com/16"
    }
  ];

  // 將資料分為左右兩欄
  const leftResults = searchResults.slice(0, 8);
  const rightResults = searchResults.slice(8, 16);

  // Pagination constants
  const TOTAL_ITEMS = 200;
  const ITEMS_PER_PAGE = 16;
  const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  const VISIBLE_PAGES = 10;

  // State
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination functions
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Future implementation for content change
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Calculate visible page numbers
  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 4);
    let end = Math.min(TOTAL_PAGES, start + VISIBLE_PAGES - 1);

    // Adjust start if we're near the end
    if (end === TOTAL_PAGES) {
      start = Math.max(1, end - VISIBLE_PAGES + 1);
    }

    // Adjust end if we're near the start
    if (start === 1) {
      end = Math.min(TOTAL_PAGES, VISIBLE_PAGES);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* 左欄位 */}
        <div className="col-6">
          <div className="row titleCard cardContainer">
            <div className="col-3 p-0">資源出處</div>
            <div className="col-9 p-0">內容</div>
          </div>
          {leftResults.map((result, index) => (
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
                  {result.content.split('台語').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <><b style={{ color: 'red' }}>台</b><b style={{ color: 'red' }}>語</b></>
                      )}
                    </React.Fragment>
                  ))}
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
              {rightResults.map((result, index) => (
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
                      {result.content.split('台語').map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <><b style={{ color: 'red' }}>台</b><b style={{ color: 'red' }}>語</b></>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </>
          )}
        </div>


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
              <a className={`page-link wide-link ${currentPage >= TOTAL_PAGES ? 'invisible' : ''}`}
                onClick={handleNextPage}>
                Next 》
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
