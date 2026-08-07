import { useState, useEffect, useMemo, useRef } from 'react';
import './CultureTestPage.css';
import searchIcon from '../assets/home/search_logo.svg';
import chevronUp from '../assets/chevron-up.svg';
import noPics from '../assets/culture/festivalN.png';
import PageLoading from '../components/PageLoading/PageLoading';
import Pagination from '../mainSearchPage/Pagination';
import { fetchCultureItems, CATEGORY_TREE } from '../services/cultureTestMockApi';

/**
 * 台語文化（test）
 *
 * 篩選與呈現方式比照「媒體與社群資源」（socialmediaPage）：
 *   - 頁首白底橫幅：分類下拉（第一層 + 第二層子選單，可複選）+ 關鍵字搜尋
 *   - 未篩選時依第一層分區預覽，每區顯示第一列並附「查看全部」
 *   - 有篩選或搜尋時攤平成完整列表 + 分頁
 *   - 內容為「圖片 + 主標」卡片，點擊開新分頁到該筆影音
 *
 * 分類取來源表的前兩層，第三層依 PM 決定捨棄、網頁不呈現。
 * 「新聞/訪談」沒有第二層，下拉需支援無子選單的情況。
 *
 * ⚠️ 資料來自 services/cultureTestMockApi.js 假資料，尚未串接後端。
 */

// 顯示規則：桌機每列 4 筆、每頁最多 5 列；未篩選時每區預覽第一列
const ITEMS_PER_ROW = 4;
const MAX_ROWS_PER_PAGE = 5;
const PAGE_SIZE = ITEMS_PER_ROW * MAX_ROWS_PER_PAGE;
const PREVIEW_COUNT = ITEMS_PER_ROW;

const CultureTestPage = () => {
  const [itemsByCategory, setItemsByCategory] = useState({});
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 已選分類，格式 { 第一層: [第二層, ...] }；空陣列代表整個第一層被選取
  const [selectedItems, setSelectedItems] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const dropdownRef = useRef(null);

  // 第一層 -> 第二層清單
  const subCategoriesOf = useMemo(() => {
    const map = {};
    CATEGORY_TREE.forEach(node => { map[node.name] = node.children; });
    return map;
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchCultureItems();
      const order = res?.category_order || Object.keys(res?.data || {});
      setItemsByCategory(res?.data || {});
      setCategoryOrder(order.filter(name => res?.data?.[name]));
    } catch (err) {
      console.error('載入台語文化資料失敗:', err);
      setError('載入台語文化資料時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedItems, activeQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // 無子選單的第一層：整層選取／取消
  const toggleCategory = (category) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[category]) delete next[category];
      else next[category] = [];
      return next;
    });
  };

  // 有子選單的第一層：點父項＝該層全選／全不選
  const toggleAllSubCategories = (category) => {
    const subs = subCategoriesOf[category] || [];
    setSelectedItems(prev => {
      const next = { ...prev };
      const current = next[category] || [];
      const isAll = subs.length > 0 && subs.every(sub => current.includes(sub));
      if (isAll) delete next[category];
      else next[category] = [...subs];
      return next;
    });
  };

  const toggleSubCategory = (category, sub) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      const current = next[category] || [];
      const updated = current.includes(sub)
        ? current.filter(name => name !== sub)
        : [...current, sub];
      if (updated.length === 0) delete next[category];
      else next[category] = updated;
      return next;
    });
  };

  const isSubSelected = (category, sub) => (selectedItems[category] || []).includes(sub);

  // 下拉按鈕上的文字
  const dropdownLabel = useMemo(() => {
    const categories = Object.keys(selectedItems);
    if (categories.length === 0) return '分類';

    const total = categories.reduce(
      (sum, category) => sum + Math.max(1, selectedItems[category].length),
      0
    );

    if (categories.length === 1) {
      const [category] = categories;
      const subs = selectedItems[category];
      if (subs.length === 0) return category;
      if (subs.length === 1) return `${category} > ${subs[0]}`;
      return `${category} > ${subs.length} 個選項`;
    }
    return `${total} 個選項`;
  }, [selectedItems]);

  const hasCategoryFilter = Object.keys(selectedItems).length > 0;
  const hasQuery = activeQuery !== '';

  // 依分類勾選與關鍵字過濾，維持第一層分組
  const filteredByCategory = useMemo(() => {
    const term = activeQuery.toLowerCase();
    const result = {};

    categoryOrder.forEach(category => {
      if (hasCategoryFilter && !selectedItems[category]) return;

      let items = itemsByCategory[category] || [];

      const subs = selectedItems[category];
      if (subs && subs.length > 0) {
        items = items.filter(item => subs.includes(item.subcategory));
      }

      if (term) {
        items = items.filter(item =>
          `${item.title} ${item.category} ${item.subcategory}`.toLowerCase().includes(term)
        );
      }

      if (items.length > 0) result[category] = items;
    });

    return result;
  }, [categoryOrder, itemsByCategory, selectedItems, hasCategoryFilter, activeQuery]);

  const visibleCategories = categoryOrder.filter(category => filteredByCategory[category]);

  // 未篩選也未搜尋 → 分區預覽；否則 → 完整列表 + 分頁
  const isFullList = hasCategoryFilter || hasQuery;

  const flatItems = visibleCategories.flatMap(category =>
    filteredByCategory[category].map(item => ({ item, category }))
  );
  const totalItems = flatItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = flatItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageGroups = [];
  pageItems.forEach(({ item, category }) => {
    const last = pageGroups[pageGroups.length - 1];
    if (last && last.category === category) last.items.push(item);
    else pageGroups.push({ category, items: [item] });
  });

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(query.trim().toLowerCase());
  };

  const handleCardClick = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewAll = (category) => {
    setSelectedItems({ [category]: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilter = () => {
    setSelectedItems({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCard = (item, category) => (
    <div
      key={`${category}-${item.id}`}
      className="col-6 col-md-4 col-lg-3"
      onClick={() => handleCardClick(item.url)}
    >
      <div className="ctp-card">
        <div className="ctp-card-image-wrap">
          <img
            src={item.image || noPics}
            alt={item.title}
            className="ctp-card-image"
            onError={(e) => { e.target.src = noPics; }}
          />
        </div>
        <h5 className="ctp-card-title">{item.title}</h5>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="culture-test-page">
        <PageLoading text="載入台語文化資料中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="culture-test-page">
        <div className="text-center py-5">
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary mt-3" onClick={loadData}>重新載入</button>
        </div>
      </div>
    );
  }

  return (
    <div className="culture-test-page">
      <div className="ctp-header">
        <div className="container px-4">
          <div className="ctp-header-content">
            {/* 分類下拉：第一層 + 第二層子選單 */}
            <div className="ctp-dropdown" ref={dropdownRef}>
              <div className="ctp-dropdown-container">
                <div
                  className="ctp-dropdown-header"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {dropdownLabel}
                </div>
                <img src={chevronUp} alt="" className="ctp-dropdown-arrow" />
              </div>

              {isDropdownOpen && (
                <div className="ctp-dropdown-menu">
                  {categoryOrder.map(category => {
                    const subs = subCategoriesOf[category] || [];
                    const selected = selectedItems[category];
                    const hasSelectedChildren = selected && selected.length > 0;
                    const isAllSelected =
                      subs.length > 0 && subs.every(sub => isSubSelected(category, sub));

                    // 無第二層（如「新聞/訪談」）：直接當成可勾選項目
                    if (subs.length === 0) {
                      return (
                        <div key={category} className="ctp-dropdown-row">
                          <div
                            className={`ctp-dropdown-item ${selected ? 'selected' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleCategory(category); }}
                          >
                            <span className="ctp-checkbox">{selected ? '✓' : ''}</span>
                            {category}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={category} className="ctp-dropdown-row">
                        <div
                          className={`ctp-dropdown-item with-submenu ${hasSelectedChildren ? 'has-selected-children' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleAllSubCategories(category); }}
                        >
                          <span className="ctp-checkbox">{isAllSelected ? '✓' : ''}</span>
                          <span className="ctp-dropdown-label">{category}</span>
                          <span className="ctp-submenu-arrow">›</span>
                        </div>

                        <div className="ctp-submenu" onClick={(e) => e.stopPropagation()}>
                          {subs.map(sub => (
                            <div
                              key={sub}
                              className={`ctp-submenu-item ${isSubSelected(category, sub) ? 'selected' : ''}`}
                              onClick={() => toggleSubCategory(category, sub)}
                            >
                              <span className="ctp-checkbox">
                                {isSubSelected(category, sub) ? '✓' : ''}
                              </span>
                              {sub}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 關鍵字搜尋 */}
            <form onSubmit={handleSearch} className="ctp-search-container">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜尋..."
                className="ctp-search-input"
              />
              <button type="submit" className="ctp-search-btn" aria-label="搜尋">
                <img src={searchIcon} alt="搜尋" className="ctp-search-icon" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {isFullList ? (
        /* ─── 完整列表（含分頁）─── */
        <>
          <div className="container px-4">
            <div className="ctp-list-toolbar">
              <div className="ctp-list-summary">
                共 {totalItems} 筆｜第 {safePage}／{totalPages} 頁
              </div>
              {hasCategoryFilter && (
                <button type="button" className="ctp-back-button" onClick={handleClearFilter}>
                  返回全部類別
                </button>
              )}
            </div>
          </div>

          {totalItems === 0 ? (
            <div className="container px-4">
              <div className="ctp-empty">沒有符合條件的資料</div>
            </div>
          ) : (
            pageGroups.map((group, index) => (
              <div key={`${group.category}-${index}`} className="ctp-section">
                <div className="container px-4">
                  <h2 className="ctp-category-title">{group.category}</h2>
                  <div className="row g-2 g-sm-4">
                    {group.items.map(item => renderCard(item, group.category))}
                  </div>
                </div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="container px-4">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                maxVisible={4}
              />
            </div>
          )}
        </>
      ) : (
        /* ─── 依第一層分區預覽（每區顯示第一列）─── */
        visibleCategories.map(category => {
          const items = filteredByCategory[category];
          return (
            <div key={category} className="ctp-section">
              <div className="container px-4">
                <div className="ctp-section-header">
                  <h2 className="ctp-category-title">
                    {category}
                    <span className="ctp-category-count">共 {items.length} 筆</span>
                  </h2>
                  <button
                    type="button"
                    className="ctp-viewall-button"
                    onClick={() => handleViewAll(category)}
                  >
                    查看全部 ›
                  </button>
                </div>
                <div className="row g-2 g-sm-4">
                  {items.slice(0, PREVIEW_COUNT).map(item => renderCard(item, category))}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CultureTestPage;
