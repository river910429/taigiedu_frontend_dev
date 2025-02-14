import React, { useState } from 'react';
import './SocialmediaPage.css';

const SocialmediaPage = () => {
    const [selectedType, setSelectedType] = useState("分類");  // 將 "類型" 改為 "分類"
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [query, setQuery] = useState("");
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

    const handleTypeChange = (type, subType = null) => {
        console.log('Before change:', selectedType);
        console.log('Changing to:', type, subType);
        const newSelectedType = subType ? `${type} > ${subType}` : type;
        setSelectedType(newSelectedType);
        setIsDropdownOpen(false);
        console.log('After change:', newSelectedType);
    };

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
            // ... more items
        ],
        Podcast: [
            { id: 1, title: "台語文化", url: "https://podcast.com/...", image: "./src/assets/culture/foodN.png" },
            // ... more items
        ],
        電視綜藝: [
            { id: 1, title: "台語節目", url: "https://tv.com/...", image: "./src/assets/culture/foodN.png" },
            // ... more items
        ]
    };

    const handleCardClick = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div className="socialmedia-page">
            <div className="socialmedia-header">
                <div className="container px-4">
                    <div className="socialmedia-header-content">
                        {/* <select
                            className="social-type-dropdown"
                            value={selectedType}
                            onChange={handleTypeChange}
                        >
                            <option hidden>分類</option>
                            <option value="YouTube">YouTube</option>
                            <option value="Podcast">Podcast</option>
                            <option value="電視綜藝">電視綜藝</option>
                        </select> */}
                        <div className="social-custom-dropdown">
  <div 
    className="dropdown-header social-type-dropdown"
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
            <div className="social-dropdown-item with-submenu">
              <span>{type}</span>
              <span className="social-submenu-arrow">›</span>
              <div className="social-submenu">
                {subItems.map(subItem => (
                  <div
                    key={subItem}
                    className="social-submenu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeChange(type, subItem);
                    }}
                  >
                    {subItem}
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
                                src="search_logo.svg"
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
                <img src="../src/assets/question-mark.svg" className="question-icon" />
                如有任何問題，請點此回報問題
            </div>
        </div>
    );
};

export default SocialmediaPage;