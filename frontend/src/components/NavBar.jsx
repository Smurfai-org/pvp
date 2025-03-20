import Hyperlink from "./Hyperlink";
import { SearchBar } from "./SearchBar";
import HyperlinkDropdown from "./HyperlinkDropdown";
import { useContext } from "react";
import AuthContext from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import { MessageContext } from "../utils/MessageProvider";

const Navbar = () => {
  const { loggedIn, logout } = useContext(AuthContext);
  const { showErrorMessage } = useContext(MessageContext);
  const navigate = useNavigate(); // ✅ Move outside handleLogout

  const handleLogout = async () => {
    try {
      const result = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!result.ok) {
        showErrorMessage("Klaida atsijungiant");
        return;
      }

      navigate("/login"); // ✅ Correctly redirects to /login
    } catch (error) {
      showErrorMessage("Klaida atsijungiant");
    }
  };

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
            links={[
              { text: "Dashboard", url: "/admin_dash" },
              { text: "Log out", onClick: logout }
            ]}
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
