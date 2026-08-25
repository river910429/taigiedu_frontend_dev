import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../../components/Toast';
import AdminModal from '../../../components/AdminModal';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';
import AdminDataTable from '../../../components/AdminDataTable';
import ReadOnlyNotice from '../../../components/ReadOnlyNotice/ReadOnlyNotice';
import { useContentEditPermission, NO_EDIT_PERMISSION_MESSAGE } from '../../useContentEditPermission';
import './adminCultureTestPage.css';

// 圖標導入
import editIcon from '../../../assets/adminPage/pencil.svg';
import deleteIcon from '../../../assets/adminPage/trash.svg';
import addIcon from '../../../assets/adminPage/plus.svg';
import uturnIcon from '../../../assets/adminPage/uturn.svg';
import jpgIconImage from '../../../assets/adminPage/jpg icon.svg';

import {
  CATEGORY_TREE,
  getCategoryId,
  fetchAdminCultureItems,
  addCultureItem,
  modifyCultureItem,
} from '../../../services/cultureTestMockApi';

/**
 * 台語文化（test）— 後台管理頁
 *
 * **版面與操作方式整套比照「媒體與社群資源」後台**（adminSocialmediaPage）：
 * 麵包屑分類篩選 + 目前資源／刪除紀錄切換 + AdminDataTable + AdminModal 表單，
 * 刪除為軟刪除、可從「刪除紀錄」復原。
 *
 * ── 欄位依前台（/culture-test）實際使用的欄位設定 ──
 *   parent_category  第一層，本頁固定「文化」，前後台都不顯示；由後端依 category_id 回填
 *   category         第二層 = 前台篩選第一層、分區預覽的區塊標題
 *   subcategory      第三層 = 前台篩選第二層（下拉子選單）
 *   title            卡片主標，也是前台搜尋的比對欄位
 *   image            卡片縮圖；**可留空**，前台沒圖會顯示預設佔位圖（見 docs/culture_test_api.md §7-2）
 *   url              影音來源網址，前台點卡片開新分頁
 * 前台沒有用到的欄位（sort_order / is_deleted / created_at）只在後台表格與狀態切換使用。
 *
 * ⚠️ 與媒體與社群資源刻意不同的兩點：
 *   1. 類別是**單選的兩層下拉**（一筆影音只屬於一個第三層分類），不是可複選的勾選框。
 *   2. 圖片**非必填**（媒體與社群資源是必填）。
 *
 * ⚠️ 資料走 services/cultureTestMockApi.js 的 mock，尚未串接後端；
 * 端點規格見 docs/culture_test_api.md §5，接上 API 時只需替換本檔 import 的四個函式。
 */

/** 第二層 → 第三層的對照，供表單與篩選的連動下拉使用 */
const SUB_CATEGORIES_OF = CATEGORY_TREE.reduce((map, node) => {
  map[node.name] = node.children;
  return map;
}, {});

/** 表格的建立時間欄位；mock 給的是 ISO 字串，接上 API 後格式相同 */
const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('zh-TW');
};

/**
 * 圖片欄位的顯示名稱
 * mock 階段上傳的是瀏覽器本地的 blob URL，取不到有意義的檔名，統一顯示「已上傳圖片」
 */
const getImageLabel = (path) => {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('data:')) return '已上傳圖片';
  return path.split('/').pop() || '圖片';
};

const AdminCultureTestPage = () => {
  const { showToast } = useToast();
  // 新增／修改／刪除僅限內容管理員，系統管理員只能檢視
  const canEditContent = useContentEditPermission();
  const [searchParams] = useSearchParams();
  // 由後台首頁的分類連結帶進來的預設篩選（?category=戲曲）
  const categoryParam = searchParams.get('category');
  const appliedCategoryRef = useRef(null);

  // 基本狀態
  const [allItems, setAllItems] = useState([]);
  const [parentFilter, setParentFilter] = useState('全部');
  const [childFilter, setChildFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('published');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal 狀態
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [imageName, setImageName] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setTitle('');
    setUrl('');
    setCategory('');
    setSubcategory('');
    setImagePath('');
    setImageName('');
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
    setUrl(item.url || '');
    setCategory(item.category || '');
    setSubcategory(item.subcategory || '');
    setImagePath(item.image || '');
    setImageName(getImageLabel(item.image));
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
      const records = await fetchAdminCultureItems();
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

  // 套用網址帶入的分類（同一個分類只套用一次，避免蓋掉使用者後續的手動切換）
  useEffect(() => {
    if (!categoryParam) return;
    if (appliedCategoryRef.current === categoryParam) return;

    appliedCategoryRef.current = categoryParam;
    if (SUB_CATEGORIES_OF[categoryParam]) {
      setParentFilter(categoryParam);
      setChildFilter('全部');
    } else {
      showToast(`找不到「${categoryParam}」分類，已顯示全部項目`, 'warning');
    }
  }, [categoryParam, showToast]);

  // 篩選列的第二層選項（跟著第一層連動）
  const childOptions = useMemo(() => {
    if (parentFilter === '全部') return [];
    return SUB_CATEGORIES_OF[parentFilter] || [];
  }, [parentFilter]);

  const filteredItems = useMemo(() => {
    const wantDeleted = statusFilter === 'archived';
    return allItems.filter(item => {
      if (item.is_deleted !== wantDeleted) return false;
      if (parentFilter !== '全部' && item.category !== parentFilter) return false;
      if (childFilter !== '全部' && item.subcategory !== childFilter) return false;
      return true;
    });
  }, [allItems, parentFilter, childFilter, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEditContent) {
      showToast(NO_EDIT_PERMISSION_MESSAGE, 'warning');
      return;
    }
    setAttemptedSubmit(true);

    if (!title.trim()) {
      showToast('請輸入標題', 'warning');
      return;
    }

    if (!category) {
      showToast('請選擇分類', 'warning');
      return;
    }

    // 目前四個分類都有第三層；保留無子項的分支，避免日後分類調整時卡住
    const subs = SUB_CATEGORIES_OF[category] || [];
    if (subs.length > 0 && !subcategory) {
      showToast('請選擇子分類', 'warning');
      return;
    }

    try {
      new URL(url);
    } catch {
      showToast('請輸入有效的影音連結 URL', 'warning');
      return;
    }

    // 後端只吃第三層的 category_id，三個分類字串由後端回填
    const categoryId = getCategoryId(category, subcategory);
    if (!categoryId) {
      showToast('找不到對應的分類，請重新選擇', 'warning');
      return;
    }

    try {
      if (isEditing && currentEditId) {
        await modifyCultureItem({
          id: String(currentEditId),
          action: '3',
          category_id: categoryId,
          title: title.trim(),
          url,
          image: imagePath || null,
        });
        showToast('項目已更新', 'success');
      } else {
        await addCultureItem({
          category_id: categoryId,
          title: title.trim(),
          url,
          image: imagePath || null,
        });
        showToast('項目已新增', 'success');
      }

      setShowModal(false);
      await fetchData();
    } catch (err) {
      showToast(`操作失敗: ${err.message}`, 'error');
    }
  };

  /**
   * 圖片選擇
   * ⚠️ mock 階段直接用本地 blob URL 當縮圖路徑；接上 API 後改成
   * services/uploadService.js 的 uploadFile()，比照 adminSocialmediaPage 的做法。
   */
  const validateAndSetImage = (file) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showToast('只接受 JPG 或 PNG 格式', 'warning');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('檔案大小不能超過 2MB', 'warning');
      return;
    }

    setImagePath(URL.createObjectURL(file));
    setImageName(file.name);
  };

  const clearImage = () => {
    setImagePath('');
    setImageName('');
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
      await modifyCultureItem({ id: String(id), action: isRestoreAction ? '2' : '1' });
      showToast(isRestoreAction ? '項目已恢復' : '項目已刪除', 'success');
      await fetchData();
    } catch (err) {
      showToast(`操作失敗: ${err.message}`, 'error');
    }
  }, [allItems, canEditContent, showToast, fetchData]);

  // 表單的第三層選項（跟著表單的第二層連動）
  const formSubOptions = useMemo(
    () => (category ? SUB_CATEGORIES_OF[category] || [] : []),
    [category]
  );

  // 定義表格欄位（依前台實際使用的欄位）
  const columns = useMemo(() => [
    // 刪除紀錄不需要修改功能
    statusFilter !== 'archived' && canEditContent && {
      id: 'edit',
      header: '編輯',
      size: 50,
      enableSorting: false,
      cell: ({ row }) => (
        <button className="admin-action-btn edit-btn" onClick={() => openEdit(row.original)}>
          <img src={editIcon} alt="編輯" className="admin-action-icon" />
        </button>
      )
    },
    {
      accessorKey: 'category',
      header: '分類',
      enableSorting: true,
    },
    {
      accessorKey: 'subcategory',
      header: '子分類',
      enableSorting: true,
      cell: ({ row }) => row.original.subcategory || '—'
    },
    {
      accessorKey: 'title',
      header: '標題',
      enableSorting: true,
    },
    {
      accessorKey: 'url',
      header: '影音連結',
      enableSorting: false,
      cell: ({ row }) => (
        <a href={row.original.url} target="_blank" rel="noopener noreferrer">
          {row.original.url}
        </a>
      )
    },
    {
      id: 'image',
      header: '圖片',
      enableSorting: false,
      cell: ({ row }) => (
        row.original.image ? (
          <div className="image-preview-cell">
            <img src={jpgIconImage} alt="圖片" className="file-icon-img" />
            <span className="file-name-text">{getImageLabel(row.original.image)}</span>
          </div>
        ) : (
          <span className="text-muted">無</span>
        )
      )
    },
    canEditContent && {
      id: 'action',
      header: statusFilter === 'archived' ? '復原' : '刪除',
      size: 50,
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className={row.original.is_deleted ? 'admin-action-btn restore-btn' : 'admin-action-btn delete-btn'}
          onClick={() => handleDeleteClick(row.original.id)}
        >
          <img
            src={row.original.is_deleted ? uturnIcon : deleteIcon}
            alt={row.original.is_deleted ? '恢復' : '刪除'}
            className="admin-action-icon"
          />
        </button>
      )
    },
    {
      accessorKey: 'created_at',
      header: '建立時間',
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.created_at)
    }
  ].filter(Boolean), [handleDeleteClick, statusFilter, canEditContent]);

  const isUrlInvalid = (() => {
    try {
      new URL(url);
      return false;
    } catch {
      return true;
    }
  })();

  return (
    <div className="admin-content-wrapper">
      <div className="admin-header-controls">
        <h5 className="d-flex align-items-center gap-2">
          台語文化（test） &gt;
          <CustomSelect
            size="sm"
            className="cs-w-auto"
            options={['全部', ...CATEGORY_TREE.map(node => node.name)]}
            value={parentFilter}
            onChange={(val) => {
              setParentFilter(val);
              setChildFilter('全部');
            }}
          />

          {childOptions.length > 0 && (
            <>
              &gt;
              <CustomSelect
                size="sm"
                className="cs-w-auto"
                options={['全部', ...childOptions]}
                value={childFilter}
                onChange={setChildFilter}
              />
            </>
          )}
        </h5>
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

      <AdminDataTable
        data={filteredItems}
        columns={columns}
        enableDragging={false}
        enableSorting={statusFilter !== 'archived'}
        isLoading={isLoading}
        error={error}
        onRetry={fetchData}
        emptyState={{ message: '暫無資料' }}
        enablePagination={true}
        pageSize={20}
      />

      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? '編輯項目' : '新增項目'}
        onSubmit={handleSubmit}
        size="lg"
      >
        <div className="admin-form-grid">
          <div className="mb-3">
            <label className="form-label admin-form-label">*標題</label>
            <input
              type="text"
              className={`form-control admin-form-control ${attemptedSubmit && !title.trim() ? 'is-invalid' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-form-label">*影音連結</label>
            <input
              type="url"
              className={`form-control admin-form-control ${attemptedSubmit && isUrlInvalid ? 'is-invalid' : ''}`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-form-label">*分類</label>
            <CustomSelect
              size="sm"
              options={CATEGORY_TREE.map(node => node.name)}
              value={category}
              placeholder="請選擇分類"
              onChange={(val) => {
                setCategory(val);
                setSubcategory('');
              }}
            />
            {attemptedSubmit && !category && (
              <div className="invalid-hint">請選擇分類</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label admin-form-label">*子分類</label>
            <CustomSelect
              size="sm"
              options={formSubOptions}
              value={subcategory}
              placeholder={category ? '請選擇子分類' : '請先選擇分類'}
              disabled={!category || formSubOptions.length === 0}
              onChange={setSubcategory}
            />
            {attemptedSubmit && formSubOptions.length > 0 && !subcategory && (
              <div className="invalid-hint">請選擇子分類</div>
            )}
          </div>

          <div className="mb-3 admin-form-grid-full d-flex align-items-start gap-4">
            <div className="d-flex flex-column align-items-start gap-2">
              <label className="form-label admin-form-label mb-0">圖片（選填）</label>
              <div className="d-flex flex-column align-items-start gap-1">
                <label className="admin-upload-btn" style={{ marginBottom: 0 }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="d-none"
                    onChange={(e) => validateAndSetImage(e.target.files?.[0])}
                  />
                  上傳檔案
                </label>
                <span className="upload-hint">
                  ※限 JPG、PNG 可上傳，限制 2MB。未上傳時前台顯示預設圖片。
                </span>
              </div>
            </div>
            {imagePath && (
              <div className="d-flex align-items-center gap-2">
                <img
                  src={imagePath}
                  alt="圖片預覽"
                  style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain', borderRadius: '4px' }}
                />
                <div className="d-flex flex-column align-items-start gap-1">
                  <div className="text-secondary text-truncate" style={{ maxWidth: '150px', fontSize: '13px' }} title={imageName}>
                    {imageName || '圖片'}
                  </div>
                  <button type="button" className="btn btn-link p-0 culture-clear-image" onClick={clearImage}>
                    移除圖片
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminCultureTestPage;
