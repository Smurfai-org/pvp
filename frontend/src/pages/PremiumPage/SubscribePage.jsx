import { useContext, useState } from "react";
import AuthContext from "../../utils/AuthContext";
import Button from "../../components/Button";
import { useNavigate, useLocation } from "react-router-dom";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const SubscribePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get billingPeriod from previous page
  const billingPeriod = location.state?.billingPeriod || "monthly";

  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${serverUrl}/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          plan: billingPeriod,
        }),
      });

      if (!res.ok) {
        throw new Error("Prenumeratos klaida");
      }

      const updatedUser = await res.json();
      navigate("/premium-area");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const planText =
    billingPeriod === "yearly"
      ? "Prenumeruoti už 49.99€/metus (2 mėn. nemokamai)"
      : "Prenumeruoti už 4.99€/mėn";

  return (
    <div className="subscribe-page">
      <h1>🚀 Tapkite Premium nariu</h1>
      <p>Atrakinkite visas funkcijas ir mėgaukitės geresne patirtimi.</p>

      <ul>
        <li>🔒 Pokalbis su DI asistentu</li>
        <li>🔒 Neribotos užuominos</li>
        <li>🔒 Neribotos DI kuriamos užduotys</li>
        <li>🔒 Užduočių sprendimas su DI</li>
      </ul>

      <Button onClick={handleSubscribe} disabled={loading}>
        {loading ? "Prašome palaukti..." : planText}
      </Button>
    </div>
  );
};

export default SubscribePage;
