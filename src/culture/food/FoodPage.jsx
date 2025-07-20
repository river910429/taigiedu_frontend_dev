import React, { useState } from 'react';  // Add useState import
import './FoodPage.css';
import FoodModal from './FoodModal';
import nofood from "../../assets/culture/foodN.png"; // 預設無圖片
import food1 from "../../assets/culture/food1.jpg";
import food2 from "../../assets/culture/food2.jpg";
import food3 from "../../assets/culture/food3.jpg";
import food4 from "../../assets/culture/food4.png";
import food5 from "../../assets/culture/food5.jpg";
import food6 from "../../assets/culture/food6.jpg";
import food7 from "../../assets/culture/food7.jpg";
import food8 from "../../assets/culture/food8.jpg";
import food9 from "../../assets/culture/food9.jpg";
import food10 from "../../assets/culture/food10.jpg";
import food11 from "../../assets/culture/food11.jpg";

const FoodPage = () => {
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const foods = [
        { id: 1, name: "地瓜球", image: food1, pron:"hân-tsî-kiû/hân-tsî-uân/hân-tsî-kiû" , intro:"地瓜切塊蒸熟，加入地瓜粉和糖，切小塊搓圓，小火油炸，在地瓜變色前用篩網壓讓地球求膨起來。地瓜球內部是空的，吃起來膨鬆會越吃越上癮。" },
        { id: 2, name: "牛肉湯", image: food2, pron:"gû-bah-thng" , intro:"溫體牛肉薄切，滾燙高湯沖熟，快速上桌。肉質鮮嫩多汁，湯頭清甜帶微微牛骨香。台南特色是湯頭清澈自然、重原味，常搭薑絲或米飯食用。" },
        { id: 3, name: "棺材板", image: food3, pron:"kuann-tshâ-pang" , intro:"厚切吐司油炸至金黃酥脆，挖空後填入奶油白醬與雞肉、蔬菜。外脆內滑，酥香濃郁。造型似棺材盒，為台南創意小吃代表。" },
        { id: 4, name: "擔仔麵", image: food4, pron:"tànn-á-mī" , intro:"源於台南，「擔仔（tàⁿ-á）」為台語「挑肩擔」挑肩擔販售之意。蝦殼熬湯作底，搭配手工細麵，加肉燥、蝦子、蒜泥。湯鮮微鹹，麵條彈牙。傳統作為點心，講求「食巧毋食飽」。" },
        { id: 5, name: "蝦捲", image: food5, pron:"hê-kńg" , intro:"用魚漿、蝦仁、蔬菜包裹後油炸。外皮金黃香脆，內餡鮮甜彈牙。通常沾甜辣醬或芥末醬食用，鹹香四溢，是台南傳統辦桌必備的炸物。" },
        { id: 6, name: "蚵仔煎", image: food6, pron:"ô-á-tsian" , intro:"以新鮮蚵仔搭配地瓜粉漿與蛋液，煎至外皮微酥內嫩，再淋上特製甜辣醬。蚵仔鮮甜多汁，粉漿口感Q滑，蛋香濃郁。整體味道鹹甜交融，外酥內軟，層次豐富，是台灣夜市最具代表性的經典小吃之一。" },
        { id: 7, name: "豆花", image: food7, pron:"tāu-hue" , intro:"豆花以黃豆磨成豆漿，加熱後拌入凝固劑（如石膏或鹽滷）靜置凝固。烹飪時須掌握溫度，使豆花細緻滑嫩。其口感柔軟細膩，入口即化，散發濃郁豆香。特色在於甜鹹皆宜，可搭配糖水、花生、薑汁或鹹湯。" },
        { id: 8, name: "肉圓", image: food8, pron:"bah-uân" , intro:"肉圓以地瓜粉或太白粉製成外皮，包入醃製後的豬肉、香菇、筍丁等內餡，常見烹飪方式有油炸、蒸煮或水煮。口感外皮Q彈滑嫩，內餡鮮美多汁。特色在於外皮晶透有嚼勁，搭配甜辣醬、蒜泥等調味，風味層次豐富，是台灣極具代表性的傳統小吃。" },
        { id: 9, name: "臭豆腐", image: food9, pron:"tshàu-tāu-hū" , intro:"臭豆腐以發酵豆腐製成，常見烹飪方式有油炸、炭烤或水煮。炸臭豆腐外酥內嫩，烤臭豆腐帶有炭香，水煮臭豆腐則滑嫩多汁。其口感外脆內軟或綿密，散發濃烈獨特的發酵香氣。特色在於「聞起來臭、吃起來香」，常搭配泡菜、蒜泥或辣醬。" },
        { id: 10, name: "車輪餅", image: food10, pron:"tshia-lián-kué" , intro:"以麵糊倒入圓形模具中，包入紅豆餡、奶油或其他內餡後煎烤成型。烹飪時需掌握火候，使外皮金黃酥香。口感外皮酥脆或蓬鬆，內餡綿密香甜。特色在於餅皮與餡料比例恰到好處，口感層次豐富，甜而不膩，是台灣街頭常見且深受喜愛的平民點心。" },
        { id: 11, name: "肉燥飯", image: food11, pron:"bah-sò-pn̄g" , intro:"以絞肉（多用豬肉）加入醬油、蒜頭、紅蔥頭等慢火燉煮，熬至肉汁濃郁，淋在白飯上食用。烹飪關鍵在於小火慢燉，使肉質軟嫩入味。口感香濃滑順、鹹香帶甜，肉汁滲入米飯中，層次豐富。特色是樸實卻讓人一吃難忘，是台灣庶民美食的代表。" },
        { id: 12, name: "虱目魚粥", image: nofood, pron:"sat-ba̍k-hî-muâi" , intro:"用虱目魚骨熬湯，搭配去刺虱目魚肚。肉質細嫩、湯頭甘甜鮮美。講究新鮮，沒有腥味。傳統常作為早餐或消夜選擇。" },
        { id: 13, name: "米糕", image: nofood, pron:"bí-ko" , intro:"糯米蒸熟鋪上滷肉燥、花生粉或魚鬆。米粒飽滿有彈性，滷汁香濃微甜。搭配醃菜、甜辣醬油膏，層次豐富。" },
        { id: 14, name: "雞蛋糕", image: nofood, pron:"ke-nn̄g-ko" , intro:"雞蛋糕以雞蛋、麵粉、糖、牛奶調製成麵糊，倒入特製模具中烘烤至金黃蓬鬆。外皮微酥、內層柔軟綿密，帶有淡淡蛋香與甜味。雞蛋糕造型多變，從傳統圓形到可愛卡通圖案皆有，是台灣人童年回憶中最常食用的小吃之一。" },
        { id: 15, name: "碗粿", image: nofood, pron:"uánn-kué" , intro:"米漿加料後蒸成，表面點綴滷肉、蛋黃。口感細滑綿密，搭配甜醬油膏增味。台南碗粿偏甜，米香濃郁，是受歡迎的傳統早餐或點心。" }

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