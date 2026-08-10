import { useEffect, useRef, useState } from 'react';
import { flattenSelection, expandSelection } from './categorySelection';
import './CategoryFilterSheet.css';

/**
 * 手機版分類篩選 bottom sheet（共用元件）
 *
 * 桌機的下拉選單與這個面板是兩套 UI，由呼叫端用 useIsMobile 擇一渲染，
 * 因為兩者的選取行為不同：桌機點了即時套用，這裡要按「確認」才套用。
 *
 * props
 *   open      是否開啟（呼叫端需自行確保只在手機版傳 true）
 *   groups    [{ name, label, subs: string[] }]
 *             name = 實際的第一層 key（可能是空字串）、label = 顯示文字、
 *             subs = 第二層清單；subs 為空代表這個第一層本身就是可勾選的末端項目
 *   value     已套用的選擇，格式 { 第一層: [第二層, ...] }
 *   onConfirm 按「確認」時呼叫，帶入新的選擇物件
 *   onDismiss 取消（點遮罩／下滑手勢）時呼叫
 */

// 下滑超過這個距離放開就關閉
const CLOSE_DRAG_PX = 80;

const CategoryFilterSheet = ({ open, groups = [], value = {}, onConfirm, onDismiss }) => {
  const [draft, setDraft] = useState({});
  const [dragOffset, setDragOffset] = useState(0);

  const bodyRef = useRef(null);
  const handleRef = useRef(null);
  const dragStartY = useRef(null);

  // 每次開啟都以目前已套用的選擇為起點
  useEffect(() => {
    if (!open) return;
    setDraft(expandSelection(groups, value));
    setDragOffset(0);
    dragStartY.current = null;
    // 只在開關切換時重設，開啟期間外部 value 變動不應蓋掉 draft
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 開啟期間鎖住底層捲動
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open) return null;

  const selectedNames = flattenSelection(groups, draft);
  const selectedCount = selectedNames.length;

  const toggleLeaf = (name) => {
    setDraft(prev => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      else next[name] = [];
      return next;
    });
  };

  const toggleSub = (name, sub) => {
    setDraft(prev => {
      const next = { ...prev };
      const current = next[name] || [];
      const updated = current.includes(sub)
        ? current.filter(item => item !== sub)
        : [...current, sub];
      if (updated.length === 0) delete next[name];
      else next[name] = updated;
      return next;
    });
  };

  // ---- 下滑關閉手勢 ----
  const handleTouchStart = (event) => {
    const startedOnHandle = handleRef.current?.contains(event.target);
    const bodyAtTop = (bodyRef.current?.scrollTop ?? 0) <= 0;
    // 只有從把手拖曳、或內容已捲到頂端時才接手，避免和內容捲動打架
    if (!startedOnHandle && !bodyAtTop) {
      dragStartY.current = null;
      return;
    }
    dragStartY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event) => {
    if (dragStartY.current === null) return;
    const delta = event.touches[0].clientY - dragStartY.current;
    setDragOffset(delta > 0 ? delta : 0);
  };

  const handleTouchEnd = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    if (dragOffset > CLOSE_DRAG_PX) onDismiss?.();
    else setDragOffset(0);
  };

  const renderOption = (key, label, checked, onToggle) => (
    <button
      key={key}
      type="button"
      className={`cfs-option ${checked ? 'is-checked' : ''}`}
      aria-pressed={checked}
      onClick={onToggle}
    >
      <span className="cfs-check" aria-hidden="true" />
      <span className="cfs-option-label">{label}</span>
    </button>
  );

  return (
    <div className="cfs-overlay" role="presentation" onClick={() => onDismiss?.()}>
      <div
        className={`cfs-sheet ${dragOffset > 0 ? 'is-dragging' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="選擇分類"
        style={dragOffset > 0 ? { transform: `translateY(${dragOffset}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* 把手：可下滑關閉 */}
        <div className="cfs-handle" ref={handleRef}>
          <span className="cfs-grabber" />
        </div>

        {/* 可捲動的選項區 */}
        <div className="cfs-body" ref={bodyRef}>
          {groups.map(({ name, label, subs }) => {
            // 無第二層：第一層本身就是可勾選項目
            if (subs.length === 0) {
              return renderOption(
                name || label,
                label,
                Boolean(draft[name]),
                () => toggleLeaf(name)
              );
            }

            return (
              <div key={name || label} className="cfs-group">
                {/* 父分類為不可選標題 */}
                <div className="cfs-group-title">{label}</div>
                {subs.map(sub =>
                  renderOption(
                    `${name}-${sub}`,
                    sub,
                    (draft[name] || []).includes(sub),
                    () => toggleSub(name, sub)
                  )
                )}
              </div>
            );
          })}
        </div>

        {/* 固定底部操作列 */}
        <div className="cfs-footer">
          <button
            type="button"
            className="cfs-clear"
            disabled={selectedCount === 0}
            onClick={() => setDraft({})}
          >
            清除
          </button>
          <button
            type="button"
            className="cfs-confirm"
            disabled={selectedCount === 0}
            onClick={() => onConfirm?.(draft)}
          >
            {selectedCount > 0 ? `確認（${selectedCount}）` : '確認'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterSheet;
