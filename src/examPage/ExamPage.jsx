import React, { useState } from 'react';
import './ExamPage.css';

const ExamPage = () => {
    const [selectedType, setSelectedType] = useState("類型");
    const [query, setQuery] = useState("");

    const examItems = {
        "考試資訊": [
            { id: 1, title: "台語認證初級考試", url: "https://exam.com/basic", image: "./src/assets/culture/foodN.png" },
            { id: 2, title: "台語認證中級考試", url: "https://exam.com/intermediate", image: "./src/assets/culture/foodN.png" },
            { id: 3, title: "台語認證高級考試", url: "https://exam.com/advanced", image: "./src/assets/culture/foodN.png" },
            { id: 4, title: "台語教師認證", url: "https://exam.com/teacher", image: "./src/assets/culture/foodN.png" },
        ],
        "推薦用書/教材": [
            { id: 1, title: "台語認證指南", url: "https://book.com/guide", image: "./src/assets/culture/foodN.png" },
            { id: 2, title: "台語會話練習", url: "https://book.com/conversation", image: "./src/assets/culture/foodN.png" },
            { id: 3, title: "台語文法大全", url: "https://book.com/grammar", image: "./src/assets/culture/foodN.png" },
            { id: 4, title: "台語發音教學", url: "https://book.com/pronunciation", image: "./src/assets/culture/foodN.png" },
        ],
        "教育頻道": [
            { id: 1, title: "台語教學頻道", url: "https://channel.com/teaching", image: "./src/assets/culture/foodN.png" },
            { id: 2, title: "台語線上課程", url: "https://channel.com/online", image: "./src/assets/culture/foodN.png" },
            { id: 3, title: "台語文化講座", url: "https://channel.com/culture", image: "./src/assets/culture/foodN.png" },
            { id: 4, title: "台語考試準備", url: "https://channel.com/prep", image: "./src/assets/culture/foodN.png" },
        ]
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
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
                        <select
                            className="exam-type-dropdown"
                            value={selectedType}
                            onChange={handleTypeChange}
                        >
                            <option hidden>分類</option>
                            <option value="考試資訊">考試資訊</option>
                            <option value="推薦用書/教材">推薦用書/教材</option>
                            <option value="教育頻道">教育頻道</option>
                        </select>

                        <form onSubmit={handleSearch} className="exam-search-container">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="搜尋..."
                                className="exam-search-input"
                            />
                            <img
                                src="search_logo.svg"
                                className="exam-search-icon"
                                onClick={handleSearch}
                            />
                        </form></div></div>
            </div>
            {Object.entries(examItems).map(([category, items]) => (
                <div key={category} className="exam-section">
                    <div className="container px-4">
                        <h2 className="exam-category-title">{category}</h2>
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
                <img src="../src/assets/question-mark.svg" className="question-icon" />
                如有任何問題，請點此回報問題
            </div>
        </div>
    );
};

export default ExamPage;