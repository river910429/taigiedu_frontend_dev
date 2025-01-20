import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainContent.css";
import heroImage from "./assets/Rectangle 7310.svg";

const MainContent = () => {
  const navigate = useNavigate(); // 使用 useNavigate 來進行頁面跳轉
  const [query, setQuery] = React.useState("");

  const handleTagClick = (tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault(); // 防止頁面重整
    if (query.trim() === "") return;
    navigate(`/search?query=${query}`); // 跳轉到搜尋結果頁面
  };

  return (
    <main className="main-content">
      {/* Hero Image Section with gradient background and text overlay */}
      <section className="hero-section px-0 pt-6">
        <div className="w-full max-w-[1600px] mx-auto h-[450px] relative bg-gradient-to-r from-[#4AA3BA] to-[#96D0B3] overflow-hidden rounded-lg">
          <img
            src={heroImage}
            alt="台語教學共備平台"
            className="w-full h-full object-cover"
          />
          <div className="hero-text absolute top-1/3 left-1/4 text-white">
            <div className="big text-4xl font-bold leading-tight">歡迎來到</div>
            <div className="bigbig text-4xl font-bold leading-tight pb-4">
              Tâi-gí 教學共備平台
            </div>
            <div className="small mt-2 text-xl leading-snug">
              鯨魚以聲音與其他鯨群溝通，聲波能穿越遙遠的距離。
            </div>
            <div className="small mt-2 text-xl leading-snug">
              台語老師透過語言的教學，讓台語的聲音在人群中傳播。
            </div>
            <div className="small mt-2 text-xl leading-snug">
              希翼能以台語為傳播媒介，傳遞咱台灣文化與情感。
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar and Tag Buttons Centered */}
      <div className="w-full max-w-[800px] mx-auto px-6 mt-6 text-center">
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋..."
            className="search-input"
          />
          <img
            src="search_logo.svg" 
            className="search-icon"
            onClick={handleSearch} // 點擊圖片觸發搜尋跳轉
          />
        </form>

        <div className="tag-buttons mt-4 flex justify-center gap-3">
          {["台語文", "國中", "奇異果", "母語", "王育德"].map((tag) => (
            <button
              key={tag}
              className="button"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid-container mt-10">
        {/* Left Top Column */}
        <div className="fade-in">
          <div className="content-section">
            <h2 className="section-title">俗語諺輪播</h2>
            <div className="text-gray-600">
              <p>無魚蝦也好</p>
              <p className="text-sm text-gray-500">Bô hî, hê mā hó</p>
            </div>
          </div>
        </div>

        {/* Right Top Column */}
        <div className="fade-in">
          <div className="content-section">
            <h2 className="section-title">今日大事</h2>
            <ul className="info-list">
              <li>王育德生日</li>
              <li>節慶日</li>
            </ul>
          </div>
        </div>

        {/* Left Bottom Column */}
        <div className="fade-in">
          <div className="content-section">
            <h2 className="section-title">考試資訊</h2>
            <ul className="info-list list-disc ml-5">
              <li>
                <a class="main-link" href="https://example.com/exam-info-1" target="_blank">
                  【報名中】2024秋季小學台語認證報名資訊
                </a>
              </li>
              <li>
                <a class="main-link" href="https://example.com/exam-info-2" target="_blank">
                  【報名截止】113年8月臺灣台語認證考試A卷電腦測驗
                </a>
              </li>
              <li>
                <a class="main-link" href="https://example.com/exam-info-3" target="_blank">
                  【公告】113年8月考試簡章公告及報名審議
                </a>
              </li>
              <li>
                <a class="main-link" href="https://example.com/exam-info-4" target="_blank">
                  【改期】教育部臺灣台語認證113年從4月15開始報名
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Bottom Column */}
        <div className="fade-in">
          <div className="content-section">
            <h2 className="section-title">最新消息</h2>
            <ul className="info-list">
              <li>
                <a class="main-link" href="https://example.com/exam-info-1" target="_blank">
                  【報名中】2024秋季小學台語認證報名資訊
                </a>
              </li>
              <li>
                <a class="main-link" href="https://example.com/exam-info-2" target="_blank">
                  【報名截止】113年8月臺灣台語認證考試A卷電腦測驗
                </a>
              </li>
              <li>
                <a class="main-link" href="https://example.com/exam-info-3" target="_blank">
                  【公告】113年8月考試簡章公告及報名審議
                </a>
              </li>
              <li>
                <a class="main-link" href="https://example.com/exam-info-4" target="_blank">
                  【改期】教育部臺灣台語認證113年從4月15開始報名
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
