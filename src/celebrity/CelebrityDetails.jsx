import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './CelebrityDetails.css';

const CelebrityDetails = () => {
    const [searchParams] = useSearchParams();
    const name = searchParams.get('name');
    const pron = searchParams.get('pron');
    const image = searchParams.get('image');
    const subtitle = searchParams.get('subtitle');
    const intro = searchParams.get('intro');
    const portfolio = searchParams.get('portfolio');

    // 頁籤狀態管理
    const [activeTab, setActiveTab] = useState('experience');
    
    // 作品分類狀態
    const [activeWorkCategory, setActiveWorkCategory] = useState('all');

    // 整合所有頁籤數據
    const [celebrityData, setCelebrityData] = useState({
        basicInfo: {
            name: name || '',
            pron: pron || '',
            image: image || '',
            subtitle: subtitle || '',
            intro: intro || ''
        },
        experience: '載入中...',
        works: {
            categories: [],
            items: {}
        },
        resources: [],
        metaverse: '載入中...',
        awards: '載入中...'
    });
    
    // 模擬外部資料載入 - 將來會替換為實際 API 調用
    useEffect(() => {
        // 模擬 API 呼叫
        const fetchCelebrityData = async () => {
            try {
                // 實際專案中，這裡應該是真實的 API 呼叫
                // 例如：const response = await fetch(`/api/celebrities/${id}`);
                // const data = await response.json();
                
                // 模擬異步載入
                setTimeout(() => {
                    // 模擬 API 返回的完整數據
                    const completeData = {
                        basicInfo: {
                            name: name || '王育德',
                            pron: pron || 'Ông Io̍k-tek',
                            image: image || 'https://example.com/image.jpg',
                            subtitle: subtitle || '1924年1月30日-1985年9月9日',
                            intro: intro || '王育德是臺南府城本町（這馬臺南市中西區民權路二段）ê人。早年赴日本留學，因為二戰轉來臺灣，一九四五年佇臺南一中任職，推廣臺語戲劇。二二八事件以後流亡日本，kōo研究臺語取著日本東京大學文學博士學位。'
                        },
                        experience: ' • 1930 Tha̍k 台南末廣公學校\n • 1936 Tha̍k 台南州立台南第一中學校\n • 1942 東京帝國大學畢業\n • 1945 台南一中任職\n • 1952 東京大學文學部中國文學語學科畢業\n • 1969 取得東京大學文學博士學位',
                        works: {
                            categories: [
                                "文學作品", "評論隨筆", "學術論文", "雜誌", "台語劇本", "單行本"
                            ],
                            items: {
                                "文學作品": [
                                    "1942〈七絕四首〉、〈過渡期〉《翔風》24號",
                                    "1946〈春の戯れ〉、〈老子と墨子〉 《中華日報》日文文藝版",
                                    "1950〈鬍的〉《La Mancha》創刊號"
                                ],
                                "評論隨筆": [
                                    "1946《中華日報》日文文藝版 7篇",
                                    "1946〈台湾演劇の確立ー栄光に輝く茨の道〉",
                                    "1960-1985《台灣青年》 評論隨筆60餘篇、書評10餘篇",
                                    "其他雜誌的評論短文26篇"
                                ],
                                "學術論文": [
                                    "1952-1985年學術論文30餘篇",
                                    "1952《台湾語表現形態試論》（東京大學文學部中國文學語學科畢業論文）",
                                    "1955《ラテン化新文字による台灣語初級教本草案》（東京大學大學院中國語學科修士論文）",
                                    "1969 博士論文《閩音系研究》（東京大學大學院文學博士論文）"
                                ],
                                "雜誌": [
                                    "1960-2002《台灣青年》創刊、末刊、二二八特刊"
                                ],
                                "台語劇本": [
                                    "1945、1946〈新生之朝〉、〈青年之路〉、〈幻影〉",
                                    "1951 菊池寬〈父歸〉（台譯）",
                                    "1985〈僑領〉"
                                ],
                                "單行本": [
                                    "1957《台湾語常用語彙》（永和語學社）",
                                    "1964《台湾・苦悶するその歴史》（弘文堂）",
                                    "1972《台湾語入門》（風林堂）",
                                    "1979《台湾-苦悶的歷史》（台湾青年社）",
                                    "1980-1985《補償請求訴訟資料集1-5》（台灣人原日本兵補償問題思考會）",
                                    "1982《台湾語入門》（日中出版）",
                                    "1983《台湾語初級》（日中出版）",
                                    "1983《台湾海峡》（日中出版）",
                                    "1986《苦悶的台灣》（鄭南榕自由時代系列叢書9）",
                                    "1987《台灣語音の歷史的研究》（第一書房）",
                                    "1990《新しい台湾：独立への歴史と未來図》（弘文堂）",
                                    "1993《台灣語常用語彙》（武陵）",
                                    "1993《台灣：苦悶的歷史》（自立晚報社文化出版部）",
                                    "1993《台灣話講座》（自立晚報社文化出版部）",
                                    "1999-2002《王育德全集》15卷（前衛）",
                                    "2006《我的台灣史觀：王育德博士演講原音重現》",
                                    "2011《「昭和」を生きた台灣青年　日本に亡命した台灣獨立運動者の回想1924－1949。》（草思社）",
                                    "2012《王育德の台湾語講座》（東方書店）"
                                ]
                            }
                        },
                        resources: [
                            {
                                title: "台灣文學資料館",
                                subtitle: "收錄王育德先生台語文學相關作品與研究資料",
                                imageUrl: "https://picsum.photos/300/200?random=1"
                            },
                            {
                                title: "國立台灣文學館",
                                subtitle: "王育德文物數位典藏與台語文研究專區",
                                imageUrl: "https://picsum.photos/300/200?random=2"
                            },
                            {
                                title: "台灣語文資料庫",
                                subtitle: "收錄王育德先生台語研究與教學資料",
                                imageUrl: "https://picsum.photos/300/200?random=3"
                            },
                            {
                                title: "台灣獨立運動史料中心",
                                subtitle: "王育德與戰後台灣獨立運動相關資料",
                                imageUrl: "https://picsum.photos/300/200?random=4"
                            },
                            {
                                title: "台語文學推廣協會",
                                subtitle: "王育德台語文學遺產傳承計畫",
                                imageUrl: "https://picsum.photos/300/200?random=5"
                            },
                            {
                                title: "日本台灣研究學會",
                                subtitle: "王育德在日活動相關研究與文獻",
                                imageUrl: "https://picsum.photos/300/200?random=6"
                            },
                            {
                                title: "台語文學數位博物館",
                                subtitle: "王育德作品數位典藏專區",
                                imageUrl: "https://picsum.photos/300/200?random=7"
                            },
                            {
                                title: "台灣歷史文化資料庫",
                                subtitle: "王育德生平事蹟與思想研究",
                                imageUrl: "https://picsum.photos/300/200?random=8"
                            }
                        ],
                        metaverse: "王育德在元宇宙中的存在尚在開發中，未來將提供虛擬導覽與互動體驗。計劃包括模擬其在台南、東京的生活場景，以及數位典藏其著作手稿等。",
                        awards: "王育德曾獲獎項：\n- 台灣文學貢獻獎\n- 台灣語言復振特殊貢獻獎\n- 台灣歷史文化推廣獎\n- 日本東亞研究特別表彰\n- 台灣獨立運動紀念獎章"
                    };
                    
                    // 設置所有數據
                    setCelebrityData(completeData);
                    
                    // 如果是第一次載入，設置默認作品分類為第一個
                    if (activeWorkCategory === 'all' && completeData.works.categories.length > 0) {
                        setActiveWorkCategory(completeData.works.categories[0]);
                    }
                }, 500);
            } catch (error) {
                console.error("Failed to fetch celebrity data:", error);
                // 處理錯誤狀態
            }
        };

        fetchCelebrityData();
    }, [name, pron, image, subtitle, intro, portfolio]);

    // 處理頁籤切換
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
    
    // 處理作品分類切換
    const handleCategoryClick = (category) => {
        setActiveWorkCategory(category);
    };
    
    // 渲染當前選擇的作品
    const renderWorks = () => {
        const { categories, items } = celebrityData.works;
        
        if (activeWorkCategory === 'all') {
            // 顯示所有作品
            return (
                <>
                    {categories.map(category => (
                        <div key={category} className="work-category-section">
                            <h3 className="work-category-title">{category}</h3>
                            <ul className="work-list">
                                {items[category]?.map((work, index) => (
                                    <li key={index}>{work}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            );
        } else {
            // 顯示選定分類的作品
            return (
                <div className="work-category-section">
                    <ul className="work-list">
                        {items[activeWorkCategory]?.map((work, index) => (
                            <li key={index}>{work}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    };

    return (
        <div className="celebrity-details-container">
            {/* 標題區塊：名字+拼音 */}
            <div className="celebrity-details-header">
                <h1>{celebrityData.basicInfo.name} <span className="celebrity-pron">{celebrityData.basicInfo.pron}</span></h1>
                <div className="celebrity-subtitle">{celebrityData.basicInfo.subtitle}</div>
            </div>

            {/* 內容區塊：圖片+介紹 */}
            <div className="celebrity-details-content">
                <div className="celebrity-image-container">
                    <img src={celebrityData.basicInfo.image} alt={celebrityData.basicInfo.name} className="celebrity-detail-image" />
                </div>
                <div className="celebrity-intro">
                    <p>{celebrityData.basicInfo.intro}</p>
                </div>
            </div>

            {/* 頁籤區塊 */}
            <div className="celebrity-tabs">
                <div className="celebrity-tab-buttons">
                    <button 
                        className={`tab-button ${activeTab === 'experience' ? 'active' : ''}`} 
                        onClick={() => handleTabClick('experience')}
                    >
                        經歷
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'works' ? 'active' : ''}`} 
                        onClick={() => handleTabClick('works')}
                    >
                        作品
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`} 
                        onClick={() => handleTabClick('resources')}
                    >
                        網路資源
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'metaverse' ? 'active' : ''}`} 
                        onClick={() => handleTabClick('metaverse')}
                    >
                        元宇宙
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'awards' ? 'active' : ''}`} 
                        onClick={() => handleTabClick('awards')}
                    >
                        得獎
                    </button>
                </div>

                {/* 頁籤內容 */}
                <div className="celebrity-tab-content">
                    {/* 經歷頁籤 */}
                    <div className={`tab-panel ${activeTab === 'experience' ? 'active' : ''}`}>
                        <pre>{celebrityData.experience}</pre>
                    </div>
                    
                    {/* 作品頁籤 */}
                    <div className={`tab-panel ${activeTab === 'works' ? 'active' : ''}`}>
                        {/* 作品分類按鈕組 */}
                        <div className="work-category-filters">
                            <span className="work-category-label">作品類型:</span>
                            <button 
                                className={`category-pill ${activeWorkCategory === 'all' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('all')}
                            >
                                ALL
                            </button>
                            {celebrityData.works.categories.map(category => (
                                <button 
                                    key={category}
                                    className={`category-pill ${activeWorkCategory === category ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        
                        {/* 作品內容 */}
                        <div className="works-content">
                            {renderWorks()}
                        </div>
                    </div>
                    
                    {/* 網路資源頁籤 */}
                    <div className={`tab-panel ${activeTab === 'resources' ? 'active' : ''}`}>
                        <div className="resource-cards-grid">
                            {celebrityData.resources.map((resource, index) => (
                                <div className="resource-card" key={index}>
                                    <h3 className="resource-card-title">{resource.title}</h3>
                                    <p className="resource-card-subtitle">{resource.subtitle}</p>
                                    <div className="resource-card-image-container">
                                        <img 
                                            src={resource.imageUrl} 
                                            alt={resource.title}
                                            className="resource-card-image"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* 元宇宙頁籤 */}
                    <div className={`tab-panel ${activeTab === 'metaverse' ? 'active' : ''}`}>
                        <pre>{celebrityData.metaverse}</pre>
                    </div>
                    
                    {/* 得獎頁籤 */}
                    <div className={`tab-panel ${activeTab === 'awards' ? 'active' : ''}`}>
                        <pre>{celebrityData.awards}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CelebrityDetails;