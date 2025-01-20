import React, { useState } from 'react';
import './SocialmediaPage.css';

const SocialmediaPage = () => {
    const [selectedType, setSelectedType] = useState("類型");
    const [query, setQuery] = useState("");

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
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
                        <select
                            className="social-type-dropdown"
                            value={selectedType}
                            onChange={handleTypeChange}
                        >
                            <option hidden>分類</option>
                            <option value="YouTube">YouTube</option>
                            <option value="Podcast">Podcast</option>
                            <option value="電視綜藝">電視綜藝</option>
                        </select>

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