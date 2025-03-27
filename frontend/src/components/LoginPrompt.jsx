import { useContext, useState } from "react";
import AuthContext from "../utils/AuthContext";
import Button from "./Button";
import TextBox from "./textBox/TextBox";
import { MessageContext } from "../utils/MessageProvider";
import { useGoogleLogin } from "@react-oauth/google";
import googleIcon from "../assets/google_icon.svg";
import Hyperlink from "./Hyperlink";

const LoginPrompt = ( {onClose} ) => {
  const { loggedIn, login } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(!loggedIn);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);

  if (loggedIn) return null;

  const isLoginValid = () => {
    let isValid = true;
    if (!username) {
      isValid = false;
      setUsernameError("Missing username");
    }
    if (!password) {
      isValid = false;
      setPasswordError("Missing password");
    }
    return isValid;
  };

  const handleUsernameChange = (event) => {
    setUsernameError("");
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPasswordError("");
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    if (!isLoginValid()) return;
    handleLogin(username, password);
  };

  const handleLogin = (username, password) => {
    login(username, password);
    window.location.reload();
  };

  const googleLoginButton = useGoogleLogin({
    onSuccess: async (gresponse) => {
      const response = await fetch("http://localhost:5000/loginGoogle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gresponse }),
        credentials: "include",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        console.log(data);
      }
    },
    onError: () => {},
    flow: "auth-code",
  });

  return (
    isOpen && (
      <div className="login-overlay">
        <div className="login-modal">
          <h2>Reikia prisijungti</h2>
          <TextBox
            text="Username"
            value={username}
            onChange={handleUsernameChange}
            errorText={usernameError}
          />
          <TextBox
            text="Password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            errorText={passwordError}
          />
          <div className="inline-centered-buttons-login">
            <Button extra="login-btn" onClick={handleSubmit}>
              Prisijungti
            </Button>
            <Button extra="secondary login-btn">Registruotis</Button>
          </div>
          <div className="google-cnt">
            <Button extra="google-button" onClick={googleLoginButton}>
              <img src={googleIcon} className="google-img" />
              Prisijungti su Google
            </Button>
          </div>
          <Hyperlink extra="close-btn" onClick={onClose}>
            ✖ Uždaryti
          </Hyperlink>
        </div>
      </div>
    )
  );
};

export default LoginPrompt;
