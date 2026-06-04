import React, { useEffect, useMemo, useState } from 'react';
import './OutageTopBanner.css';
import { subscribeOutage } from '../../services/outageService';

const LS_KEY = 'outage_banner_daily';
const PREVIEW_LEAD_MS = 7 * 24 * 60 * 60 * 1000;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function readDismissState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function shouldShow(outage, dismissState, now = new Date()) {
  if (!outage?.active) return false;
  const { startAt, endAt } = outage;
  if (!startAt || !endAt) return false;

  const t = now.getTime();
  const start = startAt.getTime();

  if (t < start - PREVIEW_LEAD_MS) return false;
  if (t >= start) return false;

  const dismissedToday =
    dismissState?.startAt === startAt.toISOString() &&
    dismissState?.date === todayStr();

  return !dismissedToday;
}

function formatPeriod(startAt, endAt) {
  if (!startAt || !endAt) return '';
  const fullFmt = new Intl.DateTimeFormat('zh-TW', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const timeFmt = new Intl.DateTimeFormat('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const sameDay =
    startAt.getFullYear() === endAt.getFullYear() &&
    startAt.getMonth() === endAt.getMonth() &&
    startAt.getDate() === endAt.getDate();
  return `${fullFmt.format(startAt)} － ${sameDay ? timeFmt.format(endAt) : fullFmt.format(endAt)}`;
}

const OutageTopBanner = () => {
  const [outage, setOutage] = useState(null);
  const [dismissState, setDismissState] = useState(() => readDismissState());

  useEffect(() => {
    return subscribeOutage(setOutage);
  }, []);

  const show = useMemo(() => shouldShow(outage, dismissState), [outage, dismissState]);

  if (!show) return null;

  const handleClose = () => {
    const next = { startAt: outage.startAt.toISOString(), date: todayStr() };
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setDismissState(next);
  };

  const period = formatPeriod(outage.startAt, outage.endAt);

  return (
    <div className="otb-banner" role="alert">
      <span className="otb-icon" aria-hidden="true">📢</span>
      <span className="otb-text">
        <strong>{outage.title || '【停電公告】'}</strong>
        {period && <span className="otb-period">　{period}</span>}
        {outage.content && <span>　{outage.content}</span>}
      </span>
      <button className="otb-close" onClick={handleClose} aria-label="關閉公告">✕</button>
    </div>
  );
};

export default OutageTopBanner;
