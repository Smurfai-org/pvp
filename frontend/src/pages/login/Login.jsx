import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextBox } from "../../components/textBox/TextBox";
import Button from "../../components/Button";
import "./login.css";
import { useGoogleLogin } from "@react-oauth/google";
import googleIcon from "../../assets/google_icon.svg";
import { MessageContext } from "../../utils/MessageProvider";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { showSuccessMessage, showErrorMessage} = useContext(MessageContext);

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
    navigate("/");
  };

  const googleLoginButton = useGoogleLogin({
    onSuccess: async (gresponse) => {
      const response = await fetch("http://localhost:5000/loginGoogle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gresponse }),
        credentials: "include",
      });
      console.log("res", response);

      if (response.ok) {
        navigate(from, {replace: true});
      } else {
        const data = await response.json();
        console.log(data);
      }
    },
    onError: () => {},
    flow: "auth-code",
  });

  return (
    <div className="full-page-container-login">
      <div className="centered-content-login">
        <h2>Login</h2>
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
            Log in
          </Button>
          <Button extra="secondary login-btn">Sign up</Button>
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
