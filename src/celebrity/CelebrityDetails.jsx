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
    const [tabContent, setTabContent] = useState({
        experience: '載入中...',
        works: portfolio || '載入中...',
        resources: '載入中...',
        metaverse: '載入中...',
        awards: '載入中...'
    });

    // 模擬外部資料載入
    useEffect(() => {
        // 模擬 API 呼叫
        const fetchTabContent = async () => {
            // 實際專案中，這裡應該是真實的 API 呼叫
            // 模擬異步載入
            setTimeout(() => {
                setTabContent(prev => ({
                    ...prev,
                    experience: ` • 1930 Tha̍k 台南末廣公學校\n • 1936 Tha̍k 台南州立台南第一中學校`,
                    works: portfolio || `${name} 的作品包括多本著作、論文與社會評論。`,
                    resources: `關於 ${name} 的相關資源：\n- 台灣文學資料館\n- 國立台灣文學館\n- 台灣文學網\n- 台語文學數位資料庫`,
                    metaverse: `${name} 在元宇宙中的存在尚在開發中，未來將提供虛擬導覽與互動體驗。`,
                    awards: `${name} 曾獲獎項：\n- 台灣文學貢獻獎\n- 台灣語言復振特殊貢獻獎\n- 台灣歷史文化推廣獎`
                }));
            }, 500);
        };

        fetchTabContent();
    }, [name, subtitle, intro, portfolio]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="celebrity-details-container">
            {/* 標題區塊：名字+拼音 */}
            <div className="celebrity-details-header">
                <h1>{name} <span className="celebrity-pron">{pron}</span></h1>
                <div className="celebrity-subtitle">{subtitle}</div>
            </div>

            {/* 內容區塊：圖片+介紹 */}
            <div className="celebrity-details-content">
                <div className="celebrity-image-container">
                    <img src={image} alt={name} className="celebrity-detail-image" />
                </div>
                <div className="celebrity-intro">
                    <p>{intro}</p>
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
                    <div className={`tab-panel ${activeTab === 'experience' ? 'active' : ''}`}>
                        <pre>{tabContent.experience}</pre>
                    </div>
                    <div className={`tab-panel ${activeTab === 'works' ? 'active' : ''}`}>
                        <pre>{tabContent.works}</pre>
                    </div>
                    <div className={`tab-panel ${activeTab === 'resources' ? 'active' : ''}`}>
                        <pre>{tabContent.resources}</pre>
                    </div>
                    <div className={`tab-panel ${activeTab === 'metaverse' ? 'active' : ''}`}>
                        <pre>{tabContent.metaverse}</pre>
                    </div>
                    <div className={`tab-panel ${activeTab === 'awards' ? 'active' : ''}`}>
                        <pre>{tabContent.awards}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CelebrityDetails;