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
import PhrasePage from './phrasePage/PhrasePage.jsx';
import CelebrityPage from './celebrity/CelebrityPage.jsx';
import TranslatePage from './translatePage/TranslatePage.jsx';
import ResourcePage from './resourcePage/ResourcePage.jsx';
import FilePreview from "./resourcePage/FilePreview.jsx";
import DeleteResource from "./resourcePage/DeleteResource";
import CultureFood from "./culture/food/FoodPage";
import CultureFestival from "./culture/festival/FestivalPage";
import SocialmediaPage from "./socialmediaPage/SocialmediaPage";
import ExamPage from "./examPage/ExamPage";

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <div className="maincontent">
          <Sidebar />
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/search" element={<MainSearchPage  />} />
            <Route path="/transcript" element={<TranscriptPage />} />
            <Route path="/phrase" element={<PhrasePage />} />
            <Route path="/read" element={<ReadPage />} />
            <Route path="/translate" element={<TranslatePage />} />
            <Route path="/resource" element={<ResourcePage />} />
            <Route path="/file-preview" element={<FilePreview />} />
            <Route path="/delete-resource" element={<DeleteResource />} />
            <Route path="/celebrity" element={<CelebrityPage />} />
            <Route path="/culture/food" element={<CultureFood />} />
            <Route path="/culture/festival" element={<CultureFestival />} />
            <Route path="/socialmedia" element={<SocialmediaPage />} />
            <Route path="/exam" element={<ExamPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
