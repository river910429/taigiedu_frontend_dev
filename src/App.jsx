import React , { useState }from "react";
import { BrowserRouter, Routes, Route , Navigate} from "react-router-dom";
import "./App.css";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import MainContent from "./MainContent";
import MainSearchPage from "./mainSearchPage/MainSearchPage.jsx";
import TranscriptPage from "./transcriptPage/TranscriptPage.jsx";
import ReadPage from "./readPage/ReadPage.jsx";
import PhrasePage from "./phrasePage/PhrasePage.jsx";
import CelebrityPage from "./celebrity/CelebrityPage.jsx";
import TranslatePage from "./translatePage/TranslatePage.jsx";
import ResourcePage from "./resourcePage/ResourcePage.jsx";
import FilePreview from "./resourcePage/FilePreview.jsx";
import DeleteResource from "./resourcePage/DeleteResource";
import UploadResource from "./resourcePage/UploadResource";
import CultureFood from "./culture/food/FoodPage";
import CultureFestival from "./culture/festival/FestivalPage";
import SocialmediaPage from "./socialmediaPage/SocialmediaPage";
import ExamPage from "./examPage/ExamPage";
import DownloadPage from "./resourcePage/DownloadPage";
import Login from "./resourcePage/LoginPage";
import RegisterPage from "./resourcePage/RegisterPage";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <div className="maincontent">
          <Sidebar />
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/search" element={<MainSearchPage />} />
            <Route path="/transcript" element={<TranscriptPage />} />
            <Route path="/phrase" element={<PhrasePage />} />
            <Route path="/read" element={<ReadPage />} />
            <Route path="/translate" element={<TranslatePage />} />
            <Route
              path="/resource"
              element={
                <ResourcePage
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                />
              }
            />
            <Route path="/file-preview" element={<FilePreview />} />
            <Route
              path="/delete-resource"
              element={
                isLoggedIn ? (
                  <DeleteResource />
                ) : (
                  <Navigate
                    to="/login"
                    state={{ redirectTo: "/delete-resource" }}
                  />
                )
              }
            />
            <Route path="/upload-resource" element={<UploadResource />} />
            <Route path="/celebrity" element={<CelebrityPage />} />
            <Route path="/culture/food" element={<CultureFood />} />
            <Route path="/culture/festival" element={<CultureFestival />} />
            <Route path="/socialmedia" element={<SocialmediaPage />} />
            <Route path="/exam" element={<ExamPage />} />
            <Route
              path="/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
