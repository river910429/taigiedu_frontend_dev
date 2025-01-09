import React, { useState } from 'react';  // Add useState import
import './FestivalPage.css';
import FestivalModal from './FestivalModal';

const FestivalPage = () => {
    const [selectedFestival, setSelectedFestival] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const foods = [
        { id: 1, name: "春節", image: "../src/assets/culture/festivalN.png", pron:"Tshun-tseh" , intro:"春節是農曆新年的開始，是華人最重要的傳統節日之一。這一天家家戶戶會貼春聯、放鞭炮、吃年夜飯，並且進行各種慶祝活動，祈求新的一年平安順利。" },
        { id: 2, name: "天公生", image: "../src/assets/culture/festivalN.png", pron:"Thinn-kong-senn" , intro:"天公生是道教信仰中玉皇大帝的誕辰，通常在農曆正月初九慶祝。這一天信徒會到廟宇祭拜，並舉行盛大的慶祝活動，祈求玉皇大帝保佑平安。" },
        { id: 3, name: "元宵", image: "../src/assets/culture/festivalN.png", pron:"Goân-siau" , intro:"元宵節是農曆正月十五，標誌著春節慶祝活動的結束。這一天人們會賞花燈、猜燈謎，並吃元宵，象徵團圓和幸福。" },
        { id: 4, name: "迎媽祖", image: "../src/assets/culture/festivalN.png", pron:"Gîng-má-tsóo" , intro:"迎媽祖是為了紀念媽祖的誕辰和她的神蹟，通常在農曆三月舉行。這一天信徒會舉行盛大的巡遊活動，祈求媽祖保佑航海平安。" },
        { id: 5, name: "清明", image: "../src/assets/culture/festivalN.png", pron:"Tshing-bîng" , intro:"清明節是祭祖和掃墓的日子，通常在公曆4月4日至6日之間。這一天家人會一起到祖先的墓地進行掃墓，並祭拜祖先，表達對先人的懷念和敬意。" },
        { id: 6, name: "端午", image: "../src/assets/culture/festivalN.png", pron:"Tuan-ngoo" , intro:"端午節是為了紀念屈原，通常在農曆五月初五慶祝。這一天人們會賽龍舟、吃粽子，並掛艾草、菖蒲，祈求驅邪避災。" },
        { id: 7, name: "七夕", image: "../src/assets/culture/festivalN.png", pron:"Tshit-sik" , intro:"七夕是中國的情人節，源自牛郎織女的傳說，通常在農曆七月初七慶祝。這一天戀人們會互送禮物，表達愛意，並祈求美好的姻緣。" },
        { id: 8, name: "中元", image: "../src/assets/culture/festivalN.png", pron:"Tiong-goân" , intro:"中元節是農曆七月十五，俗稱鬼節，是祭祀亡靈的日子。這一天人們會祭拜祖先和孤魂野鬼，並舉行普渡儀式，祈求亡靈安息。" },
        { id: 9, name: "搶孤", image: "../src/assets/culture/festivalN.png", pron:"Tshiúnn-koo" , intro:"搶孤是中元節的一項傳統活動，參加者會爬上高柱搶奪供品。這項活動既驚險又刺激，吸引了許多勇敢的年輕人參加，祈求平安和豐收。" },
        { id: 10, name: "中秋", image: "../src/assets/culture/festivalN.png", pron:"Tiong-tshiu" , intro:"中秋節、八月節。我國傳統民俗節日之一。農曆八月十五日，與春節、端午節並列為民間三大傳統節日。通常這天全家會團聚在一起吃月餅、吃柚子、賞月。" },
        { id: 11, name: "重陽", image: "../src/assets/culture/festivalN.png", pron:"Tîng-iông" , intro:"重陽節是農曆九月初九，登高望遠和敬老是這一天的傳統活動。人們會攜帶菊花酒和重陽糕，與家人一起登高，祈求健康長壽。" },
        { id: 12, name: "燒王船", image: "../src/assets/culture/festivalN.png", pron:"Sio-ông-tsûn" , intro:"燒王船是台灣沿海地區的傳統祭典，祈求平安和消災解厄。這一天人們會製作一艘精美的王船，並在儀式結束後將其焚燒，象徵送走災厄。" },
        { id: 13, name: "下元", image: "../src/assets/culture/festivalN.png", pron:"Hā-goân" , intro:"下元節是農曆十月十五，祭祀水官大帝，祈求消災解厄。這一天人們會到廟宇祭拜，並舉行各種祈福活動，祈求水官大帝保佑平安。" },
        { id: 14, name: "冬至", image: "../src/assets/culture/festivalN.png", pron:"Tang-tsì" , intro:"冬至是二十四節氣之一，這一天白天最短，夜晚最長。人們會吃湯圓，象徵團圓和幸福，並進行各種慶祝活動，迎接冬天的到來。" },
        { id: 15, name: "尾牙", image: "../src/assets/culture/festivalN.png", pron:"Bé-ge" , intro:"尾牙是商家感謝員工辛勞的日子，通常在農曆十二月十六舉行。這一天公司會舉行盛大的宴會，獎勵員工一年的辛勤工作，並祈求來年生意興隆。" },
        { id: 16, name: "聖誕節", image: "../src/assets/culture/festivalN.png", pron:"Sìng-tàn-tseh" , intro:"聖誕節是西方的重要節日，紀念耶穌基督的誕生，通常在12月25日慶祝。這一天人們會裝飾聖誕樹、交換禮物，並與家人朋友共度美好時光。" },
    ];
    const handleCardClick = (festival) => {
        setSelectedFestival(festival);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFestival(null);
    };

    return (
        <div className="container py-4">
            <div className="row g-4 pt-4">
                {foods.map(festival => (
                    <div key={festival.id} 
                         className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-custom-5"
                         onClick={() => handleCardClick(festival)}>
                        <div className="festival-card">
                            <div className="image-container">
                                <img 
                                    src={festival.image} 
                                    alt={festival.name}
                                    className="festival-image"
                                />
                            </div>
                            <h5 className="text-center mt-2">{festival.name}</h5>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-start mt-4 festival-report-issue">
            <img 
                src="../src/assets/question-mark.svg" 
                className="food-question-icon"
            />
            如有任何問題，請點此回報問題
            </div>
            <FestivalModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                festival={selectedFestival}
            />
        </div>
    );
};

export default FestivalPage;