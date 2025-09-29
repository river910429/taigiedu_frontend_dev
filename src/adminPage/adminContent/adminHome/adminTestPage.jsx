import {useState , useEffect , useCallback , useMemo} from "react";
import PropTypes from 'prop-types';
import {useToast} from '../../../components/Toast';
import './adminTestPage.css';
import editIcon from '../../../assets/adminPage/pencil.svg'; 
import deleteIcon from '../../../assets/adminPage/trash.svg'; 
import addIcon from '../../../assets/adminPage/plus.svg'; 
import uturnIcon from '../../../assets/adminPage/uturn.svg'; // 反向箭頭圖示 

// 拖曳功能 ↓
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import dragIcon from '../../../assets/adminPage/bars-2.png';

const SortableTableRow = ({ item, handleEditClick, handleDeleteClick, statusFilter }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging, // 檢查是否正在拖曳
    } = useSortable({ id: item.id }); // item.id 必須是唯一的

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0, // 拖曳時提高 z-index
        opacity: isDragging ? 0.8 : 1, // 拖曳時降低透明度
        // pointerEvents: isDragging ? 'none' : 'auto', // 拖曳時禁用事件，避免與其他事件衝突
    };
    
    // 根據狀態決定使用的圖示和樣式
    const isArchived = statusFilter === 'archived';
    const actionIcon = isArchived ? uturnIcon : deleteIcon;
    const actionClass = isArchived ? "admin-action-btn restore-btn" : "admin-action-btn delete-btn";
    
    return (
        <tr ref={setNodeRef} style={style} className={isDragging ? 'dragging-row' : ''}>
            <td className="drag-handle-column">
                {/* 拖曳句柄圖示 */}
                <button className="drag-handle-btn" {...listeners} {...attributes}>
                <img src={dragIcon} alt="拖曳" className="drag-handle-icon" />
                </button>
            </td>
            <td>
                <button className="admin-action-btn edit-btn" onClick={() => handleEditClick(item)}>
                <img src={editIcon} alt="編輯" className="admin-action-icon"/>
                </button>
            </td>
            <td>{item.category}</td>
            <td>{item.content}</td>
            <td>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                {item.link}
                </a>
            </td>
            <td>
                <button className={actionClass} onClick={() => handleDeleteClick(item.id)}>
                <img src={actionIcon} alt={isArchived ? "恢復" : "刪除"} className="admin-action-icon"/>
                </button>
            </td>
            <td>{item.timestamp}</td>
        </tr>
    );
};

SortableTableRow.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        category: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired
    }).isRequired,
    handleEditClick: PropTypes.func.isRequired,
    handleDeleteClick: PropTypes.func.isRequired,
    statusFilter: PropTypes.string.isRequired
};

const AdminTestPage = () => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allTestInfo, setAllTestInfo] = useState([]); // 所有考試資訊資料
    const [testInfo, setTestInfo] = useState([]); // 顯示的考試資訊資料
    const [statusFilter, setStatusFilter] = useState('published'); // 狀態篩選
    const [activeId, setActiveId] = useState(null); // 目前拖曳的項目 ID

    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newLink, setNewLink] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);
    
    // 排序狀態
    const [sortField, setSortField] = useState(null); // 當前排序欄位
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' 或 'desc'

    // 拖曳功能 ⭣⭣⭣⭣⭣⭣⭣⭣⭣
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setTestInfo((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);

                // 使用陣列的重新排序邏輯
                const newItems = [...items];
                const [removed] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, removed);
                // 同步更新 allTestInfo 的順序
                setAllTestInfo(prevAllInfo => {
                    const tempAllInfo = [...prevAllInfo];
                    const activeItemInAll = tempAllInfo.find(item => item.id === active.id);
                    const overItemInAll = tempAllInfo.find(item => item.id === over.id);

                    if (!activeItemInAll || !overItemInAll) return prevAllInfo; // 確保找到項目

                    const oldAllIndex = tempAllInfo.indexOf(activeItemInAll);
                    const newAllIndex = tempAllInfo.indexOf(overItemInAll);

                    const [removedAll] = tempAllInfo.splice(oldAllIndex, 1);
                    tempAllInfo.splice(newAllIndex, 0, removedAll);
                    return tempAllInfo;
                });

                return newItems;
            });
        }
        setActiveId(null); // 清除拖曳中的 ID
    }, []);

    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
    }, []);

    // 找到正在拖曳的項目，用於 DragOverlay 顯示
    const activeItem = useMemo(
        () => testInfo.find((item) => item.id === activeId),
        [activeId, testInfo]
    );
    // 拖曳功能 ⭡⭡⭡⭡⭡⭡⭡⭡

    const fetchTestInfo = useCallback(() => {
        setIsLoading(true);
        setError(null);
        
        // 模擬 API 請求延遲
        setTimeout(() => {
            try {
                // 註解掉的 API 呼叫 - 之後恢復時使用
                /*
                const response = await fetch("https://dev.taigiedu.com/backend/info/test",{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                    // 嘗試不傳送 body 或傳送 null
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("考試資訊API回傳:", data);
                */

                // 固定的測試資料 - 保持與 API 相同的資料格式
                const mockData = [
                    {
                        id: 1,
                        category: "教育部",
                        title: "112年度台語能力認證考試",
                        url: "https://example.com/test1",
                        timestamp: "2024/03/15 10:30:00",
                        status: "published"
                    },
                    {
                        id: 2,
                        category: "成大",
                        title: "台語文學測驗報名開始",
                        url: "https://example.com/test2",
                        timestamp: "2024/03/14 14:20:00",
                        status: "published"
                    },
                    {
                        id: 3,
                        category: "教育部",
                        title: "台語教學師資培訓課程",
                        url: "https://example.com/test3",
                        timestamp: "2024/03/13 09:15:00",
                        status: "published"
                    },
                    {
                        id: 4,
                        category: "成大",
                        title: "台語語音學研習營",
                        url: "https://example.com/test4",
                        timestamp: "2024/03/12 16:45:00",
                        status: "published"
                    },
                    {
                        id: 5,
                        category: "教育部",
                        title: "已刪除的測試公告1",
                        url: "https://example.com/deleted1",
                        timestamp: "2024/03/11 11:30:00",
                        status: "archived"
                    },
                    {
                        id: 6,
                        category: "成大",
                        title: "已刪除的測試公告2",
                        url: "https://example.com/deleted2",
                        timestamp: "2024/03/10 15:20:00",
                        status: "archived"
                    }
                ];

                console.log("使用模擬資料:", mockData);

                if (Array.isArray(mockData)) {
                    const formattedData = mockData.map(item => ({
                        id: item.id,
                        category: item.category,
                        content: item.title,
                        link: item.url,
                        timestamp: item.timestamp || 'N/A',
                        status: item.status || 'published'
                    }));
                    setAllTestInfo(formattedData);
                } else {
                    console.error("模擬資料格式錯誤:", mockData);
                    setTestInfo([]);
                    setError("考試資訊載入失敗，請稍後再試。");
                }
            } catch (error) {
                showToast(`載入考試資訊失敗: ${error.message}`, 'error');
                setTestInfo([]);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }, 1000); // 模擬 1 秒的載入時間
    }, [showToast]);

    useEffect(() => {
        fetchTestInfo();
    }, [fetchTestInfo]);

    useEffect(() => {
        if(allTestInfo.length > 0 || isLoading === false) {
            let filteredData = allTestInfo.filter(item => item.status === statusFilter);
            
            // 如果有排序設定，則進行排序
            if (sortField) {
                filteredData.sort((a, b) => {
                    let aValue = a[sortField];
                    let bValue = b[sortField];
                    
                    // 處理時間欄位的排序
                    if (sortField === 'timestamp') {
                        aValue = new Date(aValue);
                        bValue = new Date(bValue);
                    }
                    
                    // 字串比較
                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        aValue = aValue.toLowerCase();
                        bValue = bValue.toLowerCase();
                    }
                    
                    if (aValue < bValue) {
                        return sortDirection === 'asc' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortDirection === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
            }
            
            setTestInfo(filteredData);
        }
    }, [allTestInfo, statusFilter, isLoading, sortField, sortDirection]);

    // 處理排序點擊
    const handleSort = (field) => {
        if (sortField === field) {
            // 如果點擊的是同一個欄位，切換排序方向
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // 如果是新欄位，設為升序
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // 新增功能 ⭣⭣⭣⭣⭣⭣⭣⭣⭣
    const handleAddClick = () => {
        if (testInfo.length >= 12 && statusFilter === 'published') {
            showToast('目前公告數量已滿12個項目，請先到目前公告刪除一個公告再進行上傳。', 'warning');
            return;
        }
        setShowAddModal(true);
    }

    const handleEditClick = (item) => {
        setIsEditing(true);
        setCurrentEditItem(item);
        setNewCategory(item.category);
        setNewContent(item.content);
        setNewLink(item.link);
        setShowAddModal(true);
    }

    const handleModalClose = () => {
        setShowAddModal(false);
        setNewCategory('');
        setNewContent('');
        setNewLink('');
    }

    const handleFormSubmit  = (event) => {
        event.preventDefault();
        if (!newCategory || !newContent || !newLink) {
            showToast('請填寫所有欄位', 'warning');
            return;
        }
        try {
            new URL(newLink);
        } catch {
            showToast('請輸入有效的 URL', 'warning');
            return;
        }
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;

        if(isEditing && currentEditItem) {
            setAllTestInfo(prevInfo => prevInfo.map(item =>
                item.id === currentEditItem.id ? { ...item, category: newCategory, content: newContent, link: newLink } : item
            ));
        } else {
            const newId = 'new-' + Date.now(); // 使用時間戳作為臨時 ID
            const newItem = {
                id: newId,
                category: newCategory,
                content: newContent,
                link: newLink,
                timestamp: timestamp,
                status: 'published'
            };
            setAllTestInfo(prevInfo => [newItem, ...prevInfo]); // 將新項目加到列表最前面
            showToast('新公告已成功新增！', 'success');
        }
        handleModalClose(); // 關閉 Modal
    }
    // 新增/編輯功能 ⭡⭡⭡⭡⭡⭡⭡⭡
    

    
    const handleDeleteClick = (itemId) => {
        // 根據當前狀態篩選器決定是刪除還是恢復操作
        const isRestoreAction = statusFilter === 'archived';
        
        const confirmMessage = isRestoreAction 
            ? "確定要復原此筆已刪除的公告嗎？"
            : "確定要刪除此筆目前公告嗎？";
            
        if(!window.confirm(confirmMessage)) {
            return;
        }
        
        try {
            setAllTestInfo(prevInfo => {
                const updatedInfo = prevInfo.map(item =>
                    item.id === itemId 
                        ? { ...item, status: isRestoreAction ? 'published' : 'archived' } 
                        : item
                );
                return updatedInfo;
            });
            
            const successMessage = isRestoreAction 
                ? '公告已成功復原！'
                : '目前公告已成功刪除！';
                
            showToast(successMessage, 'success');
        } catch (error) {
            console.error(isRestoreAction ? "復原失敗:" : "刪除失敗:", error);
            showToast(`${isRestoreAction ? "復原" : "刪除"}失敗: ${error.message}`, 'error');
        }
    }

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };
    return (
        <div className="admin-test-page p-4">
            <div className="admin-header-main">
                <h5 className="mb-3 text-secondary">首頁搜尋 &gt; 考試資訊 &gt; <span>{statusFilter === 'published' ? "目前公告" : "刪除記錄"}</span></h5>
                <div className="admin-controls-row">
                    <button className="btn btn-primary me-3 admin-add-button" onClick={handleAddClick}>
                        <img src={addIcon} alt="新增項目"/>
                        新增項目
                    </button>
                    <div className="status-filter">
                        <span className="me-2 text-secondary">目前狀態：</span>
                        <select 
                            className="form-select admin-status-dropdown"
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                        >
                            <option value="published">目前公告</option>
                            <option value="archived">刪除紀錄</option>
                        </select>
                    </div>
                </div>
            </div>
            {isLoading ? (
                <div className="test-loading">
                    <div className="loading-spinner"></div>
                    <p>載入中...</p>
                </div>
            ) : error ? (
                <div className="test-loading">
                    <p>載入失敗，請重新整理頁面</p>
                    <button onClick={fetchTestInfo} className="btn btn-primary mt-2">
                        重新載入
                    </button>
                </div>
            ) : testInfo.length === 0 ? (
                <div className="no-data-message-container text-center py-5">
                    <p>目前沒有公告資料</p>
                </div>
            ) : (
                <div className="admin-table-responsive">
                    <DndContext // 包裹整個可拖曳區域
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                    >
                        <table className="table admin-data-table">
                            <thead>
                                <tr>
                                    <th style={{width: '40px'}}></th>
                                    <th style={{width: '50px'}}></th>
                                    <th className="admin-table-header" onClick={() => handleSort('category')} style={{cursor: 'pointer'}}> 
                                        類別 
                                        <span className="sort-arrow">
                                            {sortField === 'category' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                                        </span>
                                    </th>
                                    <th className="admin-table-header" onClick={() => handleSort('content')} style={{cursor: 'pointer'}}> 
                                        內容 (限20字) 
                                        <span className="sort-arrow">
                                            {sortField === 'content' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                                        </span>
                                    </th>
                                    <th className="admin-table-header" onClick={() => handleSort('link')} style={{cursor: 'pointer'}}> 
                                        連結 
                                        <span className="sort-arrow">
                                            {sortField === 'link' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                                        </span>
                                    </th>
                                    <th style={{width: '50px'}}></th>
                                    <th className="admin-table-header" onClick={() => handleSort('timestamp')} style={{cursor: 'pointer'}}> 
                                        建立時間 
                                        <span className="sort-arrow">
                                            {sortField === 'timestamp' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <SortableContext // 提供排序上下文
                                items={testInfo.map(item => item.id)} // 傳入所有可排序的 ID
                                strategy={verticalListSortingStrategy}
                            >
                                <tbody>
                                    {testInfo.map((item) => (
                                        <SortableTableRow // 使用新的可拖曳行組件
                                            key={item.id}
                                            item={item}
                                            handleEditClick={handleEditClick}
                                            handleDeleteClick={handleDeleteClick}
                                            statusFilter={statusFilter}
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </table>
                            <DragOverlay>
                                {activeItem ? (
                                    <table className="table admin-data-table drag-overlay-table">
                                        <tbody>
                                            <tr className="dragging-overlay-row">
                                                <td className="drag-handle-column">
                                                <img src={dragIcon} alt="拖曳" className="drag-handle-icon" />
                                                </td>       
                                                <td>
                                                    <button className="btn btn-sm btn-outline-secondary admin-action-btn" onClick={() => handleEditClick(activeItem)}>
                                                        <img src={editIcon} alt="編輯" className="admin-action-icon"/>
                                                    </button>
                                                </td>
                                                <td>{activeItem.category}</td>
                                                <td>{activeItem.content}</td>
                                                <td>
                                                    <a href={activeItem.link} target="_blank" rel="noopener noreferrer">
                                                        {activeItem.link}
                                                    </a>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-danger admin-action-btn" onClick={() => handleDeleteClick(activeItem.id)}>
                                                        <img src={deleteIcon} alt="刪除" className="admin-action-icon"/>
                                                    </button>
                                                </td>
                                                <td>{activeItem.timestamp}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : null}
                            </DragOverlay>
                    </DndContext>
                </div>
            )}
            
            <div className={`modal fade ${showAddModal ? 'show' : ''}`} style={{ display: showAddModal ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="addModalLabel" aria-hidden={!showAddModal}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content admin-modal-content">
                        <div className="modal-header admin-modal-header">
                            <h5 className="modal-title" id="addModalLabel">{isEditing ? '編輯項目' : '新增項目'}</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={handleModalClose}></button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="modal-body admin-modal-body">
                                <div className="mb-3">
                                    <label htmlFor="newCategory" className="form-label admin-form-label">*類別</label>
                                    <select
                                        className="form-select admin-form-control"
                                        id="newCategory"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>請選擇類別</option>
                                        <option value="教育部">教育部</option>
                                        <option value="成大">成大</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="newContent" className="form-label admin-form-label">*內容 (限20字)</label>
                                    <input
                                        type="text"
                                        className="form-control admin-form-control"
                                        id="newContent"
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        // maxLength="20"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="newLink" className="form-label admin-form-label">*連結</label>
                                    <input
                                        type="url" // 使用 url 類型可以提供一些基本的 URL 格式驗證
                                        className="form-control admin-form-control"
                                        id="newLink"
                                        value={newLink}
                                        onChange={(e) => setNewLink(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer admin-modal-footer">
                                <button type="button" className="btn btn-secondary admin-btn-cancel" onClick={handleModalClose}>取消</button>
                                <button type="submit" className="btn btn-primary admin-btn-submit">送出</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Modal Backdrop (背景遮罩) */}
            {showAddModal && <div className="modal-backdrop fade show"></div>}
        </div>
    )
}

export default AdminTestPage;