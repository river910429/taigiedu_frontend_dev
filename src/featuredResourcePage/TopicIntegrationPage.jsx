import React, { useEffect, useMemo, useState } from "react";
import searchIcon from "../assets/home/search_logo.svg";
import SearchResults from "../mainSearchPage/SearchResults";
import MultiSelect from "../phrasePage/multiselect";
import {
  getFeaturedResourceFilters,
  searchFeaturedResources,
} from "../services/featuredResourceMockApi";
import "./TopicIntegrationPage.css";

const TopicIntegrationPage = () => {
  const [sources, setSources] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchKeywordForSummary = useMemo(() => {
    if (keyword.trim()) return keyword.trim();
    if (selectedSources.length > 0) return selectedSources.join("、");
    if (selectedTopics.length > 0) return selectedTopics.join("、");
    return "全部內容";
  }, [keyword, selectedSources, selectedTopics]);

  const runSearch = async ({
    source = selectedSources,
    topic = selectedTopics,
    q = keyword,
  } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await searchFeaturedResources({
        source,
        topic,
        keyword: q.trim(),
      });

      if (response?.status !== "success" || !Array.isArray(response.data)) {
        throw new Error("mock api response format invalid");
      }

      setResults(response.data);
    } catch (err) {
      console.error("搜尋議題融入資料失敗:", err);
      setError("搜尋發生錯誤，請稍後再試。");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        const filterResponse = await getFeaturedResourceFilters();
        setSources(filterResponse.sources || []);
        setTopics(filterResponse.topics || []);
      } catch (err) {
        console.error("載入下拉選單資料失敗:", err);
      } finally {
        runSearch({ source: [], topic: [], q: "" });
      }
    };

    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSourcesChange = async (nextSources) => {
    setSelectedSources(nextSources);
    await runSearch({ source: nextSources, topic: selectedTopics, q: keyword });
  };

  const handleTopicsChange = async (nextTopics) => {
    setSelectedTopics(nextTopics);
    await runSearch({ source: selectedSources, topic: nextTopics, q: keyword });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await runSearch({ source: selectedSources, topic: selectedTopics, q: keyword });
  };

  return (
    <div className="topic-integration-page">
      <div className="topic-search-panel">
        <form onSubmit={handleSubmit} className="topic-search-form">
          <div className="topic-multiselect-wrap">
            <MultiSelect
              options={sources}
              selectedOptions={selectedSources}
              onChange={handleSourcesChange}
              placeholder="內容來源"
              displayText="內容來源"
            />
          </div>

          <div className="topic-multiselect-wrap">
            <MultiSelect
              options={topics}
              selectedOptions={selectedTopics}
              onChange={handleTopicsChange}
              placeholder="分類"
              displayText="分類"
            />
          </div>

          <div className="topic-search-input-group">
            <input
              type="text"
              className="topic-search-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="輸入自訂搜尋內容..."
            />
            <button type="submit" className="topic-search-btn" aria-label="搜尋">
              <img src={searchIcon} alt="搜尋" />
            </button>
          </div>
        </form>
      </div>

      <div className="topic-search-results">
        <SearchResults
          results={results}
          isLoading={isLoading}
          error={error}
          keyword={searchKeywordForSummary}
          totalItems={results.length}
          singleColumn={true}
        />
      </div>
    </div>
  );
};

export default TopicIntegrationPage;
