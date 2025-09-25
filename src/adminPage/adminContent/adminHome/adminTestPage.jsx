import React , {useState , useEffect , useCallback , useMemo , useRef} from "react";
import {useToast} from '../../../components/Toast';
import './adminTestPage.css';
import editIcon from '../../../assets/adminPage/pencil.svg'; 
import deleteIcon from '../../../assets/adminPage/trash.svg'; 
import addIcon from '../../../assets/adminPage/plus.svg'; 

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

const SortableTableRow = ({ item, handleEditClick, handleDeleteClick }) => {
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
                <button className="admin-action-btn delete-btn" onClick={() => handleDeleteClick(item.id)}>
                <img src={deleteIcon} alt="刪除" className="admin-action-icon"/>
                </button>
            </td>
            <td>{item.timestamp}</td>
        </tr>
    );
};

const AdminTestPage = () => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testInfo, setTestInfo] = useState([]); // 考試資訊資料
    const [statusFilter, setStatusFilter] = useState('published'); // 狀態篩選
    const [activeId, setActiveId] = useState(null); // 目前拖曳的項目 ID
    const tableRef = useRef(null);
    const [tableWidth, setTableWidth] = useState(0);

    useEffect(() => {
        if (tableRef.current) {
            setTableWidth(tableRef.current.offsetWidth);
        }
    }, [testInfo, isLoading]);

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

    useEffect(() => {
        fetchTestInfo();
    }, [statusFilter]);

    const fetchTestInfo = async () => {
        setIsLoading(true);
        setError(null);
        try {
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

            if (Array.isArray(data)) {
                const formattedData = data.map(item => ({
                    id: item.id,
                    category: item.category,
                    content: item.title,
                    link: item.url,
                    timestamp: '',
                }));
                setTestInfo(formattedData);

                // const currentData = formattedData.filter(item => item.status === statusFilter);
                // setTestInfo(currentData);

            } else {
                console.error("考試資訊API回傳格式錯誤:", data);
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
    };

    const handleAddClick = () => {
        alert('點擊了新增項目');
    }
    const handleEditClick = (item) => {
        alert(`編輯項目: ${item.content}`);
    }
    
    const handleDeleteClick = (itemId) => {
        if(!window.confirm("確定要刪除此筆目前公告嗎？")) {
            return;
        }
        try {
            alert(`執行刪除項目 ID: ${itemId}`);
        } catch (error) {
            console.error("刪除失敗:", error);
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
                                    <th className="admin-table-header"> 類別 <span className="sort-arrow">↓</span></th>
                                    <th className="admin-table-header"> 內容 (限20字) <span className="sort-arrow">↓</span></th>
                                    <th className="admin-table-header"> 連結 <span className="sort-arrow">↓</span></th>
                                    <th style={{width: '50px'}}></th>
                                    <th className="admin-table-header"> 建立時間 <span className="sort-arrow">↓</span></th>
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
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </table>
                            <DragOverlay>
                                {activeItem ? (
                                    <table ref={tableRef} className="table admin-data-table drag-overlay-table">
                                        <tbody>
                                            <tr className="dragging-overlay-row">
                                                <td className="drag-handle-column">
                                                <img src={dragIcon} alt="拖曳" className="drag-handle-icon" />
                                                </td>       
                                                <td>
                                                    <button className="btn btn-sm btn-outline-secondary admin-action-btn" onClick={() => handleEditClick(item)}>
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
        </div>
    )
}

export default AdminTestPage;