import { useState, useEffect, useCallback, useMemo } from "react";
import { createColumnHelper } from '@tanstack/react-table';
import { useToast } from '../../../components/Toast';
import AdminDataTable from '../../../components/AdminDataTable';
import '../../../components/AdminDataTable/AdminDataTable.css';
import AdminModal from '../../../components/AdminModal';
import './adminMemberPage.css';
import deleteIcon from '../../../assets/adminPage/trash.svg';
import uturnIcon from '../../../assets/adminPage/uturn.svg';

const columnHelper = createColumnHelper();

// 超級管理員白名單（若後端提供 isSuperAdmin 欄位，亦會一起判斷）
const SUPER_ADMIN_WHITELIST = [
  'admin@example.com',
  'root@example.com'
];

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
  const [newOrganization, setNewOrganization] = useState('');
  const [newOccupation, setNewOccupation] = useState('');
  const [newMotivation, setNewMotivation] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [searchQuery, setSearchQuery] = useState('');

  // 判斷超級管理員：
  // 1) 從 localStorage 讀取 currentUser（若存在 isSuperAdmin=true，則為超管）
  // 2) 或 email 在白名單 SUPER_ADMIN_WHITELIST 中且角色為 admin
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  }, []);

  const isSuperAdmin = useMemo(() => {
    const email = currentUser?.email || '';
    const role = currentUser?.role || '';
    const flag = currentUser?.isSuperAdmin === true;
    return flag || (role === 'admin' && SUPER_ADMIN_WHITELIST.includes(email));
  }, [currentUser]);

  //（已移除獨立編輯入口）

  // 刪除/恢復按鈕點擊（停用/啟用）
  const handleDeleteClick = useCallback((itemId) => {
    // 管理員名單下僅允許超級管理員停用/啟用
    if (viewFilter === 'admins' && !isSuperAdmin) {
      showToast('僅超級管理員可停用/啟用管理員', 'warning');
      return;
    }

    const isRestoreAction = viewFilter === 'archivedMembers';

    const confirmMessage = isRestoreAction
      ? "確定要啟用此帳號嗎？"
      : "確定要停用此帳號嗎？";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setAllMembers(prevInfo => {
        const now = new Date();
        const archivedAt = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const updated = prevInfo.map(item => {
          if (item.id !== itemId) return item;
          if (isRestoreAction) {
            return { ...item, status: 'active', archivedReason: '', archivedAt: '' };
          }
          return { ...item, status: 'archived', archivedReason: item.archivedReason || '系統停用', archivedAt };
        });
        return updated;
      });

      const successMessage = isRestoreAction ? '帳號已成功啟用！' : '帳號已成功停用！';
      showToast(successMessage, 'success');
    } catch (error) {
      console.error(isRestoreAction ? "啟用失敗:" : "停用失敗:", error);
      showToast(`${isRestoreAction ? "啟用" : "停用"}失敗: ${error.message}`, 'error');
    }
  }, [viewFilter, isSuperAdmin, showToast]);

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
        columnHelper.accessor('organization', {
          header: '服務單位',
          cell: info => (<span className="text-truncate-cell">{info.getValue()}</span>),
          enableSorting: true,
          size: 180,
        }),
        columnHelper.accessor('occupation', {
          header: '職業',
          cell: info => (<span className="text-truncate-cell">{info.getValue()}</span>),
          enableSorting: true,
          size: 160,
        }),
        columnHelper.accessor('motivation', {
          header: '使用網站動機',
          cell: info => (<span className="text-truncate-cell">{info.getValue()}</span>),
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
      columnHelper.accessor('role', {
        header: '身份',
        cell: info => (info.getValue() === 'admin' ? '管理員' : '會員'),
        enableSorting: true,
        size: 120,
      }),
      columnHelper.accessor('email', {
        header: '信箱',
        cell: info => (<a href={`mailto:${info.getValue()}`}>{info.getValue()}</a>),
        enableSorting: true,
      }),
      columnHelper.accessor('organization', {
        header: '服務單位',
        cell: info => (<span className="text-truncate-cell">{info.getValue()}</span>),
        enableSorting: true,
        size: 180,
      }),
      columnHelper.accessor('occupation', {
        header: '職業',
        cell: info => (<span className="text-truncate-cell">{info.getValue()}</span>),
        enableSorting: true,
        size: 160,
      }),
      columnHelper.accessor('motivation', {
        header: '使用網站動機',
        cell: info => (<span className="text-truncate-cell">{info.getValue()}</span>),
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
          viewFilter === 'admins' && !isSuperAdmin ? (
            <button className="admin-action-btn" disabled title="僅超級管理員可操作">
              <img src={deleteIcon} alt="停用" className="admin-action-icon" />
            </button>
          ) : (
            <button className="admin-action-btn delete-btn" onClick={() => handleDeleteClick(row.original.id)}>
              <img src={deleteIcon} alt="停用" className="admin-action-icon" />
            </button>
          )
        ),
      }),
    ];
  }, [viewFilter, isSuperAdmin, handleDeleteClick]);

  // 拖曳結束處理（僅前端排序預覽）
  const handleDragEnd = useCallback((activeId, overId) => {
    if (!overId) return;
    setMemberList((items) => {
      const oldIndex = items.findIndex(item => item.id === activeId);
      const newIndex = items.findIndex(item => item.id === overId);
      if (oldIndex === -1 || newIndex === -1) return items;
      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      // 同步更新 allMembers 順序
      setAllMembers(prevAll => {
        const tempAll = [...prevAll];
        const activeItemInAll = tempAll.find(item => item.id === activeId);
        const overItemInAll = tempAll.find(item => item.id === overId);
        if (!activeItemInAll || !overItemInAll) return prevAll;
        const oldAllIndex = tempAll.indexOf(activeItemInAll);
        const newAllIndex = tempAll.indexOf(overItemInAll);
        const [removedAll] = tempAll.splice(oldAllIndex, 1);
        tempAll.splice(newAllIndex, 0, removedAll);
        return tempAll;
      });
      return newItems;
    });
  }, []);

  // 模擬載入會員資料
  const fetchMembers = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const mockData = [
          { id: 1, name: "陳小明", email: "a123456@gmail.com", organization: "台南一中", occupation: "台語兼任教師", motivation: "備課需求", role: "member", timestamp: "2025/04/01 23:55:00", status: "active" },
          { id: 2, name: "李小華", email: "hua@example.com", organization: "台北市教育局", occupation: "教研員", motivation: "教材製作", role: "admin", timestamp: "2024/03/14 14:20:00", status: "active" },
          { id: 3, name: "王超管", email: "admin@example.com", organization: "系統管理部", occupation: "系統管理員", motivation: "平台維護", role: "admin", timestamp: "2024/03/13 09:15:00", status: "active" },
          { id: 4, name: "林小美", email: "mei@example.com", organization: "高雄女中", occupation: "國文教師", motivation: "課程設計", role: "member", timestamp: "2024/03/12 16:45:00", status: "active" },
          { id: 5, name: "謝阿德", email: "de@example.com", organization: "台南市教育局", occupation: "行政人員", motivation: "專案管理", role: "member", timestamp: "2024/03/11 11:30:00", status: "archived", archivedReason: "系統停用", archivedAt: "2025/04/01 23:55:00" },
          { id: 6, name: "張阿杰", email: "jie@example.com", organization: "成大附中", occupation: "教師", motivation: "補充教材", role: "member", timestamp: "2024/03/10 15:20:00", status: "archived", archivedReason: "系統停用", archivedAt: "2025/04/01 23:55:00" },
        ];
        setAllMembers(mockData);
      } catch (error) {
        showToast(`載入會員資料失敗: ${error.message}`, 'error');
        setMemberList([]);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }, 800);
  }, [showToast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 根據狀態篩選資料
  useEffect(() => {
    if (allMembers.length > 0 || isLoading === false) {
      let filtered = [];
      if (viewFilter === 'admins') {
        filtered = allMembers.filter(item => item.role === 'admin' && item.status === 'active');
      } else if (viewFilter === 'members') {
        filtered = allMembers.filter(item => item.role !== 'admin' && item.status === 'active');
      } else if (viewFilter === 'archivedMembers') {
        filtered = allMembers.filter(item => item.role !== 'admin' && item.status === 'archived');
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
    setNewOrganization('');
    setNewOccupation('');
    setNewMotivation('');
    setNewRole('member');
  };

  // 送出表單
  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!newName || !newEmail || !newOrganization || !newOccupation || !newMotivation || !newRole) {
      showToast('請填寫所有欄位', 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      showToast('請輸入有效的 Email', 'warning');
      return;
    }

    // 僅超級管理員可新增或編輯為管理員角色
    if (newRole === 'admin' && !isSuperAdmin) {
      showToast('僅超級管理員可新增/編輯為管理員角色', 'warning');
      return;
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (isEditing && currentEditItem) {
      setAllMembers(prevInfo => prevInfo.map(item =>
        item.id === currentEditItem.id
          ? { ...item, name: newName, email: newEmail, organization: newOrganization, occupation: newOccupation, motivation: newMotivation, role: newRole }
          : item
      ));
      showToast('會員資料已成功更新！', 'success');
    } else {
      const newId = 'member-' + Date.now();
      const newItem = {
        id: newId,
        name: newName,
        email: newEmail,
        organization: newOrganization,
        occupation: newOccupation,
        motivation: newMotivation,
        role: newRole,
        timestamp,
        status: 'active',
      };
      setAllMembers(prevInfo => [newItem, ...prevInfo]);
      showToast('新會員已成功新增！', 'success');
    }
    handleModalClose();
  };

  const handleViewFilterChange = (event) => {
    setViewFilter(event.target.value);
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
            <select
              className="form-select admin-status-dropdown"
              value={viewFilter}
              onChange={handleViewFilterChange}
            >
              <option value="admins">管理員名單</option>
              <option value="members">會員名單</option>
              <option value="archivedMembers">停用會員名單</option>
            </select>
          </div>
        </div>
      </div>

      {/* 使用 AdminDataTable 組件 */}
      <AdminDataTable
        data={memberList}
        columns={columns}
        enableSorting={true}
        enableDragging={true}
        onDragEnd={handleDragEnd}
        isLoading={isLoading}
        error={error}
        onRetry={fetchMembers}
        emptyState={{ message: '目前沒有會員資料' }}
      />

      {/* 使用 AdminModal 組件 */}
      <AdminModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        title={isEditing ? '編輯會員' : '新增會員'}
        onSubmit={handleFormSubmit}
      >
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
          <label htmlFor="newOrganization" className="form-label admin-form-label">
            *服務單位
          </label>
          <input
            type="text"
            className="form-control admin-form-control"
            id="newOrganization"
            value={newOrganization}
            onChange={(e) => setNewOrganization(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newOccupation" className="form-label admin-form-label">
            *職業
          </label>
          <input
            type="text"
            className="form-control admin-form-control"
            id="newOccupation"
            value={newOccupation}
            onChange={(e) => setNewOccupation(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newMotivation" className="form-label admin-form-label">
            *使用網站動機
          </label>
          <input
            type="text"
            className="form-control admin-form-control"
            id="newMotivation"
            value={newMotivation}
            onChange={(e) => setNewMotivation(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newRole" className="form-label admin-form-label">
            *角色
          </label>
          <select
            className="form-select admin-form-control"
            id="newRole"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            required
          >
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminMemberPage;
