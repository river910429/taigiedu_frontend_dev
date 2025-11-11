import {useState , useEffect , useCallback , useMemo} from "react";
import PropTypes from 'prop-types';
import {useToast} from '../../../components/Toast';
import './adminNewsPage.css';
import editIcon from '../../../assets/adminPage/pencil.svg'; 
import deleteIcon from '../../../assets/adminPage/trash.svg'; 
import addIcon from '../../../assets/adminPage/plus.svg'; 
import uturnIcon from '../../../assets/adminPage/uturn.svg';
import dragIcon from '../../../assets/adminPage/bars-2.png';

// dnd
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 可拖曳行元件（複製調整自考試資訊）
const SortableNewsRow = ({ item, handleEditClick, handleDeleteClick, statusFilter }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0, opacity: isDragging ? 0.8 : 1 };
  const isArchived = statusFilter === 'archived';
  const actionIcon = isArchived ? uturnIcon : deleteIcon;
  const actionClass = isArchived ? "admin-action-btn restore-btn" : "admin-action-btn delete-btn";
  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'dragging-row' : ''}>
      <td className="drag-handle-column">
        <button className="drag-handle-btn" {...listeners} {...attributes}><img src={dragIcon} alt="拖曳" className="drag-handle-icon" /></button>
      </td>
      <td><button className="admin-action-btn edit-btn" onClick={() => handleEditClick(item)}><img src={editIcon} alt="編輯" className="admin-action-icon"/></button></td>
      <td>{item.category}</td>
      <td>{item.content}</td>
      <td><a href={item.link} target="_blank" rel="noopener noreferrer">{item.link}</a></td>
      <td><button className={actionClass} onClick={() => handleDeleteClick(item.id)}><img src={actionIcon} alt={isArchived ? "恢復" : "刪除"} className="admin-action-icon"/></button></td>
      <td>{item.timestamp}</td>
    </tr>
  );
};

SortableNewsRow.propTypes = {
  item: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, category: PropTypes.string.isRequired, content: PropTypes.string.isRequired, link: PropTypes.string.isRequired, timestamp: PropTypes.string.isRequired, status: PropTypes.string.isRequired }).isRequired,
  handleEditClick: PropTypes.func.isRequired,
  handleDeleteClick: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired
};

const AdminNewsPage = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allNews, setAllNews] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('published');
  const [activeId, setActiveId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLink, setNewLink] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setNewsList((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        setAllNews(prev => {
          const temp = [...prev];
          const aItem = temp.find(i => i.id === active.id);
          const oItem = temp.find(i => i.id === over.id);
          if (!aItem || !oItem) return prev;
          const oldAllIndex = temp.indexOf(aItem);
          const newAllIndex = temp.indexOf(oItem);
          const [removedAll] = temp.splice(oldAllIndex, 1);
          temp.splice(newAllIndex, 0, removedAll);
          return temp;
        });
        return newItems;
      });
    }
    setActiveId(null);
  }, []);

  const handleDragStart = useCallback((event) => { setActiveId(event.active.id); }, []);
  const handleDragCancel = useCallback(() => { setActiveId(null); }, []);
  const activeItem = useMemo(() => newsList.find(i => i.id === activeId), [activeId, newsList]);

  const fetchNews = useCallback(() => {
    setIsLoading(true); setError(null);
    setTimeout(() => {
      try {
        const mockData = [
          { id: 1, category: "教育部", title: "台語教學推廣最新活動", url: "https://example.com/news1", timestamp: "2024/03/15 10:30:00", status: "published" },
          { id: 2, category: "成大", title: "語言文化研討會報名", url: "https://example.com/news2", timestamp: "2024/03/14 14:20:00", status: "published" },
          { id: 3, category: "教育部", title: "教材更新公告", url: "https://example.com/news3", timestamp: "2024/03/13 09:15:00", status: "published" },
          { id: 4, category: "成大", title: "校園活動速報", url: "https://example.com/news4", timestamp: "2024/03/12 16:45:00", status: "published" },
          { id: 5, category: "教育部", title: "已下架的快訊1", url: "https://example.com/archive1", timestamp: "2024/03/11 11:30:00", status: "archived" },
          { id: 6, category: "成大", title: "已下架的快訊2", url: "https://example.com/archive2", timestamp: "2024/03/10 15:20:00", status: "archived" }
        ];
        const formatted = mockData.map(i => ({ id: i.id, category: i.category, content: i.title, link: i.url, timestamp: i.timestamp || 'N/A', status: i.status || 'published' }));
        setAllNews(formatted);
      } catch (e) {
        showToast(`載入最新消息失敗: ${e.message}`, 'error');
        setNewsList([]); setError(e.message);
      } finally { setIsLoading(false); }
    }, 800);
  }, [showToast]);

  useEffect(() => { fetchNews(); }, [fetchNews]);
  useEffect(() => {
    if (allNews.length > 0 || !isLoading) {
      let filtered = allNews.filter(i => i.status === statusFilter);
      if (sortField) {
        filtered.sort((a,b) => {
          let av = a[sortField]; let bv = b[sortField];
          if (sortField === 'timestamp') { av = new Date(av); bv = new Date(bv); }
          if (typeof av === 'string' && typeof bv === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
          if (av < bv) return sortDirection === 'asc' ? -1 : 1;
          if (av > bv) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
      setNewsList(filtered);
    }
  }, [allNews, statusFilter, isLoading, sortField, sortDirection]);

  const handleSort = (field) => { if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDirection('asc'); } };
  const handleAddClick = () => { if (newsList.length >= 12 && statusFilter === 'published') { showToast('目前快訊數量已滿12個項目，請先刪除一個再新增。','warning'); return; } setShowAddModal(true); };
  const handleEditClick = (item) => { setIsEditing(true); setCurrentEditItem(item); setNewCategory(item.category); setNewContent(item.content); setNewLink(item.link); setShowAddModal(true); };
  const handleModalClose = () => { setShowAddModal(false); setNewCategory(''); setNewContent(''); setNewLink(''); setIsEditing(false); setCurrentEditItem(null); };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newCategory || !newContent || !newLink) { showToast('請填寫所有欄位','warning'); return; }
    try { new URL(newLink); } catch { showToast('請輸入有效的 URL','warning'); return; }
    const now = new Date();
    const ts = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    if (isEditing && currentEditItem) {
      setAllNews(prev => prev.map(i => i.id === currentEditItem.id ? { ...i, category: newCategory, content: newContent, link: newLink } : i));
      showToast('項目已更新','success');
    } else {
      const newItem = { id: 'news-' + Date.now(), category: newCategory, content: newContent, link: newLink, timestamp: ts, status: 'published' };
      setAllNews(prev => [newItem, ...prev]);
      showToast('新快訊已新增','success');
    }
    handleModalClose();
  };

  const handleDeleteClick = (itemId) => {
    const isRestore = statusFilter === 'archived';
    const confirmMsg = isRestore ? '確定要復原此筆已下架的快訊嗎？' : '確定要下架此筆快訊嗎？';
    if(!window.confirm(confirmMsg)) return;
    try {
      setAllNews(prev => prev.map(i => i.id === itemId ? { ...i, status: isRestore ? 'published' : 'archived' } : i));
      showToast(isRestore ? '快訊已復原' : '快訊已下架', 'success');
    } catch (e) {
      console.error(isRestore ? '復原失敗:' : '下架失敗:', e);
      showToast(`${isRestore ? '復原' : '下架'}失敗: ${e.message}`, 'error');
    }
  };

  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);

  return (
    <div className="admin-test-page p-4">
      <div className="admin-header-main">
        <h5 className="mb-3 text-secondary">首頁搜尋 &gt; 最新消息 &gt; <span>{statusFilter === 'published' ? '目前快訊' : '下架記錄'}</span></h5>
        <div className="admin-controls-row">
          <button className="btn btn-primary me-3 admin-add-button" onClick={handleAddClick}>
            <img src={addIcon} alt="新增快訊"/>新增快訊
          </button>
          <div className="status-filter">
            <span className="me-2 text-secondary">目前狀態：</span>
            <select className="form-select admin-status-dropdown" value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="published">目前快訊</option>
              <option value="archived">下架記錄</option>
            </select>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="news-loading"><div className="loading-spinner"></div><p>載入中...</p></div>
      ) : error ? (
        <div className="news-loading"><p>載入失敗，請重新整理頁面</p><button onClick={fetchNews} className="btn btn-primary mt-2">重新載入</button></div>
      ) : newsList.length === 0 ? (
        <div className="no-data-message-container text-center py-5"><p>目前沒有快訊資料</p></div>
      ) : (
        <div className="admin-table-responsive">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
            <table className="table admin-data-table">
              <thead>
                <tr>
                  <th style={{width:'40px'}}></th>
                  <th style={{width:'50px'}}></th>
                  <th className="admin-table-header" onClick={() => handleSort('category')} style={{cursor:'pointer'}}>類別 <span className="sort-arrow">{sortField === 'category' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}</span></th>
                  <th className="admin-table-header" onClick={() => handleSort('content')} style={{cursor:'pointer'}}>內容 (限20字) <span className="sort-arrow">{sortField === 'content' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}</span></th>
                  <th className="admin-table-header" onClick={() => handleSort('link')} style={{cursor:'pointer'}}>連結 <span className="sort-arrow">{sortField === 'link' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}</span></th>
                  <th style={{width:'50px'}}></th>
                  <th className="admin-table-header" onClick={() => handleSort('timestamp')} style={{cursor:'pointer'}}>建立時間 <span className="sort-arrow">{sortField === 'timestamp' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}</span></th>
                </tr>
              </thead>
              <SortableContext items={newsList.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {newsList.map(item => (
                    <SortableNewsRow key={item.id} item={item} handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick} statusFilter={statusFilter} />
                  ))}
                </tbody>
              </SortableContext>
            </table>
            <DragOverlay>
              {activeItem ? (
                <table className="table admin-data-table drag-overlay-table">
                  <tbody>
                    <tr className="dragging-overlay-row">
                      <td className="drag-handle-column"><img src={dragIcon} alt="拖曳" className="drag-handle-icon" /></td>
                      <td><button className="btn btn-sm btn-outline-secondary admin-action-btn" onClick={() => handleEditClick(activeItem)}><img src={editIcon} alt="編輯" className="admin-action-icon"/></button></td>
                      <td>{activeItem.category}</td>
                      <td>{activeItem.content}</td>
                      <td><a href={activeItem.link} target="_blank" rel="noopener noreferrer">{activeItem.link}</a></td>
                      <td><button className="btn btn-sm btn-outline-danger admin-action-btn" onClick={() => handleDeleteClick(activeItem.id)}><img src={deleteIcon} alt="刪除" className="admin-action-icon"/></button></td>
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
              <h5 className="modal-title" id="addModalLabel">{isEditing ? '編輯快訊' : '新增快訊'}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={handleModalClose}></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body admin-modal-body">
                <div className="mb-3">
                  <label htmlFor="newCategory" className="form-label admin-form-label">*類別</label>
                  <select className="form-select admin-form-control" id="newCategory" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required>
                    <option value="" disabled>請選擇類別</option>
                    <option value="教育部">教育部</option>
                    <option value="成大">成大</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="newContent" className="form-label admin-form-label">*內容 (限20字)</label>
                  <input type="text" className="form-control admin-form-control" id="newContent" value={newContent} onChange={(e) => setNewContent(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="newLink" className="form-label admin-form-label">*連結</label>
                  <input type="url" className="form-control admin-form-control" id="newLink" value={newLink} onChange={(e) => setNewLink(e.target.value)} required />
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
      {showAddModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AdminNewsPage;
