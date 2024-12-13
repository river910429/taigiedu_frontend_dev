import React from "react";
import { BrowserRouter ,Routes, Route} from "react-router-dom";
import "./App.css";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import MainContent from "./MainContent";
import MainSearchPage from './mainSearchPage/MainSearchPage.jsx';
import TranscriptPage from './transcriptPage/TranscriptPage.jsx';
import ReadPage from './readPage/ReadPage.jsx';
import TranslatePage from './translatePage/TranslatePage.jsx';
import ResourcePage from './translatePage/TranslatePage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <div className="content">
          <Sidebar />
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/search" element={<MainSearchPage  />} />
            <Route path="/transcript" element={<TranscriptPage />} />
            <Route path="/read" element={<ReadPage />} />
            <Route path="/translate" element={<TranslatePage />} />
            <Route path="/resource" element={<ResourcePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
