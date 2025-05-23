import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextBox } from "../../components/textBox/TextBox";
import Button from "../../components/Button";
import "../login/login.css";
import { useGoogleLogin } from "@react-oauth/google";
import googleIcon from "../../assets/google_icon.svg";
import { MessageContext } from "../../utils/MessageProvider";
import "./Register.css";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!email) {
      isValid = false;
      setEmailError("Trūksta pašto");
    }
    if (!username) {
      isValid = false;
      setUsernameError("Trūksta slapyvardžio");
    }
    if (!password) {
      isValid = false;
      setPasswordError("Trūksta slaptažodžio");
    }
    if (password !== confirmPassword) {
      isValid = false;
      setConfirmPasswordError("Slaptažodžiai nesutampa");
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (!isRegisterValid()) return;
    setLoading(true);
    await handleRegister(email, username, password);
  };

  const handleRegister = async (email, username, password) => {
    try {
      const response = await fetch(`${serverUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessMessage("Sėkmingai prisiregistravote!");
        setLoading(false);
        navigate("/login");
      } else {
        setLoading(false);
        showErrorMessage(
          data.message || "Registracija nepavyko, bandykite dar kartą."
        );
      }
    } catch (error) {
      setLoading(false);
      showErrorMessage("Serverio klaida, bandykite dar kartą.");
      console.error("Error during registration:", error);
    }
  };

  const googleLoginButton = useGoogleLogin({
    onSuccess: async (gresponse) => {
      try {
        const response = await fetch(`${serverUrl}/loginGoogle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gresponse }),
          credentials: "include",
        });

        if (response.ok) {
          navigate("/", { replace: true });
        } else {
          const data = await response.json();
          console.error(data);
        }
      } catch (error) {
        console.error("Google login failed:", error);
      }
    },
    onError: () => {},
    flow: "auth-code",
  });

  return (
    <div className="full-page-container-login">
      <div className="centered-content-login">
        <h2>Registruotis</h2>
        <TextBox
          text="El. paštas"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          errorText={emailError}
        />
        <TextBox
          text="Vardas"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          errorText={usernameError}
        />
        <TextBox
          text="Slaptažodis"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          errorText={passwordError}
        />
        <TextBox
          text="Pakartokite slaptažodį"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          errorText={confirmPasswordError}
        />
        <div className="inline-centered-buttons-login">
          <Button onClick={handleSubmit} loading={loading}>
            Registruotis
          </Button>
          <Button
            extra="secondary login-btn"
            onClick={() => navigate("/login")}
          >
            Jau turiu paskyrą
          </Button>
        </div>
        <div className="google-cnt">
          <Button extra="google-button" onClick={googleLoginButton}>
            <img src={googleIcon} className="google-img" alt="Google Icon" />
            Prisijungti su Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Register;
