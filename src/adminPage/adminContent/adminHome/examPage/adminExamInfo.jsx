import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../../../components/Toast';
import AdminModal from '../../../../components/AdminModal';
import AdminDataTable from '../../../../components/AdminDataTable';
import './adminExamInfo.css';
import editIcon from '../../../../assets/adminPage/pencil.svg';
import deleteIcon from '../../../../assets/adminPage/trash.svg';
import addIcon from '../../../../assets/adminPage/plus.svg';
import uturnIcon from '../../../../assets/adminPage/uturn.svg';
import jpgIconImage from '../../../../assets/adminPage/jpg icon.svg';
import { authenticatedFetch } from '../../../../services/authService';
import { uploadFile, resolveFileUrl } from '../../../../services/uploadService';

import envConfig from '../../../../config';

const API_BASE_URL = envConfig.apiUrl;

const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  // 新版 /file_upload 端點回傳完整相對路徑（如 /uploads/xxx.jpg），直接組合即可
  if (path.includes('/')) return resolveFileUrl(path);
  // 舊資料僅存純檔名，沿用舊有的固定靜態目錄
  return `${envConfig.imageUrl}/backend/static/exam/${path}`;
};

const normalizeStatus = (status) => {
  if (status === 'publish' || status === 'published') return 'published';
  if (status === 'archive' || status === 'archived' || status === 'deleted') return 'archived';
  return status;
};

const AdminExamInfo = () => {
  const { showToast } = useToast();
  const [examTypes, setExamTypes] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('published');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Form fields
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    fetchExamTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExamTypes = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/exam`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || '載入失敗');

      const dataObj = result.data || {};
      const cats = Object.keys(dataObj);
      setAvailableCategories(cats);

      const allItems = cats.flatMap(cat =>
        (dataObj[cat] || []).map(item => ({
          id: item.id,
          category: cat,
          subcategory: item.subcategory || '',
          name: item.title || item.name || '',
          link: item.url || item.link || '',
          imageName: (item.image || item.figure) ? (item.image || item.figure).split('/').pop() : '圖片',
          imageUrl: getFullImageUrl(item.image || item.figure || ''),
          createdAt: item.timestamp,
          status: normalizeStatus(item.status)
        }))
      );
      setExamTypes(allItems);
    } catch (err) {
      showToast(`載入失敗: ${err.message}`, 'error');
    }
  };

  const displayItems = useMemo(() => {
    return examTypes.filter(item => {
      const matchStatus = item.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchStatus && matchCategory;
    });
  }, [examTypes, statusFilter, categoryFilter]);

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setCurrentEditId(item.id);
    setNewName(item.name);
    setNewLink(item.link);
    setNewCategory(item.category);
    setNewSubcategory(item.subcategory || '');
    setImageName(item.imageName);
    setImageUrl(item.imageUrl);
    setImageFile(null);
    setUploadedImagePath('');
    setImageUploading(false);
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/exam/modify`, {
        method: 'POST',
        body: JSON.stringify({ id: String(id), action: '1' })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || '操作失敗');
      showToast('項目已移至刪除紀錄', 'success');
      await fetchExamTypes();
    } catch (err) {
      showToast(`下架失敗: ${err.message}`, 'error');
    }
  };

  const handleRestoreClick = async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/exam/modify`, {
        method: 'POST',
        body: JSON.stringify({ id: String(id), action: '2' })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || '操作失敗');
      showToast('項目已恢復', 'success');
      await fetchExamTypes();
    } catch (err) {
      showToast(`恢復失敗: ${err.message}`, 'error');
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
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setUploadedImagePath('');
    setImageUploading(true);
    try {
      const uploadedPath = await uploadFile(file);
      setUploadedImagePath(uploadedPath);
    } catch (err) {
      showToast(`圖片上傳失敗: ${err.message}`, 'error');
      setImageFile(null);
      setImageName('');
      setImageUrl('');
    } finally {
      setImageUploading(false);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewLink('');
    setNewCategory(availableCategories[0] || '');
    setNewSubcategory('');
    setIsCustomCategory(false);
    setImageFile(null);
    setUploadedImagePath('');
    setImageUploading(false);
    setImageName('');
    setImageUrl('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!newCategory) {
      showToast('請選擇類別', 'warning');
      return;
    }

    try {
      new URL(newLink);
    } catch {
      showToast('請輸入有效的 URL', 'warning');
      return;
    }

    if (imageUploading) {
      showToast('圖片上傳中，請稍候', 'warning');
      return;
    }

    if (!isEditing && !uploadedImagePath) {
      showToast('請上傳圖片', 'warning');
      return;
    }

    if (imageFile && !uploadedImagePath) {
      showToast('圖片尚未上傳成功，請重新選擇圖片', 'warning');
      return;
    }

    try {
      if (isEditing) {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/exam/modify`, {
          method: 'POST',
          body: JSON.stringify({
            id: String(currentEditId),
            action: '3',
            category: newCategory,
            subcategory: newSubcategory,
            title: newName,
            url: newLink,
            ...(uploadedImagePath && { image: uploadedImagePath })
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || '更新失敗');
        showToast('項目已更新！', 'success');
      } else {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/exam/add`, {
          method: 'POST',
          body: JSON.stringify({
            category: newCategory,
            subcategory: newSubcategory,
            title: newName,
            url: newLink,
            image: uploadedImagePath
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || '新增失敗');
        showToast('項目已新增！', 'success');
      }

      handleModalClose();
      await fetchExamTypes();
    } catch (err) {
      showToast(`操作失敗: ${err.message}`, 'error');
    }
  };

  const columns = useMemo(() => [
    // 刪除紀錄不需要修改功能
    statusFilter !== 'archived' && {
      id: 'edit',
      header: '修改',
      size: 50,
      enableSorting: false,
      cell: ({ row }) => (
        <button className="admin-action-btn edit-btn" onClick={() => handleEditClick(row.original)}>
          <img src={editIcon} alt="編輯" className="admin-action-icon" />
        </button>
      )
    },
    {
      accessorKey: 'category',
      header: '類別',
      enableSorting: true,
    },
    {
      accessorKey: 'subcategory',
      header: '子類別',
      enableSorting: true,
    },
    {
      accessorKey: 'name',
      header: '名稱',
      enableSorting: true,
    },
    {
      id: 'image',
      header: '圖片',
      size: 200,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="image-preview-cell">
          <img src={jpgIconImage} alt="圖片" className="file-icon-img" />
          <span className="file-name-text">{row.original.imageName}</span>
        </div>
      )
    },
    {
      accessorKey: 'link',
      header: '連結',
      enableSorting: false,
      cell: ({ row }) => (
        <a href={row.original.link} target="_blank" rel="noopener noreferrer" className="admin-link">
          {row.original.link}
        </a>
      )
    },
    {
      id: 'action',
      header: statusFilter === 'archived' ? '復原' : '刪除',
      size: 50,
      enableSorting: false,
      cell: ({ row }) => (
        statusFilter === 'published' ? (
          <button className="admin-action-btn delete-btn" onClick={() => handleDeleteClick(row.original.id)}>
            <img src={deleteIcon} alt="刪除" className="admin-action-icon" />
          </button>
        ) : (
          <button className="admin-action-btn restore-btn" onClick={() => handleRestoreClick(row.original.id)}>
            <img src={uturnIcon} alt="恢復" className="admin-action-icon" />
          </button>
        )
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ].filter(Boolean), [statusFilter]);

  return (
    <div className="admin-exam-info-page p-4">
      <div className="admin-header-main">
        <h5 className="mb-3 text-secondary">
          認證考試 &gt; {categoryFilter === 'all' ? '全部' : categoryFilter} &gt; <span>{statusFilter === 'published' ? '目前項目' : '刪除紀錄'}</span>
        </h5>
        <div className="admin-controls-row">
          {/* 刪除紀錄不需要新增項目功能 */}
          {statusFilter !== 'archived' && (
            <button className="btn btn-primary me-3 admin-add-button" onClick={handleAddClick}>
              <img src={addIcon} alt="新增項目" />
              新增項目
            </button>
          )}
          <div className="d-flex align-items-center gap-3">
            <div className="filter-breadcrumb">
              <span className="breadcrumb-label">篩選：</span>
              <select
                className="form-select admin-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">全部</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="status-filter">
              <span className="me-2 text-secondary">目前狀態：</span>
              <select
                className="form-select admin-status-dropdown"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="published">目前項目</option>
                <option value="archived">刪除紀錄</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <AdminDataTable
        data={displayItems}
        columns={columns}
        enableDragging={false}
        enableSorting={statusFilter !== 'archived'}
        emptyState={{ message: '目前沒有認證考試資料' }}
      />

      <AdminModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        title={isEditing ? '編輯項目' : '新增項目'}
        onSubmit={handleFormSubmit}
        size="lg"
        submitDisabled={imageUploading}
        submitText={imageUploading ? '圖片上傳中...' : '送出'}
      >
        <div className="admin-form-grid">
        <div className="mb-3">
          <label className="form-label admin-form-label">*類別</label>
          {!isCustomCategory ? (
            <>
              <select
                className="form-select admin-form-control"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              >
                <option value="" disabled>請選擇類別</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 mt-1 text-secondary"
                onClick={() => { setIsCustomCategory(true); setNewCategory(''); }}
              >
                ＋ 新增自訂類別
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                className="form-control admin-form-control"
                placeholder="輸入新類別名稱，例如：推薦用書與教材"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-link btn-sm p-0 mt-1 text-secondary"
                onClick={() => { setIsCustomCategory(false); setNewCategory(availableCategories[0] || ''); }}
              >
                ← 回到選擇現有類別
              </button>
            </>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="newSubcategory" className="form-label admin-form-label">
            子類別
          </label>
          <input
            type="text"
            className="form-control admin-form-control"
            id="newSubcategory"
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            placeholder="例如：聽力、口語（選填）"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="newName" className="form-label admin-form-label">
            *名稱
          </label>
          <input
            type="text"
            className="form-control admin-form-control"
            id="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="newLink" className="form-label admin-form-label">
            *連結
          </label>
          <input
            type="url"
            className="form-control admin-form-control"
            id="newLink"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://example.com"
            required
          />
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
              <span className="upload-hint" style={{ fontSize: '13px' }}>※限 JPG、PNG 可上傳，限制 2MB。</span>
            </div>
          </div>
          {(imageName || imageUrl) && (
            <div className="d-flex align-items-center gap-2">
              <img src={imageUrl || '#'} alt="圖片預覽" style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain', borderRadius: '4px' }} />
              <div className="text-secondary text-truncate" style={{ maxWidth: '150px', fontSize: '13px' }} title={imageName || '圖片'}>
                {imageName || '圖片'}
              </div>
            </div>
          )}
        </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminExamInfo;
