import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';
// 引入圖標
import errorIcon from '../assets/toast/error.svg';
import successIcon from '../assets/toast/check.png';
import warningIcon from '../assets/toast/warning.svg';
import infoIcon from '../assets/toast/process.svg';

// 創建 Toast Context
const ToastContext = createContext();

// 圖標映射
const iconMap = {
    'error': errorIcon,
    'success': successIcon,
    'warning': warningIcon,
    'info': infoIcon
  };

// 創建 Toast 提供者組件
export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ message: null, type: null });
  
    // 顯示錯誤訊息
    const showError = useCallback((message) => {
      setToast({ message: null, type: null });  // 先重置
      setTimeout(() => {
        setToast({ message, type: 'error' });
      }, 100);
  
      setTimeout(() => {
        setToast({ message: null, type: null });
      }, 6000);
    }, []);
  
    // 顯示成功訊息或自定義類型訊息
    const showToast = useCallback((message, type = 'success') => {
      setToast({ message: null, type: null });  // 先重置
      setTimeout(() => {
        setToast({ message, type });
      }, 100);
  
      setTimeout(() => {
        setToast({ message: null, type: null });
      }, 6000);
    }, []);

  return (
    <ToastContext.Provider value={{ showError, showToast }}>
      {children}
      {toast.message && (
        <div className={`toast-message ${toast.type}`}>
          <div className="toast-icon-container">
            <img 
              src={iconMap[toast.type]} 
              alt={`${toast.type} icon`} 
              className="toast-icon" 
            />
          </div>
          <div className="toast-content">
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

// 自定義 Hook 方便在組件中使用 Toast 功能
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};