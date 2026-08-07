import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import searchIcon from '../assets/home/search_logo.svg';
import noPics from '../assets/culture/festivalN.png';
import Pagination from '../mainSearchPage/Pagination';
import { getChildren, getItems, findNode } from '../services/cultureTestMockApi';
import './CultureTestPage.css';

/**
 * 台語文化（test）
 *
 * 導覽：用 query string 切換層級，所有層級一律以「麵包屑 + chip 列」操作，
 * 上方只保留搜尋框（不放分類下拉，避免同一批選項在兩處重複呈現）。
 *   無參數                        -> 分類索引（第一層大按鈕）
 *   ?l1=文化                      -> 麵包屑 + 第二層 chip + 卡片
 *   ?l1=文化&l2=戲曲              -> 麵包屑 + 第三層 chip + 卡片
 *   ?l1=文化&l2=戲曲&l3=歌仔戲    -> 麵包屑 + 同層 chip（自己 active）+ 卡片
 *
 * 搜尋：**只搜尋目前點選的範圍**。在「戲曲」底下搜尋就只找戲曲底下的影音；
 * 尚未選任何分類（索引頁）時範圍才是全部。切換分類時關鍵字會沿用並套到新範圍，
 * 因此摘要列一定會把目前生效的關鍵字顯示出來並提供清除，避免變成隱形狀態。
 *
 * 內容呈現比照「媒體與社群資源」：圖片 + 主標的卡片，點擊開新分頁到該筆影音。
 *
 * ⚠️ 分類樹是不規則的（深度 1~3），所以 chip 列一律看「目前節點有沒有子分類」決定，
 *    不能假設固定三層。例如「新聞/訪談」第一層即末端，點下去直接是卡片。
 *
 * ⚠️ 資料來自 services/cultureTestMockApi.js 假資料，尚未串接後端。
 */

const PAGE_SIZE = 20; // 4 欄 × 5 列

const CultureTestPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const level1 = searchParams.get('l1') || '';
  const level2 = searchParams.get('l2') || '';
  const level3 = searchParams.get('l3') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // keyword = 輸入框內容；activeKeyword = 已送出、目前生效的關鍵字
  const [keyword, setKeyword] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 目前選到的路徑與節點
  const selectedPath = useMemo(
    () => [level1, level2, level3].filter(Boolean),
    [level1, level2, level3]
  );
  const currentNode = useMemo(
    () => (selectedPath.length ? findNode(selectedPath) : null),
    [selectedPath]
  );

  // chip 列要顯示誰：
  //   目前節點還有下一層 -> 顯示它的子分類（沒有 active）
  //   目前節點已是末端   -> 顯示同層的兄弟分類，並把自己標成 active，
  //                        讓使用者不用回上一層就能換分類
  //   還沒選任何分類     -> 顯示第一層，供搜尋結果頁縮小範圍
  const hasChildren = (currentNode?.children?.length || 0) > 0;
  const chipParentPath = useMemo(
    () => (hasChildren ? selectedPath : selectedPath.slice(0, -1)),
    [hasChildren, selectedPath]
  );
  const chipNodes = useMemo(() => getChildren(chipParentPath), [chipParentPath]);
  const activeChip = hasChildren ? '' : selectedPath[selectedPath.length - 1];

  const rootCategories = useMemo(() => getChildren([]), []);

  // 目前搜尋範圍的名稱（未選分類時為全部）
  const scopeName = selectedPath.length ? selectedPath[selectedPath.length - 1] : '';

  // 有選分類、或有生效中的關鍵字時才進入結果頁；否則顯示分類索引
  const isIndex = !level1 && !activeKeyword;

  // 更新 query string 的統一入口（值為空字串時移除該參數）
  const updateParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  // ---- 導覽動作 ----
  const goToIndex = () => updateParams({ l1: '', l2: '', l3: '', page: '' });
  const selectLevel1 = (name) => updateParams({ l1: name, l2: '', l3: '', page: '' });
  const selectLevel2 = (name) => updateParams({ l2: name, l3: '', page: '' });
  const selectLevel3 = (name) => updateParams({ l3: name, page: '' });

  // 點 chip：依 chip 所屬的層級決定要填哪個參數
  const selectChip = (name) => {
    if (chipParentPath.length === 0) selectLevel1(name);
    else if (chipParentPath.length === 1) selectLevel2(name);
    else selectLevel3(name);
  };

  const handlePageChange = (nextPage) => {
    updateParams({ page: nextPage > 1 ? String(nextPage) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- 載入影音列表（範圍 = 目前選到的分類）----
  useEffect(() => {
    // 沒選分類也沒搜尋 -> 停在索引頁，不查資料
    if (!level1 && !activeKeyword) {
      setItems([]);
      setTotal(0);
      setTotalPages(1);
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getItems({
      level1,
      level2,
      level3,
      keyword: activeKeyword,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        if (res?.status !== 'success' || !Array.isArray(res.data)) {
          throw new Error('mock api response format invalid');
        }
        setItems(res.data);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('載入台語文化影音失敗:', err);
        setError('載入資料時發生錯誤，請稍後再試。');
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [level1, level2, level3, activeKeyword, page]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setActiveKeyword(keyword.trim());
    if (page !== 1) updateParams({ page: '' });
  };

  const clearKeyword = () => {
    setKeyword('');
    setActiveKeyword('');
    if (page !== 1) updateParams({ page: '' });
  };

  const handleCardClick = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 麵包屑：最後一段是純文字，前面都可點回去
  const crumbs = [
    level1 && { label: level1, onClick: () => updateParams({ l2: '', l3: '', page: '' }) },
    level2 && { label: level2, onClick: () => updateParams({ l3: '', page: '' }) },
    level3 && { label: level3, onClick: null },
  ].filter(Boolean);

  // 兩頁的搜尋框結構相同，只差外層 class：
  //   .ctp-search-form      起始頁：置中容器內的灰底圓角框，輸入框撐滿 + 外掛方形按鈕
  //   .ctp-search-container 分類頁：白底滿版橫幅內的窄輸入框，放大鏡疊在框內右側
  const renderSearchForm = (wrapperClass) => (
    <form className={wrapperClass} onSubmit={handleSearchSubmit}>
      <input
        type="text"
        className="ctp-search-input"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder={scopeName ? `在「${scopeName}」中搜尋...` : '搜尋全部分類...'}
      />
      <button type="submit" className="ctp-search-btn" aria-label="搜尋">
        <img src={searchIcon} alt="搜尋" className="ctp-search-icon" />
      </button>
    </form>
  );

  return (
    <div className="culture-test-page">
      {/* ============ 起始頁：維持原設計（置中容器 + 灰底搜尋框 + 分類索引）============ */}
      {isIndex && (
        <div className="ctp-page-narrow">
          <div className="ctp-toolbar">{renderSearchForm('ctp-search-form')}</div>

          <section className="ctp-index">
            <h2 className="ctp-index-title">分類索引</h2>
            <div className="ctp-topic-grid">
              {rootCategories.map(node => (
                <button
                  key={node.name}
                  type="button"
                  className="ctp-topic-btn"
                  title={node.desc || undefined}
                  onClick={() => selectLevel1(node.name)}
                >
                  {node.name}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 分類頁頁首：滿版白底橫幅，搜尋框靠左上對齊（版型比照「媒體與社群資源」） */}
      {!isIndex && (
        <div className="ctp-header">
          <div className="container px-4">
            <div className="ctp-header-content">
              {renderSearchForm('ctp-search-container')}
            </div>
          </div>
        </div>
      )}

      {/* ============ 分類頁 / 搜尋結果（麵包屑 + chip + 卡片）============ */}
      {!isIndex && (
        <section className="ctp-detail">
          <div className="container px-4">
          <nav className="ctp-breadcrumb" aria-label="breadcrumb">
            <button type="button" className="ctp-crumb-link" onClick={goToIndex}>
              分類索引
            </button>
            {crumbs.length === 0 ? (
              <span className="ctp-crumb-item">
                <span className="ctp-crumb-sep">&gt;</span>
                <span className="ctp-crumb-current">搜尋結果</span>
              </span>
            ) : (
              crumbs.map((crumb, index) => (
                <span key={crumb.label} className="ctp-crumb-item">
                  <span className="ctp-crumb-sep">&gt;</span>
                  {index === crumbs.length - 1 ? (
                    <span className="ctp-crumb-current">{crumb.label}</span>
                  ) : (
                    <button type="button" className="ctp-crumb-link" onClick={crumb.onClick}>
                      {crumb.label}
                    </button>
                  )}
                </span>
              ))
            )}
          </nav>

          {/* 分類 chip 列（子分類或同層兄弟，見上方 chipParentPath 說明） */}
          {chipNodes.length > 0 && (
            <div className="ctp-chip-group">
              {chipNodes.map(node => (
                <button
                  key={node.name}
                  type="button"
                  className={`ctp-chip ${node.name === activeChip ? 'is-active' : ''}`}
                  title={node.desc || undefined}
                  onClick={() => selectChip(node.name)}
                >
                  {node.name}
                </button>
              ))}
            </div>
          )}

          {/* 結果摘要：關鍵字生效時一定顯示出來，並可一鍵清除 */}
          {!isLoading && !error && (
            <div className="ctp-summary">
              <span>
                共 {total} 筆{totalPages > 1 && `｜第 ${page}／${totalPages} 頁`}
              </span>
              {activeKeyword && (
                <button type="button" className="ctp-keyword-tag" onClick={clearKeyword}>
                  <span>
                    在「{scopeName || '全部分類'}」中搜尋：{activeKeyword}
                  </span>
                  <span className="ctp-keyword-clear" aria-hidden="true">✕</span>
                </button>
              )}
            </div>
          )}

          {/* 卡片 */}
          {isLoading ? (
            <div className="ctp-msg">載入中…</div>
          ) : error ? (
            <div className="ctp-msg ctp-msg-error">{error}</div>
          ) : items.length === 0 ? (
            <div className="ctp-msg">
              {activeKeyword
                ? `在「${scopeName || '全部分類'}」中找不到符合「${activeKeyword}」的影音。`
                : '查無符合的影音。'}
            </div>
          ) : (
            <div className="row g-2 g-sm-4 ctp-card-grid">
              {items.map(item => (
                <div
                  key={item.id}
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
              ))}
            </div>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="ctp-pagination-wrap">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          </div>
        </section>
      )}
    </div>
  );
};

export default CultureTestPage;
