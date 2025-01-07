import React, { useState } from 'react';
import './PhraseModal.css';

const PhraseModal = ({ isOpen, onClose, phrase, pronunciation, interpretation }) => {
  const playAudio = async () => {
    try {
      const response = await fetch('/TTS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: phrase }),
      });
      
      const data = await response.json();
      const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="phrase-modal-overlay">
      <div className="phrase-modal-container">
        <div className="phrase-modal-content">
          <div className="phrase-modal-close">
            <div className="phrase-close-button" onClick={onClose}>&times;</div>
          </div>
          <div className="phrase-modal-detail">
            <div className="phrase-modal-header">
              <h2 className="phrase-modal-title">{phrase}</h2>
            </div>
            <div className="phrase-modal-body">
              <div className="phrase-pronunciation-container">
                <div className="phrase-pronunciation-text">{pronunciation}</div>
                <div className="phrase-play-button" onClick={playAudio}>
                  <img src="src/assets/megaphone.svg" />
                </div>
              </div>
              <div className="phrase-interpretation-container">
               <span className="phrase-interpretation-label">漢羅解讀</span>
                <div className="phrase-interpretation-text">
                {interpretation}
                </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhraseModal;