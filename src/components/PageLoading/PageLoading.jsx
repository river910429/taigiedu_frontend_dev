import React from 'react';
import './PageLoading.css';

// 全站共用的頁面載入動畫（樣式參考節慶飲食頁），置於畫面正中間
const PageLoading = ({ text = '載入中...' }) => (
    <div className="page-loading">
        <div className="page-loading-spinner"></div>
        <p className="page-loading-text">{text}</p>
    </div>
);

export default PageLoading;
