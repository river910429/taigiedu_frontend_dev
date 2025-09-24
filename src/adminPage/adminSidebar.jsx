import React, { useState,useEffect  } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./adminSidebar.css";
import bookIcon from '../assets/adminPage/book.svg';
import cloudIcon from '../assets/adminPage/cloudComputing.svg';
import houseIcon from '../assets/adminPage/house.svg';
import playIcon from '../assets/adminPage/playButton.svg';
import testIcon from '../assets/adminPage/test.svg';
import userIcon from '../assets/adminPage/userCircle.svg';
import chevronUpIcon from "../assets/chevron-up.svg";

const AdminSidebar = () => {
  const basePath = import.meta.env.BASE_URL || '/';
  const [activeItem, setActiveItem] = useState(null); // 用於追蹤哪個選單被選取
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState({});
  const navigate = useNavigate(); // 使用 React Router 的 navigate
  const location = useLocation(); // 監聽當前路由變化

  const menuItems = [
    { id: 1, 
      label: "主頁搜尋", 
      icon: houseIcon,
      hasSubmenu: true,
      submenuItems: [
        { id: 'adminTestInfo', label: "考試資訊", path: "/admin/main-search/test" },
        { id: 'adminNewsInfo', label: "活動快訊", path: "/admin/main-search/news" }
      ]
    },
    { id: 2, 
      label: "台灣文化", 
      icon: bookIcon, 
      hasSubmenu: true,
      submenuItems: [
        { id: 'food', label: "飲食", path: "/admin/culture/food" },
        { id: 'festival', label: "節慶", path: "/admin/culture/festival" }
      ]
    },
    { id: 3, 
      label: "認證考試", 
      icon: testIcon, 
      hasSubmenu: true,
      submenuItems: [
        { id: 'adminExamInfo', label: "考試資訊", path: "/admin/exam/info" },
        { id: 'adminBooks', label: "推薦用書", path: "/admin/exam/books" },
        { id: 'adminChannels', label: "教育頻道", path: "/admin/exam/channels" },
      ]
    },
    { id: 4, label: "媒體與社群資源", icon: playIcon, path: "/admin/socialmedia" },
    { id: 5, 
      label: "台語教學資源共享平台", 
      icon: cloudIcon, 
      hasSubmenu: true,
      submenuItems: [
        { id: 'adminUploadManagement', label: "上傳項目管理", path: "/admin/resource/upload" },
        { id: 'adminBooks', label: "編輯課本選單", path: "/admin/resource/exam/books" },
      ]
    },
    { id: 6, label: "會員管理", icon: userIcon, path: "/admin/member" }
    ];

  // 當 URL 變更時，根據當前路徑來設定 activeItem
  useEffect(() => {
    const matchedItem = menuItems.find(item => item.path === location.pathname);
    if (matchedItem) {
      setActiveItem(matchedItem.id);
      setIsSubMenuOpen(matchedItem.hasSubmenu || false);
    } else {
      // 檢查是否為子選單
      const parentItem = menuItems.find(item => item.hasSubmenu && item.submenuItems.some(sub => sub.path === location.pathname));
      if (parentItem) {
        setActiveItem(parentItem.id);
        setIsSubMenuOpen(prev => ({ ...prev, [parentItem.id]: true }));
        setActiveSubItem(parentItem.submenuItems.find(sub => sub.path === location.pathname).id);
      } else {
        setActiveItem(null);
        setActiveSubItem(null);
      }
    }
  }, [location.pathname]); // 監聽 location.pathname 變化

   const handleClick = (id, path, hasSubmenu) => {
    if (hasSubmenu) {
      setIsSubMenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
      setActiveItem(id);
      setActiveSubItem(null);
    } else {
      setActiveItem(id);
      setActiveSubItem(null);
      navigate(path);
    }
  };

    const handleSubItemClick = (subItemId, path, parentId) => {
    setActiveSubItem(subItemId);
    setActiveItem(null);
    setIsSubMenuOpen(prev => ({ ...prev, [parentId]: true })); // Keep submenu open when submenu item is active
    navigate(path);
  };

  return (
    <div className="sidebar">
      {menuItems.map((item) => (
        <div key={item.id}>
          <button
            className={`menu-item ${activeItem === item.id ? "active" : ""}`}
            onClick={() => handleClick(item.id, item.path, item.hasSubmenu)}
          >
            <img
              src={item.icon}
              alt={`${item.label} icon`}
              className={`menu-icon ${activeItem === item.id ? "active-icon" : ""}`}
            />
            {item.label}
            {item.hasSubmenu && (
              <span className={`arrow ${isSubMenuOpen[item.id] ? 'up' : 'down'}`}>
              <img src={chevronUpIcon} />
            </span>
            )}
          </button>
          {item.hasSubmenu && isSubMenuOpen[item.id] && (
            <div className="submenu">
              {item.submenuItems.map((subItem) => (
                <div
                  key={subItem.id}
                  className={`submenu-item ${activeSubItem === subItem.id ? "active" : ""}`}
                  onClick={() => handleSubItemClick(subItem.id, subItem.path)}
                >
                  {subItem.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminSidebar;
