import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from '../../../contexts/AuthContext';
import { createPortal } from 'react-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { useToast } from '../../../components/Toast';
import { authenticatedFetch } from '../../../services/authService';
import { updateMemberFlags, updateMemberStatus } from '../../../services/memberService';
import { FLAG_OPTIONS, flagsToRoleLabel, getUserFlags } from '../../../config/permissions';
import AdminDataTable from '../../../components/AdminDataTable';
import '../../../components/AdminDataTable/AdminDataTable.css';
import AdminModal from '../../../components/AdminModal';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';
import './adminMemberPage.css';
import envConfig from '../../../config';
import adjustmentsIcon from '../../../assets/adjustments-horizontal.svg';
import uturnIcon from '../../../assets/adminPage/uturn.svg';

const columnHelper = createColumnHelper();

/**
 * 帳號是否為「停用」狀態
 *
 * 後端目前回傳的是「被停用」（role: SUSPENDED），
 * 這裡一併相容舊的「停用／已停用」字串，避免改字就漏掉。
 */
const SUSPENDED_STATUSES = ['被停用', '停用', '已停用'];
const isSuspendedStatus = (member) =>
  member?.role === 'SUSPENDED' || SUSPENDED_STATUSES.includes(member?.status);

/**
 * 解析並格式化「使用網站動機」欄位
 * API 回傳格式可能是：
 * - JSON 陣列：[{"type": "編課"}, {"type": "自學"}, {"type": "其他", "custom": "測試"}]
 * - JSON 字串："[{\"type\": \"編課\"}]"
 * - 純文字："編課、自學"
 * @param {any} reason - 原始 reason 資料
 * @returns {string} 格式化後的文字
 */
const formatReasonDisplay = (reason) => {
  if (!reason) return '';

  // 如果已經是字串，嘗試解析 JSON
  let reasonArray = reason;
  if (typeof reason === 'string') {
    try {
      reasonArray = JSON.parse(reason);
    } catch {
      // 如果解析失敗，直接回傳原始字串
      return reason;
    }
  }

  // 如果不是陣列，直接轉換為字串
  if (!Array.isArray(reasonArray)) {
    return String(reason);
  }

  // 解析陣列並格式化
  const formatted = reasonArray.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      const type = item.type || '';
      const custom = item.custom || '';
      // 如果是「其他」且有自訂內容，顯示為「其他：XXX」
      if (type === '其他' && custom) {
        return `${type}：${custom}`;
      }
      return type;
    }
    return '';
  }).filter(Boolean);

  return formatted.join('、');
};

/**
 * 操作欄位組件 - 解決 Hooks 順序問題
 */
const ActionCell = ({
  row,
  viewFilter,
  canManageMembers,
  canManageAdmins,
  handleDeleteClick,
  handleDisableUpload,
  handleAssignAdmin,
  activeMenuId,
  setActiveMenuId,
  menuPosition,
  setMenuPosition,
  adjustmentsIcon,
  uturnIcon
}) => {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 160;

      // Calculate left position, ensuring menu doesn't go off-screen
      let left = rect.right - menuWidth;

      // If menu would go off the left edge, align it to the left of the button
      if (left < 0) {
        left = rect.left;
      }

      // If menu would go off the right edge, adjust it
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10; // 10px margin from edge
      }

      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: left + window.scrollX
      });
    }
    setActiveMenuId(activeMenuId === row.original.id ? null : row.original.id);
  };

  // 停用會員名單：顯示恢復按鈕（需內容管理員權限）
  if (viewFilter === 'archivedMembers') {
    return (
      <div className="action-menu-container">
        <button
          className="admin-action-btn restore-btn"
          disabled={!canManageMembers}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row.original.id);
          }}
          title={canManageMembers ? '恢復上傳資格' : '僅內容管理員可操作'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    );
  }

  // 會員名單與管理員名單：顯示下拉選單
  // 管理員名單只處理身分調整，因此需要系統管理員權限；會員名單只要有其中一種權限即可開啟
  const hasAnyAction = viewFilter === 'admins'
    ? canManageAdmins
    : (canManageMembers || canManageAdmins);

  return (
    <div className="action-menu-container">
      {!hasAnyAction ? (
        <button
          className="admin-action-btn menu-btn"
          disabled
          title={viewFilter === 'admins' ? '僅系統管理員可調整管理員身分' : '您沒有管理會員的權限'}
        >
          <img src={adjustmentsIcon} alt="管理" className="admin-action-icon" style={{ opacity: 0.5 }} />
        </button>
      ) : (
        <>
          <button
            ref={buttonRef}
            className="admin-action-btn menu-btn"
            onClick={handleClick}
          >
            <img src={adjustmentsIcon} alt="管理" className="admin-action-icon" />
          </button>

          {activeMenuId === row.original.id && createPortal(
            <div
              className="action-menu-dropdown"
              style={{
                position: 'absolute',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                zIndex: 9999
              }}
            >
              {canManageMembers && (
                <button
                  className="action-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisableUpload(row.original);
                  }}
                >
                  停用上傳資格
                </button>
              )}
              {canManageAdmins && (
                <button
                  className="action-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignAdmin(row.original);
                  }}
                >
                  設定管理員身分
                </button>
              )}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
};

const AdminMemberPage = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [memberList, setMemberList] = useState([]);
  // 視圖切換：admins（管理員名單）| members（會員名單）| archivedMembers（停用會員名單）
  const [viewFilter, setViewFilter] = useState('members');

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // 停用上傳資格彈窗狀態
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableTarget, setDisableTarget] = useState(null);
  const [disableReason, setDisableReason] = useState('');
  const [disableNote, setDisableNote] = useState('');

  // 設定管理員身分彈窗狀態
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTarget, setAdminTarget] = useState(null);
  const [selectedFlags, setSelectedFlags] = useState(0);
  const [isSubmittingFlags, setIsSubmittingFlags] = useState(false);

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 檢查是否點擊在選單容器或下拉選單內
      const isInsideContainer = event.target.closest('.action-menu-container');
      const isInsideDropdown = event.target.closest('.action-menu-dropdown');

      if (activeMenuId && !isInsideContainer && !isInsideDropdown) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const { isSuperAdmin: checkIsSystemManager, isContentManager: checkIsContentManager } = useAuth();
  // 指派／解除管理員身分：SYSTEM_MANAGER
  const canManageAdmins = checkIsSystemManager();
  // 停用／恢復會員上傳資格：CONTENT_MANAGER
  const canManageMembers = checkIsContentManager();

  // API base URL
  const apiBaseUrl = envConfig.apiUrl;

  // 載入會員資料
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`${apiBaseUrl}/admin/member/list`, {
        method: 'GET',
      });
      const result = await response.json();

      if (response.ok && result.success) {
        // 將 API 資料映射到前端格式
        const members = (result.members || []).map(member => ({
          ...member,
          // 確保 id 是數字或字串
          id: member.id,
          // 保留 API 原始欄位名稱
          name: member.name,
          email: member.email,
          dept: member.dept || '',
          reason: member.reason || '',
          timestamp: member.timestamp || '',
          status: member.status || '會員',
          // 權限 flags：目前 /admin/member/list 尚未回傳 flags，
          // 由 role 字串推導（SUPER_ADMIN→3、ADMIN→1、其餘→0）。
          // 後端補上 flags 後 getUserFlags 會自動優先採用真值。
          flags: getUserFlags(member),
          // 帳號是否被停用（API 目前回「被停用」，另相容舊字串）
          isSuspended: isSuspendedStatus(member),
        }));
        setAllMembers(members);
      } else {
        throw new Error(result.message || '載入會員資料失敗');
      }
    } catch (error) {
      console.error('載入會員資料錯誤:', error);
      showToast(`載入會員資料失敗: ${error.message}`, 'error');
      setMemberList([]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [showToast, apiBaseUrl]);

  //（已移除獨立編輯入口）

  // 刪除/恢復按鈕點擊（停用/啟用）
  const handleDeleteClick = useCallback(async (itemId) => {
    // 停用/啟用會員屬於「管理會員」，需要內容管理員權限
    if (!canManageMembers) {
      showToast('僅內容管理員可停用/啟用會員', 'warning');
      return;
    }

    const isRestoreAction = viewFilter === 'archivedMembers';
    const action = isRestoreAction ? '恢復會員' : '停用會員';

    try {
      const result = await updateMemberStatus({
        id: itemId,
        action,
        reason: isRestoreAction ? '管理員恢復' : '系統停用',
      });

      showToast(result.message || (isRestoreAction ? '帳號已成功啟用！' : '帳號已成功停用！'), 'success');
      // 重新載入會員列表以確保資料同步
      fetchMembers();
    } catch (error) {
      console.error(isRestoreAction ? "啟用失敗:" : "停用失敗:", error);
      showToast(`${isRestoreAction ? "啟用" : "停用"}失敗: ${error.message}`, 'error');
    }
  }, [viewFilter, canManageMembers, showToast, fetchMembers]);

  // 停用上傳資格
  const handleDisableUpload = useCallback((member) => {
    // 開啟停用彈窗
    setDisableTarget(member);
    setDisableReason('');
    setDisableNote('');
    setShowDisableModal(true);
    setActiveMenuId(null);
  }, []);

  // 確認停用上傳資格
  const confirmDisableUpload = useCallback(async () => {
    if (!disableReason) {
      showToast('請選擇停用理由', 'warning');
      return;
    }

    const fullReason = disableNote ? `${disableReason}（${disableNote}）` : disableReason;

    try {
      const result = await updateMemberStatus({
        id: disableTarget.id,
        action: '停用會員',
        reason: fullReason,
        detail: disableNote || '',
      });

      showToast(result.message || `已停用 ${disableTarget.name} 的上傳資格`, 'success');
      setShowDisableModal(false);
      setDisableTarget(null);
      // 重新載入會員列表以確保資料同步
      fetchMembers();
    } catch (error) {
      console.error('停用會員失敗:', error);
      console.error('停用會員請求參數:', { id: disableTarget?.id, action: '停用會員', reason: fullReason });
      showToast(`停用失敗: ${error.message}`, 'error');
    }
  }, [disableTarget, disableReason, disableNote, showToast, fetchMembers]);

  const handleAdminModalClose = useCallback(() => {
    setShowAdminModal(false);
    setAdminTarget(null);
  }, []);

  // 設定管理員身分
  const handleAssignAdmin = useCallback((member) => {
    // 開啟身分設定彈窗，預設帶入目前的 flags
    setAdminTarget(member);
    setSelectedFlags(member.flags ?? 0);
    setShowAdminModal(true);
    setActiveMenuId(null);
  }, []);

  // 確認設定管理員身分（POST /admin/member/flags，需 SYSTEM_MANAGER）
  const confirmAssignAdmin = useCallback(async () => {
    if (!canManageAdmins) {
      showToast('僅系統管理員可設定管理員身分', 'warning');
      return;
    }
    if (!adminTarget) return;

    const currentFlags = adminTarget.flags ?? 0;
    if (selectedFlags === currentFlags) {
      showToast('身分未變更', 'warning');
      return;
    }

    setIsSubmittingFlags(true);
    try {
      const result = await updateMemberFlags(adminTarget.id, selectedFlags);

      showToast(
        result.message || `已將 ${adminTarget.name} 設定為${flagsToRoleLabel(selectedFlags)}`,
        'success'
      );
      setShowAdminModal(false);
      setAdminTarget(null);
      // 重新載入會員列表以確保資料同步
      fetchMembers();
    } catch (error) {
      console.error('設定管理員身分失敗:', error);
      showToast(`設定管理員身分失敗: ${error.message}`, 'error');
    } finally {
      setIsSubmittingFlags(false);
    }
  }, [adminTarget, selectedFlags, canManageAdmins, showToast, fetchMembers]);

  // 欄位定義
  const columns = useMemo(() => {
    const isArchivedView = viewFilter === 'archivedMembers';
    if (isArchivedView) {
      // 停用會員名單欄位
      return [
        columnHelper.accessor('name', {
          header: '名稱',
          cell: info => info.getValue(),
          enableSorting: true,
        }),
        columnHelper.accessor('archivedReason', {
          header: '停用理由',
          cell: info => (<span className="text-truncate-cell">{info.getValue() || ''}</span>),
          enableSorting: true,
          size: 180,
        }),
        columnHelper.accessor('email', {
          header: '信箱',
          cell: info => (<a href={`mailto:${info.getValue()}`}>{info.getValue()}</a>),
          enableSorting: true,
        }),
        columnHelper.accessor('dept', {
          header: '服務單位',
          cell: info => (<span className="text-truncate-cell">{info.getValue()}</span>),
          enableSorting: true,
          size: 180,
        }),
        columnHelper.accessor('reason', {
          header: '使用網站動機',
          cell: info => (<span className="text-truncate-cell">{formatReasonDisplay(info.getValue())}</span>),
          enableSorting: true,
          size: 220,
        }),
        columnHelper.accessor('archivedAt', {
          header: '停用時間',
          cell: info => info.getValue() || '',
          enableSorting: true,
          sortingFn: (rowA, rowB) => {
            const dateA = new Date(rowA.original.archivedAt || 0);
            const dateB = new Date(rowB.original.archivedAt || 0);
            return dateA.getTime() - dateB.getTime();
          },
        }),
        columnHelper.display({
          id: 'actions',
          size: 50,
          enableSorting: false,
          header: () => null,
          cell: ({ row }) => (
            <button className="admin-action-btn restore-btn" onClick={() => handleDeleteClick(row.original.id)}>
              <img src={uturnIcon} alt="啟用" className="admin-action-icon" />
            </button>
          ),
        }),
      ];
    }

    // 其他視圖欄位（管理員名單、會員名單）
    return [
      columnHelper.accessor('name', {
        header: '名稱',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor('flags', {
        header: '身份',
        cell: info => flagsToRoleLabel(info.getValue() ?? 0),
        enableSorting: true,
        size: 120,
      }),
      columnHelper.accessor('email', {
        header: '信箱',
        cell: info => (<a href={`mailto:${info.getValue()}`}>{info.getValue()}</a>),
        enableSorting: true,
      }),
      columnHelper.accessor('dept', {
        header: '服務單位',
        cell: info => (<span className="text-truncate-cell">{info.getValue()}</span>),
        enableSorting: true,
        size: 180,
      }),
      columnHelper.accessor('reason', {
        header: '使用網站動機',
        cell: info => (<span className="text-truncate-cell">{formatReasonDisplay(info.getValue())}</span>),
        enableSorting: true,
        size: 220,
      }),
      columnHelper.accessor('timestamp', {
        header: '建立時間',
        cell: info => info.getValue(),
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.timestamp);
          const dateB = new Date(rowB.original.timestamp);
          return dateA.getTime() - dateB.getTime();
        },
      }),
      columnHelper.display({
        id: 'actions',
        size: 50,
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <ActionCell
            row={row}
            viewFilter={viewFilter}
            canManageMembers={canManageMembers}
            canManageAdmins={canManageAdmins}
            handleDeleteClick={handleDeleteClick}
            handleDisableUpload={handleDisableUpload}
            handleAssignAdmin={handleAssignAdmin}
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
            menuPosition={menuPosition}
            setMenuPosition={setMenuPosition}
            adjustmentsIcon={adjustmentsIcon}
            uturnIcon={uturnIcon}
          />
        ),
      }),
    ];
  }, [viewFilter, canManageMembers, canManageAdmins, handleDeleteClick, activeMenuId, handleDisableUpload, handleAssignAdmin]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 根據狀態篩選資料（使用 API 回傳的 status 字串）
  useEffect(() => {
    if (allMembers.length > 0 || isLoading === false) {
      let filtered = [];
      if (viewFilter === 'admins') {
        // 管理員名單：有任何後台權限（含系統管理員、超級管理員）
        filtered = allMembers.filter(item => !item.isSuspended && item.flags > 0);
      } else if (viewFilter === 'members') {
        // 會員名單：無後台權限
        filtered = allMembers.filter(item => !item.isSuspended && item.flags === 0);
      } else if (viewFilter === 'archivedMembers') {
        // 停用會員名單
        filtered = allMembers.filter(item => item.isSuspended);
      }

      // 文字搜尋過濾：僅姓名
      if (searchQuery && searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(item =>
          (item.name || '').toLowerCase().includes(q)
        );
      }
      setMemberList(filtered);
    }
  }, [allMembers, viewFilter, isLoading, searchQuery]);

  //（移除新增會員按鈕，保留原有編輯流程所需的狀態與函式）

  // Modal 關閉
  const handleModalClose = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setCurrentEditItem(null);
    setNewName('');
    setNewEmail('');
    setNewDept('');
    setNewReason('');
    setNewRole('member');
  };

  // 送出表單
  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!newName || !newEmail || !newDept || !newReason || !newRole) {
      showToast('請填寫所有欄位', 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      showToast('請輸入有效的 Email', 'warning');
      return;
    }

    // 僅系統管理員可新增或編輯為管理員角色
    if (newRole === 'admin' && !canManageAdmins) {
      showToast('僅系統管理員可新增/編輯為管理員角色', 'warning');
      return;
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (isEditing && currentEditItem) {
      setAllMembers(prevInfo => prevInfo.map(item =>
        item.id === currentEditItem.id
          ? { ...item, name: newName, email: newEmail, dept: newDept, reason: newReason, role: newRole }
          : item
      ));
      showToast('會員資料已成功更新！', 'success');
    } else {
      const newId = 'member-' + Date.now();
      const newItem = {
        id: newId,
        name: newName,
        email: newEmail,
        dept: newDept,
        reason: newReason,
        role: newRole,
        timestamp,
        status: '會員',
      };
      setAllMembers(prevInfo => [newItem, ...prevInfo]);
      showToast('新會員已成功新增！', 'success');
    }
    handleModalClose();
  };

  const handleViewFilterChange = (value) => {
    setViewFilter(value);
  };

  return (
    <div className="admin-member-page">
      <div className="admin-header-main">
        <h5 className="mb-3 text-secondary">
          首頁搜尋 &gt; 會員管理 &gt;
          <span>{viewFilter === 'admins' ? '管理員名單' : viewFilter === 'members' ? '會員名單' : '停用會員名單'}</span>
        </h5>
        <div className="admin-controls-row">
          <input
            type="text"
            className="form-control admin-search-input"
            placeholder="搜尋姓名"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* 已移除「新增會員」按鈕 */}
          <div className="status-filter">
            <span className="text-secondary">目前狀態：</span>
            <CustomSelect
              size="sm"
              className="cs-w-md"
              options={[
                { value: 'admins', label: '管理員名單' },
                { value: 'members', label: '會員名單' },
                { value: 'archivedMembers', label: '停用會員名單' },
              ]}
              value={viewFilter}
              onChange={handleViewFilterChange}
            />
          </div>
        </div>
      </div>

      {/* 使用 AdminDataTable 組件 */}
      <AdminDataTable
        data={memberList}
        columns={columns}
        enableSorting={true}
        enableDragging={false}
        isLoading={isLoading}
        error={error}
        onRetry={fetchMembers}
        emptyState={{ message: '目前沒有會員資料' }}
        enablePagination={true}
        pageSize={20}
      />

      {/* 使用 AdminModal 組件 */}
      <AdminModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        title={isEditing ? '編輯會員' : '新增會員'}
        onSubmit={handleFormSubmit}
        size="lg"
      >
        <div className="admin-form-grid">
        <div className="mb-3">
          <label htmlFor="newName" className="form-label admin-form-label">
            *姓名
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
          <label htmlFor="newEmail" className="form-label admin-form-label">
            *Email
          </label>
          <input
            type="email"
            className="form-control admin-form-control"
            id="newEmail"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newDept" className="form-label admin-form-label">
            *服務單位
          </label>
          <input
            type="text"
            className="form-control admin-form-control"
            id="newDept"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newReason" className="form-label admin-form-label">
            *使用網站動機
          </label>
          <input
            type="text"
            className="form-control admin-form-control"
            id="newReason"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 admin-form-grid-full">
          <label htmlFor="newRole" className="form-label admin-form-label">
            *角色
          </label>
          <CustomSelect
            size="sm"
            id="newRole"
            options={['member', 'admin']}
            value={newRole}
            onChange={setNewRole}
          />
        </div>
        </div>
      </AdminModal>

      {/* 停用上傳資格彈窗 */}
      {showDisableModal && (
        <div className="disable-modal-overlay" onClick={() => setShowDisableModal(false)}>
          <div className="disable-modal" onClick={(e) => e.stopPropagation()}>
            <div className="disable-modal-header">
              <h3>停用會員上傳資格</h3>
              <button
                className="disable-modal-close"
                onClick={() => setShowDisableModal(false)}
              >
                ×
              </button>
            </div>
            <div className="disable-modal-body">
              <div className="disable-modal-left">
                <label className="disable-form-label">*停用理由：</label>
                <div className="disable-radio-group">
                  {[
                    '散佈不雅內容',
                    '冒用他人身份',
                    '違規張貼內容',
                    '攻擊講師或平台',
                    '依舉報結果而定',
                    '帳號交易或共享',
                    '其他（請寫在補充說明）'
                  ].map((reason) => (
                    <label key={reason} className="disable-radio-label">
                      <input
                        type="radio"
                        name="disableReason"
                        value={reason}
                        checked={disableReason === reason}
                        onChange={(e) => setDisableReason(e.target.value)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="disable-modal-right">
                <label className="disable-form-label">補充說明（非必填）：</label>
                <textarea
                  className="disable-textarea"
                  value={disableNote}
                  onChange={(e) => setDisableNote(e.target.value)}
                  placeholder=""
                />
              </div>
            </div>
            <div className="disable-modal-footer">
              <button
                className="disable-confirm-btn"
                onClick={confirmDisableUpload}
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 設定管理員身分彈窗（沿用共用的 AdminModal，樣式與其他後台彈窗一致） */}
      <AdminModal
        isOpen={showAdminModal && !!adminTarget}
        onClose={handleAdminModalClose}
        title="設定管理員身分"
        onSubmit={confirmAssignAdmin}
        submitText={isSubmittingFlags ? '設定中…' : '確定'}
        submitDisabled={isSubmittingFlags}
        size="md"
      >
        {adminTarget && (
          <>
            <p className="admin-confirm-text">
              *請選擇要指派給此人員的身分
            </p>
            <p className="admin-permission-note">
              （目前身分：{flagsToRoleLabel(adminTarget.flags ?? 0)}；設定為「會員」即解除全部後台權限）
            </p>

            <div className="admin-flags-group">
              {FLAG_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`admin-flags-option ${selectedFlags === option.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="memberFlags"
                    value={option.value}
                    checked={selectedFlags === option.value}
                    onChange={() => setSelectedFlags(option.value)}
                  />
                  <span className="admin-flags-option-text">
                    <span className="admin-flags-option-label">{option.label}</span>
                    <span className="admin-flags-option-desc">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="admin-member-info">
              <p><span>姓名：</span>{adminTarget.name}</p>
              <p><span>信箱：</span>{adminTarget.email}</p>
              <p><span>服務單位：</span>{adminTarget.dept}</p>
              <p><span>使用網站動機：</span>{formatReasonDisplay(adminTarget.reason)}</p>
            </div>
          </>
        )}
      </AdminModal>
    </div>
  );
};

export default AdminMemberPage;
