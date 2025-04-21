import React, { useState } from 'react';
import { TextBox } from '../../components/textBox/TextBox';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import { useParams, useNavigate } from 'react-router-dom';
import cookies from 'js-cookie';
import './AddProblem.css';

function AddProblem() {
  const param = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState({
    name: '',
    description: '',
    generated: 0,
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
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${cookies.get('token')}` 
        },
        body: JSON.stringify(problem),
        credentials: 'include'
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
    <div className='problem-wrapper'>
      <div className='problem-form'>
        <h2>Pridėti problemą</h2>
        
        <TextBox text='Problemos pavadinimas' onChange={(e) => setProblem(prev => ({ ...prev, name: e.target.value }))} />
        <p>Aprašymas:</p>
        <textarea
          required
          rows={5}
          onChange={(e) => setProblem(prev => ({ ...prev, description: e.target.value }))}
        />
        <Dropdown 
          className='dropdown'
          options={['Lengvas', 'Sudėtingas', 'Sunkus']} 
          placeholder='Sudėtingumas' 
          onSelect={handleDifficultyChange} 
        />
        
        <Button extra='submit-btn' onClick={handlePost}>Išsaugoti</Button>
      </div>
    </div>
  );
}

export default AddProblem;
