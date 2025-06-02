import React, { useState, useEffect } from "react";
import "./ResourceContent.css";
import ResourceCard from "./ResourceCard";
import { useToast } from "../components/Toast";

// 添加 renderCard 到組件參數中
const ResourceContent = ({ searchParams, onCardClick, renderCard, onResourcesLoaded }) => {
  const { showToast } = useToast();
  const [resources, setResources] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // 分頁設置
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const TOTAL_PAGES = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const VISIBLE_PAGES = 10;

  // 獲取資源數據
useEffect(() => {
  fetchResources();
}, [searchParams, currentPage]);

const fetchResources = async () => {
  setIsLoading(true);
  try {
      const parameters = {
        stage: searchParams?.stage || "",
        version: searchParams?.version || "",
        keyword: searchParams?.keyword || "",
        searchContent: searchParams?.searchContent || "",
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };

      console.log("搜索參數:", parameters);

      const response = await fetch("https://dev.taigiedu.com/backend/api/resource/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parameters)
      });

      const result = await response.json();
      
      
    if (response.ok && result.status === "success") {
      console.log("搜索結果:", result);
      
      if (result.data && Array.isArray(result.data.resources)) {
        const resourcesList = result.data.resources;
        setResources(resourcesList);
        setTotalItems(result.data.totalItems || 0);
        
        // 調用回調函數以通知父組件資源已載入完成
        if (onResourcesLoaded) {
          onResourcesLoaded(resourcesList);
        }
      } else {
        console.error("返回的資源數據結構不正確:", result);
        setResources([]);
        setTotalItems(0);
        
        // 也要通知父組件資源為空
        if (onResourcesLoaded) {
          onResourcesLoaded([]);
        }
      }
    } else {
        console.error("搜索請求失敗:", result);
        showToast("搜索資源時發生錯誤，請稍後再試", "error");
        setResources([]);
        setTotalItems(0);
        if (onResourcesLoaded) {
        onResourcesLoaded([]);
      }
      }
    } catch (error) {
      console.error("搜索請求錯誤:", error);
      showToast("網絡連接錯誤，請檢查您的網絡連接", "error");
      setResources([]);
      setTotalItems(0);
      if (onResourcesLoaded) {
        onResourcesLoaded([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 分頁處理函數
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // 滾動到頁面頂部
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
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
        {isLoading ? (
          <div className="resource-loading">
            <div className="loading-spinner"></div>
            <p>載入資源中...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="resource-empty">
            <p>沒有找到符合條件的資源</p>
          </div>
        ) : (
          <div className="resource-content">
            {resources.map((resource, index) => {
              // 如果提供了自定義渲染函數，則使用它
              if (renderCard) {
                return renderCard(resource, index);
              }
              
              // 否則使用默認的卡片渲染
              return (
                <ResourceCard
                  key={resource.id || index}
                  imageUrl={resource.imageUrl || "/src/assets/resourcepage/file_preview_demo.png"}
                  fileType={resource.fileType || "PDF"}
                  likes={resource.likes || 0}
                  downloads={resource.downloads || 0}
                  title={resource.title || "無標題資源"}
                  uploader={resource.uploader_name || "匿名上傳者"}
                  tags={resource.tags || []}
                  date={resource.date || ""}
                  onCardClick={() => onCardClick && onCardClick(resource)}
                />
              );
            })}
          </div>
        )}

        {!isLoading && resources.length > 0 && (
          <div className="pagination-container">
            <ul className="pagination">
              <li className="page-item back-button">
                <a 
                  className={`page-link wide-link ${currentPage <= 1 ? 'invisible' : ''}`}
                  onClick={handlePreviousPage}
                >
                  《 Back
                </a>
              </li>

              {getPageNumbers().map(number => (
                <li 
                  key={number}
                  className={`page-item ${currentPage === number ? 'active' : ''}`}
                >
                  <a 
                    className="page-link"
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </a>
                </li>
              ))}

              <li className="page-item next-button">
                <a 
                  className={`page-link wide-link ${currentPage >= TOTAL_PAGES ? 'invisible' : ''}`}
                  onClick={handleNextPage}
                >
                  Next 》
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default ResourceContent;