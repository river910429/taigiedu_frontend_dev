import React from 'react';
import './AdminResourcePage.css';

export default function TakedownDialog({
    open,
    onClose,
    onConfirm,
    selectedItem,
    reason,
    setReason
}) {
    if (!open) return null;

    const reasons = [
        '不雅內容',
        '涉及著作權侵權',
        '政治不中立',
        '旁白或文稿問題',
        '重複上傳',
        '廣告內容',
        '侵害隱私',
        '涉及恐怖、脅迫或血腥'
    ];

    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ overflow: 'hidden' }}>
                <div className="admin-modal-header">
                    <div>下架理由：</div>
                    <button className="admin-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="admin-modal-body">
                    {/* 顯示已有的檢舉與操作原因 */}
                    {(selectedItem?.reason?.length > 0 || selectedItem?.reports?.length > 0) && (
                        <div className="admin-modal-report-reasons">
                            <div className="report-reasons-title">相關軌跡：</div>
                            {/* 顯示歷史操作理由 */}
                            {selectedItem.reason && selectedItem.reason.map((r, idx) => (
                                <div key={`reason-${idx}`} className="report-reason-item">
                                    <span className="report-reason-action">{r.action === 'reported' ? '檢舉' : r.action === 'deleted' ? '下架' : r.action}</span>
                                    <span className="report-reason-text">{r.reason}</span>
                                    <span className="report-reason-time">{r.timestamp}</span>
                                </div>
                            ))}
                            {/* 顯示具體用戶檢舉理由 */}
                            {selectedItem.reports && selectedItem.reports.map((r, idx) => (
                                <div key={`report-${idx}`} className="report-reason-item">
                                    <span className="report-reason-action report">用戶檢舉</span>
                                    <span className="report-reason-text">
                                        {r.report_reason}
                                        {r.report_reason_detail ? ` - ${r.report_reason_detail}` : ''}
                                        {r.supplement ? ` (${r.supplement})` : ''}
                                    </span>
                                    <span className="report-reason-time">{r.created_at}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="report-reasons-title" style={{ marginTop: selectedItem?.reason?.length > 0 ? '12px' : '0' }}>下架理由選擇：</div>
                    <div className="admin-modal-radio-grid">
                        {reasons.map(r => (
                            <label key={r} className="admin-radio">
                                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                                <span>{r}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <button className="admin-btn" onClick={onClose}>取消</button>
                    <button className="admin-btn primary" onClick={onConfirm}>確定</button>
                </div>
            </div>
        </div>
    );
}
