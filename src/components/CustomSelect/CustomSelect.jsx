import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './CustomSelect.css';
import useAnchoredMenu, { getMenuPortalTarget } from '../AnchoredMenu/useAnchoredMenu';
import chevronUp from '../../assets/chevron-up.svg';

// 全站共用的客製化單選下拉選單（樣式參考臺語俗諺語「意涵分類」）
// options 可為字串陣列或 { value, label } 陣列
// size：'md'（前台預設，48px）｜'sm'（後台篩選器／表單，38px）
// 選單以 portal 掛到 App 根節點（#root），避免被 Modal（overflow: auto）或表格容器裁切；
// 定位交給 useAnchoredMenu：跟著 trigger 捲動、空間不足時翻轉並夾在畫面內。
const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = '請選擇',
    className = '',
    size = 'md',
    disabled = false,
    id,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const { menuStyle, updatePosition } = useAnchoredMenu(dropdownRef, isOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current?.contains(event.target)) return;
            if (menuRef.current?.contains(event.target)) return;
            setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 停用時強制收合，避免選單留在展開狀態
    useEffect(() => {
        if (disabled) setIsOpen(false);
    }, [disabled]);

    const items = options.map((opt) =>
        typeof opt === 'object' && opt !== null ? opt : { value: opt, label: opt }
    );
    const selectedItem = items.find((item) => item.value === value);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (disabled) return;
        if (!isOpen) updatePosition();
        setIsOpen(!isOpen);
    };

    return (
        <div
            className={`custom-select ${size === 'sm' ? 'custom-select-sm' : ''} ${className}`}
            ref={dropdownRef}
        >
            <button
                type="button"
                id={id}
                className={`custom-select-header ${isOpen ? 'open' : ''}`}
                onClick={handleToggle}
                disabled={disabled}
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

            {isOpen && menuStyle && createPortal(
                <div
                    ref={menuRef}
                    className={`custom-select-options ${size === 'sm' ? 'custom-select-options-sm' : ''}`}
                    style={menuStyle}
                >
                    {items.map((item) => (
                        <div
                            key={item.value}
                            className={`custom-select-option ${item.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(item.value)}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>,
                getMenuPortalTarget()
            )}
        </div>
    );
};

CustomSelect.propTypes = {
    options: PropTypes.array,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md']),
    disabled: PropTypes.bool,
    id: PropTypes.string,
};

export default CustomSelect;
