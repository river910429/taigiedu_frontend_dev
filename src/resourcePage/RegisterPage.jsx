import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isVerificationVisible, setIsVerificationVisible] = useState(false); // 控制是否顯示信箱驗證視窗
  const [resendCooldown, setResendCooldown] = useState(60); // 再次獲取驗證碼的倒數計時

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    firstName: "",
    profession: "",
    professionOther: "",
    organization: "",
    usagePurpose: [],
  });

  /*usagePurpose json 格式：
  [
    { "type": "備課" },
    { "type": "自學" },
    { "type": "其他", "custom": "自定義內容" }
  ]
*/
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (value === "其他") {
        setFormData((prev) => ({
          ...prev,
          usagePurpose: checked
            ? [...prev.usagePurpose, { type: value, custom: "" }] // 新增 "其他" 且初始化為空
            : prev.usagePurpose.filter((item) => item.type !== value), // 移除 "其他"
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          usagePurpose: checked
            ? [...prev.usagePurpose, { type: value }] // 新增一般選項
            : prev.usagePurpose.filter((item) => item.type !== value), // 移除一般選項
        }));
      }
    } else if (name === "customPurpose") {
      setFormData((prev) => ({
        ...prev,
        usagePurpose: prev.usagePurpose.map(
          (item) => (item.type === "其他" ? { ...item, custom: value } : item) // 更新 "其他" 的描述
        ),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("密碼與確認密碼不一致！");
      return;
    }
    console.log("Submitted Data:", formData);
    // 模擬註冊成功，切換到信箱驗證提醒視窗
    setIsVerificationVisible(true);
  };

  const handleResendCode = () => {
    if (resendCooldown === 0) {
      setResendCooldown(60); // 重置倒數計時
    }
  };

  // 倒數計時邏輯
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown((prev) => prev - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleClose = () => {
    navigate(-1); // 返回上一頁
  };

  return (
    <div className="register-modal-overlay">
      {!isVerificationVisible ? (
        <>
          {/* 註冊表單 */}
          <div className="register-modal-container">
            <div className="register-modal-header">
              <div>註冊</div>
              <button className="close-button" onClick={handleClose}>
                ×
              </button>
            </div>

            <form className="register-modal-form" onSubmit={handleSubmit}>
              {/* 帳號（電子郵件信箱） */}
              <label className="form-label">
                <span className="form-label-title">
                  <span className="form-label-required">*</span>
                  帳號（電子郵件信箱）
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* 密碼 */}
              <label className="form-label">
                <span className="form-label-title">
                  <span className="form-label-required">*</span>密碼
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* 註冊表單 */}
              <label className="form-label">
                <span className="form-label-title">
                  <span className="form-label-required">*</span>再次輸入密碼
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* 姓氏 */}
              <label className="form-label">
                <span className="form-label-title">
                  <span className="form-label-required">*</span>姓氏
                </span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* 名字 */}
              <label className="form-label">
                <span className="form-label-title">
                  <span className="form-label-required">*</span>名字
                </span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* 職業 */}
              <label className="form-label">
                <span className="form-label-title">
                  <span className="form-label-required">*</span>職業
                </span>
                <div className="radio-group">
                  {["老師", "台語文相關工作者"].map((profession) => (
                    <label key={profession}>
                      <input
                        type="radio"
                        name="profession"
                        value={profession}
                        onChange={handleChange}
                        required
                      />
                      {profession}
                    </label>
                  ))}
                  <label>
                    <input
                      type="radio"
                      name="profession"
                      value="其他"
                      onChange={handleChange}
                    />
                    其他
                    <input
                      type="text"
                      name="professionOther"
                      value={
                        formData.profession === "其他"
                          ? formData.professionOther
                          : ""
                      }
                      onChange={handleChange}
                      disabled={formData.profession !== "其他"}
                      placeholder="請說明"
                    />
                  </label>
                </div>
              </label>

              {/* 服務單位 */}
              <label className="form-label">
                <span className="form-label-title">
                  <span className="form-label-required">*</span>服務單位
                </span>
                <p>※例如：台南一中</p>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                />
              </label>

              {/* 使用網站動機 */}
              <label className="form-label">
                <span className="form-label-title">
                  <span className="form-label-required">*</span>
                  使用網站動機（可多選）
                </span>
                <div className="checkbox-group">
                  {["備課", "自學"].map((purpose) => (
                    <label key={purpose}>
                      <input
                        type="checkbox"
                        value={purpose}
                        onChange={handleChange}
                      />
                      {purpose}
                    </label>
                  ))}
                  <label>
                    <input
                      type="checkbox"
                      value="其他"
                      onChange={handleChange}
                    />
                    其他
                    <input
                      type="text"
                      name="customPurpose"
                      placeholder="請說明"
                      onChange={handleChange}
                      disabled={
                        !formData.usagePurpose.some(
                          (item) => item.type === "其他"
                        )
                      }
                    />
                  </label>
                </div>
              </label>

              <button type="submit" className="register-submit-button">
                送出
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          {/* 信箱驗證提醒視窗 */}
          <div className="verification-modal-container">
            <div className="verification-modal-header">
              <div>驗證您的信箱</div>
              <button className="close-button" onClick={handleClose}>
                ×
              </button>
            </div>
            <div className="verification-modal-content">
              <p>驗證信件已寄出，請於30分鐘之內至您的信箱完成驗證喔！</p>
              <button
                className="resend-button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `再次獲取驗證碼 (${resendCooldown}s)`
                  : "再次獲取驗證碼"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterPage;
