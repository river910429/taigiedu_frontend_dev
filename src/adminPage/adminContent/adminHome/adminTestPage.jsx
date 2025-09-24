import React , {useState , useEffect} from "react";
import {useToast} from '../../../components/Toast';
import './adminTestPage.css';
import bookIcon from '../../../assets/adminPage/book.svg'; // 暫時代替編輯圖示
import cloudIcon from '../../../assets/adminPage/cloudComputing.svg'; // 暫時代替刪除圖示
import houseIcon from '../../../assets/adminPage/house.svg'; // 暫時代替新增圖示
import playIcon from '../../../assets/adminPage/playButton.svg'; // 暫時代替載入中圖示

const AdminTestPage = () => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testInfo, setTestInfo] = useState([]); // 考試資訊資料
    const [statusFilter, setStatusFilter] = useState('published'); // 狀態篩選

    useEffect(() => {
        fetchTestInfo();
    }, []);

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
                // 補上各資訊的 status
                // const filteredData = data.map(item => ({

                // }));
                setTestInfo(data);
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
                        <img src={houseIcon} alt="新增項目" />
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
                    <img src={playIcon} alt="載入中" className="loading-spinner" />
                    <span>載入中...</span>
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
                    <table className="table admin-data-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th className="admin-table-header"> 類別 <span className="sort-arrow">↓</span></th>
                                <th className="admin-table-header"> 內容 (限20字) <span className="sort-arrow">↓</span></th>
                                <th className="admin-table-header"> 連結 <span className="sort-arrow">↓</span></th>
                                <th></th>
                                <th className="admin-table-header"> 建立時間 <span className="sort-arrow">↓</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {testInfo.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <button className="btn btn-sm btn-outline-secondary admin-action-btn" onClick={() => handleEditClick(item)}>
                                            <img src={bookIcon} alt="編輯" className="admin-action-icon"/>
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
                                        <button className="btn btn-sm btn-outline-danger admin-action-btn" onClick={() => handleDeleteClick(item.id)}>
                                            <img src={cloudIcon} alt="刪除" className="admin-action-icon"/>
                                        </button>
                                    </td>
                                    <td>{item.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminTestPage;