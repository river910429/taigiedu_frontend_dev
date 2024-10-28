import React from "react";
import { BrowserRouter ,Routes, Route} from "react-router-dom";
import "./App.css";

import Component from "./Component";
import Component2 from "./Component2";

import Sidebar from "./Sidebar";
import Header from "./Header";
import MainContent from "./MainContent";
import MainSearchPage from './mainSearchPage/MainSearchPage.jsx';

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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

{
  /*
function App() {
  const text="台語文共備平台"
  return (
    <>
      <h1>{text}</h1>
      <button onClick={function(){alert('hello')}}>click</button>
      <Component2 />
      <Component a='hello'/>
      <Component a='hello1'/>
      <Component a='hello2'/>
    </>
  );
}
*/
}
export default App;
