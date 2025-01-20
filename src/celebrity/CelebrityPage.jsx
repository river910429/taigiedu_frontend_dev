import React, { useState } from 'react';  // Add useState import
import './CelebrityPage.css';
import CelebrityModal from './CelebrityModal';

const CelebrityPage = () => {
    const [selectedCelebrity, setSelectedCelebrity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const celebrities = [
        { id: 1, name: "王育德", image: "./src/assets/celebrity/wyd.jpg", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"王育德是臺南府城本町（這馬臺南市中西區民權路二段）ê人。早年赴日本留學，因為二戰轉來臺灣，一九四五年佇臺南一中任職，推廣臺語戲劇。二二八事件以後流亡日本，kōo研究臺語取著日本東京大學文學博士學位。一九六Ｏ年成立『臺灣青年社』佮出版《臺灣青年》雜誌，成做臺灣獨立運動ê發聲基地；一九七五年開始，為著解決戰後臺灣人日本兵ê補償問題走傱。王育德博士因為政治思想拄著國民政府ê追掠，伊ê一生為臺灣獨立運動盡力，mā予人認為是臺灣民族意識佮語言復振運動ê重要推手之一。 王育德ê寫作有小說、詩、散文、評論、戲劇，以及臺語文學ê書寫佮研究，是臺語文學復興ê重要推動者。伊ê研究佮作品為臺灣本土文化佮語言運動奠定基礎，對後世有多方面ê影響。伊是推廣臺語文ê先行者，伊ê貢獻予臺語文學成做臺灣文學的一个重要領域。王育德博士ê著作涵蓋臺灣政治、歷史佮語言等等濟濟領域，對臺灣文學佮臺灣獨立運動mā仝款有多方面ê廣大影響。", portfolio:"王育德創作涵蓋小說、詩、散文、評論、戲劇。戰後經由葉石濤介紹到當時由龍瑛宗擔任日文版總編輯的「中華日報」工作，一方面為報社撰稿，分別發表短篇小說「春戲」、「老子與墨子」等；另一方面也開始編寫劇本及戲劇演出，第一篇劇本「新生之朝」於1945年10月在臺南延平戲院(昔臺南真善美戲院)演出。" },
        { id: 2, name: "賴仁聲", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。"},
        { id: 3, name: "鄭兒玉", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。"},
        { id: 4, name: "胡長松", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。"},
        { id: 5, name: "吳景裕", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。"},
        { id: 6, name: "胡民祥", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。"},
        { id: 7, name: "簡忠松", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。"},
        { id: 8, name: "蔡奇蘭", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。"},
        { id: 9, name: "楊順明", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。"},
        { id: 10, name: "李勤岸", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。" },
        { id: 11, name: "陳明仁", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。" },
        { id: 12, name: "林央敏", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。" },
        { id: 13, name: "鄭雅怡", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。" },
        { id: 14, name: "陳金順", image: "./src/assets/celebrity/nopic.png", pron:"Ông Io̍k-tek" , subtitle:"1924年1月30日-1985年9月9日", intro:"這是簡介文字。這是簡介文字。這是簡介文字。這是簡介文字。", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。" },
        { id: 15, name: "謝宗佑", image: "./src/assets/celebrity/nopic.png", pron:"Tsiā Tsong-iū" , subtitle:"1996年11月26日-", intro:"還沒畢業的老屁股", portfolio:"這是作品文字。這是作品文字。這是作品文字。這是作品文字。" },
    ];
    const handleCardClick = (celebrity) => {
        setSelectedCelebrity(celebrity);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCelebrity(null);
    };

    return (
        <div className="container py-4">
            <div className="row g-4 pt-4">
                {celebrities.map(celebrity => (
                    <div key={celebrity.id} 
                         className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-custom-5"
                         onClick={() => handleCardClick(celebrity)}>
                        <div className="celebrity-card">
                            <div className="image-container">
                                <img 
                                    src={celebrity.image} 
                                    alt={celebrity.name}
                                    className="celebrity-image"
                                />
                            </div>
                            <h5 className="text-center mt-2">{celebrity.name}</h5>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-start mt-4 celebrity-report-issue">
            <img 
                src="src/assets/question-mark.svg" 
                className="celebrity-question-icon"
            />
            如有任何問題，請點此回報問題
            </div>
            <CelebrityModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                celebrity={selectedCelebrity}
            />
        </div>
    );
};

export default CelebrityPage;