import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AdminFilePreview.css';

// 預設預覽圖
import defaultPreviewImage from '../../../../assets/resourcepage/file_preview_demo.png';

// 將 API 的 action 對應到前端管理軌跡類型
const mapActionToType = (action) => {
    switch (action) {
        case 'reported': return 'report';
        case 'deleted': return 'takedown';
        case 'restored': return 'restore';
        default: return action;
    }
};

// 取得管理軌跡類型的標籤樣式和文字
const getHistoryTypeInfo = (type) => {
    switch (type) {
        case "report":
            return { label: "檢舉", className: "history-badge-report" };
        case "takedown":
            return { label: "下架", className: "history-badge-takedown" };
        case "restore":
            return { label: "取消下架", className: "history-badge-restore" };
        default:
            return { label: "未知", className: "history-badge-default" };
    }
};

export default function AdminFilePreview() {
    const location = useLocation();
    const [resourceData, setResourceData] = useState({
        title: "無標題資源",
        imageUrl: defaultPreviewImage,
        fileType: "PDF",
        likes: 0,
        downloads: 0,
        uploader: "匿名上傳者",
        tags: [],
        status: "目前項目"
    });
    const [managementHistory, setManagementHistory] = useState([]);

    // 從 URL 讀取資源資料
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        let parsedTags = [];
        try {
            parsedTags = JSON.parse(decodeURIComponent(searchParams.get("tags") || "[]"));
        } catch {
            parsedTags = [];
        }

        // 解析管理理由（從 API reason 陣列 - 通常是管理員的操作紀錄）
        let parsedReasons = [];
        try {
            parsedReasons = JSON.parse(decodeURIComponent(searchParams.get("reason") || "[]"));
        } catch {
            parsedReasons = [];
        }

        // 解析詳細檢舉資訊（從 API reports 陣列 - 來自用戶的檢舉）
        let parsedReports = [];
        try {
            parsedReports = JSON.parse(decodeURIComponent(searchParams.get("reports") || "[]"));
        } catch {
            parsedReports = [];
        }

        setResourceData({
            title: searchParams.get("title") || "無標題資源",
            imageUrl: searchParams.get("imageUrl") || defaultPreviewImage,
            fileType: searchParams.get("fileType") || "PDF",
            likes: parseInt(searchParams.get("likes") || "0", 10),
            downloads: parseInt(searchParams.get("downloads") || "0", 10),
            uploader: searchParams.get("uploader") || "匿名上傳者",
            tags: parsedTags,
            status: searchParams.get("status") || "目前項目"
        });

        // 合併所有管理軌跡與檢舉紀錄
        const combinedHistory = [
            ...parsedReasons.map((r, idx) => ({
                id: `reason-${idx}`,
                type: mapActionToType(r.action),
                user: r.userId ? `管理員 ${r.userId}` : '管理員',
                date: r.timestamp ? r.timestamp.replace(/-/g, '/') : '',
                reason: r.reason || '',
                rawDate: r.timestamp
            })),
            ...parsedReports.map((r, idx) => ({
                id: `report-${idx}`,
                type: 'report',
                user: r.username || '用戶',
                date: r.created_at ? r.created_at.replace(/-/g, '/') : '',
                reason: `${r.report_reason}${r.supplement ? ` - ${r.supplement}` : ''}`,
                rawDate: r.created_at
            }))
        ];

        // 依據日期排序
        combinedHistory.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
        setManagementHistory(combinedHistory);
    }, [location.search]);

    // 判斷目前資源狀態（是否已下架）
    const isCurrentlyTakenDown = () => {
        if (managementHistory.length === 0) return false;
        const lastAction = managementHistory[managementHistory.length - 1];
        return lastAction.type === "takedown";
    };

    // 處理下架/取消下架操作
    const handleTakedownAction = () => {
        const isTakenDown = isCurrentlyTakenDown();
        const actionType = isTakenDown ? "restore" : "takedown";
        const actionLabel = isTakenDown ? "取消下架" : "下架";

        const reason = prompt(`請輸入${actionLabel}理由：`);
        if (!reason) return;

        const newEntry = {
            id: managementHistory.length + 1,
            type: actionType,
            user: "當前管理員",
            date: new Date().toLocaleDateString("zh-TW").replace(/\//g, "/"),
            reason: `${actionLabel}理由：${reason}`
        };

        setManagementHistory([...managementHistory, newEntry]);
        alert(`已成功${actionLabel}此資源`);
    };

    return (
        <div className="admin-file-preview-page">
            {/* 管理員檢視提示 */}
            <div className="admin-view-banner">
                <span className="admin-view-dot"></span>
                您現在使用管理員權限檢視角度
            </div>

            <div className="admin-preview-header">
                <h1 className="admin-preview-title">{resourceData.title}</h1>

                {/* 管理軌跡時間軸 */}
                {managementHistory.length > 0 && (
                    <div className="management-timeline">
                        {managementHistory.map((entry) => {
                            const typeInfo = getHistoryTypeInfo(entry.type);
                            return (
                                <div key={entry.id} className="timeline-entry">
                                    <span className={`history-badge ${typeInfo.className}`}>
                                        {typeInfo.label}
                                    </span>
                                    <span className="timeline-user">{entry.user}</span>
                                    <span className="timeline-date">{entry.date}</span>
                                    <span className="timeline-reason">{entry.reason}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="admin-preview-info">
                    <span className="admin-preview-uploader">AUTHOR：{resourceData.uploader}</span>
                </div>

                <div className="admin-preview-tags">
                    {resourceData.tags.map((tag, index) => (
                        <span key={index} className="admin-preview-tag">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* 管理操作按鈕 */}
                <button
                    className={`admin-action-button ${isCurrentlyTakenDown() ? 'restore' : 'takedown'}`}
                    onClick={handleTakedownAction}
                >
                    {isCurrentlyTakenDown() ? '取消下架' : '下架資源'}
                </button>
            </div>

            <div className="admin-preview-image">
                <img src={resourceData.imageUrl} alt={resourceData.title} />
            </div>
        </div>
    );
}
