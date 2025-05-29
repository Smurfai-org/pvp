import { useContext, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import AuthContext from "../../utils/AuthContext";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const SubscribePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stripePromise, setStripePromise] = useState();
  useEffect(() => {
    const localStripePromise = loadStripe(
      "pk_test_51RO242E2ccvohllaeOkX2bD0j9y8JOSG0Ho5ZOffrkEa5OqWa9Gl6UnXijy0tPEK835d5XWTKNwNzXpxA1OXBuvb00IgvLKz4v"
    );
    setStripePromise(localStripePromise);
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const stripe = await stripePromise;

    const response = await fetch(
      `${serverUrl}/stripe/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: user.id }),
      }
    );

    const data = await response.json();

    if (!data.id) {
      alert("Klaida apmokant prenumeratą");
      return;
    }

    const result = await stripe.redirectToCheckout({
      sessionId: data.id,
    });

    if (result.error) {
      alert(result.error.message);
    }
  };

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

      <Button onClick={handleSubscribe}>Prenumeruoti už 4.99€/mėn</Button>
    </div>
  );
};

export default SubscribePage;
