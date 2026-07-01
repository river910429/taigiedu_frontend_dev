/**
 * 檔案上傳服務
 * 呼叫獨立的 /file_upload 端點上傳檔案，取代直接傳送 Base64 給後端的舊做法
 */

import envConfig from '../config';
import { getAccessToken, refreshToken } from './authService';

const API_BASE_URL = envConfig.apiUrl;

// 產生唯一的隨機 Hash，長度為 32 字元 16 進位字串
const generateUniqueHash = () => {
    try {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch {
        // 備用方案：若不支援 crypto 則使用亂數 + 時間戳記組合
        return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
};

/**
 * 上傳單一檔案
 * 上傳前會將檔名改為隨機 Hash（保留原始副檔名），避免檔名衝突或包含特殊字元
 * @param {File} file - 要上傳的檔案
 * @returns {Promise<string>} 後端回傳的檔案路徑/URL（可直接存入表單欄位）
 */
export const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const hashedFileName = `${generateUniqueHash()}.${fileExt}`;
    const hashedFile = new File([file], hashedFileName, { type: file.type });

    const formData = new FormData();
    formData.append('file', hashedFile);

    const sendRequest = async (token) => {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(`${API_BASE_URL}/file_upload`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include',
        });
    };

    let response = await sendRequest(getAccessToken());

    if (response.status === 401) {
        const refreshResult = await refreshToken();
        if (refreshResult.success) {
            response = await sendRequest(refreshResult.accessToken);
        }
    }

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.data?.success) {
        throw new Error(result?.data?.message || result?.message || '檔案上傳失敗');
    }

    return result.data.filename;
};

/**
 * 將 /file_upload 端點回傳的相對路徑（如 /uploads/xxx.jpg）組合成可直接顯示的完整 URL
 * 邏輯與「臺語教學資源共享平臺」ResourceCard 的 joinUrl 一致：直接沿用完整路徑，
 * 而非只取檔名再拼接固定目錄（否則會因目錄不符而 404）
 * @param {string} path - 後端回傳的相對路徑
 * @returns {string} 完整可存取的圖片/檔案 URL
 */
export const resolveFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }

    const normalizedBase = String(API_BASE_URL || '').replace(/\/+$/, '');
    let normalizedPath = String(path).replace(/^\/+/, '').replace(/\/{2,}/g, '/');

    // 後端在列表 API 回傳的圖片路徑常夾帶容器內部檔案系統前綴 app/（例如
    // app/static/exam/4.jpg、app/uploads/uploads/xxx.png），若直接沿用會組出
    // /backend/app/... 而 404。實際對外服務位置為：
    //   - 上傳檔案：{base}/uploads/<檔名>（可能出現重複 uploads/，取最後一段即可）
    //   - 其他靜態檔：{base}/static/...（去掉開頭的 app/）
    const uploadsIdx = normalizedPath.lastIndexOf('uploads/');
    if (uploadsIdx !== -1) {
        normalizedPath = normalizedPath.slice(uploadsIdx);
    } else if (normalizedPath.startsWith('app/')) {
        normalizedPath = normalizedPath.replace(/^app\//, '');
    }

    if (normalizedBase.endsWith('/backend') && normalizedPath.startsWith('backend/')) {
        normalizedPath = normalizedPath.replace(/^backend\//, '');
    }
    if (normalizedBase.endsWith('/api') && normalizedPath.startsWith('api/')) {
        normalizedPath = normalizedPath.replace(/^api\//, '');
    }

    return `${normalizedBase}/${normalizedPath}`;
};

export default { uploadFile, resolveFileUrl };
