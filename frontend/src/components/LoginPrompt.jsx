import { useContext, useState } from "react";
import AuthContext from "../utils/AuthContext";
import Button from "./Button";
import TextBox from "./textBox/TextBox";
import { MessageContext } from "../utils/MessageProvider";
import { useGoogleLogin } from "@react-oauth/google";
import googleIcon from "../assets/google_icon.svg";
import Hyperlink from "./Hyperlink";
import loadingIcon from "../assets/loading-anim.svg";
import '../pages/Register/Register.css';
import { useNavigate } from "react-router-dom";

const LoginPrompt = ( {onClose} ) => {
  const { loggedIn, login } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(!loggedIn);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    console.log(isLoginValid());
    if (!isLoginValid()) return;
    setLoading(true);
    handleLogin(username, password);
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if(response.status === 401) {
        showErrorMessage('Netinkami prisijungimo duomenys');
        setUsernameError('Netinkami duomenys');
        setPasswordError('Netinkami duomenys');
        setLoading(false);
      }

      if(response.ok) {
        showSuccessMessage('Sėkmingai prisijungėte');
        setLoading(false);
        window.location.reload();
      }
    } catch (error) {
      showErrorMessage(error.message || 'Nepavyko prisijungti');
      setLoading(false);
    }
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
            <Button extra={loading ? 'login-btn clicked' : 'login-btn'} onClick={() => { if (!loading) handleSubmit(); }}>
              {loading ?
                <img src={loadingIcon} alt='Įkeliama...' className="loading"/>
              : "Log in"}
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
