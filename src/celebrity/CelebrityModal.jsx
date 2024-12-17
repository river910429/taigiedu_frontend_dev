import React from 'react';
import './CelebrityModal.css';

const CelebrityModal = ({ isOpen, onClose, celebrity }) => {
  if (!isOpen || !celebrity) return null;

  return (
    <div className="celebrity-modal-overlay">
      <div className="celebrity-modal-container">
        <div className="celebrity-modal-content">
          <div className="celebrity-modal-close">
            <div className="celebrity-close-button" onClick={onClose}>&times;</div>
          </div>
          <div className="celebrity-modal-detail">
            <div className="celebrity-modal-header">
            <h2 className="celebrity-modal-title">{celebrity.name}
               <span className="celebrity-pronunciation-text">{celebrity.pron}</span>
            </h2>
            <div className="celebrity-subtitle">{celebrity.subtitle}</div>
          </div>
            <div className="celebrity-modal-body">
            <div className="celebrity-row-container">
  <div className="celebrity-interpretation-container" style={{ flex: 1 }}>
    <span className="celebrity-interpretation-label">簡介</span>
    <div className="celebrity-interpretation-text">
      {celebrity.intro}
    </div>
  </div>
  <div className="celebrity-interpretation-container" style={{ flex: 1 }}>
    <span className="celebrity-interpretation-label">作品導讀</span>
    <div className="celebrity-interpretation-text">
      {celebrity.portfolio}
    </div>
  </div>
</div>
<div className="celebrity-attribution">
    此為台文課學生XXX作業授權
  </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrityModal; 