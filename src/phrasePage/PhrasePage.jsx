import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import './PhrasePage.css';
import PhraseSearchBar from './PhraseSearchBar';
import PhraseResult from './PhraseResult';

const PhrasePage = () => {
    const [searchParams] = useSearchParams();
    const [phrases, setPhrases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 獲取搜索參數
    const searchKeyword = searchParams.get('query') || '';
    const categories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
    
    useEffect(() => {
    const searchKeyword = searchParams.get('query') || '';
    const categories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
    
    console.log("搜索參數變化:", { searchKeyword, categories });
    fetchPhrases(searchKeyword, categories);
}, [searchParams]); // 只依賴於 searchParams 對象
    
    const fetchPhrases = async (keyword, categories) => {
    setLoading(true);
    try {
        // 準備參數
        const parameters = {
            search_keyword: keyword || "",
            category: categories.length > 0 ? categories[0] : "" // 暫時只傳第一個類別
        };
        
        console.log("搜尋參數:", parameters);
        
        // 發送請求
        const response = await fetch("https://dev.taigiedu.com/backend/idiom_search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(parameters)
        });
        
        if (!response.ok) {
            throw new Error(`API 請求失敗: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log("API 返回數據:", responseData);
        
        // 修正：檢查 data.phrases 而不是 phrases
        if (responseData.data && Array.isArray(responseData.data.phrases)) {
            setPhrases(responseData.data.phrases);
            setError(null); // 清除任何之前的錯誤
        } else {
            console.error("API 返回的 data.phrases 不是陣列:", 
                responseData.data ? responseData.data.phrases : undefined);
            setPhrases([]);
            setError("數據格式錯誤：找不到有效的成語列表");
        }
    } catch (error) {
        console.error("獲取成語發生錯誤:", error);
        setError("獲取成語時發生錯誤: " + error.message);
        setPhrases([]);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="page-container">
            <div className="search-bar-container">
                <PhraseSearchBar />
            </div>
            <div className="phrase-results-container">
                <PhraseResult 
                    phrases={phrases} 
                    loading={loading} 
                    error={error} 
                />
            </div>
        </div>
    );
};

export default PhrasePage;