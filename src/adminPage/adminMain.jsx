import React from 'react';
import './adminMain.css';
import bookIcon from '../assets/adminPage/book.svg';
import cloudIcon from '../assets/adminPage/cloudComputing.svg';
import houseIcon from '../assets/adminPage/house.svg';
import playIcon from '../assets/adminPage/playButton.svg';
import testIcon from '../assets/adminPage/test.svg';
import userIcon from '../assets/adminPage/userCircle.svg';

const AdminMain = () => {
  const functionGroups = [
    {
      title: "主頁搜尋",
      icon: houseIcon,
      functions: ["考試資訊", "最新消息"]
    },
    {
      title: "台灣文化",
      icon: bookIcon,
      functions: ["飲食", "節慶"]
    },
    {
      title: "台語教學資源共享平台",
      icon: cloudIcon,
      functions: ["上傳項目", "編輯課本清單"]
    },
    {
      title: "認證考試",
      icon: testIcon,
      functions: ["考試資訊", "推薦用書", "教育頻道"]
    },
    {
      title: "媒體與社群資源",
      icon: playIcon,
      functions: ["工具", "百科", "各地教育機構", "社群", "Youtube", "Podcast", "遊戲", "卡通動漫", "音樂", "戲劇"]
    },
    {
      title: "會員",
      icon: userIcon,
      functions: ["暫無內容"]
    }
  ];

  return (
    <div className="admin-main-container">
      <div className="admin-header">
        <h1>後台管理</h1>
      </div>
      
      <div className="admin-content">
        <div className="function-grid">
          {functionGroups.map((group, index) => (
            <div key={index} className="function-card">
              <h3 className="card-title">{group.title}</h3>
              <div className="card-icon">
                <img src={group.icon} alt={`${group.title} icon`} />
              </div>
              <hr className="card-divider" />
              <div className="function-links">
                {group.functions.map((func, funcIndex) => (
                  <a key={funcIndex} href="#" className="function-link">
                    {func}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMain;
