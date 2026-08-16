import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './OccupationTestPage.css';
import envConfig from '../config';
import searchIcon from '../assets/home/search_logo.svg';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import Card from '../components/Card/Card';
import defaultPreviewImage from '../assets/resourcepage/file_preview_demo.png';
import PageLoading from '../components/PageLoading/PageLoading';
import Pagination from '../mainSearchPage/Pagination';
import { fetchOccupationResources } from '../services/occupationTestMockApi';

/**
 * 職業台語（test）
 *
 * 版面沿用「台語教學資源共享平台」（resourcePage）：sticky 篩選列 + 卡片牆 + 分頁，
 * 卡片直接組裝 `components/Card` 的積木（預覽圖 + 檔案類型標籤 + 標題 + 上傳者 + 標籤），
 * 與資源共享平台的差別只在**不顯示點讚數與下載次數**——不放 `<Card.Stats>` 就是了。
 * 卡片在本頁的尺寸（300×400、預覽圖 222px…）寫在 OccupationTestPage.css，
 * ⚠️ 需要調整只能改本頁 CSS，**不可改動 components/Card 的積木樣式**，那是跨頁共用的。
 *
 * 與資源共享平台刻意不同的兩點（PM 指定）：
 *   1. 篩選只有**一個**分類下拉 + 關鍵字搜尋，沒有階段／版本／內容類型，也沒有上傳／刪除按鈕
 *   2. 點卡片**不另開新分頁**，用 navigate 直接在站內開啟 /occupation-test/:id
 *
 * ⚠️ 資料來自 services/occupationTestMockApi.js 假資料（分類目前為醫療長照／行業台語），
 *    分類與內容日後改由後端資料庫提供。
 */

const ITEMS_PER_PAGE = 12;

const OccupationTestPage = () => {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 唯一的篩選條件：分類（null 代表全部）
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchOccupationResources();
      setResources(res?.data || []);
      setCategories(res?.categories || []);
    } catch (err) {
      console.error('載入職業台語資料失敗:', err);
      setError('載入職業台語資料時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 篩選條件變動就回到第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, activeQuery]);

  const filteredResources = useMemo(() => {
    const term = activeQuery.trim().toLowerCase();

    return resources.filter(item => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (!term) return true;
      return `${item.title} ${item.category} ${item.topic} ${item.uploader} ${(item.tags || []).join(' ')}`
        .toLowerCase()
        .includes(term);
    });
  }, [resources, selectedCategory, activeQuery]);

  const totalItems = filteredResources.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredResources.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(query.trim());
  };

  // 預覽圖：相對路徑補上 API base，沒有圖就用預設圖
  const resolveImageUrl = (url) => {
    if (!url) return defaultPreviewImage;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = String(envConfig.apiUrl || '').replace(/\/+$/, '');
    return `${base}/${String(url).replace(/^\/+/, '')}`;
  };

  // 分類下拉：選「全部」等同清空條件
  const handleCategoryChange = (value) => {
    setSelectedCategory(value === '全部' ? null : value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 站內開啟詳細頁（不另開新分頁）
  const handleCardClick = (item) => {
    navigate(`/occupation-test/${item.id}`);
  };

  if (isLoading) {
    return (
      <div className="occupation-test-page">
        <PageLoading text="載入職業台語資料中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="occupation-test-page">
        <div className="text-center py-5">
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary mt-3" onClick={loadData}>重新載入</button>
        </div>
      </div>
    );
  }

  return (
    <div className="occupation-test-page">
      <div className="otp-header page-filter-header is-bleed">
        {/* 分類下拉（唯一的篩選條件） */}
        <div className="otp-category-select">
          <CustomSelect
            options={['全部', ...categories]}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="分類"
          />
        </div>

        {/* 關鍵字搜尋 */}
        <form onSubmit={handleSearch} className="otp-search-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋..."
            className="otp-search-input"
          />
          <button type="submit" className="otp-search-btn" aria-label="搜尋">
            <img src={searchIcon} alt="搜尋" className="otp-search-icon" />
          </button>
        </form>
      </div>

      <div className="otp-container">
        {totalItems === 0 ? (
          <div className="otp-empty">沒有找到符合條件的資源</div>
        ) : (
          <div className="otp-grid">
            {pageItems.map(item => (
              <Card key={item.id} onClick={() => handleCardClick(item)}>
                <Card.Preview imageUrl={resolveImageUrl(item.imageUrl)}>
                  <Card.FileType>{item.fileType}</Card.FileType>
                </Card.Preview>
                <Card.Content>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Uploader name={item.uploader} />
                  <Card.Tags tags={item.tags} />
                </Card.Content>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            maxVisible={4}
          />
        )}
      </div>
    </div>
  );
};

export default OccupationTestPage;
