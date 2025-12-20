import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-buttons">
        <button className="footer-button">Our team</button>
        <button className="footer-button" onClick={() => window.open('/terms', '_blank', 'noopener,noreferrer')}>Terms</button>
        <button className="footer-button" onClick={() => window.open('/policy', '_blank', 'noopener,noreferrer')}>Policy</button>
      </div>
      <div className="footer-text">
        © 2024 台語文教學共融平台 All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;