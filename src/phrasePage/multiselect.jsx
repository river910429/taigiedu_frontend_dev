import React, { useState } from 'react';
import './MultiSelect.css';

const MultiSelect = () => {
  const options = [
    { id: 1, label: '選項 1' },
    { id: 2, label: '選項 2' },
    { id: 3, label: '選項 3' },
    { id: 4, label: '選項 4' },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === options.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(options.map(option => option.id));
    }
  };

  return (
    <div className="multi-select">
      <div className="select-header" onClick={handleToggleDropdown}>
        {selectedItems.length === 0 ? '請選擇' : `已選擇 ${selectedItems.length} 項`}
      </div>
      
      {isOpen && (
        <div className="options-container">
          <div className="option" onClick={handleSelectAll}>
            <input
              type="checkbox"
              checked={selectedItems.length === options.length}
              readOnly
            />
            <span>全選</span>
          </div>
          
          {options.map(option => (
            <div
              key={option.id}
              className="option"
              onClick={() => handleSelectItem(option.id)}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(option.id)}
                readOnly
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
