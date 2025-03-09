import React, { useState } from 'react';
import { TextBox } from '../../components/textBox/TextBox';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import { useParams, useNavigate } from 'react-router-dom';

function AddProblem() {
  const param = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState({
    name: '',
    description: '',
    generated: 0,
    hints: '',
    solution: '',
    difficulty: '',
    fk_COURSEid: param.id,
    fk_AI_RESPONSEid: null
  });

  const handleDifficultyChange = (selectedValue) => {
    setProblem((prevProblem) => ({
      ...prevProblem,
      difficulty:
        selectedValue === 'Lengvas' ? 'easy' :
        selectedValue === 'Sudėtingas' ? 'medium' :
        selectedValue === 'Sunkus' ? 'hard' : ''
    }));
  };

  const handlePost = async () => {
    try {
      const response = await fetch('http://localhost:5000/problem/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problem)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Klaida kuriant problemą');
      }

      navigate(-1);
    } catch (error) {
      alert(`Klaida: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h2>Pridėti problemą</h2>
      
      <TextBox text='Problemos pavadinimas' onChange={(e) => setProblem(prev => ({ ...prev, name: e.target.value }))} />
      <TextBox text='Problemos aprašymas' onChange={(e) => setProblem(prev => ({ ...prev, description: e.target.value }))} />
      <TextBox text='Problemos užuominos' onChange={(e) => setProblem(prev => ({ ...prev, hints: e.target.value }))} />
      <TextBox text='Problemos sprendimas' onChange={(e) => setProblem(prev => ({ ...prev, solution: e.target.value }))} />
      
      <Dropdown 
        options={['Lengvas', 'Sudėtingas', 'Sunkus']} 
        placeholder='Sudėtingumas' 
        onSelect={handleDifficultyChange} 
      />
      
      <Button onClick={handlePost}>Išsaugoti</Button>
    </div>
  );
}

export default AddProblem;
