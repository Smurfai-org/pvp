import { useContext, useEffect, useState } from "react";
import AuthContext from "../../utils/AuthContext";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import "./ViewProfile.css";
import defaultProfilePic from "../../assets/profile-default.svg";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import LoginPrompt from "../../components/LoginPrompt";
import cookies from "js-cookie";
import UserProgressChart from "./UserProgressChart";

export const formatDate = (dateString, shorten = false) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("lt-LT", {
    year: "numeric",
    month: shorten ? "numeric" : "long",
    day: "numeric",
  });
};

function ViewProfile() {
  const { loggedIn, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/user/${user.id}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
          setFormUsername(user?.username || "");
          setFormEmail(user?.email || "");
        } else {
          console.error("Nepavyko paimti naudotojo duomenų");
        }
      } catch (error) {
        console.error("Klaida imant naudotojo duomenis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [loggedIn, user, navigate]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setIsEditingPassword(false);
    setUpdateMessage("");
  };

  const handleEditPassword = () => {
    setIsEditingPassword(true);
    setIsEditingProfile(false);
    setFormPassword("");
    setFormConfirmPassword("");
    setUpdateMessage("");
  };

  const handleCancel = () => {
    setIsEditingProfile(false);
    setIsEditingPassword(false);
    setFormUsername(user?.username || "");
    setFormEmail(user?.email || "");
    setFormPassword("");
    setFormConfirmPassword("");
    setUpdateMessage("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/user/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          username: formUsername ? formUsername : null,
          email: formEmail ? formEmail : null,
        }),
      });

      if (response.ok) {
        const data = response.json();

        if (data.token) {
          cookies.set("token", data.token, { expires: 7, path: "/" });
        }

        setUpdateMessage("Profilis sėkmingai atnaujintas");
        setTimeout(() => {
          window.location.reload();
        }, 350);
      } else {
        const errorData = await response.json();
        console.error("Nepavyko gauti atsakymo iš /users/id:", errorData);
        setUpdateMessage("Nepavyko atnaujinti profilio");
      }
    } catch (error) {
      console.error("Klaida atnaujinant profilį:", error);
      setUpdateMessage("Klaida atnaujinant profilį");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (formPassword !== formConfirmPassword) {
      setUpdateMessage("Slaptažodžiai nesutampa");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/user/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          password: formPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          cookies.set("token", data.token, { expires: 7, path: "/" });
        }

        setUpdateMessage("Slaptažodis sėkmingai pakeistas");
        setFormPassword("");
        setFormConfirmPassword("");
        setIsEditingPassword(false);
        setTimeout(() => {
          window.location.reload();
        }, 350);
      } else {
        const errorData = await response.json();
        setUpdateMessage(
          `Klaida: ${errorData.message || "Nepavyko pakeisti slaptažodžio"}`
        );
      }
    } catch (error) {
      console.error("Klaida keičiant slaptažodį:", error);
      setUpdateMessage("Klaida keičiant slaptažodį");
    }
  };

  if (!loggedIn) {
    return <LoginPrompt />;
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <AnimatedLoadingText />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Jūsų profilis</h2>
        </div>

        <div className="profile-content">
          <div className="profile-picture-container">
            <img
              src={user?.profile_pic || defaultProfilePic}
              alt="Profile"
              className="profile-picture"
            />
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="profile-edit-form">
              <div className="profile-form-group">
                <label htmlFor="username">Vardas:</label>
                <input
                  type="text"
                  id="username"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="email">El. paštas:</label>
                <input
                  type="email"
                  id="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>

              {updateMessage && (
                <div className="update-message">{updateMessage}</div>
              )}

              <div className="profile-form-actions">
                <Button type="submit">Išsaugoti</Button>
                <Button type="button" extra="secondary" onClick={handleCancel}>
                  Atšaukti
                </Button>
              </div>
            </form>
          ) : isEditingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="profile-edit-form">
              <div className="profile-form-group">
                <label htmlFor="password">Naujas slaptažodis:</label>
                <input
                  type="password"
                  id="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="confirmPassword">Pakartokite slaptažodį:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formConfirmPassword}
                  onChange={(e) => setFormConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {updateMessage && (
                <div className="update-message">{updateMessage}</div>
              )}

              <div className="profile-form-actions">
                <Button type="submit">Išsaugoti</Button>
                <Button type="button" extra="secondary" onClick={handleCancel}>
                  Atšaukti
                </Button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="profile-info-row">
                <span className="profile-label">Vardas:</span>
                <span className="profile-value">{user?.username}</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-label">El. paštas:</span>
                <span className="profile-value">{user?.email}</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-label">Paskyros sukūrimo data:</span>
                <span className="profile-value">
                  {userDetails ? formatDate(userDetails.creation_date) : "N/A"}
                </span>
              </div>

              <div className="profile-info-row">
                <span className="profile-label">Vidutinis įvertinimas:</span>
                <span className="profile-value">
                  {averageRating !== 0 ? averageRating : "N/A"}
                </span>
              </div>

              <span className="profile-label">Jūsų progresas:</span>

              <UserProgressChart
                accountCreationDate={formatDate(
                  userDetails.creation_date,
                  true
                )}
                setAverageRating={(item) => setAverageRating(item)}
              />

              {updateMessage && (
                <div className="update-message">{updateMessage}</div>
              )}
            </div>
          )}
        </div>

        <div className="profile-actions">
          {!isEditingProfile && !isEditingPassword ? (
            <>
              <Button onClick={handleEditProfile} extra="secondary">
                Redaguoti profilį
              </Button>
              <Button onClick={handleEditPassword}>Redaguoti slaptažodį</Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ViewProfile;
