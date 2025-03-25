import React, { useState, useRef, useEffect } from 'react';
import './multiselect.css';

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

  // 當 selectedOptions 或 options 變更時，同步更新內部 selected 狀態
  useEffect(() => {
    // 確保外部傳入的 selectedOptions 被正確反映在內部狀態中
    if (selectedOptions) {
      setSelected(selectedOptions);
    }
  }, [selectedOptions, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
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
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-options">
          {selected.length > 0 ? (
            <span className="display-text">{displayText} ({selected.length})</span>
          ) : (
            <span className="select-placeholder">{placeholder}</span>
          )}
        </div>
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}><img src="src/assets/chevron-up.svg" /></span>
      </div>
      
      {isOpen && (
        <div className="options-container">
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
        </div>
      )}
    </div>
  );
};

export default MultiSelect;