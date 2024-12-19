import React, { useState } from 'react';  // Add useState import
import './FoodPage.css';
import FoodModal from './FoodModal';

const FoodPage = () => {
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const foods = [
        { id: 1, name: "米糕", image: "../src/assets/culture/food1.jpg", pron:"bí-ko" , intro:"米糕是一種用糯米製成的食品，是台灣傳統的節慶食品之一。米糕的製作方式是將糯米浸泡後蒸熟，再加入其他食材拌炒而成。米糕的口感Q彈，味道香甜，是許多人喜愛的美食。" },
        { id: 2, name: "蚵仔煎", image: "../src/assets/culture/food2.jpg", pron:"ô-á-tsian" , intro:"蚵仔煎是一種台灣傳統小吃，是用蚵仔、蛋、麵粉等食材製成的煎餅。蚵仔煎的製作方式是將蚵仔、蛋、麵粉等食材拌勻後，倒入平底鍋中煎熟，再加上醬料、香菜等調味料，最後切塊上桌。蚵仔煎的口感酥脆，味道鮮美，是許多人喜愛的美食。" },
        { id: 3, name: "鳳梨酥", image: "../src/assets/culture/food3.jpg", pron:"ông-lâi-soo" , intro:"鳳梨酥是一種台灣傳統點心，是用鳳梨、麵粉等食材製成的酥餅。鳳梨酥的製作方式是將鳳梨、麵粉等食材拌勻後，包入酥皮中，再烘烤而成。鳳梨酥的外皮酥脆，內餡香甜，是許多人喜愛的美食。" },
        { id: 4, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。"},
        { id: 5, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。"},
        { id: 6, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。"},
        { id: 7, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。"},
        { id: 8, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。"},
        { id: 9, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。"},
        { id: 10, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。" },
        { id: 11, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。" },
        { id: 12, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。" },
        { id: 13, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。" },
        { id: 14, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Ông Io̍k-tek" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。" },
        { id: 15, name: "美食", image: "../src/assets/culture/foodN.png", pron:"Tsiā Tsong-iū" , intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。" },
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
            <FoodModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                food={selectedFood}
            />
        </div>
    );
};

export default FoodPage;