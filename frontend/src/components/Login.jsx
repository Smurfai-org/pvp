import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "./buttons/buttons";
import { TextBox } from "./input/TextInput";

const validateLogin = () => {};

const handleLogin = (username, password) => {
  console.log("Username:", username);
  console.log("Password:", password);
};

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    handleLogin(username, password);
  };

  return (
    <>
      <h2>Login</h2>
      <TextBox
        text="Username"
        value={username}
        onChange={handleUsernameChange}
      />
      <TextBox
        text="Password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
      />
      <PrimaryButton text="Log in" onClick={handleSubmit} />
      <SecondaryButton text="Sign up" />
    </>
  );
}

export default Login;
