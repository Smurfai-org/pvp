import React from "react";
import Hyperlink from "./Hyperlink";
import { SearchBar } from "./SearchBar";
import HyperlinkDropdown from "./HyperlinkDropdown";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Hyperlink href="/">Logo</Hyperlink>

      <div className="nav-search">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
      </div>

      <div className="nav-links">
        <Hyperlink href="/courses">Courses</Hyperlink>
        <Hyperlink href="/problems">Problems</Hyperlink>
        <Hyperlink href="/discussion">Discussion</Hyperlink>
        <HyperlinkDropdown 
        placeholder="Account" 
        showArrow={false} 
        links={[
            { text: "Dashboard", url: '/admin_dash' }
        ]} 
        />
      </div>
    </nav>
  );
};

export default Navbar;
