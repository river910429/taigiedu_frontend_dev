import React, { useEffect } from 'react';
import './PhraseModal.css';
import megaphoneIcon from '../assets/megaphone.svg';

const PhraseModal = ({ isOpen, onClose, phrase, pronunciation, interpretation, pronun_diff, audio }) => {
  console.log("Modal 接收的數據:", { phrase, pronunciation, interpretation, pronun_diff, audio });
  
  useEffect(() => {
    if (isOpen) {
      console.log("Modal 打開時的方音差數據:", {
        接收到的方音差: pronun_diff,
        類型: typeof pronun_diff,
        是否為陣列: Array.isArray(pronun_diff),
        長度: Array.isArray(pronun_diff) ? pronun_diff.length : "非陣列"
      });
    }
  }, [isOpen, pronun_diff]);

  const playAudio = () => {
    try {
      if (audio) {
        console.log("使用 API 提供的音頻數據");
        // 確保音頻數據格式正確
        const audioSrc = audio.startsWith('data:')
          ? audio
          : `data:audio/wav;base64,${audio}`;

        const audioElement = new Audio(audioSrc);
        audioElement.play().catch(error => {
          console.error("播放音頻失敗:", error);
          // 如果播放失敗，嘗試使用 TTS API
          fetchAndPlayTTS();
        });
      } else {
        console.log("無音頻數據，使用 TTS API");
        fetchAndPlayTTS();
      }
    } catch (error) {
      console.error('播放音頻時發生錯誤:', error);
      fetchAndPlayTTS();
    }
  };
  

  const fetchAndPlayTTS = async () => {
    try {
      console.log("使用 TTS API 合成音頻");
      // 準備 API 參數
      const parameters = {
        tts_lang: 'tb',  // 使用漢羅
        tts_data: phrase // 要合成的文字
      };

      console.log('發送 TTS 請求:', parameters);

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
      console.log('收到音頻數據長度:', synthesized_audio_base64.length);

      // 建立並播放音訊
      const audio = new Audio(`data:audio/wav;base64,${synthesized_audio_base64}`);
      await audio.play();

    } catch (error) {
      console.error('合成音頻失敗:', error);
    }
  };

  const playVariationAudio = async (word, pronun) => {
    try {
      console.log(`播放方音差: ${word} - ${pronun}`);
      const response = await fetch('https://dev.taigiedu.com/backend/synthesize_speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tts_lang: 'tb',
          tts_data: pronun
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const synthesized_audio_base64 = await response.text();
      const audio = new Audio(`data:audio/wav;base64,${synthesized_audio_base64}`);
      audio.play();
    } catch (error) {
      console.error('播放方音差音頻失敗:', error);
    }
  };

  if (!isOpen) return null;

  // 確保方音差數據存在且格式正確
  const renderPronunDiffTable = () => {
    if (!pronun_diff || !Array.isArray(pronun_diff) || pronun_diff.length === 0) {
      console.log("無方音差數據或格式不正確");
      return null;
    }

    console.log("渲染方音差表格:", pronun_diff);

    return (
      <div className="pronun-diff-section">
        <div className="pronun-diff-container">
          <table className="pronun-diff-table">
            <thead>
              <tr>
                <th>單字方音差</th>
                <th>發音</th>
              </tr>
            </thead>
            <tbody>
              {pronun_diff.map((wordItem, wordIndex) => {
                if (!wordItem || !wordItem.pronounciations) {
                  console.log(`跳過無效的方音差項目 ${wordIndex}`);
                  return null;
                }

                // 獲取所有位置和發音
                const locations = Object.keys(wordItem.pronounciations || {});

                if (locations.length === 0) {
                  console.log(`項目 ${wordIndex} 無發音位置數據`);
                  return null;
                }

                // 在 renderPronunDiffTable 函數中修改位置名稱顯示
                return locations.map((location, index) => {
                  // 轉換方言代碼為顯示名稱
                  let locationName;
                  switch (location) {
                    case 'lokkang': locationName = '鹿港'; break;
                    case 'tailam': locationName = '台南'; break;
                    case 'taipak': locationName = '台北'; break;
                    default: locationName = location;
                  }

                  return (
                    <tr
                      key={`${wordItem.word}-${location}-${index}`}
                      className={
                        index === locations.length - 1 &&
                          wordIndex !== pronun_diff.length - 1 ?
                          'word-last-row' : ''
                      }
                    >
                      <td>
                        {wordItem.word} <span className="pronun-location-badge">{locationName}</span>
                      </td>
                      <td>
                        {wordItem.pronounciations[location]}
                        <img
                          src={megaphoneIcon}
                          className="pronun-speaker-icon"
                          onClick={() => playVariationAudio(wordItem.word, wordItem.pronounciations[location])}
                          alt="播放"
                        />
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
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
                  <img src={megaphoneIcon} alt="播放發音" />
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