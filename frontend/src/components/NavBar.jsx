import Hyperlink from "./Hyperlink";
import { SearchBar } from "./SearchBar";
import HyperlinkDropdown from "./HyperlinkDropdown";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../utils/AuthContext";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const { loggedIn, logout, user } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const router = useLocation()
  const fixedRoutes = ['/'];
  const offRoutes = ['/admin_dash'];
  const isFixed = fixedRoutes.includes(router.pathname)
  const isOff = offRoutes.includes(router.pathname);

  useEffect(() => {
    setList(
      user?.role === "admin"
        ? [
            // admino sarasas
            { text: "Profilis", url: "/profile" },
            { text: "Administratoriaus langas", url: "/admin_dash" },
            { text: "Atsijungti", onClick: logout },
          ]
        : [
            // userio sarasas
            { text: "Profilis", url: "/profile" },
            { text: "Atsijungti", onClick: logout },
          ]
    );
  }, [loggedIn, logout, user]);

  return (
    <nav className={`navbar ${isFixed ? "fixed" : ""} ${isOff ? "nav-off" : ""}`}>
      <Hyperlink href="/">Logo</Hyperlink>

      <div className="nav-search">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
      </div>

      <div className="nav-links">
        <Hyperlink href="/courses">Kursai</Hyperlink>
        <Hyperlink href="/discussion">Diskusija</Hyperlink>
        {loggedIn && (
          <HyperlinkDropdown
            placeholder="Paskyra"
            showArrow={false}
            links={list}
          />
        )}
        {!loggedIn && <Hyperlink href="/login">Prisijungimas</Hyperlink>}
        {!loggedIn && <Hyperlink href="/register">Registracija</Hyperlink>}
      </div>
    </nav>
  );
};

export default Navbar;
