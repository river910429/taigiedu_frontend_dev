import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../../components/Toast';
import AdminModal from '../../../components/AdminModal';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';
import AdminDataTable from '../../../components/AdminDataTable';
import ReadOnlyNotice from '../../../components/ReadOnlyNotice/ReadOnlyNotice';
import { useContentEditPermission, NO_EDIT_PERMISSION_MESSAGE } from '../../useContentEditPermission';
import './adminSocialmediaPage.css';

// 圖標導入
import editIcon from '../../../assets/adminPage/pencil.svg';
import deleteIcon from '../../../assets/adminPage/trash.svg';
import addIcon from '../../../assets/adminPage/plus.svg';
import uturnIcon from '../../../assets/adminPage/uturn.svg';
import jpgIconImage from '../../../assets/adminPage/jpg icon.svg';
import { authenticatedFetch } from '../../../services/authService';
import { uploadFile, resolveFileUrl } from '../../../services/uploadService';

import envConfig from '../../../config';

const API_BASE_URL = envConfig.apiUrl;

/** 多個類別在後端是以逗號串成同一個字串 */
const CATEGORY_SEPARATOR = ', ';

/**
 * 把後端的 category 字串拆成標準化的類別 key 陣列
 * 後端格式為「以逗號分隔、每段可為 `父>子`」，例如 "工具>辭典或翻譯, Podcast"
 * 標準化後一律去除 `>` 與逗號前後的空白，才能跟勾選框的 key 對得起來
 */
const parseCategories = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map(part => part.split('>').map(s => s.trim()).filter(Boolean).join('>'))
    .filter(Boolean);
};

/** 把勾選的類別 key 陣列組回後端格式（與 parseCategories 對稱） */
const serializeCategories = (list) => list.join(CATEGORY_SEPARATOR);

/** 將 `父>子` 拆成 [父, 子]，沒有子分類時子為空字串 */
const splitCategoryKey = (key) => {
  const [parent = '', sub = ''] = String(key || '').split('>');
  return [parent, sub];
};

const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  // 新版 /file_upload 端點回傳完整相對路徑（如 /uploads/xxx.jpg），直接組合即可
  if (path.includes('/')) return resolveFileUrl(path);
  // 舊資料僅存純檔名，沿用舊有的固定靜態目錄
  return `${envConfig.imageUrl}/backend/static/media/${path}`;
};

const AdminSocialmediaPage = () => {
  const { showToast } = useToast();
  // 新增／修改／刪除僅限內容管理員，系統管理員只能檢視
  const canEditContent = useContentEditPermission();
  const [searchParams] = useSearchParams();
  // 由後台首頁的類別連結帶進來的預設篩選（?category=社群）
  const categoryParam = searchParams.get('category');
  const appliedCategoryRef = useRef(null);

  // 基本狀態
  const [menuItems, setMenuItems] = useState({});
  // 資料中實際出現過的所有類別 key（含只有父層的），即勾選框的選項來源
  const [categoryKeys, setCategoryKeys] = useState([]);
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
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [pickedCategories, setPickedCategories] = useState([]);
  const [imageName, setImageName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  // 編輯時原本的 figure 完整路徑，沒有重新上傳圖片就原封不動送回（imageName 只是顯示用的檔名）
  const [existingFigurePath, setExistingFigurePath] = useState('');
  const [uploadedImagePath, setUploadedImagePath] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setName('');
    setLink('');
    setPickedCategories([]);
    setImageName('');
    setImageUrl('');
    setExistingFigurePath('');
    setUploadedImagePath('');
    setImageUploading(false);
  };

  const togglePicked = (cat) => {
    setPickedCategories(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat]);
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
    setName(item.name || '');
    setLink(item.link || '');
    setPickedCategories(item.categories || []);
    setImageName(item.imageName || '');
    setImageUrl(item.imageUrl || '');
    setExistingFigurePath(item.figurePath || '');
    setUploadedImagePath('');
    setImageUploading(false);
    setAttemptedSubmit(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setAttemptedSubmit(false);
    setShowModal(false);
  };

  // 取得資料
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/socialmedia`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || '載入失敗');

      const dynamicMenu = {};
      const items = [];
      const records = result.data || [];
      const categoryMap = {};
      const allCategoryKeys = new Set();

      records.forEach(item => {
        // 一筆資料可能同時屬於多個類別，全部都要進選單，否則編輯時會勾不回來
        const categories = parseCategories(item.category);

        categories.forEach(key => {
          allCategoryKeys.add(key);
          const [parent, sub] = splitCategoryKey(key);
          if (!categoryMap[parent]) {
            categoryMap[parent] = new Set();
          }
          if (sub) {
            categoryMap[parent].add(sub);
          }
        });

        items.push({
          id: item.id || `media-${Date.now()}-${Math.random()}`,
          categories,
          name: item.name || '未命名',
          link: item.link || '#',
          imageUrl: getFullImageUrl(item.figure),
          imageName: item.figure ? item.figure.split('/').pop() : '',
          figurePath: item.figure || '',
          status: (item.status === 'publish' || item.status === 'published') ? 'published' : (item.status === 'archive' || item.status === 'archived' || item.status === 'deleted') ? 'archived' : item.status,
          timestamp: item.timestamp || new Date().toLocaleDateString('zh-TW')
        });
      });

      Object.keys(categoryMap).forEach(mainCat => {
        const subItems = Array.from(categoryMap[mainCat]).sort();
        dynamicMenu[mainCat] = {
          hasSubMenu: subItems.length > 0,
          subItems
        };
      });

      setMenuItems(dynamicMenu);
      setCategoryKeys(Array.from(allCategoryKeys).sort());
      setAllItems(items);
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

  // 資料載入後套用網址帶入的類別（同一個類別只套用一次，避免蓋掉使用者後續的手動切換）
  useEffect(() => {
    if (!categoryParam) return;
    if (appliedCategoryRef.current === categoryParam) return;
    if (Object.keys(menuItems).length === 0) return;

    appliedCategoryRef.current = categoryParam;
    if (menuItems[categoryParam]) {
      setParentFilter(categoryParam);
      setChildFilter('全部');
    } else {
      showToast(`找不到「${categoryParam}」類別，已顯示全部項目`, 'warning');
    }
  }, [categoryParam, menuItems, showToast]);

  // 取得子選項
  const childOptions = useMemo(() => {
    if (parentFilter === '全部') return [];
    return menuItems[parentFilter]?.subItems || [];
  }, [parentFilter, menuItems]);

  // 過濾邏輯：一筆資料只要有任一個類別符合就算命中（同一筆可能跨多個類別）
  const filteredItems = useMemo(() => {
    let list = allItems.filter(i => i.status === statusFilter);
    if (parentFilter !== '全部') {
      list = list.filter(i => i.categories.some(key => {
        const [parent, sub] = splitCategoryKey(key);
        return parent === parentFilter && (childFilter === '全部' || sub === childFilter);
      }));
    }
    return list;
  }, [allItems, parentFilter, childFilter, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEditContent) {
      showToast(NO_EDIT_PERMISSION_MESSAGE, 'warning');
      return;
    }
    setAttemptedSubmit(true);

    if (!name.trim()) {
      showToast('請輸入名稱', 'warning');
      return;
    }

    if (pickedCategories.length === 0) {
      showToast('請至少選擇一個類別', 'warning');
      return;
    }

    try {
      new URL(link);
    } catch {
      showToast('請輸入有效的連結 URL', 'warning');
      return;
    }

    if (imageUploading) {
      showToast('圖片上傳中，請稍候', 'warning');
      return;
    }

    // 沒有重新上傳就沿用原本的完整路徑；imageName 只是檔名，直接送回去會讓圖片失效
    const figureValue = uploadedImagePath || existingFigurePath;

    try {
      if (isEditing && currentEditId) {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/socialmedia/modify`, {
          method: 'POST',
          body: JSON.stringify({
            id: String(currentEditId),
            action: '3',
            name,
            link,
            category: serializeCategories(pickedCategories),
            figure: figureValue
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || '更新失敗');
        showToast('項目已更新', 'success');
      } else {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/socialmedia/add`, {
          method: 'POST',
          body: JSON.stringify({
            name,
            link,
            category: serializeCategories(pickedCategories),
            figure: figureValue
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || '新增失敗');
        showToast('項目已新增', 'success');
      }

      setShowModal(false);
      await fetchData();
    } catch (err) {
      showToast(`操作失敗: ${err.message}`, 'error');
    }
  };

  const validateAndSetImage = async (file) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showToast('只接受 JPG 或 PNG 格式', 'warning');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('檔案大小不能超過 2MB', 'warning');
      return;
    }

    setImageName(file.name);
    setImageUrl(URL.createObjectURL(file));
    setUploadedImagePath('');
    setImageUploading(true);
    try {
      const uploadedPath = await uploadFile(file);
      setUploadedImagePath(uploadedPath);
    } catch (err) {
      showToast(`圖片上傳失敗: ${err.message}`, 'error');
      setImageName('');
      setImageUrl('');
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteClick = useCallback(async (id) => {
    if (!canEditContent) {
      showToast(NO_EDIT_PERMISSION_MESSAGE, 'warning');
      return;
    }
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    const isRestoreAction = item.status === 'archived';
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/socialmedia/modify`, {
        method: 'POST',
        body: JSON.stringify({ id: String(id), action: isRestoreAction ? '2' : '1' })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || '操作失敗');

      showToast(isRestoreAction ? '項目已恢復' : '項目已封存', 'success');
      await fetchData();
    } catch (err) {
      showToast(`操作失敗: ${err.message}`, 'error');
    }
  }, [allItems, canEditContent, showToast, fetchData]);

  const showChildFilter = parentFilter === '全部'
    ? childOptions.length > 0
    : !!menuItems[parentFilter]?.hasSubMenu && childOptions.length > 0;

  // 直接以「資料中實際存在的類別」為選項，確保每一筆資料都勾得回來
  // （例如同一個父類別下，有些資料有子分類、有些只掛在父類別上，兩種都要能選）
  const flatCategoryOptions = useMemo(
    () => categoryKeys.map(key => ({ key, label: key.replace('>', '/') })),
    [categoryKeys]
  );

  // 定義表格欄位
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
      id: 'category',
      header: '類別',
      enableSorting: false,
      cell: ({ row }) => (
        row.original.categories.length > 0
          ? row.original.categories.map(key => key.replace('>', ' > ')).join('、')
          : '—'
      )
    },
    {
      accessorKey: 'name',
      header: '內容 (限20字)',
      enableSorting: true,
    },
    {
      accessorKey: 'link',
      header: '連結',
      enableSorting: false,
      cell: ({ row }) => (
        <a href={row.original.link} target="_blank" rel="noopener noreferrer">
          {row.original.link}
        </a>
      )
    },
    {
      id: 'image',
      header: '圖片',
      enableSorting: false,
      cell: ({ row }) => (
        (row.original.imageUrl || row.original.imageName) ? (
          <div className="image-preview-cell">
            <img src={jpgIconImage} alt="圖片" className="file-icon-img" />
            <span className="file-name-text">
              {row.original.imageName || row.original.imageUrl?.split('/').pop()?.split('.')[0] || '圖片'}
            </span>
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
          className={row.original.status === 'archived' ? "admin-action-btn restore-btn" : "admin-action-btn delete-btn"}
          onClick={() => handleDeleteClick(row.original.id)}
        >
          <img src={row.original.status === 'archived' ? uturnIcon : deleteIcon} alt={row.original.status === 'archived' ? "恢復" : "刪除"} className="admin-action-icon" />
        </button>
      )
    },
    {
      accessorKey: 'timestamp',
      header: '建立時間',
      enableSorting: true,
    }
  ].filter(Boolean), [handleDeleteClick, statusFilter, canEditContent]);

  return (
    <div className="admin-content-wrapper">
      <div className="admin-header-controls">
        <h5 className="d-flex align-items-center gap-2">
          媒體與社群資源 &gt;
          <CustomSelect
            size="sm"
            className="cs-w-auto"
            options={['全部', ...Object.keys(menuItems)]}
            value={parentFilter}
            onChange={(val) => {
              setParentFilter(val);
              setChildFilter('全部');
            }}
          />

          {showChildFilter && (
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

      {/* 使用 AdminModal 組件 */}
      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? '編輯項目' : '新增項目'}
        onSubmit={handleSubmit}
        size="lg"
        submitDisabled={imageUploading}
        submitText={imageUploading ? '圖片上傳中...' : '送出'}
      >
        <div className="admin-form-grid">
        <div className="mb-3">
          <label className="form-label admin-form-label">*名稱</label>
          <input
            type="text"
            className={`form-control admin-form-control ${attemptedSubmit && !name.trim() ? 'is-invalid' : ''
              }`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label admin-form-label">*連結</label>
          <input
            type="url"
            className={`form-control admin-form-control ${attemptedSubmit && (() => {
                try {
                  new URL(link);
                  return false;
                } catch {
                  return true;
                }
              })() ? 'is-invalid' : ''
              }`}
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        <div className="mb-3 admin-form-grid-full">
          <label className="form-label admin-form-label">*類別（至少勾選一個類別）</label>
          {flatCategoryOptions.length === 0 ? (
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
              尚無可選分類
            </div>
          ) : (
            <div className="category-checkboxes-container p-3 border rounded bg-light">
              <div className="d-flex flex-wrap gap-4">
                {flatCategoryOptions.map(opt => (
                  <div key={opt.key} className="form-check m-0 d-flex align-items-center">
                    <input
                      className="form-check-input mt-0 me-2"
                      type="checkbox"
                      id={`cat-${opt.key}`}
                      checked={pickedCategories.includes(opt.key)}
                      onChange={() => togglePicked(opt.key)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label mb-0" htmlFor={`cat-${opt.key}`} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {attemptedSubmit && pickedCategories.length === 0 && (
            <div className="invalid-hint text-danger mt-1" style={{ fontSize: '13px' }}>請至少勾選一個類別</div>
          )}
        </div>

        <div className="mb-3 admin-form-grid-full d-flex align-items-start gap-4">
          <div className="d-flex flex-column align-items-start gap-2">
            <label className="form-label admin-form-label mb-0">*圖片</label>
            <div className="d-flex flex-column align-items-start gap-1">
              <label className="admin-upload-btn" style={{ marginBottom: 0, opacity: imageUploading ? 0.6 : 1, pointerEvents: imageUploading ? 'none' : 'auto' }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="d-none"
                  disabled={imageUploading}
                  onChange={(e) => validateAndSetImage(e.target.files?.[0])}
                />
                {imageUploading ? '上傳中...' : '上傳檔案'}
              </label>
              <span className="upload-hint" style={{ fontSize: '13px' }}>
                ※限 JPG、PNG 可上傳，限制 2MB。
              </span>
            </div>
          </div>
          {(imageName || imageUrl) && (
            <div className="d-flex align-items-center gap-2">
              <img src={imageUrl || '#'} alt="圖片預覽" style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain', borderRadius: '4px' }} />
              <div className="text-secondary text-truncate" style={{ maxWidth: '150px', fontSize: '13px' }} title={imageName || '圖片'}>
                {imageName || imageUrl?.split('/').pop()?.split('.')[0] || '圖片'}
              </div>
            </div>
          )}
        </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminSocialmediaPage;
