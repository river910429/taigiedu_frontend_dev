import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "./assets/Logo + Title.svg";

const Header = () => {
  return (
    <header className="header">
      <Link to="/">
        <img src={logo} alt="Logo" className="logo" />
      </Link>
    </header>
  );
};

export default Header;
