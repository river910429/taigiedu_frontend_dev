import React, { useState,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(null); // 用於追蹤哪個選單被選取
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const navigate = useNavigate(); // 使用 React Router 的 navigate

  const menuItems = [
    { id: 1, label: "主頁搜尋", icon: "/src/assets/sidebar_icon/主頁.svg", path: "/" },
    { id: 2, label: "台語逐字稿", icon: "/src/assets/sidebar_icon/逐字稿.svg" , path: "/transcript"},
    { id: 3, label: "台語朗讀", icon: "/src/assets/sidebar_icon/朗讀.svg", path: "/read" },
    { id: 4, label: "台語文字轉換",icon: "/src/assets/sidebar_icon/文字轉換.svg", path: "/translate"},
    { id: 5, label: "台語教學資源共享平台",icon: "/src/assets/sidebar_icon/資源共享平台.svg", path: "/resource"},
    { id: 6, label: "台語俗諺語", icon: "/src/assets/sidebar_icon/俗諺語.svg", path: "/phrase" },
    { id: 7, label: "台語名人堂", icon: "/src/assets/sidebar_icon/名人堂.svg", path: "/celebrity" },
    { 
      id: 8, 
      label: "台語文化", 
      icon: "/src/assets/sidebar_icon/文化.svg",
      hasSubmenu: true,
      submenuItems: [
        { id: 'food', label: "飲食", path: "/culture/food" },
        { id: 'festival', label: "節慶", path: "/culture/festival" }
      ]
    },
    { id: 9, label: "媒體與社群資源",icon: "/src/assets/sidebar_icon/媒體與社群資源.svg", path: "/socialmedia" },
    { id: 10, label: "認證考試",icon: "/src/assets/sidebar_icon/認證考試.svg", path: "/exam" },
  ];

  useEffect(() => {
    // Close submenu if active item is not a culture submenu item
    if (activeItem !== 8 && !activeSubItem) {
      setIsSubMenuOpen(false);
    }
  }, [activeItem, activeSubItem]);

   const handleClick = (id, path, hasSubmenu) => {
    if (hasSubmenu) {
      setIsSubMenuOpen(!isSubMenuOpen);
      setActiveItem(id);
      setActiveSubItem(null);
    } else {
      setActiveItem(id);
      setActiveSubItem(null);
      navigate(path);
    }
  };

    const handleSubItemClick = (subItemId, path) => {
    setActiveSubItem(subItemId);
    setActiveItem(null);
    setIsSubMenuOpen(true); // Keep submenu open when submenu item is active
    navigate(path);
  };

  useEffect(() => {
    handleClick(1,"/"); // 預設點擊 "主頁搜尋"
  }, []);


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
              <span className={`arrow ${isSubMenuOpen ? 'up' : 'down'}`}>
              <img src="/src/assets/chevron-up.svg" />
            </span>
            )}
          </button>
          {item.hasSubmenu && isSubMenuOpen && (
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

export default Sidebar;
