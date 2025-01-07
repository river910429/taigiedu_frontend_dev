import React from 'react';
import './FestivalModal.css';

const FestivalModal = ({ isOpen, onClose, festival }) => {
  if (!isOpen || !festival) return null;

  return (
    <div className="festival-modal-overlay">
      <div className="festival-modal-container">
        <div className="festival-modal-content">
          <div className="festival-modal-close">
            <div className="festival-close-button" onClick={onClose}>&times;</div>
          </div>
          <div className="festival-modal-detail">
            <div className="festival-header-content">
              <h2 className="festival-modal-title">{festival.name}</h2>
              <div className="festival-pronunciation-container">
                <div className="festival-pronunciation-text">{festival.pron}</div>
                <div className="festival-play-button">
                  <img src="/src/assets/megaphone.svg" />
                </div>
              </div>
            </div>
            <div className="festival-modal-body">
              <div className="festival-row-container">
                <div className="festival-interpretation-container">
                  <span className="festival-interpretation-label">說明</span>
                  <div className="festival-interpretation-text">
                    {festival.intro}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalModal; 