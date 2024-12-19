import React, { useState } from 'react';  // Add useState import
import './FestivalPage.css';
// import FoodModal from './FoodModal';

const FestivalPage = () => {
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const foods = [
        { id: 1, name: "春節", image: "../src/assets/culture/festivalN.jpg", pron:"tshun-tseh" , intro:"" },
        { id: 2, name: "天公生", image: "../src/assets/culture/festivalN.jpg", pron:"ô-á-tsian" , intro:"" },
        { id: 3, name: "元宵", image: "../src/assets/culture/festivalN.jpg", pron:"ông-lâi-soo" , intro:"" },
        { id: 4, name: "迎媽祖", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:""},
        { id: 5, name: "清明", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:""},
        { id: 6, name: "端午", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:""},
        { id: 7, name: "七夕", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:""},
        { id: 8, name: "中元", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:""},
        { id: 9, name: "搶孤", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:""},
        { id: 10, name: "中秋", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:"" },
        { id: 11, name: "重陽", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:"" },
        { id: 12, name: "燒王船", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:"" },
        { id: 13, name: "下元", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:"" },
        { id: 14, name: "冬至", image: "../src/assets/culture/festivalN.png", pron:"Ông Io̍k-tek" , intro:"" },
        { id: 15, name: "尾牙", image: "../src/assets/culture/festivalN.png", pron:"Tsiā Tsong-iū" , intro:"" },
        { id: 15, name: "聖誕節", image: "../src/assets/culture/festivalN.png", pron:"Tsiā Tsong-iū" , intro:"" },
    ];
    const handleCardClick = (food) => {
        setSelectedFood(food);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFood(null);
    };

    return (
        <div className="container py-4">
            <div className="row g-4">
                {foods.map(food => (
                    <div key={food.id} 
                         className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-custom-5"
                         onClick={() => handleCardClick(food)}>
                        <div className="food-card">
                            <div className="image-container">
                                <img 
                                    src={food.image} 
                                    alt={food.name}
                                    className="food-image"
                                />
                            </div>
                            <h5 className="text-center mt-2">{food.name}</h5>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-start mt-4 food-report-issue">
            <img 
                src="../src/assets/question-mark.svg" 
                className="food-question-icon"
            />
            如有任何問題，請點此回報問題
            </div>
            {/* <FoodModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                food={selectedFood}
            /> */}
        </div>
    );
};

export default FestivalPage;