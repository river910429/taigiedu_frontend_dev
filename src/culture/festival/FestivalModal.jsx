import React from 'react';
import { UnifiedModal, InfoRow } from '../../components/UnifiedModal/UnifiedModal';
import megaPhoneIcon from '../../assets/megaphone.svg';
import nofestival from "../../assets/culture/festivalN.png";
import { resolveFileUrl } from '../../services/uploadService';
import './FestivalModal.css';

const getFullAudioUrl = (path, type) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }
    
    const cleanPath = path.trim().replace(/\s/g, '');
    if (cleanPath.length > 100 && /^[A-Za-z0-9+/=]+$/.test(cleanPath)) {
        let mimeType = 'webm';
        if (cleanPath.startsWith('GkXf')) {
            mimeType = 'webm';
        } else if (cleanPath.startsWith('UklG')) {
            mimeType = 'wav';
        } else if (cleanPath.startsWith('SUQz') || cleanPath.startsWith('//O') || cleanPath.startsWith('//M')) {
            mimeType = 'mpeg';
        }
        return `data:audio/${mimeType};base64,${cleanPath}`;
    }
    
    if (path.includes('/')) {
        return resolveFileUrl(path);
    }
    
    const filename = path.split('/').filter(Boolean).pop();
    const apiUrl = import.meta.env.VITE_API_URL || '/backend';
    return `${apiUrl}/static/${type}/${filename}`;
};

const FestivalModal = ({ isOpen, onClose, festival }) => {
    if (!isOpen || !festival) return null;

    const playAudio = async () => {
        try {
            if (festival.audio_data) {
                const url = getFullAudioUrl(festival.audio_data, 'festival');
                if (url) {
                    const audio = new Audio(url);
                    await audio.play();
                    return;
                }
            }

            const parameters = {
                tts_lang: 'tb',
                tts_data: festival.pron || festival.name
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/synthesize_speech`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parameters)
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const audioBase64 = await response.text();
            const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
            await audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    return (
        <UnifiedModal isOpen={isOpen} onClose={onClose} className="festival-modal">
            <div className="festival-header-container">
                <div className="festival-image-container">
                    <img
                        className="festival-modal-image"
                        src={festival.image}
                        alt={festival.name}
                        onError={(e) => { e.target.src = nofestival; }}
                    />
                </div>
                <div className="festival-header-content">
                    <h2 className="festival-modal-name">{festival.name}</h2>
                    <div className="festival-pronunciation-container">
                        <div className="festival-pron-text">{festival.pron}</div>
                        <button
                            className="festival-play-btn"
                            onClick={playAudio}
                        >
                            <img src={megaPhoneIcon} alt="播放" style={{ width: '24px' }} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="festival-modal-body">
                <InfoRow label="華文釋義">
                    {festival.intro}
                </InfoRow>

                {festival.intro_taigi && festival.intro_taigi.trim() !== "" && (
                    <InfoRow label="台語釋義">
                        {festival.intro_taigi}
                    </InfoRow>
                )}

                {festival.author && (
                    <div style={{ textAlign: 'right', marginTop: '20px', color: '#666', fontSize: '14px' }}>
                        資料來源：{festival.author}
                    </div>
                )}
            </div>
        </UnifiedModal>
    );
};

export default FestivalModal;