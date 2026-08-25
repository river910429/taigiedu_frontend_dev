import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import envConfig from '../config';
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
  // 台語文化與其路由同受 VITE_ENABLE_CULTURE_TEST_FEATURE 控制，
  // 沒有一起擋的話關閉時卡片還在，點了會被路由導回本頁，看起來像沒反應
  const isCultureTestFeatureEnabled = envConfig.features.enableCultureTestFeature;
  const isOccupationTestFeatureEnabled = envConfig.features.enableOccupationTestFeature;

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
    // 項目為前台篩選第一層（＝來源表第二層），需與 services/cultureTestMockApi.js 的 CATEGORY_TREE 一致
    {
      title: "台語文化（test）",
      icon: bookIcon,
      functions: ["戲曲", "祭典", "傳統工藝", "地方/產業"],
      // 這些項目會帶 ?category= 進入台語文化管理頁並自動套用篩選
      cultureTestCategories: true,
      requireCultureTestFeature: true,
    },
    // 項目為前台的分類下拉選項，需與 services/occupationTestMockApi.js 的 CATEGORY_OPTIONS 一致
    {
      title: "職業台語（test）",
      icon: cloudIcon,
      functions: ["醫療長照", "行業台語"],
      // 這些項目會帶 ?category= 進入職業台語管理頁並自動套用篩選
      occupationTestCategories: true,
      requireOccupationTestFeature: true,
    },
  ];

  const functionGroups = allFunctionGroups.filter(group => {
    if (group.requireSystemManager && !canManageAnnouncement) return false;
    if (group.requireCultureTestFeature && !isCultureTestFeatureEnabled) return false;
    if (group.requireOccupationTestFeature && !isOccupationTestFeatureEnabled) return false;
    return true;
  });

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
    // 台語文化（test）：同樣帶類別參數進入管理頁
    if (group.cultureTestCategories) {
      navigate(`/admin/culture-test?category=${encodeURIComponent(functionName)}`);
      return;
    }
    // 職業台語（test）：同樣帶類別參數進入管理頁
    if (group.occupationTestCategories) {
      navigate(`/admin/occupation-test?category=${encodeURIComponent(functionName)}`);
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
