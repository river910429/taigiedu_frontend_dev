import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastProvider } from './components/Toast';
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
import AdminFoodPage from "./adminPage/adminContent/adminHome/adminFoodPage";
import AdminFestivalPage from "./adminPage/adminContent/adminHome/adminFestivalPage";
import AdminSocialmediaPage from "./adminPage/adminContent/adminHome/adminSocialmediaPage";
import AdminResourcePage from "./adminPage/adminContent/adminHome/adminresourcePage/AdminResourcePage.jsx";
import ResourceHeaderPage from "./adminPage/adminContent/adminHome/adminresourcePage/ResourceHeaderPage.jsx";
import SocialmediaPage from "./socialmediaPage/SocialmediaPage";
import ExamPage from "./examPage/ExamPage";
import DownloadPage from "./resourcePage/DownloadPage";
import LoginPage from "./resourcePage/LoginPage";
import RegisterPage from "./resourcePage/RegisterPage";
import CelebrityDetails from "./celebrity/CelebrityDetails";
import TermsPage from "./TermsPage.jsx";
import PolicyPage from "./PolicyPage.jsx";
import AdminMain from "./adminPage/adminMain";
import AdminSidebar from "./adminPage/adminSidebar";
import AdminTestPage from "./adminPage/adminContent/adminHome/adminTestPage";
import AdminNewsPage from "./adminPage/adminContent/adminHome/adminNewsPage";
import AdminExamInfo from "./adminPage/adminContent/adminHome/examPage/adminExamInfo";
import AdminExamBooks from "./adminPage/adminContent/adminHome/examPage/adminExamBooks";
import AdminExamChannels from "./adminPage/adminContent/adminHome/examPage/adminExamChannels";
import AdminMemberPage from "./adminPage/adminContent/adminHome/adminMemberPage";
import AdminFilePreview from "./adminPage/adminContent/adminHome/adminresourcePage/AdminFilePreview";

const AppLayout = () => {
  const location = useLocation();
  const isPreviewPage = location.pathname === '/file-preview';
  const isDownloadPage = location.pathname === '/download';
  const isCelebrityDetail = location.pathname === '/celebrity/detail';
  const isAdminPage = location.pathname === '/admin';
  const isAdminContent = location.pathname.startsWith('/admin/') && location.pathname !== '/admin';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 檢查登入狀態
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true" && !isLoggedIn) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  return (
    <div className="app">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div className={`maincontent ${isPreviewPage || isDownloadPage || isCelebrityDetail || isAdminPage ? 'preview-page' : ''}`}>
        {!isPreviewPage && !isDownloadPage && !isCelebrityDetail && (isAdminContent ? <AdminSidebar /> : isAdminPage ? null : <Sidebar />)}
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
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/policy" element={<PolicyPage />} />
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
          <Route
            path="/upload-resource"
            element={
              isLoggedIn ? (
                <UploadResource />
              ) : (
                <Navigate
                  to="/login"
                  state={{ redirectTo: "/upload-resource" }}
                />
              )
            }
          />
          <Route path="/celebrity" element={<CelebrityPage />} />
          <Route path="/celebrity/detail" element={<CelebrityDetails />} />
          <Route path="/culture/food" element={<CultureFood />} />
          <Route path="/culture/festival" element={<CultureFestival />} />
          <Route path="/socialmedia" element={<SocialmediaPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route
            path="/login"
            element={<LoginPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminMain />} />
          <Route path="/admin/main-search/test" element={<AdminTestPage />} />
          <Route path="/admin/main-search/news" element={<AdminNewsPage />} />
          <Route path="/admin/culture/food" element={<AdminFoodPage />} />
          <Route path="/admin/culture/festival" element={<AdminFestivalPage />} />
          <Route path="/admin/socialmedia" element={<AdminSocialmediaPage />} />
          <Route path="/admin/resource" element={<AdminResourcePage />} />
          <Route path="/admin/resource/upload" element={<AdminResourcePage />} />
          <Route path="/admin/resource/header" element={<ResourceHeaderPage />} />
          <Route path="/admin/exam/info" element={<AdminExamInfo />} />
          <Route path="/admin/exam/books" element={<AdminExamBooks />} />
          <Route path="/admin/exam/channels" element={<AdminExamChannels />} />
          <Route path="/admin/member" element={<AdminMemberPage />} />
          <Route path="/admin/file-preview" element={<AdminFilePreview />} />
          {/* // 其他 admin 路由 */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}


const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppLayout />
      </BrowserRouter>
    </ToastProvider>

  );
};

// const App = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   return (
//     <BrowserRouter>
//       <div className="app">
//         <Header />
//         <div className="maincontent">
//           <Sidebar />
//           <Routes>
//             <Route path="/" element={<MainContent />} />
//             <Route path="/search" element={<MainSearchPage />} />
//             <Route path="/transcript" element={<TranscriptPage />} />
//             <Route path="/phrase" element={<PhrasePage />} />
//             <Route path="/read" element={<ReadPage />} />
//             <Route path="/translate" element={<TranslatePage />} />
//             <Route
//               path="/resource"
//               element={
//                 <ResourcePage
//                   //isLoggedIn={isLoggedIn}
//                   //setIsLoggedIn={setIsLoggedIn}
//                 />
//               }
//             />
//             <Route path="/file-preview" element={<FilePreview />} />
//             <Route path="/download" element={<DownloadPage />} />
//             <Route
//               path="/delete-resource"
//               element={<DeleteResource />} 
//               // element={
//               //   isLoggedIn ? (
//               //     <DeleteResource />
//               //   ) : (
//               //     <Navigate
//               //       to="/login"
//               //       state={{ redirectTo: "/delete-resource" }}
//               //     />
//               //   )
//               // }
//             />
//             <Route path="/upload-resource" element={<UploadResource />} />
//             <Route path="/celebrity" element={<CelebrityPage />} />
//             <Route path="/culture/food" element={<CultureFood />} />
//             <Route path="/culture/festival" element={<CultureFestival />} />
//             <Route path="/socialmedia" element={<SocialmediaPage />} />
//             <Route path="/exam" element={<ExamPage />} />
//             <Route
//               path="/login"
//               element={<Login 
//                 //setIsLoggedIn={setIsLoggedIn} 
//                 />}
//             />
//             <Route path="/register" element={<RegisterPage />} />
//           </Routes>
//         </div>
//         <Footer />
//       </div>
//     </BrowserRouter>
//   );
// };

export default App;
