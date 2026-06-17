import { useState } from 'react';
import './ServiceSuspensionNotice.css';
import blackboardBg from '../../assets/blackboard.png';
import bearGif from '../../assets/bear1.gif';

const LS_KEY = 'gan_dismissed_v1';

// Mock 目前上架中的一般公告（相對時間，確保 demo 期間永遠顯示）
const _now = new Date();
const MOCK_ANNOUNCEMENT = {
  id: 1,
  title: '網站功能更新通知',
  content: '本站已新增台語拼音搜尋功能，歡迎使用者多加利用。',
  startAt: new Date(_now.getTime() - 7 * 24 * 60 * 60 * 1000),
  endAt: new Date(_now.getTime() + 30 * 24 * 60 * 60 * 1000),
};

function isActive(ann) {
  const now = new Date();
  return now >= ann.startAt && now <= ann.endAt;
}

function getDismissKey(ann) {
  return `${ann.id}_${ann.startAt.toISOString()}`;
}

function isDismissed(ann) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const state = raw ? JSON.parse(raw) : {};
    return !!state[getDismissKey(ann)];
  } catch { return false; }
}

function setDismissed(ann) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const state = raw ? JSON.parse(raw) : {};
    state[getDismissKey(ann)] = true;
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const GeneralAnnouncementModal = () => {
  const ann = MOCK_ANNOUNCEMENT;
  const [visible, setVisible] = useState(() => isActive(ann) && !isDismissed(ann));

  if (!visible) return null;

  const handleClose = () => {
    setDismissed(ann);
    setVisible(false);
  };

  return (
    <div className="ssn-overlay" onClick={handleClose}>
      <div
        className="ssn-card"
        style={{
          backgroundImage: `url(${blackboardBg})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="ssn-header">
          <h2 className="ssn-title">{ann.title}</h2>
          <button className="ssn-close-btn" onClick={handleClose} aria-label="關閉">
            <CloseIcon />
          </button>
        </div>

        <div className="ssn-body">
          <div className="ssn-text-section">
            <p className="ssn-description">{ann.content}</p>
            <p className="ssn-signature">「Tshuì 水」團隊</p>
          </div>

          <div className="ssn-icon-section">
            <img src={bearGif} className="ssn-bear-icon" alt="bear" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralAnnouncementModal;
