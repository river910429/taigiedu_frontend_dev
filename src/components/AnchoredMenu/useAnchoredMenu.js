import { useCallback, useEffect, useState } from 'react';

// 全站下拉選單的共用定位邏輯（以「認證考試」的 CustomSelect 為準）。
//
// 選單一律 portal 到 #root、用 position: fixed，座標每次都由 trigger 的
// getBoundingClientRect() 算出，因此：
//   1. 頁面捲動時選單跟著 trigger 走（不論篩選列是否為 sticky），不會與欄位分離
//   2. 下方空間不夠時自動往上開，左右也會夾在畫面內，不會超出畫面
//
// gap: trigger 與選單的間距
// maxHeight: 選單偏好的最大高度（實際會再依可用空間縮小）
// matchTriggerWidth: true = 選單寬度等於 trigger（單選/多選欄位）
//                    false = 由內容決定寬度，僅以 trigger 寬度為最小值（含飛出子選單的選單）
// clampHeight: false = 不限制高度、不加內部捲動（子選單靠 overflow 飛出時必須關閉）
const VIEWPORT_MARGIN = 8;
const MIN_MENU_HEIGHT = 160;

// 選單必須掛在 React 根節點內，掛到 document.body 會讓 React 事件（onClick）收不到。
export const getMenuPortalTarget = () => document.getElementById('root') || document.body;

const useAnchoredMenu = (triggerRef, isOpen, {
    gap = 4,
    maxHeight = 300,
    matchTriggerWidth = true,
    clampHeight = true,
} = {}) => {
    const [menuStyle, setMenuStyle] = useState(null);

    const updatePosition = useCallback(() => {
        const el = triggerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const spaceBelow = viewportHeight - rect.bottom - gap - VIEWPORT_MARGIN;
        const spaceAbove = rect.top - gap - VIEWPORT_MARGIN;
        // 下方放不下一個像樣的選單、且上方比較寬裕時才往上開
        const dropUp = spaceBelow < Math.min(maxHeight, MIN_MENU_HEIGHT) && spaceAbove > spaceBelow;
        // 一律夾在可用空間內（超過就靠選單自身的內部捲動），確保不會超出畫面
        const available = Math.max(dropUp ? spaceAbove : spaceBelow, 0);

        const width = Math.min(rect.width, viewportWidth - VIEWPORT_MARGIN * 2);
        const left = matchTriggerWidth
            ? Math.min(Math.max(VIEWPORT_MARGIN, rect.left), viewportWidth - VIEWPORT_MARGIN - width)
            : Math.max(VIEWPORT_MARGIN, Math.min(rect.left, viewportWidth - VIEWPORT_MARGIN - width));

        setMenuStyle({
            position: 'fixed',
            left,
            ...(dropUp
                ? { bottom: viewportHeight - rect.top + gap }
                : { top: rect.bottom + gap }),
            ...(matchTriggerWidth
                ? { width }
                : { minWidth: width, maxWidth: viewportWidth - left - VIEWPORT_MARGIN }),
            ...(clampHeight
                ? { maxHeight: Math.min(maxHeight, available), overflowY: 'auto' }
                : {}),
        });
    }, [triggerRef, gap, maxHeight, matchTriggerWidth, clampHeight]);

    // 開啟時跟著捲動／縮放重新定位（scroll 用 capture，才收得到內層容器的捲動）
    useEffect(() => {
        if (!isOpen) return undefined;
        updatePosition();
        const onReposition = () => updatePosition();
        window.addEventListener('scroll', onReposition, true);
        window.addEventListener('resize', onReposition);
        return () => {
            window.removeEventListener('scroll', onReposition, true);
            window.removeEventListener('resize', onReposition);
        };
    }, [isOpen, updatePosition]);

    return { menuStyle, updatePosition };
};

export default useAnchoredMenu;
