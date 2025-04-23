import React, { useState } from 'react';
import './SocialmediaPage.css';
import searchIcon from '../assets/home/search_logo.svg';
import chevronUp from '../assets/chevron-up.svg';
import questionMarkIcon from '../assets/question-mark.svg';

const SocialmediaPage = () => {
    const [selectedType, setSelectedType] = useState("分類");  // 將 "類型" 改為 "分類"
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [query, setQuery] = useState("");
    
    // 儲存多選項目，格式為 { 主分類: [子項目1, 子項目2, ...] }
    const [selectedItems, setSelectedItems] = useState({});
    
    const menuItems = {
        '社群': {
            hasSubMenu: true,
            subItems: [
              '文學文化', '民俗', '生態', '在地地景與人物',
              '宗教', '新聞', '講古', '考古', '教育',
              '技藝', '歌仔戲', '活動', '科學', '物理',
              '美食', '旅遊', '笑詼', '唸歌', '教材',
              '親子', '訪談', '部落格','野球', '電影',
              '歌詞', '認證考試', '廣播', '鄭順聰', '演講','醫學'
            ]},
        'YouTube': {
            hasSubMenu: true,
            subItems: [
                '文學文化', '教育', '台語漫才', '在地地景與人物',
                '宗教', '講古', '藝術', '笑詼', '訪談',
                '新聞', '演講朗讀', '廣播',
            ]
        },
        'Podcast': {
            hasSubMenu: false
        },
        '電視綜藝': {
            hasSubMenu: false
        }
    };
    
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.social-custom-dropdown')) {
                setIsDropdownOpen(false);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // 處理多選邏輯
const handleTypeChange = (type, subType = null) => {
  console.log('Before change:', { selectedType, selectedItems });
  
  if (!subType) {
    // 如果是無子選單的主類別，直接選擇
    if (!menuItems[type].hasSubMenu) {
      setSelectedType(type);
      // 清空已選擇的項目
      setSelectedItems({});
      setIsDropdownOpen(false);
    } else {
      // 有子選單的主類別，不做選擇，只是顯示該類別，保持下拉選單開啟
      setSelectedType(type);
    }
  } else {
    // 子選單項目處理 - 直接更新顯示和選項，不使用巢狀 setTimeout
    const newSelectedItems = { ...selectedItems };
    
    // 如果選擇的是新的主類別，先清空之前的選擇
    if (Object.keys(newSelectedItems).length > 0 && !(type in newSelectedItems)) {
      // 完全重置選項
      setSelectedItems({ [type]: [subType] });
      setSelectedType(`${type} > ${subType}`);
      return;
    }
    
    // 初始化該類別的數組，如果不存在
    if (!newSelectedItems[type]) {
      newSelectedItems[type] = [];
    }
    
    // 檢查項目是否已選擇
    const itemIndex = newSelectedItems[type].indexOf(subType);
    
    if (itemIndex > -1) {
      // 已選擇，則移除
      newSelectedItems[type].splice(itemIndex, 1);
      
      // 檢查該類別下是否還有項目
      if (newSelectedItems[type].length === 0) {
        delete newSelectedItems[type];
        setSelectedType(type);
      } else if (newSelectedItems[type].length === 1) {
        setSelectedType(`${type} > ${newSelectedItems[type][0]}`);
      } else {
        setSelectedType(`${type} > ${newSelectedItems[type].length} 個選項`);
      }
    } else {
      // 未選擇，則添加
      newSelectedItems[type].push(subType);
      
      if (newSelectedItems[type].length === 1) {
        setSelectedType(`${type} > ${subType}`);
      } else {
        setSelectedType(`${type} > ${newSelectedItems[type].length} 個選項`);
      }
    }
    
    // 一次性更新狀態，防止多次渲染
    setSelectedItems(newSelectedItems);
  }
  
  console.log('After change:', { type, subType });
};
    

    // 更新顯示的選擇類型文字
    const updateSelectedTypeDisplay = (type) => {
        // 確保 selectedItems 已更新
        if (!selectedItems[type] || selectedItems[type].length === 0) {
            setSelectedType(type);
            return;
        }
        
        if (selectedItems[type].length === 1) {
            setSelectedType(`${type} > ${selectedItems[type][0]}`);
        } else {
            setSelectedType(`${type} > ${selectedItems[type].length} 個選項`);
        }
    }

    // 檢查項目是否被選擇
    const isItemSelected = (type, subType) => {
        return selectedItems[type] && selectedItems[type].includes(subType);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim() === "") return;
    };

    const socialMediaItems = {
        YouTube: [
            { id: 1, title: "台語廣播", url: "https://youtube.com/...", image: "./src/assets/culture/foodN.png" },
            { id: 2, title: "台語新聞", url: "https://youtube.com/...", image: "./src/assets/culture/foodN.png" },
            { id: 3, title: "台語新聞", url: "https://youtube.com/...", image: "./src/assets/culture/foodN.png" },
            { id: 4, title: "台語新聞", url: "https://youtube.com/...", image: "./src/assets/culture/foodN.png" },
            { id: 5, title: "台語新聞", url: "https://youtube.com/...", image: "./src/assets/culture/foodN.png" },
        ],
        Podcast: [
            { id: 1, title: "台語文化", url: "https://podcast.com/...", image: "./src/assets/culture/foodN.png" },
        ],
        電視綜藝: [
            { id: 1, title: "台語節目", url: "https://tv.com/...", image: "./src/assets/culture/foodN.png" },
        ]
    };

    const handleCardClick = (url) => {
        window.open(url, '_blank');
    };
    const dropdownStyle = {
      backgroundImage: `url(${chevronUp})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'calc(100% - 16px) center',
      backgroundSize: '20px 20px'
  };
    return (
        <div className="socialmedia-page">
            <div className="socialmedia-header">
                <div className="container px-4">
                    <div className="socialmedia-header-content">
                        <div className="social-custom-dropdown">
                            <div 
                                className="dropdown-header social-type-dropdown"
                                style={dropdownStyle}
                                onClick={() => {
                                    console.log("dropdown-header clicked");
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                            >
                                {selectedType}
                            </div>
                            {isDropdownOpen && (
                                <div className="social-dropdown-menu">
                                    {Object.entries(menuItems).map(([type, { hasSubMenu, subItems }]) => (
                                        <div key={type} className="social-dropdown-item-container">
                                            {!hasSubMenu ? (
                                                <div
                                                    className="social-dropdown-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTypeChange(type);
                                                    }}
                                                >
                                                    {type}
                                                </div>
                                            ) : (
                                                <div 
                                                    className="social-dropdown-item with-submenu"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // 只改變顯示的主類別名稱，不觸發選擇
                                                        if (selectedType !== type) {
                                                            setSelectedType(type);
                                                        }
                                                    }}
                                                >
                                                    <span>{type}</span>
                                                    <span className="social-submenu-arrow">›</span>
                                                    <div 
                                                        className="social-submenu"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {subItems.map(subItem => (
                                                            <div
                                                            key={subItem}
                                                            className={`social-submenu-item ${isItemSelected(type, subItem) ? 'selected' : ''}`}
                                                            onMouseDown={(e) => { // 改用 onMouseDown 代替 onClick，反應更靈敏
                                                              e.preventDefault(); 
                                                              e.stopPropagation();
                                                              handleTypeChange(type, subItem);
                                                            }}
                                                          >
                                                            {subItem}
                                                            {isItemSelected(type, subItem) && (
                                                              <span className="checkmark">✓</span>
                                                            )}
                                                          </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSearch} className="social-search-container">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="搜尋..."
                                className="social-search-input"
                            />
                            <img
                                src={searchIcon}
                                className="social-search-icon"
                                onClick={handleSearch}
                            />
                        </form>
                    </div>
                </div>
            </div>
            {Object.entries(socialMediaItems).map(([category, items]) => (
                <div key={category} className="socialmedia-section">
                    <div className="container px-4">
                        <h2 className="social-category-title">{category}</h2>
                        <div className="row g-4">
                            {items.map(item => (
                                <div key={item.id}
                                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                                    onClick={() => handleCardClick(item.url)}>
                                    <div className="socialmedia-card">
                                        <div className="social-image-container">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="socialmedia-image"
                                            />
                                        </div>
                                        <h5 className="text-center mt-2">{item.title}</h5>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
            <div className="text-start mt-4 socialmedia-report-issue">
                <img src={questionMarkIcon} className="question-icon" />
                如有任何問題，請點此回報問題
            </div>
        </div>
    );
};

export default SocialmediaPage;