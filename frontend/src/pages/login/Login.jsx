import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextBox } from "../../components/textBox/TextBox";
import Button from "../../components/Button";
import "./login.css";
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import googleIcon from '../../assets/google_icon.svg';

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
    console.log("Username:", username);
    console.log("Password:", password);
    navigate("/");
  };

  const googleLoginButton = useGoogleLogin({
    onSuccess: async (gresponse) => {
      const response = await fetch('http://localhost:5000/googleAuth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gresponse }),
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const data = await response.json();
        console.log(data.message || 'Login failed');
      }
    },
    onError: () => {
      console.log('Google login failed.');
    },
    flow: 'auth-code',
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
          <Button extra='login-btn' onClick={handleSubmit}>Log in</Button>
          <Button extra="secondary login-btn">Sign up</Button>
        </div> 
        <div className="google-cnt">
          <Button extra='google-button' onClick={googleLoginButton}>
            <img src={googleIcon} className="google-img"/>Prisijungti su Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
