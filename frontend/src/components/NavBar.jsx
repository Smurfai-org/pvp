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
          { text: "Profilis", url: "/profile" },
          { text: "Administratoriaus langas", url: "/admin_dash" },
          { text: "Atsijungti", onClick: logout },
        ]
      : [
          // userio sarasas
          { text: "Profilis", url: "/profile" },
          { text: "Atsijungti", onClick: logout },
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
