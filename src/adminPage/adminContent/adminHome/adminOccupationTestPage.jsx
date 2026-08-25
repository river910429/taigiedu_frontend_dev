import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../../components/Toast';
import AdminModal from '../../../components/AdminModal';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';
import Card from '../../../components/Card/Card';
import Pagination from '../../../mainSearchPage/Pagination';
import PageLoading from '../../../components/PageLoading/PageLoading';
import ReadOnlyNotice from '../../../components/ReadOnlyNotice/ReadOnlyNotice';
import { useContentEditPermission, NO_EDIT_PERMISSION_MESSAGE } from '../../useContentEditPermission';
import { useAuth } from '../../../contexts/AuthContext';
import envConfig from '../../../config';
import { generateDocumentThumbnail } from '../../../utils/documentThumbnail';
import './adminOccupationTestPage.css';

// 圖標導入
import editIcon from '../../../assets/adminPage/pencil.svg';
import deleteIcon from '../../../assets/adminPage/trash.svg';
import addIcon from '../../../assets/adminPage/plus.svg';
import uturnIcon from '../../../assets/adminPage/uturn.svg';
import loadingImage from '../../../assets/record_loading.svg';
import defaultPreviewImage from '../../../assets/resourcepage/file_preview_demo.png';
import searchIcon from '../../../assets/home/search_logo.svg';

import {
  CATEGORY_OPTIONS,
  fetchAdminOccupationResources,
  addOccupationResource,
  modifyOccupationResource,
} from '../../../services/occupationTestMockApi';

/**
 * 職業台語（test）— 後台管理頁
 *
 * 頁面外框（麵包屑分類篩選、目前資源／刪除紀錄切換、新增鈕、AdminModal 表單）比照其他後台分頁
 * （adminSocialmediaPage / adminCultureTestPage），刪除為軟刪除、可從「刪除紀錄」復原。
 *
 * ⚠️ 但**清單不是 AdminDataTable，而是卡片牆**（PM 指定）：直接組裝 `components/Card` 的積木，
 * 與前台 /occupation-test 相同（預覽圖 + 檔案類型標籤 + 標題 + 上傳者，不放 Card.Stats，
 * 因為本功能不記錄點讚數與下載次數）。管理用的編輯／刪除鈕疊在預覽圖右上角。
 * 卡片尺寸寫在本頁 CSS 的 `.oca-grid > .cc-card`，
 * ⚠️ 要調整只能改本頁 CSS，**不可改動 components/Card 的積木樣式**（跨頁共用）。
 *
 * ── 欄位依前台（/occupation-test）實際使用的欄位設定 ──
 *   title      名稱：卡片主標、詳細頁標題，也是前台搜尋的比對欄位
 *   category   類別：前台的分類下拉（醫療長照／行業台語）
 *   uploader   上傳者：卡片的 Card.Uploader。**後台不提供輸入**，新增時由後端依 Token 自動帶入
 *              登入者名稱（mock 階段先用 AuthContext 的 user.name 代替）；編輯時維持原值不動
 *   fileType   檔案類型標籤：卡片預覽圖左下角，由上傳檔案的副檔名自動帶入，不手動填
 *   fileUrl    檔案：詳細頁「閱讀全部」下載用
 *   imageUrl   預覽縮圖：卡片預覽圖與詳細頁預覽區
 * 前台不顯示點讚數與下載次數，故沒有 likes / downloads；
 * topic 只用於前台搜尋字串，後台不提供輸入，新資料留空。
 *
 * ── 上傳檔案與預覽縮圖 ──
 * 比照前台「上傳資源」（resourcePage/UploadResource）的行為：
 * 選好檔案後自動產生縮圖（PDF 渲染第一頁、DOCX 取文字、DOC/PPT 佔位圖），
 * 也可手動上傳自訂圖片覆蓋。邏輯在 utils/documentThumbnail.js。
 *
 * ⚠️ 資料走 services/occupationTestMockApi.js 的 mock，尚未串接後端。
 * mock 階段檔案與縮圖都只產生本地 blob URL，接上 API 後改用
 * services/uploadService.js 的 uploadFile() 取得真實路徑。
 */

/** 上傳檔案限制，與前台「上傳資源」一致 */
const ACCEPTED_FILE_EXT = '.pdf,.doc,.docx,.ppt,.pptx';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/** 卡片牆每頁筆數（4 欄 × 3 列），與前台 /occupation-test 一致 */
const PAGE_SIZE = 12;

const AdminOccupationTestPage = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  // 新增／修改／刪除僅限內容管理員，系統管理員只能檢視
  const canEditContent = useContentEditPermission();
  const [searchParams] = useSearchParams();
  // 由後台首頁的類別連結帶進來的預設篩選（?category=醫療長照）
  const categoryParam = searchParams.get('category');
  const appliedCategoryRef = useRef(null);

  // 基本狀態
  const [allItems, setAllItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('published');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // 搜尋分成輸入中的 query 與已送出的 activeQuery，按 Enter／放大鏡才套用（與前台一致）
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  // Modal 狀態
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [customImageName, setCustomImageName] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setTitle('');
    setCategory('');
    setFileName('');
    setFileUrl('');
    setFileType('');
    setPreviewUrl('');
    setCustomImageName('');
    setIsGeneratingPreview(false);
  };

  const openCreate = () => {
    if (!canEditContent) {
      showToast(NO_EDIT_PERMISSION_MESSAGE, 'warning');
      return;
    }
    resetForm();
    setAttemptedSubmit(false);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setCurrentEditId(item.id);
    setTitle(item.title || '');
    setCategory(item.category || '');
    setFileName(item.fileName || '');
    setFileUrl(item.fileUrl || '');
    setFileType(item.fileType || '');
    setPreviewUrl(item.imageUrl || '');
    setCustomImageName('');
    setIsGeneratingPreview(false);
    setAttemptedSubmit(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setAttemptedSubmit(false);
    setShowModal(false);
  };

  // 取得資料（含已刪除，兩個視圖都從同一份資料篩）
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = await fetchAdminOccupationResources();
      setAllItems(records);
    } catch (err) {
      console.error('載入失敗:', err);
      setError(err.message);
      showToast('載入資料失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 套用網址帶入的類別（同一個類別只套用一次，避免蓋掉使用者後續的手動切換）
  useEffect(() => {
    if (!categoryParam) return;
    if (appliedCategoryRef.current === categoryParam) return;

    appliedCategoryRef.current = categoryParam;
    if (CATEGORY_OPTIONS.includes(categoryParam)) {
      setCategoryFilter(categoryParam);
    } else {
      showToast(`找不到「${categoryParam}」類別，已顯示全部項目`, 'warning');
    }
  }, [categoryParam, showToast]);

  const filteredItems = useMemo(() => {
    const wantDeleted = statusFilter === 'archived';
    const term = activeQuery.trim().toLowerCase();
    return allItems.filter(item => {
      if (item.is_deleted !== wantDeleted) return false;
      if (categoryFilter !== '全部' && item.category !== categoryFilter) return false;
      if (term) {
        // 比對欄位與前台一致（topic 不顯示在畫面上，但一樣列入比對）
        const haystack = `${item.title} ${item.category} ${item.topic} ${item.uploader}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [allItems, categoryFilter, statusFilter, activeQuery]);

  // 換篩選或搜尋條件後回到第一頁，避免停在一個已經不存在的頁碼上
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, activeQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(query);
  };

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /** 縮圖在 mock 階段是本地 blob URL，接上 API 後會變成後端路徑，兩種都要能顯示 */
  const resolveImageUrl = (url) => {
    if (!url) return defaultPreviewImage;
    if (/^(https?:|blob:|data:)/.test(url)) return url;
    const base = String(envConfig.apiUrl || '').replace(/\/+$/, '');
    return `${base}/${String(url).replace(/^\/+/, '')}`;
  };

  /**
   * 選擇檔案：驗證格式與大小，帶出檔案類型，並自動產生縮圖
   * 已手動上傳過自訂圖片時不覆蓋，避免使用者的選擇被蓋掉
   */
  const handleFileChange = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(ext)) {
      showToast('只接受 PDF、DOC、PPT 格式', 'warning');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast('檔案大小不能超過 100MB', 'warning');
      return;
    }

    setFileName(file.name);
    // mock 階段用本地 blob URL 代替上傳結果；接上 API 後改成 uploadFile(file)
    setFileUrl(URL.createObjectURL(file));
    // 前台卡片的檔案類型標籤只用 pdf / ppt / doc 三種
    setFileType(ext.replace(/x$/, ''));

    if (customImageName) return;

    setIsGeneratingPreview(true);
    try {
      const thumbnail = await generateDocumentThumbnail(file);
      if (thumbnail) setPreviewUrl(URL.createObjectURL(thumbnail));
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  /** 手動上傳預覽圖片，覆蓋自動產生的縮圖 */
  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('請選擇圖片檔案（JPG、PNG 等）', 'warning');
      return;
    }
    setCustomImageName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearPreview = () => {
    setPreviewUrl('');
    setCustomImageName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEditContent) {
      showToast(NO_EDIT_PERMISSION_MESSAGE, 'warning');
      return;
    }
    setAttemptedSubmit(true);

    if (!title.trim()) {
      showToast('請輸入名稱', 'warning');
      return;
    }

    if (!category) {
      showToast('請選擇類別', 'warning');
      return;
    }

    if (!fileUrl) {
      showToast('請上傳檔案', 'warning');
      return;
    }

    if (isGeneratingPreview) {
      showToast('縮圖生成中，請稍候', 'warning');
      return;
    }

    const payload = {
      category,
      title: title.trim(),
      fileType,
      fileUrl,
      fileName,
      imageUrl: previewUrl || null,
    };

    try {
      if (isEditing && currentEditId) {
        // 編輯不帶 uploader，維持原本的上傳者不變
        await modifyOccupationResource({ id: String(currentEditId), action: '3', ...payload });
        showToast('項目已更新', 'success');
      } else {
        // ⚠️ 上傳者應由後端依 Token 判定，這裡帶的值只是 mock 階段的替代；
        // 接上真實 API 後請把 uploader 從 payload 拿掉，改由後端寫入
        await addOccupationResource({ ...payload, uploader: user?.name || '' });
        showToast('項目已新增', 'success');
      }

      setShowModal(false);
      await fetchData();
    } catch (err) {
      showToast(`操作失敗: ${err.message}`, 'error');
    }
  };

  /**
   * 預覽：導到職業台語專用的預覽頁 /admin/occupation-test/preview，資料塞在 query string
   *
   * ⚠️ **不共用資源共享平台的 `/admin/file-preview`**：那頁的「下架資源」按鈕打
   * `/admin/resource/status`，職業台語的資料不在那組 API 裡；且本功能需要「返回列表」。
   * 要在那支加開關就得改到共用檔案，因此另寫一份（見 adminOccupationPreviewPage.jsx）。
   *
   * ⚠️ 這裡是**站內導頁（navigate），不是另開新分頁**。
   * 原因：access token 只存在記憶體（services/authService.js），新分頁是全新的 JS context 而拿不到，
   * 必須靠 /auth/refresh 的 cookie 救回來；本機 localhost:3000 打 api.taigiedu.com 屬跨站，
   * cookie 送不出去 → 被導去 /login → 而 ProtectedRoute 轉跳時只保留 pathname、
   * 把 query string 丟掉，回來後參數就全沒了。同分頁導頁不經過這段轉跳，參數才留得住。
   */
  const handlePreview = (item) => {
    const previewUrl = '/admin/occupation-test/preview?'
      + `title=${encodeURIComponent(item.title || '無標題資源')}`
      + `&imageUrl=${encodeURIComponent(resolveImageUrl(item.imageUrl))}`
      + `&fileType=${encodeURIComponent(item.fileType || '')}`
      + `&uploader=${encodeURIComponent(item.uploader || '匿名上傳者')}`
      + `&category=${encodeURIComponent(item.category || '')}`;
    navigate(previewUrl);
  };

  const handleDeleteClick = useCallback(async (id) => {
    if (!canEditContent) {
      showToast(NO_EDIT_PERMISSION_MESSAGE, 'warning');
      return;
    }
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    const isRestoreAction = item.is_deleted;
    try {
      await modifyOccupationResource({ id: String(id), action: isRestoreAction ? '2' : '1' });
      showToast(isRestoreAction ? '項目已恢復' : '項目已刪除', 'success');
      await fetchData();
    } catch (err) {
      showToast(`操作失敗: ${err.message}`, 'error');
    }
  }, [allItems, canEditContent, showToast, fetchData]);

  return (
    <div className="admin-content-wrapper">
      <div className="admin-header-controls">
        <h5 className="d-flex align-items-center gap-2">
          職業台語（test） &gt;
          <CustomSelect
            size="sm"
            className="cs-w-auto"
            options={['全部', ...CATEGORY_OPTIONS]}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </h5>

        <form className="oca-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="oca-search-input"
            placeholder="搜尋..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="oca-search-btn" aria-label="搜尋">
            <img src={searchIcon} alt="" />
          </button>
        </form>
      </div>

      <div className="admin-controls-row">
        {/* 刪除紀錄不需要新增項目功能；無編輯權限時也不顯示 */}
        {statusFilter !== 'archived' && canEditContent ? (
          <button className="btn btn-primary admin-add-button" onClick={openCreate}>
            <img src={addIcon} alt="新增" />
            新增項目
          </button>
        ) : (
          <div />
        )}

        <div className="status-filter">
          <span>目前狀態：</span>
          <CustomSelect
            size="sm"
            className="cs-w-md"
            options={[
              { value: 'published', label: '目前資源' },
              { value: 'archived', label: '刪除紀錄' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      <ReadOnlyNotice show={!canEditContent} />

      {isLoading ? (
        <PageLoading />
      ) : error ? (
        <div className="oca-state">
          <p className="mb-2">載入失敗：{error}</p>
          <button type="button" className="btn btn-primary admin-add-button" onClick={fetchData}>
            重新載入
          </button>
        </div>
      ) : pageItems.length === 0 ? (
        <div className="oca-state">{activeQuery ? '沒有找到符合條件的資源' : '暫無資料'}</div>
      ) : (
        <>
          <div className="oca-grid">
            {pageItems.map(item => (
              <div key={item.id} className="oca-card-slot">
                <Card>
                  <Card.Preview imageUrl={resolveImageUrl(item.imageUrl)}>
                    <Card.FileType>{item.fileType}</Card.FileType>
                  </Card.Preview>
                  <Card.Content>
                    <Card.Title>{item.title}</Card.Title>
                    <Card.Uploader name={item.uploader} />
                  </Card.Content>
                </Card>

                {/* 滑過卡片才浮出的操作層：預覽人人可用，編輯／刪除限內容管理員。
                    也對 :focus-within 生效，鍵盤 Tab 進來時同樣會顯示 */}
                <div className="oca-card-overlay">
                  <button
                    type="button"
                    className="oca-overlay-btn is-primary"
                    onClick={() => handlePreview(item)}
                  >
                    預覽
                  </button>

                  {canEditContent && statusFilter !== 'archived' && (
                    <button
                      type="button"
                      className="oca-overlay-btn"
                      onClick={() => openEdit(item)}
                    >
                      <img src={editIcon} alt="" />
                      編輯
                    </button>
                  )}

                  {canEditContent && (
                    <button
                      type="button"
                      className={`oca-overlay-btn ${item.is_deleted ? '' : 'is-danger'}`}
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      <img src={item.is_deleted ? uturnIcon : deleteIcon} alt="" />
                      {item.is_deleted ? '復原' : '刪除'}
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              maxVisible={4}
            />
          )}
        </>
      )}

      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? '編輯項目' : '新增項目'}
        onSubmit={handleSubmit}
        size="lg"
        submitDisabled={isGeneratingPreview}
        submitText={isGeneratingPreview ? '縮圖生成中...' : '送出'}
      >
        <div className="admin-form-grid">
          <div className="mb-3">
            <label className="form-label admin-form-label">*名稱</label>
            <input
              type="text"
              className={`form-control admin-form-control ${attemptedSubmit && !title.trim() ? 'is-invalid' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-form-label">*類別</label>
            <CustomSelect
              size="sm"
              options={CATEGORY_OPTIONS}
              value={category}
              placeholder="請選擇類別"
              onChange={setCategory}
            />
            {attemptedSubmit && !category && (
              <div className="invalid-hint">請選擇類別</div>
            )}
          </div>

          {/* 上傳檔案 */}
          <div className="mb-3 admin-form-grid-full">
            <label className="form-label admin-form-label">*上傳檔案</label>
            <div className="oca-upload-row">
              <label className="admin-upload-btn mb-0">
                <input
                  type="file"
                  accept={ACCEPTED_FILE_EXT}
                  className="d-none"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
                {fileName ? '已上傳檔案！' : '上傳檔案'}
              </label>
              <span className="oca-file-name">{fileName || '尚未選擇檔案'}</span>
            </div>
            <p className="upload-hint mb-0">※限 PDF, PPT, DOC 可上傳，限制 100MB。</p>
            {attemptedSubmit && !fileUrl && (
              <div className="invalid-hint">請上傳檔案</div>
            )}
          </div>

          {/* 預覽縮圖 */}
          <div className="mb-3 admin-form-grid-full">
            <label className="form-label admin-form-label">預覽縮圖</label>
            <p className="upload-hint">系統會依據上傳的檔案自動產生縮圖，也可手動上傳自訂預覽圖片。</p>

            <div className="oca-thumb-area">
              {isGeneratingPreview && (
                <div className="oca-thumb-loading">
                  <img src={loadingImage} alt="Generating" className="oca-thumb-loading-icon" />
                  <span>縮圖生成中…</span>
                </div>
              )}

              {!isGeneratingPreview && previewUrl && (
                <div className="oca-thumb-result">
                  <div className="oca-thumb-image-wrapper">
                    <img src={previewUrl} alt="文件縮圖預覽" className="oca-thumb-image" />
                    <button
                      type="button"
                      className="oca-thumb-remove"
                      onClick={clearPreview}
                      title="移除縮圖"
                    >
                      ✕
                    </button>
                  </div>
                  {customImageName && (
                    <span className="oca-thumb-custom-name">{customImageName}</span>
                  )}
                </div>
              )}

              {!isGeneratingPreview && !previewUrl && (
                <div className="oca-thumb-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>上傳檔案後自動生成縮圖</span>
                </div>
              )}
            </div>

            <label className="oca-thumb-upload-btn">
              <input
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />
              {previewUrl ? '替換預覽圖片' : '手動上傳預覽圖片'}
            </label>
          </div>
        </div>
      </AdminModal>

    </div>
  );
};

export default AdminOccupationTestPage;
