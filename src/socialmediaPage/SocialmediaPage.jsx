import React, { useState, useEffect, useRef } from 'react';
import './SocialmediaPage.css';
import searchIcon from '../assets/home/search_logo.svg';
import chevronUp from '../assets/chevron-up.svg';
import questionMarkIcon from '../assets/question-mark.svg';
import noPics from "../assets/culture/festivalN.png";

const SocialmediaPage = () => {
    const [selectedType, setSelectedType] = useState("分類");  // 將 "類型" 改為 "分類"
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [query, setQuery] = useState("");
    
    // 儲存多選項目，格式為 { 主分類: [子項目1, 子項目2, ...] }
    const [selectedItems, setSelectedItems] = useState({});
    
    // 新增 API 相關狀態
    const [socialMediaData, setSocialMediaData] = useState({});
    const [menuItems, setMenuItems] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 儲存每個分類的滾動位置引用
    const categoryRefs = useRef({});
    
    // 從 API 獲取社交媒體資料
    const fetchSocialMediaData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch('https://dev.taigiedu.com/backend/media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Social Media API Response:', data);
            
            // 將 API 回傳的資料格式化為適合顯示的格式
            const formattedData = {};
            const dynamicMenuItems = {};
            
            Object.keys(data).forEach(category => {
                if (category === "") {
                    // 處理空字串類別，可能是未分類項目
                    if (data[category].length > 0) {
                        formattedData["其他"] = data[category];
                        dynamicMenuItems["其他"] = { hasSubMenu: false };
                    }
                } else {
                    formattedData[category] = data[category];
                    
                    // 檢查是否有子分類
                    const subCategories = [...new Set(data[category]
                        .filter(item => item.subcategory && item.subcategory.trim() !== "")
                        .map(item => item.subcategory))];
                    
                    if (subCategories.length > 0) {
                        dynamicMenuItems[category] = {
                            hasSubMenu: true,
                            subItems: subCategories
                        };
                    } else {
                        dynamicMenuItems[category] = { hasSubMenu: false };
                    }
                }
            });
            
            setSocialMediaData(formattedData);
            setMenuItems(dynamicMenuItems);
            
            // 為每個分類創建 ref
            const refs = {};
            Object.keys(formattedData).forEach(category => {
                refs[category] = React.createRef();
            });
            categoryRefs.current = refs;
            
        } catch (error) {
            console.error('Error fetching social media data:', error);
            setError('載入社交媒體資料時發生錯誤');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSocialMediaData();
    }, []);
    
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

    // 獲取要顯示的項目（根據選擇的分類和子分類進行過濾）
    const getFilteredItems = () => {
        if (selectedType === "分類" || Object.keys(selectedItems).length === 0) {
            // 如果沒有選擇任何分類，返回所有資料
            return socialMediaData;
        }
        
        const filteredData = {};
        
        Object.keys(selectedItems).forEach(mainCategory => {
            const selectedSubItems = selectedItems[mainCategory];
            
            if (socialMediaData[mainCategory]) {
                if (selectedSubItems.length === 0) {
                    // 如果選擇了主分類但沒有子項目，顯示該分類的所有項目
                    filteredData[mainCategory] = socialMediaData[mainCategory];
                } else {
                    // 根據選擇的子分類過濾項目
                    const filteredItems = socialMediaData[mainCategory].filter(item => 
                        selectedSubItems.includes(item.subcategory) || 
                        (selectedSubItems.includes("") && (!item.subcategory || item.subcategory.trim() === ""))
                    );
                    
                    if (filteredItems.length > 0) {
                        filteredData[mainCategory] = filteredItems;
                    }
                }
            }
        });
        
        return filteredData;
    };
    
    // 滾動到指定分類
    const scrollToCategory = (category) => {
        if (categoryRefs.current[category] && categoryRefs.current[category].current) {
            categoryRefs.current[category].current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };
    
    const handleCardClick = (url) => {
        window.open(url, '_blank');
    };
    
    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim() === "") return;
    };

    const socialMediaItems = {};

    // 如果正在載入，顯示載入中訊息
    if (isLoading) {
        return (
            <div className="socialmedia-container">
                <div className="text-center py-5">
                    <p>載入中...</p>
                </div>
            </div>
        );
    }

    // 如果發生錯誤，顯示錯誤訊息
    if (error) {
        return (
            <div className="socialmedia-container">
                <div className="text-center py-5">
                    <p className="text-danger">{error}</p>
                    <button 
                        className="btn btn-primary mt-3" 
                        onClick={fetchSocialMediaData}
                    >
                        重新載入
                    </button>
                </div>
            </div>
        );
    }

    const filteredData = getFilteredItems();
    
    return (
        <div className="socialmedia-page">
            <div className="socialmedia-header">
                <div className="container px-4">
                    <div className="socialmedia-header-content">
                        <div className="social-custom-dropdown">
                            <div className="dropdown-container">
                                <div 
                                    className="dropdown-header social-type-dropdown"
                                    onClick={() => {
                                        console.log("dropdown-header clicked");
                                        setIsDropdownOpen(!isDropdownOpen);
                                    }}
                                >
                                    {selectedType}
                                </div>
                                <img 
                                    src={chevronUp} 
                                    alt="dropdown arrow" 
                                    className="dropdown-arrow"
                                />
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
            {Object.entries(filteredData).map(([category, items]) => (
                <div key={category} className="socialmedia-section" ref={categoryRefs.current[category]}>
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
                                                src={item.image || noPics}
                                                alt={item.title}
                                                className="socialmedia-image"
                                                onError={(e) => {
                                                    e.target.src = noPics;
                                                }}
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