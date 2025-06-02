import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import "./LoginPage.css";

const LoginPage = ({ setIsLoggedIn, isLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast(); // 引入 Toast 功能

  // 檢查 setIsLoggedIn 是否為函數，如果不是，創建一個空函數
  const updateLoginStatus = typeof setIsLoggedIn === 'function' 
    ? setIsLoggedIn 
    : () => console.warn('setIsLoggedIn is not provided or not a function');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 檢查必填欄位
    if (!email || !password || !captcha) {
      showToast("請填寫所有必填欄位", "error");
      return;
    }
    
    // 設置提交狀態
    setIsSubmitting(true);
    
    try {
      // 準備 API 參數
      const parameters = {
        username: email, // API 接受 username 作為參數，但實際上可以是 email
        password: password
      };
      
      // 呼叫登入 API
      const response = await fetch("https://dev.taigiedu.com/backend/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parameters)
      });
      
      const data = await response.json();

      if (response.ok && data.success) {

        // 登入成功處理
        showToast("登入成功！", "success");
        
        // 儲存 token 和用戶 ID 到 localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("isLoggedIn", "true");
        
        // 使用安全的方式更新登入狀態
        updateLoginStatus(true);
        
        // 導航到之前嘗試訪問的頁面或首頁
        if (location.state?.redirectTo) {
          navigate(location.state.redirectTo, { replace: true });
        } else {
          navigate(-1); // 返回上一頁
        }
      } else {
        // 登入失敗處理
        showToast(data.message || "登入失敗，請檢查帳號和密碼！", "error");
      }
    } catch (error) {
      console.error("登入請求失敗:", error);
      showToast("登入過程中發生錯誤，請稍後再試", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(-1); // 點擊關閉按鈕返回上一頁
  };

  const handleRegister = () => {
    navigate("/register"); // 跳轉到註冊頁面
  };

  const handleThirdPartyLogin = () => {
    alert("Gmail 登入功能尚未實現");
    // Gmail 登入邏輯將來再實現
  };
  
  useEffect(() => {
    // 檢查是否已登入，如果已登入且有重定向目標，則導航到該目標
    if (isLoggedIn && location.state?.redirectTo) {
      navigate(location.state.redirectTo, { replace: true });
    }
    
    // 檢查 localStorage 中是否有登入狀態
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true" && !isLoggedIn && typeof setIsLoggedIn === 'function') {
      updateLoginStatus(true);
    }
  }, [isLoggedIn, navigate, location.state, updateLoginStatus]);
 
  return (
    <div className="login-modal-overlay">
      <div className="login-modal-container">
        <div className="login-modal-header">
          <div>登入</div>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* 第三方登入區 */}
        <div className="third-party-login">
          <div className="separator">&nbsp;</div>
          <p>使用第三方登入：</p>
          <button
            className="gmail-login-button"
            onClick={handleThirdPartyLogin}
          >
          </button>
          <p>或是</p>
          <div className="separator">&nbsp;</div>
          <p>本站帳號登入：</p>
        </div>

        {/* 本站帳號登入表單 */}
        <form className="login-modal-form" onSubmit={handleLogin}>
          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>帳號
            </span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入您的電子郵件"
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>密碼
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入您的密碼"
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>請輸入驗證碼
            </span>
            <input 
              type="text" 
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="請輸入驗證碼"
              disabled={isSubmitting}
              required 
            />
          </label>

          <button 
            type="submit" 
            className="login-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "登入中..." : "登入"}
          </button>
        </form>

        {/* 註冊按鈕 */}
        <div className="register-button-container">
          <button 
            className="register-button" 
            onClick={handleRegister}
            disabled={isSubmitting}
          >
            沒有帳號？進行註冊
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;