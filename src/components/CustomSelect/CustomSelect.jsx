import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';
import chevronUp from '../../assets/chevron-up.svg';

// 全站共用的客製化單選下拉選單（樣式參考臺語俗諺語「意涵分類」）
// options 可為字串陣列或 { value, label } 陣列
const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = '請選擇',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const items = options.map((opt) =>
        typeof opt === 'object' && opt !== null ? opt : { value: opt, label: opt }
    );
    const selectedItem = items.find((item) => item.value === value);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`custom-select ${className}`} ref={dropdownRef}>
            <button
                type="button"
                className={`custom-select-header ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`custom-select-value ${selectedItem ? '' : 'is-placeholder'}`}>
                    {selectedItem ? selectedItem.label : placeholder}
                </span>
                <img
                    src={chevronUp}
                    alt=""
                    className={`custom-select-arrow ${isOpen ? 'up' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="custom-select-options">
                    {items.map((item) => (
                        <div
                            key={item.value}
                            className={`custom-select-option ${item.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(item.value)}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
