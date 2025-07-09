import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import './PhrasePage.css';
import PhraseSearchBar from './PhraseSearchBar';
import PhraseResult from './PhraseResult';
import { useToast } from '../components/Toast';

const PhrasePage = () => {
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [phrases, setPhrases] = useState([]);
    const [allPhrases, setAllPhrases] = useState([]); // 保存所有成語數據
    const [availableCategories, setAvailableCategories] = useState([]); // 動態類別選項
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // 標記是否為初次載入
    
    // 獲取搜索參數
    const searchKeyword = searchParams.get('query') || '';
    const categories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
    
    useEffect(() => {
        const searchKeyword = searchParams.get('query') || '';
        const categories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
        
        console.log("搜索參數變化:", { searchKeyword, categories });
        
        // 如果是初次載入且沒有搜尋參數，先獲取所有數據
        if (isInitialLoad && !searchKeyword && categories.length === 0) {
            fetchAllPhrases();
        } else if (!isInitialLoad || searchKeyword || categories.length > 0) {
            // 否則根據參數搜尋（包括初次載入但有參數的情況）
            fetchPhrases(searchKeyword, categories);
        }
    }, [searchParams, isInitialLoad]);
    
    // 首次載入獲取所有數據並提取類別
    const fetchAllPhrases = async () => {
        setLoading(true);
        try {
            const parameters = {
                search_keyword: "",
                category: ""
            };
            
            console.log("首次載入，獲取所有成語數據");
            
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
            console.log("API 返回所有數據:", responseData);
            
            if (responseData.data && Array.isArray(responseData.data.phrases)) {
                const allPhrasesData = responseData.data.phrases;
                setAllPhrases(allPhrasesData);
                setPhrases(allPhrasesData);
                
                // 提取所有不重複的類別
                const categoriesSet = new Set();
                allPhrasesData.forEach(phrase => {
                    // 檢查 Category1, Category2, ... 等屬性
                    let categoryIndex = 1;
                    while (phrase[`Category${categoryIndex}`]) {
                        categoriesSet.add(phrase[`Category${categoryIndex}`]);
                        categoryIndex++;
                    }
                });
                
                const categoriesList = Array.from(categoriesSet).sort();
                console.log("提取到的類別:", categoriesList);
                setAvailableCategories(categoriesList);
                setError(null);
            } else {
                console.error("API 返回的 data.phrases 不是陣列");
                setPhrases([]);
                setError("數據格式錯誤：找不到有效的成語列表");
                showToast("數據格式錯誤：找不到有效的成語列表", "error");
            }
        } catch (error) {
            console.error("獲取所有成語發生錯誤:", error);
            setError("獲取成語時發生錯誤: " + error.message);
            setPhrases([]);
            showToast("獲取成語時發生錯誤，請稍後再試", "error");
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    };

    const fetchPhrases = async (keyword, categories) => {
        setLoading(true);
        try {
            // 準備參數 - category 使用陣列格式
            const parameters = {
                search_keyword: keyword || "",
                category: categories.length > 0 ? categories : [] // API 接受陣列
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
            
            // 檢查 data.phrases
            if (responseData.data && Array.isArray(responseData.data.phrases)) {
                setPhrases(responseData.data.phrases);
                setError(null);
            } else {
                console.error("API 返回的 data.phrases 不是陣列:", 
                    responseData.data ? responseData.data.phrases : undefined);
                setPhrases([]);
                setError("數據格式錯誤：找不到有效的成語列表");
                showToast("數據格式錯誤：找不到有效的成語列表", "error");
            }
        } catch (error) {
            console.error("獲取成語發生錯誤:", error);
            setError("獲取成語時發生錯誤: " + error.message);
            setPhrases([]);
            showToast("獲取成語時發生錯誤，請稍後再試", "error");
        } finally {
            setLoading(false);
        }
    };

    // 本地篩選函數 - 當用戶調整類別選項時使用
    const filterPhrasesByCategories = (selectedCategories) => {
        if (!selectedCategories || selectedCategories.length === 0) {
            // 如果沒有選擇類別，顯示所有成語
            setPhrases(allPhrases);
            return;
        }
        
        const filteredPhrases = allPhrases.filter(phrase => {
            // 檢查成語是否屬於任一選中的類別
            let categoryIndex = 1;
            while (phrase[`Category${categoryIndex}`]) {
                if (selectedCategories.includes(phrase[`Category${categoryIndex}`])) {
                    return true;
                }
                categoryIndex++;
            }
            return false;
        });
        
        console.log("本地篩選結果:", filteredPhrases.length);
        setPhrases(filteredPhrases);
    };

    return (
        <div className="page-container">
            <div className="search-bar-container">
                <PhraseSearchBar 
                    availableCategories={availableCategories}
                    onCategoryFilter={filterPhrasesByCategories}
                    allPhrases={allPhrases}
                />
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