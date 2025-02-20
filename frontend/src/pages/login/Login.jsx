import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextBox } from "../../components/textBox/TextBox";
import Button from "../../components/Button";
import "./login.css";

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
          <Button onClick={handleSubmit}>Log in</Button>
          <Button extra="secondary">Sign up</Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
