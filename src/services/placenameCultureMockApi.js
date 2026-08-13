// 台語地名與文化 Mock API
// ------------------------------------------------------------------
// 之後串接後端時，只需替換此檔內各函式的實作（改為打真正的 API），
// 元件端不需變動。回傳格式刻意模擬後端 { status, data } 結構。
//
// 對應（預期）後端端點：
//   getRegions()                -> GET /api/placename/regions
//   getCounties(region)         -> GET /api/placename/regions/:region/counties
//   getDistrictList(county)     -> GET /api/placename/counties/:county/districts
//   getDistrictBrief(name)      -> GET /api/placename/districts/:name/brief
//   getDistrictDetail(name)     -> GET /api/placename/districts/:name
//
// ⚠️ 目前為 mock 階段：除了「安平區」「七股區」「安南區」「新營區」帶有 PM 提供的真實文案
//    （其中僅「安平區」「新營區」有里舊名），其餘行政區皆以樣板文字產生，僅供版面驗證使用。
// ------------------------------------------------------------------

const DELAY = 120;

const respond = (data) =>
    new Promise((resolve) => setTimeout(() => resolve({ status: 'success', data }), DELAY));

// ---- 地區 / 縣市（保留未來擴增地圖使用，目前僅開放臺南市）----
const REGIONS = ['北部地區', '中部地區', '南部地區', '東部地區', '離島地區'];

const COUNTIES_BY_REGION = {
    北部地區: [],
    中部地區: [],
    南部地區: ['臺南市'],
    東部地區: [],
    離島地區: [],
};

// ---- 37 個行政區的台羅拼音與古地名 ----
const DISTRICTS = [
    { name: '中西區', romaji: 'Tiong-se-khu', oldName: '赤崁' },
    { name: '東區', romaji: 'Tang-khu', oldName: '大東門外' },
    { name: '南區', romaji: 'Lâm-khu', oldName: '鹽埕' },
    { name: '北區', romaji: 'Pak-khu', oldName: '三分子' },
    { name: '安平區', romaji: 'An-pîng-khu', oldName: '大員' },
    { name: '安南區', romaji: 'An-lâm-khu', oldName: '安順' },
    { name: '永康區', romaji: 'Íng-khong-khu', oldName: '埔羌頭' },
    { name: '歸仁區', romaji: 'Kui-jîn-khu', oldName: '歸仁北里' },
    { name: '新化區', romaji: 'Sin-huà-khu', oldName: '大目降' },
    { name: '左鎮區', romaji: 'Tsó-tìn-khu', oldName: '拔馬' },
    { name: '玉井區', romaji: 'Gio̍k-tsénn-khu', oldName: '噍吧哖' },
    { name: '楠西區', romaji: 'Lâm-se-khu', oldName: '茄拔' },
    { name: '南化區', romaji: 'Lâm-huà-khu', oldName: '南庄' },
    { name: '仁德區', romaji: 'Jîn-tik-khu', oldName: '塗庫' },
    { name: '關廟區', romaji: 'Kuan-biō-khu', oldName: '香洋仔' },
    { name: '龍崎區', romaji: 'Liông-khi-khu', oldName: '番社' },
    { name: '官田區', romaji: 'Kuan-tiân-khu', oldName: '官佃' },
    { name: '麻豆區', romaji: 'Muâ-tāu-khu', oldName: '蔴荳' },
    { name: '佳里區', romaji: 'Ka-lí-khu', oldName: '蕭壠' },
    { name: '西港區', romaji: 'Se-káng-khu', oldName: '西港仔' },
    { name: '七股區', romaji: 'Tshit-kóo-khu', oldName: '七股寮' },
    { name: '將軍區', romaji: 'Tsiong-kun-khu', oldName: '漚汪' },
    { name: '學甲區', romaji: 'Ha̍k-kah-khu', oldName: '學甲寮' },
    { name: '北門區', romaji: 'Pak-mn̂g-khu', oldName: '北門嶼' },
    { name: '新營區', romaji: 'Sin-iânn-khu', oldName: '舊營' },
    { name: '後壁區', romaji: 'Āu-piah-khu', oldName: '後壁寮' },
    { name: '白河區', romaji: 'Pe̍h-hô-khu', oldName: '店仔口' },
    { name: '東山區', romaji: 'Tang-suann-khu', oldName: '番仔田' },
    { name: '六甲區', romaji: 'La̍k-kah-khu', oldName: '六甲庄' },
    { name: '下營區', romaji: 'Ē-iânn-khu', oldName: '海墘營' },
    { name: '柳營區', romaji: 'Liú-iânn-khu', oldName: '查畝營' },
    { name: '鹽水區', romaji: 'Kiâm-tsuí-khu', oldName: '月津' },
    { name: '善化區', romaji: 'Siān-huà-khu', oldName: '目加溜灣' },
    { name: '大內區', romaji: 'Tuā-lāi-khu', oldName: '內庄' },
    { name: '山上區', romaji: 'Suann-siōng-khu', oldName: '山仔頂' },
    { name: '新市區', romaji: 'Sin-tshī-khu', oldName: '新港社' },
    { name: '安定區', romaji: 'An-tīng-khu', oldName: '直加弄' },
];

// ---- 設計稿提供的真實文案 ----
const REAL_TEXT = {
    安平區: [
        '【「大員」、「台灣」與大武壠族「臺窩灣社」，荷蘭時期的東番夷人、安平「臺江內海」、「熱蘭遮城」與「一鯤鯓」】',
        '「大員」又稱「臺員」是一個古地名，原指臺南市安平區「臺江內海」。荷蘭時期乃指今日之安平區，當時也稱作「一鯤鯓」。17世紀荷蘭時期，大員被引申為「熱蘭遮城」（今安平古堡）所在的一鯤鯓。',
        '早在荷蘭人之前，漢人就在海上並且在赤崁（今台南市中西區）至魍港（今嘉義縣布袋鎮）一帶活動，與平埔族人做貿易。關於「大員」之由來，一種普遍的說法說此詞來自臺灣大武壠族大灣社或臺窩灣社之名轉化而來。',
        '明朝萬曆三十年（1602年－1603年），福建連江人陳第隨沈有容追捕倭寇至臺灣安平外海，歸後作《東番記》。文中提到閩南語音大員，說明是「東番夷人不知所自始，居彭湖外洋海島中。起魍港、加老灣，歷大員、堯港、打狗嶼、小淡水、雙溪口、加哩林、沙巴里、大幫坑，皆其居也」。',
        '其後，福建莆田人周嬰在其所著《遠遊篇》中，引《東番記》稱之為臺員。大員、臺員，皆閩南語音，這是最早出現在文獻上的「臺灣」原始文字的前身。但指的僅僅是現在臺南「安平」一地，當時臺江未淤積，「臺員」乃一小島，也有稱之為「一鯤鯓」。',
        '1624年，荷蘭人攻佔明朝領土澎湖，因在當時明軍準備發動攻勢的威脅下，雙方開始交涉，最後請荷蘭人退出澎湖轉至當時非明朝領土的臺員。1632年，荷蘭人於島上築城並取名熱蘭遮城。1662年延平王鄭成功趕走荷蘭人，設「東都」於赤崁，乃以故鄉「安平」命名。',
        '十七世紀中期，這些沙洲因為淤積而逐漸接近乃至相連。1661年，鄭成功出兵攻打臺灣時，七個鯤身島已經連成一個與內陸相連的長條狀的沙洲半島。鯤身半島和臺灣本島間的臺江內海，在清道光年間逐漸淤淺，最後陸化消失，與臺南連成一片。',
    ],
    七股區: [
        '七股區（臺灣話：Tshit-kóo-khu）位於臺灣臺南市最西端，為台灣本島最西端的行政區，北臨將軍區，東鄰佳里區、西港區，西濱臺灣海峽，南接安南區，境內的十份里尖仔尾（國聖港燈塔附近）係台灣本島最西端所在。',
        '該區屬濱海地區，地形多為潮汐灘地、沙洲、潟湖，沿岸多紅樹林，為候鳥群聚棲息之地，區內的曾文溪出海口溼地更是瀕臨絕種鳥類－黑面琵鷺全球最重要的棲息地。氣候上屬熱帶季風氣候，產業則以農業、漁業為主。',
    ],
    安南區: [
        '安南區（臺灣話：An-lâm-khu），舊稱「安順」，位於臺灣臺南市西部，屬於臺南都會區的一部份，東鄰永康區、新市區、安定區，西濱臺灣海峽，南以鹽水溪與安平區、中西區、北區為界，北以曾文溪與七股區、西港區為界。區內人口約有20.0萬人，是臺南市僅次於永康區的人口第二大區。',
        '安南區在不到300年前仍是一片汪洋，屬於臺江內海的一部份，內海外緣臨臺灣海峽處有北線尾等沙洲。據史載，清領時期乾隆年間即開始有海埔新生地浮出，遭百姓圍墾。',
        '道光3年（1823年）曾文溪改道使得內海快速淤積，沿海居民據地圍墾、搭建臨時草寮，故形成許多「藔」字地名，日治後日人再改作「寮」。古時有臺江十六寮（草湖寮、南路寮、中洲寮、溪頂寮、陳卿寮、和順寮、總頭寮、新寮、布袋嘴寮、溪心寮、海尾寮、本淵寮、公親寮、學甲寮莊、溪南寮、五塊寮）的說法，即為歷史之見證。',
    ],
    // 資料來源：臺南市新營區公所 https://xinying.tainan.gov.tw/cp.aspx?n=8163
    新營區: [
        '延平郡王鄭成功為反清復明工作，為備清兵來襲，屯營於此，因此先有「舊營」，後有「新營」，舊營約在鹽水區南方兩公里處。',
        '清康熙時新營為諸羅縣大奎壁村，乾隆以後，則屬嘉義縣（原諸羅縣）太子宮堡及部份鐵線橋堡。日治時代大正九年10月地方改制，改隸屬於太子宮之下，稱為「太子宮堡新營庄」，後經改制，屬「台南州新營鎮新營庄」，後改為新營街，為新營郡所在地。',
        '民國34年（1945年）改街為鎮，為台南縣政府所在地，從此取代了鹽水鎮的地位；民國70年又改制為縣轄市，本市更成為嘉南平原上重要農產集散地及地方行政中心。民國九十九年十二月二十五日，台南縣、市合併改制為直轄市，新營市由公法人團體地位改為區。',
    ],
};

// ---- 里舊名（點擊後以懸浮視窗顯示）----
const OLD_VILLAGE_NAMES = {
    安平區: [
        {
            name: '大員',
            romaji: 'Tāi-Uân',
            description: [
                '「大員」又稱「臺員」，是一個古地名，原指臺南市安平區的「臺江內海」。荷蘭時期乃指今日之安平區，當時也稱作「一鯤鯓」。',
                '關於「大員」之由來，一種普遍的說法是此詞來自臺灣大武壠族大灣社或臺窩灣社之名轉化而來；台灣史學者翁佳音則認為，這是從漢人對台江內海的稱呼「大灣」之名轉化而來，因不同口音被轉譯成臺員、大員等不同稱呼。',
                '德國史學家路德維格·里斯研究荷蘭史料後表示，荷蘭人透過漢人為通譯與平埔住民溝通，並把漢人的「大灣」或「大員（tâi-uân）」轉寫為 Tayouan。「大員」亦為最早出現在中文文獻上的「臺灣」原始文字的前身。',
            ],
        },
        {
            name: '安順（庄）',
            romaji: 'An-sūn',
            description: [
                '「安順」為今日安南區的舊稱，日治時期設安順庄，隸屬臺南州新豐郡。',
                '此地原為臺江內海，清道光年間曾文溪改道後快速淤積，沿海居民據地圍墾、搭建臨時草寮，形成「臺江十六寮」等聚落，安順庄即在此背景下成形。',
            ],
        },
    ],
    新營區: [
        {
            name: '舊營',
            romaji: 'Kū-Îng',
            // ⚠️ PM 提供的來源表此欄位錯位，「舊營」自己的說明沒有給到；
            //    暫以區介紹中談到舊營的段落頂替，待補上正式文案後替換。
            description: [
                '「舊營」之名來自延平郡王鄭成功屯營於此的歷史。為反清復明、備清兵來襲而設營，因此先有「舊營」，後有「新營」。',
                '舊營約在今鹽水區南方兩公里處，是新營地名由來的源頭。',
            ],
        },
        {
            name: '秀才',
            romaji: 'Siù-Tsâi',
            description: [
                '秀才，是臺灣臺南市新營區的一個傳統地域名稱，位於該區西南端。相較於今日行政區，其範圍大致包括五興里西南部不含其東南側邊界地帶、姑爺里南部凸出部分。',
                '台灣日治初期，鐵線橋地區為一街庄，稱為「鐵線橋庄」，隸屬於鐵線橋堡。該庄昔日北與姑爺庄為鄰，東邊及東南邊大部分與鐵線橋庄為鄰，東南邊一小部分與大墩藔庄為鄰，西南邊及西邊大部分為坔頭港庄，西邊北側一小段與竹仔腳庄為界。',
            ],
        },
        {
            name: '後鎮',
            romaji: 'Āu-Tìn',
            description: [
                '後鎮，是臺灣臺南市新營區的一個傳統地域名稱，位於該區東北半葉的西北部。相較於今日行政區，其範圍大致包括護鎮里不含東南部凸出部分的東部及西南部、埤寮里西部邊界地帶中段、新南里西北端、嘉芳里東北端。',
                '本地區境內東南端為臺南市立新營體育場的大部分，主要聚落為後鎮。',
                '台灣日治初期，後鎮地區為一街庄，稱為「後鎮庄」，隸屬於下茄苳南堡。該庄昔日北與竹圍後庄為鄰，東與許丑庄為鄰，南邊主要部分為新營庄、茄苳腳庄，南邊最西段及西邊為鹽水港街，西北邊為土庫庄、竹仔腳庄。',
            ],
        },
        {
            name: '鐵線橋',
            romaji: 'Thih-Suànn-Kiô',
            description: [
                '鐵線里之名來自里內大莊「鐵線橋莊」。「鐵線」一說是因為當地興建橋梁時有用上鐵線固定竹篾，橋因而名鐵線橋，莊名因此得來；另一說則認為名稱是音譯自西拉雅語。不過「鐵線橋」三字可確定在清康熙年間便已使用，如《臺灣府志‧卷六》（蔣毓英版）的「市廛」一章便有提到「鐵線橋：在茅港尾保」。',
                '鐵線橋也用來指當地的港口，如《續修臺灣府志》就曾提及：「昔時有倒風港分三支，一為麻豆港，一為茅港尾港，北為鐵線橋港」。',
                '另據學者翁佳音的考證：鐵線，是鐵汕的音譯，也就是當地的沙汕地，非常堅硬，如果有船隻不幸碰上，往往造成船隻損壞，因此稱之為「鐵汕」之名。',
            ],
        },
    ],
};

// 沒有真實文案的行政區，以樣板文字補齊版面（mock 階段專用）
const buildMockText = (district) => [
    `${district.name}（臺灣話：${district.romaji}）位於臺南市，古地名為「${district.oldName}」。`,
    `這段文字為 mock 資料，用於驗證「台語地名與文化」頁面的版面與互動。實際串接後端後，此處將顯示 ${district.name}的地名由來、行政沿革、地理環境與產業特色等完整介紹。`,
    '從先民開墾的足跡、平埔族社的舊稱，到日治時期的改制與戰後的行政區調整，每一個地名都記錄著這塊土地被稱呼的方式，也保留了台語在地的發音與詞彙。',
];

const findDistrict = (name) => DISTRICTS.find((district) => district.name === name) || null;

const buildDetail = (district) => ({
    name: district.name,
    romaji: district.romaji,
    oldName: district.oldName,
    // 之後接上後端時改為真正的音檔位址；null 代表尚無音檔
    audioUrl: null,
    // 保留 80×80 的圖示位置（設計稿標註），尚未提供圖片
    iconUrl: null,
    description: REAL_TEXT[district.name] || buildMockText(district),
    oldVillageNames: OLD_VILLAGE_NAMES[district.name] || [],
});

export const getRegions = () => respond(REGIONS);

export const getCounties = (region) => respond(COUNTIES_BY_REGION[region] || []);

export const getDistrictList = (county) =>
    respond(county === '臺南市' ? DISTRICTS.map((district) => district.name) : []);

// 滑鼠移過地圖時顯示的簡介（第一層右側面板）
export const getDistrictBrief = (name) => {
    const district = findDistrict(name);
    if (!district) return respond(null);
    const detail = buildDetail(district);
    return respond({
        name: detail.name,
        romaji: detail.romaji,
        iconUrl: detail.iconUrl,
        summary: detail.description.join(''),
    });
};

// 點擊行政區後的完整資料（第二層）
export const getDistrictDetail = (name) => {
    const district = findDistrict(name);
    return respond(district ? buildDetail(district) : null);
};

export const DEFAULT_REGION = '南部地區';
export const DEFAULT_COUNTY = '臺南市';

export default {
    getRegions,
    getCounties,
    getDistrictList,
    getDistrictBrief,
    getDistrictDetail,
};
