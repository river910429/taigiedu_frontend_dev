import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './adminMain.css';
import bookIcon from '../assets/adminPage/book.svg';
import cloudIcon from '../assets/adminPage/cloudComputing.svg';
import houseIcon from '../assets/adminPage/house.svg';
import playIcon from '../assets/adminPage/playButton.svg';
import testIcon from '../assets/adminPage/test.svg';
import userIcon from '../assets/adminPage/userCircle.svg';
import shieldIcon from '../assets/adminPage/shield-exclamation.svg';

const AdminMain = () => {
  const { isSuperAdmin } = useAuth();
  // 公告管理（Popup 公告）僅系統管理員可見
  const canManageAnnouncement = isSuperAdmin();

  // 排列順序即卡片在 3 欄格線中的位置：
  // 第一列刻意放三張「兩個項目」的卡片，讓高度自然對齊
  const allFunctionGroups = [
    { title: "主頁搜尋",            icon: houseIcon,  functions: ["考試資訊", "活動快訊"] },
    { title: "節慶飲食",            icon: bookIcon,   functions: ["飲食", "節慶"] },
    { title: "公告管理",            icon: shieldIcon, functions: ["一般公告", "停機公告"], requireSystemManager: true },
    { title: "台語教學資源共享平台", icon: cloudIcon,  functions: ["上傳項目", "編輯課本選單"] },
    { title: "會員",                icon: userIcon,   functions: ["會員管理"] },
    { title: "認證考試",            icon: testIcon,   functions: ["認證考試"] },
    // 類別需與 /media API 實際存在的類別一致（後台 /admin/socialmedia 的下拉選單同樣由資料動態產生）
    {
      title: "媒體與社群資源",
      icon: playIcon,
      functions: ["Podcast", "Youtube", "卡通動漫", "工具", "百科", "教育機構", "綜合資料網站", "社群", "遊戲", "音樂", "戲劇", "醫病長照機構", "文化機構"],
      twoColumnLinks: true,
      // 這些項目會帶 ?category= 進入媒體與社群資源管理頁並自動套用篩選
      socialmediaCategories: true,
    },
  ];

  const functionGroups = allFunctionGroups.filter(
    group => !group.requireSystemManager || canManageAnnouncement
  );

  const navigate = useNavigate();
  const routeMap = {
    "考試資訊": "/admin/main-search/test",
    "活動快訊": "/admin/main-search/news",
    "飲食": "/admin/culture/food",
    "節慶": "/admin/culture/festival",
    "上傳項目": "/admin/resource",
    "編輯課本選單": "/admin/resource/header",
    "認證考試": "/admin/exam/info",
    "會員管理": "/admin/member",
    "一般公告": "/admin/announcement",
    "停機公告": "/admin/announcement",
  };

  const handleFunctionClick = (group, functionName) => {
    // 媒體與社群資源：帶類別參數進入管理頁，該頁會自動套用下拉選單篩選
    if (group.socialmediaCategories) {
      navigate(`/admin/socialmedia?category=${encodeURIComponent(functionName)}`);
      return;
    }
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
        <div className="function-grid">
          {functionGroups.map((group, index) => (
            <div
              key={index}
              className="function-card"
            >
              <h3 className="card-title">{group.title}</h3>
              <div className="card-icon">
                <img src={group.icon} alt={`${group.title} icon`} />
              </div>
              <hr className="card-divider" />
              <div className={`function-links${group.twoColumnLinks ? ' function-links-2col' : ''}`}>
                {group.functions.map((func, funcIndex) => (
                  <a
                    key={funcIndex}
                    href="#"
                    className="function-link"
                    onClick={(e) => { e.preventDefault(); handleFunctionClick(group, func); }}
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
