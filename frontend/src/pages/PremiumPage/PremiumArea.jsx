import { Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PremiumArea = () => {
  const navigate = useNavigate();

  return (
    <div className="premium-page">
      <h1>👑 Sveiki prisijungę prie Premium zonos</h1>
      <p>Turite prieigą prie visų išskirtinių funkcijų, įrankių ir analizės.</p>

      <ul>
        <li>✅ Pokalbis su DI asistentu</li>
        <li>✅ Neribotos užuominos</li>
        <li>✅ Neribotos DI kuriamos užduotys</li>
        <li>✅ Užduočių sprendimas su DI</li>
      </ul>

      <Button onClick={() => navigate(-1)}>Grįžti į pagrindinį</Button>
    </div>
  );
};

export default PremiumArea;
