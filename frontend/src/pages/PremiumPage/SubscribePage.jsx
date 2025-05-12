import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RO242E2ccvohllaeOkX2bD0j9y8JOSG0Ho5ZOffrkEa5OqWa9Gl6UnXijy0tPEK835d5XWTKNwNzXpxA1OXBuvb00IgvLKz4v"
);

const SubscribePage = () => {
  const handleSubscribe = async () => {
    const stripe = await stripePromise;

    const response = await fetch(
      "http://localhost:5000/stripe/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();

    if (!data.id) {
      alert("Session ID not returned from server.");
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
        <li>🔒 Užduočių sprendimas su DI</li>
        <li>🔒 Išplėstinė analizė</li>
        <li>🔒 Be reklamų</li>
      </ul>

      <button onClick={handleSubscribe}>Prenumeruoti už 19.99€/mėn</button>
    </div>
  );
};

export default SubscribePage;
