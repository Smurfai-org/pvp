import React, { useEffect, useContext } from 'react';
import AuthContext from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const SubscribeSuccessPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

    useEffect(() => {
    const refreshUser = async () => {
        try {
        const res = await fetch(`${serverUrl}/auth/refresh`, {
            method: "GET",
            credentials: "include",
        });

        if (res.ok) {
            await login(); // update context
            navigate("/premium-area");
        } else {
            console.error("Refresh failed");
            navigate("/subscribe");
        }
        } catch (err) {
        console.error("Refresh error:", err);
        navigate("/subscribe");
        }
    };

    refreshUser();
    }, [login, navigate]);

  return (
    <div>
      <h2>Apmokėjimas sėkmingas 🎉</h2>
      <p>Krauname jūsų paskyrą...</p>
    </div>
  );
};

export default SubscribeSuccessPage;
