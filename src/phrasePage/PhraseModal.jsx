import React, { useState } from 'react';
import './PhraseModal.css';
import megaphoneIcon from '../assets/megaphone.svg';

const PhraseModal = ({ isOpen, onClose, phrase, pronunciation, interpretation, pronun_diff }) => {
  const playAudio = async () => {
    try {
      // 準備 API 參數
      const parameters = {
        tts_lang: 'tb',  // 使用漢羅
        tts_data: phrase // 要合成的文字
      };

      console.log('Sending TTS request:', parameters);

      const response = await fetch('https://dev.taigiedu.com/backend/synthesize_speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const synthesized_audio_base64 = await response.text();
      console.log('Received audio data length:', synthesized_audio_base64.length);

      // 建立並播放音訊
      const audio = new Audio(`data:audio/wav;base64,${synthesized_audio_base64}`);
      await audio.play();

    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };
  const playVariationAudio = async (word, pronun) => {
    try {
      const response = await fetch('/TTS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: pronun }),
      });

      const data = await response.json();
      const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  if (!isOpen) return null;

  const renderPronunDiffTable = () => {
    if (!pronun_diff || pronun_diff.length === 0) return null;

    return (
      <div className="pronun-diff-container">
        <table className="pronun-diff-table">
          <thead>
            <tr>
              <th>單字方音差</th>
              <th>發音</th>
            </tr>
          </thead>
          <tbody>
          {pronun_diff.map((word, wordIndex) =>
  word.variations.map((variant, index) => (
    <tr 
      key={`${word.word}-${variant.location}-${index}`}
      className={
        index === word.variations.length - 1 && 
        wordIndex !== pronun_diff.length - 1 ? 
        'word-last-row' : ''
      }
    >
      <td>
        {word.word} <span className="pronun-location-badge">{variant.location}</span>
      </td>
      <td>{variant.pronun}<img 
          src={megaphoneIcon}
          className="pronun-speaker-icon"
          onClick={() => playVariationAudio(word.word, variant.pronun)}
          alt="播放"
        />
      </td>
    </tr>
  ))
)}
          </tbody>
        </table>
      </div>
    );
  };

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
                  <img src={megaphoneIcon} />
                </div>
              </div>
              <div className="phrase-interpretation-container">
                <span className="phrase-interpretation-label">漢羅解讀</span>
                <div className="phrase-interpretation-text">
                  {interpretation}
                </div>
              </div>
              {renderPronunDiffTable()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhraseModal;