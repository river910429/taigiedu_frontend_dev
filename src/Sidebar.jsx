import React, { useState,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(null); // 用於追蹤哪個選單被選取
  const navigate = useNavigate(); // 使用 React Router 的 navigate

  const menuItems = [
    { id: 1, label: "主頁搜尋", icon: "/src/assets/sidebar_icon/主頁.svg", path: "/" },
    { id: 2, label: "台語逐字稿", icon: "/src/assets/sidebar_icon/逐字稿.svg" , path: "/transcript"},
    { id: 3, label: "台語朗讀", icon: "/src/assets/sidebar_icon/朗讀.svg", path: "/read" },
    { id: 4, label: "台語文字轉換",icon: "/src/assets/sidebar_icon/文字轉換.svg", path: "/translate"},
    { id: 5, label: "台語教學資源共享平台",icon: "/src/assets/sidebar_icon/資源共享平台.svg",},
    { id: 6, label: "台語俗諺語", icon: "/src/assets/sidebar_icon/俗諺語.svg", path: "/phrase" },
    { id: 7, label: "台語名人堂", icon: "/src/assets/sidebar_icon/名人堂.svg", path: "/celebrity" },
    { id: 8, label: "台語文化", icon: "/src/assets/sidebar_icon/文化.svg" },
    { id: 9, label: "媒體與社群資源",icon: "/src/assets/sidebar_icon/媒體與社群資源.svg",},
    { id: 10, label: "認證考試",icon: "/src/assets/sidebar_icon/認證考試.svg",},
  ];

  const handleClick = (id, path) => {
    setActiveItem(id);
    navigate(path); // 進行頁面導航
  };

  useEffect(() => {
    handleClick(1,"/"); // 預設點擊 "主頁搜尋"
  }, []);


  return (
    <div className="sidebar">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`menu-item ${activeItem === item.id ? "active" : ""}`}
          onClick={() => handleClick(item.id, item.path)}
        >
          <img
            src={item.icon}
            alt={`${item.label} icon`}
            className={`menu-icon ${
              activeItem === item.id ? "active-icon" : ""}`}
          />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
