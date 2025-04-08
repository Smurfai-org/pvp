import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../utils/AuthContext";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import "./ViewProfile.css";
import defaultProfilePic from "../../assets/profile-default.svg";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import LoginPrompt from "../../components/LoginPrompt";
import cookies from "js-cookie";

function ViewProfile() {
  const { loggedIn, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!loggedIn) {
    return (<LoginPrompt />);
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/user/${user.id}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
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

  if (loading) {
    return (
      <div className="profile-loading">
        <AnimatedLoadingText />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
          </div>
        </div>

        <div className="profile-actions">
          <Button extra="secondary">Redaguoti profilį</Button>
          <Button>Redaguoti slaptažodį</Button>
        </div>
      </div>
    </div>
  );
}

export default ViewProfile;
