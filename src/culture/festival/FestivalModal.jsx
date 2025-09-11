import React from 'react';
import './FestivalModal.css';
import megaphoneIcon from '../../assets/megaphone.svg';

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
                  <img src={megaphoneIcon} />
                </div>
              </div>
            </div>
            <div className="festival-modal-body">
              <div className="festival-content-container">
                {festival.date && (
                  <div className="festival-date-container">
                    <span className="festival-date-label">日期</span>
                    <div className="festival-date-text">
                      {festival.date}
                    </div>
                  </div>
                )}
                <div className="festival-interpretation-container">
                  <span className="festival-interpretation-label">說明</span>
                  <div className="festival-interpretation-text">
                    {festival.intro || festival.intro_taigi || '暫無說明'}
                  </div>
                </div>
                {festival.intro_taigi && festival.intro && (
                  <div className="festival-taigi-container">
                    <span className="festival-taigi-label">台語說明</span>
                    <div className="festival-taigi-text">
                      {festival.intro_taigi}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalModal; 