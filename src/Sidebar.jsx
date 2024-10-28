import React, { useState } from 'react';
import './Sidebar.css'; 

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(null); // 用於追蹤哪個選單被選取

  const menuItems = [
    { id: 1, label: '主頁搜尋', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 2, label: '台語逐字稿', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 3, label: '台語朗讀', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 4, label: '台語文字轉換', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 5, label: '台語教學資源共享平台', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 6, label: '台語俗諺語', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 7, label: '台語名人堂', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 8, label: '台語文化', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 9, label: '媒體與社群', icon: '/src/assets/sidebar_icon/home.svg' },
    { id: 10, label: '認證考試', icon: '/src/assets/sidebar_icon/home.svg' },
  ];

  const handleClick = (id) => {
    setActiveItem(id); 
  };

  return (
    <div className="sidebar">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
          onClick={() => handleClick(item.id)}
        >
          <img src={item.icon} alt={`${item.label} icon`} className="menu-icon" />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;