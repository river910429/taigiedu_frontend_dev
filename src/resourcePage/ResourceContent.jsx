import React, { useState } from "react";
import "./ResourceContent.css";

import ResourceCard from "./ResourceCard";

const ResourceContent = ({ numberOfCards,renderCard,onCardClick  }) => {
  const defaultCard = {
    //imageUrl: "/src/assets/home/banner.png",
    imageUrl: "/src/assets/resourcepage/file_preview_demo.png",
    fileType: "PDF",
    likes: 100,
    downloads: 20,
    title: "112南一版四年級上學期國語課講義",
    uploader: "Wynnie",
    tags: ["國中", "真平", "上冊", "投影片"],
    date: "today",
  };

  const cards = Array.from({ length: numberOfCards  }, () => defaultCard);
  //const cards = fetchNewData() || Array.from({ length: 20 }, () => defaultCard);
  // Pagination constants
  const TOTAL_ITEMS = numberOfCards;
  const ITEMS_PER_PAGE = 12;
  const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  const VISIBLE_PAGES = 10;

  // State
  const [currentPage, setCurrentPage] = useState(1);
  // Generate all cards
  const allCards = Array.from({ length: numberOfCards }, () => defaultCard);
  
  // Get current page cards
  const getCurrentPageCards = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allCards.slice(startIndex, endIndex);
  };
  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 4);
    let end = Math.min(TOTAL_PAGES, start + VISIBLE_PAGES - 1);

    if (end === TOTAL_PAGES) {
      start = Math.max(1, end - VISIBLE_PAGES + 1);
    }
    if (start === 1) {
      end = Math.min(TOTAL_PAGES, VISIBLE_PAGES);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  return (
    <>
      <div className="resource-container">
      <div className="resource-content">
        {getCurrentPageCards().map((card, index) =>
          renderCard ? renderCard(card, index) : (
            <ResourceCard
              key={index}
              {...card}
              onCardClick={onCardClick ? () => onCardClick(card) : undefined}
            />
          )
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
    </>
  );
};

export default ResourceContent;
