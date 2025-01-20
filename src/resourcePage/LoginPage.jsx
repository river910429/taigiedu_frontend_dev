import React, { useState,useEffect  } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = ({ setIsLoggedIn,isLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // 模擬登入成功邏輯（實際應替換為 API 調用）
    if (username === "123" && password === "123") {
      alert("登入成功！");
      setIsLoggedIn(true); // 通知父組件更新登入狀態
    } else {
      alert("登入失敗，請檢查帳號和密碼！");
    }
  };

  const handleClose = () => {
    navigate(-1); // 點擊關閉按鈕返回上一頁
  };

  const handleRegister = () => {
    navigate("/register"); // 跳轉到註冊頁面
  };

  const handleThirdPartyLogin = () => {
    alert(" Gmail 登入！");
    // 這裡可以集成實際的第三方登入邏輯
  };
  
  useEffect(() => {
    if (isLoggedIn && location.state?.redirectTo) {
      navigate(location.state.redirectTo, { replace: true }); // 使用 replace 防止導航堆疊
    }
  }, [isLoggedIn, navigate]); // 減少依賴項，避免不必要的重新執行

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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              required
            />
          </label>

          <label className="form-label">
            <span className="form-label-title">
              <span className="form-label-required">*</span>請輸入驗證碼
            </span>
            <input type="text" required />
          </label>

          <button type="submit" className="login-submit-button">
            登入
          </button>
        </form>

        {/* 註冊按鈕 */}
        <div className="register-button-container">
          <button className="register-button" onClick={handleRegister}>
            沒有帳號？進行註冊
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
