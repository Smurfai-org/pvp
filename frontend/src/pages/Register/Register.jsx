import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextBox } from "../../components/textBox/TextBox";
import Button from "../../components/Button";
import "../login/login.css";
import { useGoogleLogin } from "@react-oauth/google";
import googleIcon from "../../assets/google_icon.svg";
import { MessageContext } from "../../utils/MessageProvider";
import Hyperlink from "../../components/Hyperlink";

function Register() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);

  const isRegisterValid = () => {
    let isValid = true;
    if (!email) {
      isValid = false;
      setEmailError("Missing email");
    }
    if (!username) {
      isValid = false;
      setUsernameError("Missing username");
    }
    if (!password) {
      isValid = false;
      setPasswordError("Missing password");
    }
    if (password !== confirmPassword) {
      isValid = false;
      setConfirmPasswordError("Passwords do not match");
    }
    return isValid;
  };

  const handleEmailChange = (event) => {
    setEmailError("");
    setEmail(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsernameError("");
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPasswordError("");
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPasswordError("");
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = () => {
    if (!isRegisterValid()) return;
    handleRegister(email, username, password);
  };

  const handleRegister = (email, username, password) => {
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

      if (response.ok) {
        navigate("/", { replace: true });
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
        <h2>Register</h2>
        <TextBox
          text="Email"
          value={email}
          onChange={handleEmailChange}
          errorText={emailError}
        />
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
        <TextBox
          text="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          errorText={confirmPasswordError}
        />
        <div className="inline-centered-buttons-login">
          <Button extra="login-btn" onClick={handleSubmit}>
            Sign up
          </Button>
          <Button extra="secondary login-btn">Log in</Button>
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

export default Register;