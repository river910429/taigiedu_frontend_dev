import { useNavigate } from 'react-router-dom';
import './adminMain.css';
import bookIcon from '../assets/adminPage/book.svg';
import cloudIcon from '../assets/adminPage/cloudComputing.svg';
import houseIcon from '../assets/adminPage/house.svg';
import playIcon from '../assets/adminPage/playButton.svg';
import testIcon from '../assets/adminPage/test.svg';
import userIcon from '../assets/adminPage/userCircle.svg';
import shieldIcon from '../assets/adminPage/shield-exclamation.svg';

const AdminMain = () => {
  const functionGroups = [
    { title: "主頁搜尋",            icon: houseIcon,  functions: ["考試資訊", "活動快訊"],                                                                                     gridColumn: '1', gridRow: '1' },
    { title: "節慶飲食",            icon: bookIcon,   functions: ["飲食", "節慶"],                                                                                             gridColumn: '2', gridRow: '1' },
    { title: "台語教學資源共享平台", icon: cloudIcon,  functions: ["上傳項目", "編輯課本選單"],                                                                                 gridColumn: '3', gridRow: '1' },
    { title: "認證考試",            icon: testIcon,   functions: ["認證考試"],                                                                                                 gridColumn: '1', gridRow: '2' },
    { title: "媒體與社群資源",       icon: playIcon,   functions: ["工具", "百科", "各地教育機構", "社群", "Youtube", "Podcast", "遊戲", "卡通動漫", "音樂", "戲劇"],             gridColumn: '2', gridRow: '2' },
    { title: "會員",                icon: userIcon,   functions: ["會員管理"],                                                                                                 gridColumn: '3', gridRow: '2' },
    { title: "公告管理",            icon: shieldIcon, functions: ["一般公告", "停機公告"],                                                                                     gridColumn: '3', gridRow: '3' },
  ];

  const navigate = useNavigate();
  const routeMap = {
    "考試資訊": "/admin/main-search/test",
    "活動快訊": "/admin/main-search/news",
    "飲食": "/admin/culture/food",
    "節慶": "/admin/culture/festival",
    "上傳項目": "/admin/resource",
    "編輯課本選單": "/admin/resource/header",
    "工具": "/admin/socialmedia",
    "百科": "/admin/socialmedia",
    "各地教育機構": "/admin/socialmedia",
    "社群": "/admin/socialmedia",
    "Youtube": "/admin/socialmedia",
    "Podcast": "/admin/socialmedia",
    "遊戲": "/admin/socialmedia",
    "卡通動漫": "/admin/socialmedia",
    "音樂": "/admin/socialmedia",
    "戲劇": "/admin/socialmedia",
    "認證考試": "/admin/exam/info",
    "會員管理": "/admin/member",
    "一般公告": "/admin/announcement",
    "停機公告": "/admin/announcement",
  };

  const handleFunctionClick = (functionName) => {
    const path = routeMap[functionName];
    if (path && path !== "#") navigate(path);
    else if (path === "#") alert(`此功能尚未開放`);
    else alert(`未定義 ${functionName} 的路徑`);
  };

  return (
    <div className="admin-main-container">
      <div className="admin-header">
        <h1>後台管理</h1>
      </div>

      <div className="admin-content">
        <div className="function-grid" style={{ alignItems: 'start' }}>
          {functionGroups.map((group, index) => (
            <div
              key={index}
              className="function-card"
              style={{ gridColumn: group.gridColumn, gridRow: group.gridRow }}
            >
              <h3 className="card-title">{group.title}</h3>
              <div className="card-icon">
                <img src={group.icon} alt={`${group.title} icon`} />
              </div>
              <hr className="card-divider" />
              <div className="function-links">
                {group.functions.map((func, funcIndex) => (
                  <a
                    key={funcIndex}
                    href="#"
                    className="function-link"
                    onClick={(e) => { e.preventDefault(); handleFunctionClick(func); }}
                  >
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
