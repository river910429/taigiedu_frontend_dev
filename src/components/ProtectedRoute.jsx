import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasFlag } from '../config/permissions';
import './ProtectedRoute.css';

/**
 * 受保護的路由組件
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} props.requireAuth      - 是否需要登入（預設 true）
 * @param {boolean} props.requireAdmin     - 是否需要任何後台權限（預設 false）
 * @param {number}  props.requiredFlag     - 需要擁有的特定 FLAG 常數（優先於 requireAdmin）
 * @param {string}  props.redirectTo       - 未認證時重定向路徑（預設 '/login'）
 */
const ProtectedRoute = ({
    children,
    requireAuth = true,
    requireAdmin = false,
    requiredFlag = null,
    redirectTo = '/login'
}) => {
    const { isAuthenticated, isLoading, isAdmin, getUserPermissionFlags } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="protected-route-loading">
                <div className="loading-spinner"></div>
                <p>載入中...</p>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return (
            <Navigate
                to={redirectTo}
                state={{ redirectTo: location.pathname }}
                replace
            />
        );
    }

    // 指定特定 flag 時，優先以 flag 判斷
    if (requiredFlag !== null) {
        const flags = getUserPermissionFlags();
        if (!hasFlag(flags, requiredFlag)) {
            return (
                <Navigate
                    to="/"
                    state={{ error: '您沒有權限訪問此頁面' }}
                    replace
                />
            );
        }
    } else if (requireAdmin && !isAdmin()) {
        return (
            <Navigate
                to="/"
                state={{ error: '您沒有權限訪問此頁面' }}
                replace
            />
        );
    }

    return children;
};

/**
 * 管理員路由組件（有任何後台權限即可進入）
 */
export const AdminRoute = ({ children }) => {
    return (
        <ProtectedRoute requireAuth={true} requireAdmin={true}>
            {children}
        </ProtectedRoute>
    );
};

export default ProtectedRoute;
