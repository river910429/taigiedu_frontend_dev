import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import './DatePicker.css';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const WEEKDAY_DISPLAY = ['(週日)', '(週一)', '(週二)', '(週三)', '(週四)', '(週五)', '(週六)'];
const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

function pad2(n) { return String(n).padStart(2, '0'); }

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('/').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${dateStr} ${WEEKDAY_DISPLAY[dow]}`;
}

const DatePicker = ({ value, onChange, disabled = false, placeholder = '選擇日期', minDate = null }) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const parts = value.split('/').map(Number);
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1] - 1);
      }
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const handleDateClick = useCallback((y, m, d) => {
    const ds = `${y}/${pad2(m)}/${pad2(d)}`;
    onChange(ds);
    setOpen(false);
  }, [onChange]);

  const prevMonth = (e) => {
    e.stopPropagation();
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const todayStr = `${today.getFullYear()}/${pad2(today.getMonth() + 1)}/${pad2(today.getDate())}`;
  const firstDOW = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDOW - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, type: 'other' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}/${pad2(month + 1)}/${pad2(d)}`;
    const isDisabled = minDate ? ds < minDate : false;
    cells.push({ day: d, type: 'current', ds, isSelected: ds === value, isToday: ds === todayStr, isDisabled });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, type: 'other' });
  }

  return (
    <div className="dp-container" ref={containerRef}>
      <button
        type="button"
        className={`dp-trigger${disabled ? ' dp-disabled' : ''}${value ? ' dp-has-value' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        {value ? formatDateDisplay(value) : placeholder}
      </button>
      {open && !disabled && (
        <div className="dp-popup">
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth}>‹</button>
            <span className="dp-month-label">{year}年{MONTH_NAMES[month]}</span>
            <button type="button" className="dp-nav" onClick={nextMonth}>›</button>
          </div>
          <div className="dp-grid">
            {WEEKDAYS.map(wd => (
              <div key={wd} className="dp-weekday">{wd}</div>
            ))}
            {cells.map((cell, idx) => (
              <div
                key={idx}
                className={[
                  'dp-day',
                  cell.type === 'other' ? 'dp-day-other' : '',
                  cell.isDisabled ? 'dp-day-disabled' : '',
                  cell.isSelected ? 'dp-day-selected' : '',
                  cell.isToday ? 'dp-day-today' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => cell.type === 'current' && !cell.isDisabled && handleDateClick(year, month + 1, cell.day)}
              >
                {cell.day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

DatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  minDate: PropTypes.string,
};

export default DatePicker;
