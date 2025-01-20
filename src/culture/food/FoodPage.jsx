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
        { id: 4, name: "滷肉飯", image: "../src/assets/culture/foodN.png", pron:"ló͘-bah-pn̄g" , intro:"滷肉飯是一種台灣傳統小吃，是用滷肉和白飯製成的。滷肉飯的製作方式是將豬肉切丁後，加入醬油、糖、五香粉等調味料滷煮，再淋在白飯上。滷肉飯的口感豐富，味道香濃，是許多人喜愛的美食。" },
        { id: 5, name: "牛肉麵", image: "../src/assets/culture/foodN.png", pron:"gû-bah-mī" , intro:"牛肉麵是一種台灣傳統小吃，是用牛肉和麵條製成的。牛肉麵的製作方式是將牛肉煮熟後，加入麵條和湯頭，再加上蔥花、香菜等調味料。牛肉麵的口感Q彈，味道鮮美，是許多人喜愛的美食。" },
        { id: 6, name: "珍珠奶茶", image: "../src/assets/culture/foodN.png", pron:"tsin-tsu-ling-tê" , intro:"珍珠奶茶是一種台灣傳統飲品，是用紅茶、牛奶和珍珠製成的。珍珠奶茶的製作方式是將紅茶和牛奶混合後，加入煮熟的珍珠，再加上冰塊。珍珠奶茶的口感Q彈，味道香甜，是許多人喜愛的飲品。" },
        { id: 7, name: "臭豆腐", image: "../src/assets/culture/foodN.png", pron:"tshàu-tāu-hū" , intro:"臭豆腐是一種台灣傳統小吃，是用發酵豆腐製成的。臭豆腐的製作方式是將豆腐發酵後，加入醬料和泡菜，再炸至金黃。臭豆腐的口感酥脆，味道獨特，是許多人喜愛的美食。" },
        { id: 8, name: "雞排", image: "../src/assets/culture/foodN.png", pron:"ke-pâi" , intro:"雞排是一種台灣傳統小吃，是用雞胸肉製成的。雞排的製作方式是將雞胸肉切片後，加入麵粉和調味料，再炸至金黃。雞排的口感酥脆，味道香濃，是許多人喜愛的美食。" },
        { id: 9, name: "刈包", image: "../src/assets/culture/foodN.png", pron:"koah-pau" , intro:"刈包是一種台灣傳統小吃，是用豬肉、酸菜和花生粉製成的。刈包的製作方式是將豬肉煮熟後，加入酸菜和花生粉，再包入蒸熟的麵皮中。刈包的口感豐富，味道香濃，是許多人喜愛的美食。" },
        { id: 10, name: "鹽酥雞", image: "../src/assets/culture/foodN.png", pron:"iâm-soo-ke" , intro:"鹽酥雞是一種台灣傳統小吃，是用雞肉和調味料製成的。鹽酥雞的製作方式是將雞肉切塊後，加入麵粉和調味料，再炸至金黃。鹽酥雞的口感酥脆，味道香濃，是許多人喜愛的美食。" },
        { id: 11, name: "擔仔麵", image: "../src/assets/culture/foodN.png", pron:"tàn-á-mī" , intro:"擔仔麵是一種台灣傳統小吃，是用麵條和豬肉製成的。擔仔麵的製作方式是將麵條煮熟後，加入豬肉和湯頭，再加上蔥花、香菜等調味料。擔仔麵的口感Q彈，味道鮮美，是許多人喜愛的美食。" },
        { id: 12, name: "肉圓", image: "../src/assets/culture/foodN.png", pron:"bah-ôan" , intro:"肉圓是一種台灣傳統小吃，是用豬肉和糯米粉製成的。肉圓的製作方式是將豬肉包入糯米粉中，再蒸熟或炸至金黃。肉圓的口感Q彈，味道香濃，是許多人喜愛的美食。" },
        { id: 13, name: "豆花", image: "../src/assets/culture/foodN.png", pron:"tāu-hue" , intro:"豆花是一種台灣傳統甜品，是用豆漿製成的。豆花的製作方式是將豆漿煮熟後，加入糖水和配料，再冷藏至凝固。豆花的口感滑嫩，味道香甜，是許多人喜愛的甜品。" },
        { id: 14, name: "芋圓", image: "../src/assets/culture/foodN.png", pron:"ōo-înn" , intro:"芋圓是一種台灣傳統甜品，是用芋頭和糯米粉製成的。芋圓的製作方式是將芋頭蒸熟後，加入糯米粉和糖，再搓成小圓球煮熟。芋圓的口感Q彈，味道香甜，是許多人喜愛的甜品。" },
        { id: 15, name: "麻糬", image: "../src/assets/culture/foodN.png", pron:"môa-tsî" , intro:"麻糬是一種台灣傳統甜品，是用糯米粉製成的。麻糬的製作方式是將糯米粉蒸熟後，加入糖和配料，再搓成小圓球。麻糬的口感Q彈，味道香甜，是許多人喜愛的甜品。" }
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
            <div className="row g-4 pt-4">
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