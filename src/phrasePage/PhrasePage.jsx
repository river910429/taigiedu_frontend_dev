import React from 'react';
import './PhrasePage.css';
import PhraseSearchBar from './PhraseSearchBar';
import PhraseResult from './PhraseResult';

const PhrasePage = () => {
    return (

        <div className="page-container">
            <div className="search-bar-container">
                <PhraseSearchBar />
            </div>
            <div className="phrase-results-container">
                <PhraseResult />
            </div>
        </div>
    );
};

export default PhrasePage;