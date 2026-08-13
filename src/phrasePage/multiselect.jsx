import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './multiselect.css';
import useAnchoredMenu, { getMenuPortalTarget } from '../components/AnchoredMenu/useAnchoredMenu';
import chevonUp from '../assets/chevron-up.svg';

// 選單以 portal 掛到 #root、由 useAnchoredMenu 以 trigger 為基準做 fixed 定位，
// 與 CustomSelect（認證考試）同一套：捲動時跟著欄位走，且不會超出畫面。
const MultiSelect = ({
  options,
  selectedOptions,
  onChange,
  placeholder = "請選擇...",
  displayText = "請選擇"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedOptions || []);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const { menuStyle, updatePosition } = useAnchoredMenu(dropdownRef, isOpen);

  // 當 selectedOptions 或 options 變更時，同步更新內部 selected 狀態
  useEffect(() => {
    // 確保外部傳入的 selectedOptions 被正確反映在內部狀態中
    if (selectedOptions) {
      setSelected(selectedOptions);
    }
  }, [selectedOptions, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // 選單已 portal 到 #root，觸發器與選單都要排除
      if (dropdownRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 新增全選功能
  const handleSelectAll = () => {
    if (selected.length === options.length) {
      // 如果全部都選了，就全部取消
      setSelected([]);
      onChange([]);
    } else {
      // 否則全選
      setSelected([...options]);
      onChange([...options]);
    }
  };

  const handleOptionClick = (option) => {
    let newSelected;
    if (selected.includes(option)) {
      newSelected = selected.filter(item => item !== option);
    } else {
      newSelected = [...selected, option];
    }
    setSelected(newSelected);
    onChange(newSelected);
  };

  return (
    <div className="multi-select" ref={dropdownRef}>
      <div
        className={`select-header ${isOpen ? 'active' : ''}`}
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen(!isOpen);
        }}
      >
        <div className="selected-options">
          {selected.length > 0 ? (
            <span className="display-text">{displayText} ({selected.length})</span>
          ) : (
            <span className="select-placeholder">{placeholder}</span>
          )}
        </div>
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}><img src={chevonUp} /></span>
      </div>
      
      {isOpen && menuStyle && createPortal(
        <div className="options-container" ref={menuRef} style={menuStyle}>
          {/* 加入全選選項 */}
          <div
            className={`option ${selected.length === options.length && options.length > 0 ? 'selected' : ''}`}
            onClick={handleSelectAll}
          >
            <span 
              className={`checkbox ${selected.length === options.length && options.length > 0 ? 'checked' : ''}`}
            >
              {selected.length === options.length && options.length > 0 && '✓'}
            </span>
            全選
          </div>
          {/* 分隔線 */}
          <div className="divider"></div>
          {options.map(option => {
            const isSelected = selected.includes(option);
            return (
              <div
                key={option}
                className={`option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                <span 
                  className={`checkbox ${isSelected ? 'checked' : ''}`}
                >
                  {isSelected && '✓'}
                </span>
                <span>{option}</span>
              </div>
            );
          })}
        </div>,
        getMenuPortalTarget()
      )}
    </div>
  );
};

export default MultiSelect;