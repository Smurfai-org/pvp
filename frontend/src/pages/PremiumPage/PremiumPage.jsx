import { useContext, useState } from "react";
import "./PremiumPage.css";
import AuthContext from "../../utils/AuthContext";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const PremiumSelection = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const premium = user?.premium;

  const [billingPeriod, setBillingPeriod] = useState("monthly"); // "monthly" or "yearly"

  const free = [
    "Jokio pokalbio su DI asistentu",
    "3 užuominos per savaitę",
    "1 DI sukuriama užduotis",
    "Be užduočių sprendimo su DI",
  ];

  const benefits = [
    "Pokalbis su DI asistentu",
    "Neribotos užuominos",
    "Neribotos DI kuriamos užduotys",
    "Užduočių sprendimas su DI",
  ];

  const handlePremiumClick = () => {
    // You can pass the selected plan type if needed
    navigate("/subscribe", { state: { billingPeriod } });
  };

  return (
    <section className="premium-selection">
      <div className="container">
        <header>
          <h1>Pirkite Premium!</h1>
          <p>
            Mėgaukitės geriausia patirtimi su mūsų aukščiausios kokybės planu!
          </p>
        </header>

        {/* Toggle Between Monthly and Yearly */}
        <div className="billing-toggle">
          <Button
            extra={billingPeriod === "monthly" ? "bright btn" : "btn"}
            onClick={() => setBillingPeriod("monthly")}
          >
            Mėnesinis
          </Button>
          <Button
            extra={billingPeriod === "yearly" ? "bright btn" : "btn"}
            onClick={() => setBillingPeriod("yearly")}
          >
            Metinis <span style={{ fontSize: "0.8em" }}>(2 mėn. nemokamai!)</span>
          </Button>
        </div>

        <div className="plans">
          {/* Free Plan */}
          <div className="plan-card">
            <h2>
              {premium ? "Nemokamas Planas" : <>Dabartinis<br />Planas</>}
            </h2>
            <p className="price">Nemokamas</p>
            <ul className="benefits-list-x">
              {free.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
            {premium ? (
              <Button extra="bright btn" onClick={handlePremiumClick}>
                Grįžti prie nemokamo
              </Button>
            ) : (
              <Button extra="disabled btn">Dabartinis</Button>
            )}
          </div>

          {/* Premium Plan */}
          <div className="plan-card">
            <h2>
              {premium ? <>Dabartinis<br />Planas</> : <>Premium<br />Planas</>}
            </h2>
            <p className="price">
              {billingPeriod === "monthly" ? "4.99€/mėn" : "49.99€/metus"}
            </p>
            <ul className="benefits-list">
              {benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
            {premium ? (
              <Button extra="disabled btn">Dabartinis</Button>
            ) : (
              <Button extra="bright btn" onClick={handlePremiumClick}>
                Tapti nariu
              </Button>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="comparison">
          <h2>Planų palyginimas</h2>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Funkcija</th>
                <th>Nemokama</th>
                <th>Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pokalbis su DI asistentu</td>
                <td>Negalima</td>
                <td>Neribota</td>
              </tr>
              <tr>
                <td>Užuominos</td>
                <td>3 per savaitę</td>
                <td>Neribotos</td>
              </tr>
              <tr>
                <td>DI asistento kuriamos užduotys</td>
                <td>Viena užduotis</td>
                <td>Neribota</td>
              </tr>
              <tr>
                <td>Užduočių sprendimas su DI</td>
                <td>Negalima</td>
                <td>Neribota</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PremiumSelection;
