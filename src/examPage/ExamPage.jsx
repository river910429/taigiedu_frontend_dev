import React, { useState, useRef } from 'react';
import './ExamPage.css';
import searchIcon from '../assets/home/search_logo.svg';
import questionMarkIcon from '../assets/question-mark.svg';
import foodImage from '../assets/culture/foodN.png'; 
import chevronUpIcon from '../assets/chevron-up.svg';

const ExamPage = () => {
    const [selectedType, setSelectedType] = useState("類型");
    const [query, setQuery] = useState("");

    // 創建 refs 來引用各個標題
    const sectionRefs = {
        "考試資訊": useRef(null),
        "推薦用書/教材": useRef(null),
        "教育頻道": useRef(null)
    };

    const examItems = {
        "考試資訊": [
            { id: 1, title: "台語認證初級考試", url: "https://exam.com/basic", image: foodImage },
            { id: 2, title: "台語認證中級考試", url: "https://exam.com/intermediate", image: foodImage },
            { id: 3, title: "台語認證高級考試", url: "https://exam.com/advanced", image: foodImage },
            { id: 4, title: "台語教師認證", url: "https://exam.com/teacher", image: foodImage },
        ],
        "推薦用書/教材": [
            { id: 1, title: "台語認證指南", url: "https://book.com/guide", image: foodImage },
            { id: 2, title: "台語會話練習", url: "https://book.com/conversation", image: foodImage },
            { id: 3, title: "台語文法大全", url: "https://book.com/grammar", image: foodImage },
            { id: 4, title: "台語發音教學", url: "https://book.com/pronunciation", image: foodImage },
        ],
        "教育頻道": [
            { id: 1, title: "台語教學頻道", url: "https://channel.com/teaching", image: foodImage },
            { id: 2, title: "台語線上課程", url: "https://channel.com/online", image: foodImage },
            { id: 3, title: "台語文化講座", url: "https://channel.com/culture", image: foodImage },
            { id: 4, title: "台語考試準備", url: "https://channel.com/prep", image: foodImage },
        ]
    };

    const handleTypeChange = (e) => {
        const selectedValue = e.target.value;
        setSelectedType(selectedValue);
        
        // 滾動到對應的標題
        if (selectedValue !== "類型" && sectionRefs[selectedValue]?.current) {
            sectionRefs[selectedValue].current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim() === "") return;
    };

    const handleCardClick = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div className="exam-page">
            <div className="exam-header">
                <div className="container px-4">
                    <div className="exam-header-content">
                        <div className="dropdown-container">
                            <select
                                className="exam-type-dropdown"
                                value={selectedType}
                                onChange={handleTypeChange}
                            >
                                <option value="類型">類型</option>
                                <option value="考試資訊">考試資訊</option>
                                <option value="推薦用書/教材">推薦用書</option>
                                <option value="教育頻道">教育頻道</option>
                            </select>
                            <img 
                                src={chevronUpIcon} 
                                alt="dropdown arrow" 
                                className="dropdown-arrow"
                            />
                        </div>

                        <form onSubmit={handleSearch} className="exam-search-container">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="搜尋..."
                                className="exam-search-input"
                            />
                            <img
                                src={searchIcon}
                                className="exam-search-icon"
                                onClick={handleSearch}
                            />
                        </form></div></div>
            </div>
            {Object.entries(examItems).map(([category, items]) => (
                <div key={category} className="exam-section">
                    <div className="container px-4">
                        <h2 
                            className="exam-category-title"
                            ref={sectionRefs[category]}
                        >
                            {category}
                        </h2>
                        <div className="row g-4">
                            {items.map(item => (
                                <div key={item.id}
                                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                                    onClick={() => handleCardClick(item.url)}>
                                    <div className="exam-card">
                                        <div className="exam-image-container">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="exam-image"
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
            <div className="text-start mt-4 exam-report-issue">
                <img src={questionMarkIcon} className="question-icon" />
                如有任何問題，請點此回報問題
            </div>
        </div>
    );
};

export default ExamPage;