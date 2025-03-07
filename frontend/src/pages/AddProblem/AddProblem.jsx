import React, { use, useEffect, useState } from 'react'
import { TextBox } from '../../components/textBox/TextBox'
import Dropdown from '../../components/Dropdown'
import Button from '../../components/Button'

function AddProblem() {
  const [problem, setProblem] = useState({
    name: '',
    description: '',
    generated: 0,
    hints: '',
    solution: '',
    difficulty: '',
    fk_COURSEid: '',
    fk_RESPONSEid: ''
  });

  const handleDifficultyChange = (selectedValue) => {
    let difficulty = '';

    switch (selectedValue) {
      case 'Lengvas':
        difficulty = 'easy';
        break;
      case 'Sudėtingas':
        difficulty = 'medium';
        break;
      case 'Sunkus':
        difficulty = 'hard';
        break;
      default:
        difficulty = '';
    }

    setProblem((prevProblem) => ({
      ...prevProblem,
      difficulty: difficulty,
    }));
  };

  const handlePost = async () => {
    try {
      const [response] = await fetch('http://localhost:5000/problem/create', {
        method: 'POST',
        head: {'ContentType': 'application/json'},
        body: {
          name: problem.name,
          description: problem.description,
          generated: 0,
          hints: problem.hints,
          solution: problem.solution,
          difficulty: problem.difficulty,
          fk_COURSEid: problem.fk_COURSEid,
          fk_RESPONSEid: problem.fk_RESPONSEid
        }})

        
        if(!response.ok) {
          console.error(response.status);
        }

        setProblem(response);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
        <TextBox text='Problemos pavadinimas' onChange={(e) => setProblem.name(e.target.value)}/>
        <TextBox text='Problemos aprašymas' onChange={(e) => setProblem.description(e.target.value)}/>
        <TextBox text='Problemos sprendiniai' onChange={(e) => setProblem.solution(e.target.value)}/>
        <Dropdown options={['Lengvas', 'Sudėtingas', 'Sunkus']} placeholder='Sudėtingumas'  />
        <Button onClick={handlePost}>Išsaugoti</Button>
    </>
  )
}

export default AddProblem