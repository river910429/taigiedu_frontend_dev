import { useEffect, useState } from 'react';

export const MOBILE_QUERY = '(max-width: 768px)';

/**
 * 是否為手機版寬度。
 *
 * 用 matchMedia 而不是純 CSS 切換，是因為分類篩選在桌機（下拉、即時套用）
 * 與手機（bottom sheet、按確認才套用）是行為不同的兩套 UI，
 * 同時渲染兩份會讓它們共用同一份 state。
 */
const useIsMobile = (query = MOBILE_QUERY) => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handleChange = (event) => setIsMobile(event.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [query]);

  return isMobile;
};

export default useIsMobile;
