import React, { useState } from 'react';
import './SocialmediaPage.css';
import searchIcon from '../assets/home/search_logo.svg';
import chevronUp from '../assets/chevron-up.svg';
import questionMarkIcon from '../assets/question-mark.svg';
import noPics from "../assets/culture/festivalN.png";

const SocialmediaPage = () => {
    const [selectedType, setSelectedType] = useState("分類");  // 將 "類型" 改為 "分類"
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [query, setQuery] = useState("");
    
    // 儲存多選項目，格式為 { 主分類: [子項目1, 子項目2, ...] }
    const [selectedItems, setSelectedItems] = useState({});
    
    const menuItems = {
        '社群': {
            hasSubMenu: true,
            subItems: [
              '文學文化', '民俗', '生態', '在地地景與人物',
              '宗教', '新聞', '講古', '考古', '教育',
              '技藝', '歌仔戲', '活動', '科學', '物理',
              '美食', '旅遊', '笑詼', '唸歌', '教材',
              '親子', '訪談', '部落格','野球', '電影',
              '歌詞', '認證考試', '廣播', '鄭順聰', '演講','醫學'
            ]},
        'YouTube': {
            hasSubMenu: true,
            subItems: [
                '文學文化', '教育', '台語漫才', '在地地景與人物',
                '宗教', '講古', '藝術', '笑詼', '訪談',
                '新聞', '演講朗讀', '廣播',
            ]
        },
        'Podcast': {
            hasSubMenu: false
        },
        '電視綜藝': {
            hasSubMenu: false
        }
    };
    
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.social-custom-dropdown')) {
                setIsDropdownOpen(false);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // 處理多選邏輯
const handleTypeChange = (type, subType = null) => {
  console.log('Before change:', { selectedType, selectedItems });
  
  if (!subType) {
    // 如果是無子選單的主類別，直接選擇
    if (!menuItems[type].hasSubMenu) {
      setSelectedType(type);
      // 清空已選擇的項目
      setSelectedItems({});
      setIsDropdownOpen(false);
    } else {
      // 有子選單的主類別，不做選擇，只是顯示該類別，保持下拉選單開啟
      setSelectedType(type);
    }
  } else {
    // 子選單項目處理 - 直接更新顯示和選項，不使用巢狀 setTimeout
    const newSelectedItems = { ...selectedItems };
    
    // 如果選擇的是新的主類別，先清空之前的選擇
    if (Object.keys(newSelectedItems).length > 0 && !(type in newSelectedItems)) {
      // 完全重置選項
      setSelectedItems({ [type]: [subType] });
      setSelectedType(`${type} > ${subType}`);
      return;
    }
    
    // 初始化該類別的數組，如果不存在
    if (!newSelectedItems[type]) {
      newSelectedItems[type] = [];
    }
    
    // 檢查項目是否已選擇
    const itemIndex = newSelectedItems[type].indexOf(subType);
    
    if (itemIndex > -1) {
      // 已選擇，則移除
      newSelectedItems[type].splice(itemIndex, 1);
      
      // 檢查該類別下是否還有項目
      if (newSelectedItems[type].length === 0) {
        delete newSelectedItems[type];
        setSelectedType(type);
      } else if (newSelectedItems[type].length === 1) {
        setSelectedType(`${type} > ${newSelectedItems[type][0]}`);
      } else {
        setSelectedType(`${type} > ${newSelectedItems[type].length} 個選項`);
      }
    } else {
      // 未選擇，則添加
      newSelectedItems[type].push(subType);
      
      if (newSelectedItems[type].length === 1) {
        setSelectedType(`${type} > ${subType}`);
      } else {
        setSelectedType(`${type} > ${newSelectedItems[type].length} 個選項`);
      }
    }
    
    // 一次性更新狀態，防止多次渲染
    setSelectedItems(newSelectedItems);
  }
  
  console.log('After change:', { type, subType });
};
    

    // 更新顯示的選擇類型文字
    const updateSelectedTypeDisplay = (type) => {
        // 確保 selectedItems 已更新
        if (!selectedItems[type] || selectedItems[type].length === 0) {
            setSelectedType(type);
            return;
        }
        
        if (selectedItems[type].length === 1) {
            setSelectedType(`${type} > ${selectedItems[type][0]}`);
        } else {
            setSelectedType(`${type} > ${selectedItems[type].length} 個選項`);
        }
    }

    // 檢查項目是否被選擇
    const isItemSelected = (type, subType) => {
        return selectedItems[type] && selectedItems[type].includes(subType);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim() === "") return;
    };

    const socialMediaItems = {
        工具: [
            { id: 1, title: "教育部臺灣台語常用詞辭典", url: "https://sutian.moe.edu.tw/zh-hant/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://sutian.moe.edu.tw/zh-hant/" },
            { id: 2, title: "Chhoe Taigi 找台語", url: "https://chhoe.taigi.info/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://chhoe.taigi.info/" },
            { id: 3, title: "臺灣台語語料庫 應用檢索系統", url: "https://tggl.naer.edu.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://tggl.naer.edu.tw/" },
            { id: 4, title: "學科術語臺灣台語/臺灣客語對譯查詢", url: "https://stti.moe.edu.tw/?lang=sutgi", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://stti.moe.edu.tw/?lang=sutgi" },
            { id: 5, title: "姓名查詢念法網站", url: "https://sutian.moe.edu.tw/zh-hant/huliok/miasenn/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://sutian.moe.edu.tw/zh-hant/huliok/miasenn/" },
            { id: 6, title: "芋圓台語字典 Taro Dictionary (iOS)", url: "https://apps.apple.com/tw/app/%E8%8A%8B%E5%9C%93%E5%8F%B0%E8%AA%9E%E5%AD%97%E5%85%B8-taro-dictionary/id6477933002", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://apps.apple.com/tw/app/%E8%8A%8B%E5%9C%93%E5%8F%B0%E8%AA%9E%E5%AD%97%E5%85%B8-taro-dictionary/id6477933002" },
            { id: 7, title: "台字田", url: "https://ji.taioan.org/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://ji.taioan.org/" }
        ],
        百科: [
            { id: 1, title: "WIKI-TÔ͘-SU-KOÁN", url: "https://zh-min-nan.wikisource.org/wiki/Th%C3%A2u-ia%CC%8Dh", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://zh-min-nan.wikisource.org/wiki/Th%C3%A2u-ia%CC%8Dh" },
            { id: 2, title: "讀台語，學科學 Tha̍k Tâi-gí, o̍h kho-ha̍k", url: "https://funbiochampion.com/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://funbiochampion.com/" },
            { id: 3, title: "逐工一幅天文圖", url: "https://apod.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://apod.tw/" },
            { id: 4, title: "【鄭詩宗Blog】內外科看護學", url: "https://lgkkhanhouhak.blogspot.com/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://lgkkhanhouhak.blogspot.com/" },
            { id: 5, title: "醫用台語", url: "https://i-ocw.ctld.ncku.edu.tw/site/course_content/FT_01rR0hjh", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://i-ocw.ctld.ncku.edu.tw/site/course_content/FT_01rR0hjh" },
            { id: 6, title: "醫學台語/台灣醫學語言資料庫", url: "https://chuliaukhou.blogspot.com/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://chuliaukhou.blogspot.com/" },
            { id: 7, title: "地名資訊服務網", url: "https://gn.moi.gov.tw/GeoNames/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://gn.moi.gov.tw/GeoNames/" },
            { id: 8, title: "教育部以本土語言標注臺灣地名計畫成果", url: "https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/mhigeonames/twplacename.html", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/mhigeonames/twplacename.html" },
            { id: 9, title: "台語漢字羅馬本 聖經", url: "https://www.sl-pc.org.tw/bible/4", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.sl-pc.org.tw/bible/4" },
            { id: 10, title: "飛閱文學地景(第一~九季)", url: "https://www.youtube.com/watch?v=vmUM7gfbMLs&list=PLMxcTS5", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/watch?v=vmUM7gfbMLs&list=PLMxcTS5" },
            { id: 11, title: "臺灣台語典藏 – 歷史語言與分佈變遷資料庫", url: "http://cls.lib.ntu.edu.tw/southernmin/index.htm", image: "https://urlscan.io/liveshot/?width=300&height=300&url=http://cls.lib.ntu.edu.tw/southernmin/index.htm" },
            { id: 12, title: "台灣大百科全書", url: "https://nrch.culture.tw/#", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://nrch.culture.tw/#" }
        ],
        各地教育機構: [
            { id: 1, title: "教育部臺灣台語語言能力認證", url: "https://blgjts.moe.edu.tw/tmt/index.php", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://blgjts.moe.edu.tw/tmt/index.php" },
            { id: 2, title: "CIRN國民中小學課程與教學資源整合平臺", url: "https://cirn.moe.edu.tw/Facet/Home/index.aspx?HtmlName=Home&ToUrl=", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://cirn.moe.edu.tw/Facet/Home/index.aspx?HtmlName=Home&ToUrl=" },
            { id: 3, title: "本土教育資源網", url: "https://cirn.moe.edu.tw/Module/index.aspx?sid=1107", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://cirn.moe.edu.tw/Module/index.aspx?sid=1107" },
            { id: 4, title: "國民中小學臺灣台語沉浸式教學", url: "https://cirn.moe.edu.tw/Module/index.aspx?sid=1156", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://cirn.moe.edu.tw/Module/index.aspx?sid=1156" },
            { id: 5, title: "高級中等學校本土語文教育資源中心首頁", url: "https://cirn.moe.edu.tw/Module/index.aspx?sid=1195", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://cirn.moe.edu.tw/Module/index.aspx?sid=1195" },
            { id: 6, title: "教育雲數位學習入口網", url: "https://elearning.cloud.edu.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://elearning.cloud.edu.tw/" },
            { id: 7, title: "教育部語文成果網", url: "https://language.moe.gov.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://language.moe.gov.tw/" },
            { id: 8, title: "臺灣台語文數位教材", url: "https://holo.iformosa.com.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://holo.iformosa.com.tw/" },
            { id: 9, title: "本土語文直播共學", url: "https://livestudy.tw/1", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://livestudy.tw/1" }
        ],
        綜合資料網站: [
            { id: 1, title: "李江却台語文教基金會", url: "https://www.tgb.org.tw/p/blog-page_9.html", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.tgb.org.tw/p/blog-page_9.html" },
            { id: 2, title: "台文通訊BONG報", url: "https://tsbp.tgb.org.tw", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://tsbp.tgb.org.tw" },
            { id: 3, title: "台灣語文測驗中心 全民台語認證", url: "https://ctlt.twl.ncku.edu.tw/gtpt/index.html", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://ctlt.twl.ncku.edu.tw/gtpt/index.html" },
            { id: 4, title: "教育部臺灣台語語言能力認證", url: "https://blgjts.moe.edu.tw/tmt/view.php?page=resource", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://blgjts.moe.edu.tw/tmt/view.php?page=resource" },
            { id: 5, title: "Bite-size Taiwanese 一嘴台語", url: "https://bitesizetaiwanese.com/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://bitesizetaiwanese.com/" },
            { id: 6, title: "O̍h Tâi-gí 學台語", url: "https://laioh.taigi.info/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://laioh.taigi.info/" },
            { id: 7, title: "Tâi-gí 做伙耍", url: "https://www.taigi-domiso.com/%E9%A6%96%E9%A0%81", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.taigi-domiso.com/%E9%A6%96%E9%A0%81" },
            { id: 8, title: "TÂI-GÍ-BÛN KÌ-EK 台語文記憶", url: "https://kiek.taigi.info/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://kiek.taigi.info/" },
            { id: 9, title: "Tâi-gí Kàu-ha̍k Tsu-goân 台語教學資源", url: "https://ctlt.twl.ncku.edu.tw/kauhak/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://ctlt.twl.ncku.edu.tw/kauhak/" },
            { id: 10, title: "Tâi-oân Chè-chō", url: "https://taiwanesevocabulary.wordpress.com/page/81/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://taiwanesevocabulary.wordpress.com/page/81/" },
            { id: 11, title: "TGB通訊 台灣組合", url: "https://taioanchouhap.pixnet.net/blog/category/583492", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://taioanchouhap.pixnet.net/blog/category/583492" },
            { id: 12, title: "PE̍H-ŌE-JĪ BÛN-HIÀN KOÁN 白話字文獻館", url: "https://bunhiankoan.poj.tw/2010/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://bunhiankoan.poj.tw/2010/" },
            { id: 13, title: "PE̍H-ŌE-JĪ BÛN-HIÀN KOÁN 白話字文獻館", url: "https://bunhiankoan.poj.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://bunhiankoan.poj.tw/" },
            { id: 14, title: "《歌仔冊》唸唱學習知識網", url: "https://liamkua.lib.ntu.edu.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://liamkua.lib.ntu.edu.tw/" },
            { id: 15, title: "《講台語當著時》第一季文字稿", url: "https://hackmd.io/VzCCOuEUT-6dnp5WjaYVVw#%E3%80%8A%E8%AC%9B%E5%8F%B0%E8%AA%9E%E7%95%B6%E8%91%97%E6%99%82%E3%80%8B%E7%AC%AC%E4%B8%80%E5%AD%A3%E6%96%87%E5%AD%97%E7%A8%BF", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://hackmd.io/VzCCOuEUT-6dnp5WjaYVVw" },
            { id: 16, title: "【國立臺灣文學館】台語文學發展史資料庫", url: "https://db.nmtl.gov.tw/site3/index", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://db.nmtl.gov.tw/site3/index" },
            { id: 17, title: "【國立臺灣文學館】台灣民間文學歌仔冊資料庫", url: "https://db.nmtl.gov.tw/site4/s5/index", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://db.nmtl.gov.tw/site4/s5/index" },
            { id: 18, title: "【國立臺灣文學館】白話字數位典藏博物館", url: "https://db.nmtl.gov.tw/site3/home", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://db.nmtl.gov.tw/site3/home" },
            { id: 19, title: "公視台語台- Taigi TV Station", url: "https://www.taigitv.org.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.taigitv.org.tw/" },
            { id: 20, title: "Tâi-uân Káng Sin Ue-kū 公視母語小學堂-台灣講新話舊", url: "http://kongtaigi.pts.org.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=http://kongtaigi.pts.org.tw/" }
        ],
        社群: [
            { id: 1, title: "老人囡仔性 閒閒罔話仙", url: "https://chhantionglang.blogspot.com/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://chhantionglang.blogspot.com/" },
            { id: 2, title: "簫平治作田人博物館", url: "https://siaulahjih.github.io/ChohChhanLang/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://siaulahjih.github.io/ChohChhanLang/" },
            { id: 3, title: "台灣俗語鹹酸甜第1冊", url: "https://siaulahjih.github.io/KiamSngTinn1/chheh/08-25.html", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://siaulahjih.github.io/KiamSngTinn1/chheh/08-25.html" },
            { id: 4, title: "台灣俗語鹹酸甜第2冊", url: "https://siaulahjih.github.io/KiamSngTinn2/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://siaulahjih.github.io/KiamSngTinn2/" },
            { id: 5, title: "台灣俗語鹹酸甜第3冊", url: "https://siaulahjih.github.io/KiamSngTinn3/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://siaulahjih.github.io/KiamSngTinn3/" },
            { id: 6, title: "還我台灣鳥á名", url: "https://siaulahjih.github.io/TaiOanChiauA/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://siaulahjih.github.io/TaiOanChiauA/" },
            { id: 7, title: "劉承賢：一倒水", url: "http://taokara.blogspot.com/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=http://taokara.blogspot.com/" },
            { id: 8, title: "春天ｅ霧 陳金順部落格", url: "https://mypaper.pchome.com.tw/19660329", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://mypaper.pchome.com.tw/19660329" },
            { id: 9, title: "台語心世界 Tâi-gú Sim Sè-kài(台語)", url: "https://ungian.pixnet.net/blog/category/869906", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://ungian.pixnet.net/blog/category/869906" },
            { id: 10, title: "洪惟仁 治言齋", url: "https://www.uijin.idv.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.uijin.idv.tw/" },
            { id: 11, title: "國立成功大學蔣為文教授出版品", url: "https://ebook.de-han.org/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://ebook.de-han.org/" },
            { id: 12, title: "A siâm", url: "https://pisiam.blogspot.com/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://pisiam.blogspot.com/" }
        ],
        YouTube: [
            { id: 1, title: "A-ian 台語冷智識", url: "https://www.youtube.com/channel/UCYom-OkXXhj4a2I5sKI72zA", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/channel/UCYom-OkXXhj4a2I5sKI72zA" },
            { id: 2, title: "Aiong Taigi 阿勇台語", url: "https://www.youtube.com/@AiongTaigi", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/@AiongTaigi" },
            { id: 3, title: "Báng-gà 台語青春", url: "https://www.youtube.com/playlist?list=PL9X_7mTn8zvWGkwUdZEqnHs9ggcMDWJs0", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/playlist?list=PL9X_7mTn8zvWGkwUdZEqnHs9ggcMDWJs0" },
            { id: 4, title: "BANLAMGU", url: "https://www.youtube.com/@BANLAMGU", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/@BANLAMGU" },
            { id: 5, title: "Chaochia Tu 凃文", url: "https://www.youtube.com/@chaochiatu/videos", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/@chaochiatu/videos" },
            { id: 6, title: "DaiDai Friends 呆呆伙伴", url: "https://www.youtube.com/@DaiDaiFriends", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/@DaiDaiFriends" },
            { id: 7, title: "Nâ-phîng 教台語", url: "https://www.youtube.com/@NP_Taigi/featured", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/@NP_Taigi/featured" },
            { id: 8, title: "Pah-kang kóng-tâi-gí 百工講台語", url: "https://www.youtube.com/playlist?list=PL1jBQxu5EklfpII_NYQg4akaoGDYECblQ", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/playlist?list=PL1jBQxu5EklfpII_NYQg4akaoGDYECblQ" },
            { id: 9, title: "Tâi-gí sin-bûn 台語新聞", url: "https://www.youtube.com/playlist?list=PL1jBQxu5Eklfor6Q3feEoW9IzXou1yFBN", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/playlist?list=PL1jBQxu5Eklfor6Q3feEoW9IzXou1yFBN" },
            { id: 10, title: "Taiwanese for Grown-ups 大人ê台語", url: "https://www.youtube.com/@tualang_gilik", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/@tualang_gilik" }
        ],
        Podcast: [
            { id: 1, title: "Bear's Taiwanese talk 肥宅熊的台語日常雜記", url: "https://podcasters.spotify.com/pod/show/bear-hsu", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://podcasters.spotify.com/pod/show/bear-hsu" },
            { id: 2, title: "Cheng-sîn bóng khai-káng 精神罔開講", url: "https://podcasts.apple.com/tw/podcast/%E7%B2%BE%E7%A5%9E%E7%BD%94%E9%96%8B%E8%AC%9B-cheng-s%C3%AEn-b%C3%B3ng-khai-k%C3%A1ng/id1777512019?l=en-GB", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://podcasts.apple.com/tw/podcast/%E7%B2%BE%E7%A5%9E%E7%BD%94%E9%96%8B%E8%AC%9B-cheng-s%C3%AEn-b%C3%B3ng-khai-k%C3%A1ng/id1777512019?l=en-GB" },
            { id: 3, title: "Chhia-pang Hòng-sàng Kio̍k 車幫放送局", url: "https://podcasts.apple.com/us/podcast/chhia-pang-h%C3%B2ng-s%C3%A0ng-kio-k-%E8%BB%8A%E5%B9%AB%E6%94%BE%E9%80%81%E5%B1%80/id1675105349", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://podcasts.apple.com/us/podcast/chhia-pang-h%C3%B2ng-s%C3%A0ng-kio-k-%E8%BB%8A%E5%B9%AB%E6%94%BE%E9%80%81%E5%B1%80/id1675105349" },
            { id: 4, title: "Chò Kang á Lâng Tâi-gí Kang-chok-sek 做工á人台語工作室", url: "https://podcasts.apple.com/tw/podcast/%E5%81%9A%E5%B7%A5%C3%A1%E4%BA%BA%E5%8F%B0%E8%AA%9E%E5%B7%A5%E4%BD%9C%E5%AE%A4-ch%C3%B2-kang-%C3%A1-l%C3%A2ng-t%C3%A2i-g%C3%AD-kang-chok-sek/id1730745763", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://podcasts.apple.com/tw/podcast/%E5%81%9A%E5%B7%A5%C3%A1%E4%BA%BA%E5%8F%B0%E8%AA%9E%E5%B7%A5%E4%BD%9C%E5%AE%A4-ch%C3%B2-kang-%C3%A1-l%C3%A2ng-t%C3%A2i-g%C3%AD-kang-chok-sek/id1730745763" },
            { id: 5, title: "eng-ha̍k-ú-tiū 英學宇宙", url: "https://enkhakutiu.firstory.io/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://enkhakutiu.firstory.io/" },
            { id: 6, title: "Ka-hui ê 台文故事", url: "https://player.soundon.fm/p/2c676d5c-3695-48de-a78e-f84299a6ea33", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://player.soundon.fm/p/2c676d5c-3695-48de-a78e-f84299a6ea33" },
            { id: 7, title: "Lán ê 島嶼．lán ê 歷史", url: "https://2018lane.rti.org.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://2018lane.rti.org.tw/" },
            { id: 8, title: "NASA 逐工一幅天文圖 APOD Taigi", url: "https://apod-taigi.firstory.io/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://apod-taigi.firstory.io/" },
            { id: 9, title: "pîng-iú ài kóng-uē 邊友愛講話", url: "https://podcasters.spotify.com/pod/show/pinn-iu-hue", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://podcasters.spotify.com/pod/show/pinn-iu-hue" },
            { id: 10, title: "Stray Birds 浪鳥集 ｜泰戈爾詩集台語版", url: "https://podcasts.apple.com/tw/podcast/%E6%B5%AA%E9%B3%A5%E9%9B%86-stray-birds-%E6%B3%B0%E6%88%88%E7%88%BE%E8%A9%A9%E9%9B%86%E5%8F%B0%E8%AA%9E%E7%89%88/id1660521682", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://podcasts.apple.com/tw/podcast/%E6%B5%AA%E9%B3%A5%E9%9B%86-stray-birds-%E6%B3%B0%E6%88%88%E7%88%BE%E8%A9%A9%E9%9B%86%E5%8F%B0%E8%AA%9E%E7%89%88/id1660521682" }
        ],
        遊戲: [
            { id: 1, title: "臺灣台語羅馬字拼音教學網", url: "https://tailo.moe.edu.tw/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://tailo.moe.edu.tw/" },
            { id: 2, title: "台語700字(1200詞）", url: "https://quizlet.com/tw/177944800/%E5%8F%B0%E8%AA%9E700%E5%AD%971200%E8%A9%9E-flash-cards/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://quizlet.com/tw/177944800/%E5%8F%B0%E8%AA%9E700%E5%AD%971200%E8%A9%9E-flash-cards/" },
            { id: 3, title: "台語美聲/台灣媠聲/ Beautiful Taiwanese", url: "https://ankiweb.net/shared/info/741273519", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://ankiweb.net/shared/info/741273519" },
            { id: 4, title: "106臺灣台語認證線上互動遊戲題庫-拼音測驗", url: "https://mhi.moe.edu.tw/exam/TSMhiExam-000107/?lang=", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://mhi.moe.edu.tw/exam/TSMhiExam-000107/?lang=" },
            { id: 5, title: "106臺灣台語認證線上互動遊戲題庫-閱讀選答", url: "https://mhi.moe.edu.tw/exam/TSMhiExam-000106/?lang=", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://mhi.moe.edu.tw/exam/TSMhiExam-000106/?lang=" },
            { id: 6, title: "106臺灣台語認證線上互動遊戲題庫-聽音選答", url: "https://mhi.moe.edu.tw/exam/TSMhiExam-000105/?lang=", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://mhi.moe.edu.tw/exam/TSMhiExam-000105/?lang=" },
            { id: 7, title: "106臺灣台語認證線上互動遊戲題庫-聽音選圖", url: "https://mhi.moe.edu.tw/exam/TSMhiExam-000108/?lang=", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://mhi.moe.edu.tw/exam/TSMhiExam-000108/?lang=" },
            { id: 8, title: "107臺灣台語互動遊戲題庫", url: "https://mhi.moe.edu.tw/exam/TSMhiExam-000109/?lang=", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://mhi.moe.edu.tw/exam/TSMhiExam-000109/?lang=" },
            { id: 9, title: "12天將戰記", url: "http://www.tp-12g.tw/game.php", image: "https://urlscan.io/liveshot/?width=300&height=300&url=http://www.tp-12g.tw/game.php" },
            { id: 10, title: "Glossika Logo Glossika", url: "https://ai.glossika.com/language/learn-taiwanese-hokkien", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://ai.glossika.com/language/learn-taiwanese-hokkien" },
            { id: 11, title: "Html5 小遊戲", url: "https://game.k123.tw/game/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://game.k123.tw/game/" },
            { id: 12, title: "PAGUI打鬼", url: "https://store.steampowered.com/app/986680/PAGUI/?l=tchinese&curator_clanid=31470152", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://store.steampowered.com/app/986680/PAGUI/?l=tchinese&curator_clanid=31470152" },
            { id: 13, title: "Wordwall 小遊戲", url: "https://wordwall.net/tc-tw/community/%E5%8F%B0%E7%81%A3-%E9%96%A9%E5%8D%97%E8%AA%9E", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://wordwall.net/tc-tw/community/%E5%8F%B0%E7%81%A3-%E9%96%A9%E5%8D%97%E8%AA%9E" },
            { id: 14, title: "夕生 Halflight", url: "https://store.steampowered.com/app/724370/_Halflight/?l=tchinese", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://store.steampowered.com/app/724370/_Halflight/?l=tchinese" }
        ],
        卡通動漫: [
            { id: 1, title: "DaiDai Friends 呆呆伙伴", url: "https://www.facebook.com/daidaifriends/?_rdr", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.facebook.com/daidaifriends/?_rdr" },
            { id: 2, title: "FOOD超人動畫", url: "https://www.youtube.com/playlist?list=PLqScWeuVBoK1bhNB4DmNNgFmFHshP9JYM", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/playlist?list=PLqScWeuVBoK1bhNB4DmNNgFmFHshP9JYM" },
            { id: 3, title: "GO!GO!原子小金剛", url: "https://twbangga.moe.edu.tw/animation/BBB1CCC3-2D42-EE11-BC8D-005056B2D58D", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://twbangga.moe.edu.tw/animation/BBB1CCC3-2D42-EE11-BC8D-005056B2D58D" },
            { id: 4, title: "Lí Kám Chai-iáⁿ 你敢知影", url: "https://www.instagram.com/likamchaiiann/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.instagram.com/likamchaiiann/" },
            { id: 5, title: "My Little Boys- A Nee Gu 小兒子阿甯咕", url: "https://www.youtube.com/@ANeeGu/playlists", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/@ANeeGu/playlists" },
            { id: 6, title: "PokemonGO Tân Tekjū", url: "https://www.instagram.com/phokhibonggo", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.instagram.com/phokhibonggo" },
            { id: 7, title: "SPY×FAMILY間諜家家酒", url: "https://www.ptsplus.tv/zh/programs/cf7d9b53-9092-478e-875f-7deb8e2e18fd", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.ptsplus.tv/zh/programs/cf7d9b53-9092-478e-875f-7deb8e2e18fd" }
        ],
        音樂: [
            { id: 1, title: "Báng-gà 台語青春", url: "https://www.youtube.com/playlist?list=PL9X_7mTn8zvVOAnbXsoSfL3_9L-KK4pUl", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.youtube.com/playlist?list=PL9X_7mTn8zvVOAnbXsoSfL3_9L-KK4pUl" },
            { id: 2, title: "Î Tshing 余青", url: "https://www.instagram.com/_itshing", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.instagram.com/_itshing" },
            { id: 3, title: "kóng Tâi-gí kuè-ji̍t 講台語過日", url: "https://www.instagram.com/taigi_kuejit/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://www.instagram.com/taigi_kuejit/" },
            { id: 4, title: "Tâi-gú koa-phóo bāng-chā", url: "https://tg-koaphoo.blogspot.com/", image: "https://urlscan.io/liveshot/?width=300&height=300&url=https://tg-koaphoo.blogspot.com/" }
        ]
    };

    const handleCardClick = (url) => {
        window.open(url, '_blank');
    };
    const dropdownStyle = {
      backgroundImage: `url(${chevronUp})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'calc(100% - 16px) center',
      backgroundSize: '20px 20px'
  };
    return (
        <div className="socialmedia-page">
            <div className="socialmedia-header">
                <div className="container px-4">
                    <div className="socialmedia-header-content">
                        <div className="social-custom-dropdown">
                            <div 
                                className="dropdown-header social-type-dropdown"
                                style={dropdownStyle}
                                onClick={() => {
                                    console.log("dropdown-header clicked");
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                            >
                                {selectedType}
                            </div>
                            {isDropdownOpen && (
                                <div className="social-dropdown-menu">
                                    {Object.entries(menuItems).map(([type, { hasSubMenu, subItems }]) => (
                                        <div key={type} className="social-dropdown-item-container">
                                            {!hasSubMenu ? (
                                                <div
                                                    className="social-dropdown-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTypeChange(type);
                                                    }}
                                                >
                                                    {type}
                                                </div>
                                            ) : (
                                                <div 
                                                    className="social-dropdown-item with-submenu"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // 只改變顯示的主類別名稱，不觸發選擇
                                                        if (selectedType !== type) {
                                                            setSelectedType(type);
                                                        }
                                                    }}
                                                >
                                                    <span>{type}</span>
                                                    <span className="social-submenu-arrow">›</span>
                                                    <div 
                                                        className="social-submenu"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {subItems.map(subItem => (
                                                            <div
                                                            key={subItem}
                                                            className={`social-submenu-item ${isItemSelected(type, subItem) ? 'selected' : ''}`}
                                                            onMouseDown={(e) => { // 改用 onMouseDown 代替 onClick，反應更靈敏
                                                              e.preventDefault(); 
                                                              e.stopPropagation();
                                                              handleTypeChange(type, subItem);
                                                            }}
                                                          >
                                                            {subItem}
                                                            {isItemSelected(type, subItem) && (
                                                              <span className="checkmark">✓</span>
                                                            )}
                                                          </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSearch} className="social-search-container">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="搜尋..."
                                className="social-search-input"
                            />
                            <img
                                src={searchIcon}
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
                                                onError={(e) => {
                                                    e.target.src = noPics;
                                                }}
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
                <img src={questionMarkIcon} className="question-icon" />
                如有任何問題，請點此回報問題
            </div>
        </div>
    );
};

export default SocialmediaPage;