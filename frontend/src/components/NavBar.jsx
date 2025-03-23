import Hyperlink from "./Hyperlink";
import { SearchBar } from "./SearchBar";
import HyperlinkDropdown from "./HyperlinkDropdown";
import { useContext } from "react";
import AuthContext from "../utils/AuthContext";

const Navbar = () => {
  const { loggedIn, logout, user } = useContext(AuthContext);
  const list =
    user?.role === "admin"
      ? [
          // admino sarasas
          { text: "Profile", url: "/profile" },
          { text: "Dashboard", url: "/admin_dash" },
          { text: "Log out", onClick: logout },
        ]
      : [
          // userio sarasas
          { text: "Profile", url: "/profile" },
          { text: "Log out", onClick: logout },
        ];

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
        {loggedIn ? (
          <HyperlinkDropdown
            placeholder="Account"
            showArrow={false}
            links={list}
          />
        ) : (
          <div className="navbar-login">
            <Hyperlink href="/login">Login</Hyperlink>
            <p>or</p>
            <Hyperlink href="/register">Register</Hyperlink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
