import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const bannerRef = useRef(null);

  useEffect(() => {
    return subscribeOutage(setOutage);
  }, []);

  const show = useMemo(() => shouldShow(outage, dismissState), [outage, dismissState]);

  // 將橫幅實際高度發佈成 --otb-height，供 Header/Sidebar/主內容計算偏移；
  // 橫幅文字在手機上會折行使高度變動，所以用 ResizeObserver 持續同步。
  useEffect(() => {
    const root = document.documentElement;
    const el = bannerRef.current;
    if (!show || !el) {
      root.style.setProperty('--otb-height', '0px');
      return undefined;
    }
    const update = () =>
      root.style.setProperty('--otb-height', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty('--otb-height', '0px');
    };
  }, [show]);

  if (!show) return null;

  const handleClose = () => {
    const next = { startAt: outage.startAt.toISOString(), date: todayStr() };
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setDismissState(next);
  };

  const period = formatPeriod(outage.startAt, outage.endAt);

  return (
    <div className="otb-banner" role="alert" ref={bannerRef}>
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
