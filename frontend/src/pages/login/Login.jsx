import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextBox } from "../../components/textBox/TextBox";
import Button from "../../components/Button";
import "./login.css";
import { useGoogleLogin } from "@react-oauth/google";
import googleIcon from "../../assets/google_icon.svg";
import { MessageContext } from "../../utils/MessageProvider";
import loadingIcon from "../../assets/loading-anim.svg";
import '../Register/Register.css';
import AuthContext from "../../utils/AuthContext";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
  const { login } = useContext(AuthContext);

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
        await login();
        navigate('/');
      }
    } catch (error) {
      showErrorMessage('Nepavyko prisijungti');
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
        await login();
        navigate(from, {replace: true});
      } else {
        const data = await response.json(); 
      }
    },
    onError: () => {},
    flow: "auth-code",
  });

  const navigateRegister = () => {
    navigate('/register');
  }

  return (
    <div className="full-page-container-login">
      <div className="centered-content-login">
        <h2>Prisijungti</h2>
        <TextBox
          text="Vardas"
          value={username}
          onChange={handleUsernameChange}
          errorText={usernameError}
        />
        <TextBox
          text="Slaptažodis"
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
          <Button extra="secondary login-btn" onClick={navigateRegister}>Registruotis</Button>
        </div>
        <div className="google-cnt">
          <Button extra="google-button" onClick={googleLoginButton}>
            <img src={googleIcon} className="google-img" />
            Prisijungti su Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
