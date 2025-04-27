import React, { useContext, useState } from 'react';
import { TextBox } from '../../components/textBox/TextBox';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import { useParams, useNavigate } from 'react-router-dom';
import cookies from 'js-cookie';
import './AddProblem.css';
import { MessageContext } from '../../utils/MessageProvider';
import AuthContext from '../../utils/AuthContext';
import LoginPrompt from '../../components/LoginPrompt';

function AddProblem() {
  const { showErrorMessage, showSuccessMessage } = useContext(MessageContext);
  const param = useParams();
  const navigate = useNavigate();
  const { user, loggedIn } = useContext(AuthContext);

  if (!loggedIn) {
    return <LoginPrompt />
  }

  if (user.role != 'admin') {
    navigate('/404');
    return;
  }

  const [problem, setProblem] = useState({
    name: '',
    description: '',
    generated: 0,
    difficulty: '',
    fk_COURSEid: param.id,
    fk_AI_RESPONSEid: null
  });

  const [hints, setHints] = useState(['']);
  const [testCases, setTestCases] = useState([{ input: { cpp: '', python: '' }, output: '' }]);

  const handleDifficultyChange = (selectedValue) => {
    setProblem((prevProblem) => ({
      ...prevProblem,
      difficulty:
        selectedValue === 'Lengvas' ? 'easy' :
        selectedValue === 'Sudėtingas' ? 'medium' :
        selectedValue === 'Sunkus' ? 'hard' : ''
    }));
  };

  const handleHintChange = (index, value) => {
    const updatedHints = [...hints];
    updatedHints[index] = value;
    setHints(updatedHints);
  };

  const addHintField = () => {
    setHints([...hints, '']);
  };

  const removeHintField = (index) => {
    setHints(hints.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    if (field === 'output') {
      updated[index].output = value;
    } else {
      updated[index].input[field] = value;
    }
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: { cpp: '', python: '' }, output: '' }]);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
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

      const insertId = data.insertId;

      // post hints
      const validHints = hints.filter(h => h.trim());
      for (let hintText of validHints) {
        const hintRes = await fetch("http://localhost:5000/hint/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookies.get("token")}`
          },
          body: JSON.stringify({
            problemId: insertId,
            hint: hintText.trim(),
          }),
          credentials: "include"
        });

        const hintData = await hintRes.json();

        if (!hintRes.ok) {
          throw new Error(hintData.message || "Klaida kuriant užuominą");
        }
      }

      // Post test cases
      const validTestCases = testCases.filter(tc => tc.input.cpp.trim() || tc.input.python.trim() && tc.output.trim());
      for (let testCase of validTestCases) {
        const tcRes = await fetch('http://localhost:5000/test_cases/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies.get("token")}`
          },
          body: JSON.stringify({
            problemId: insertId,
            input: testCase.input,
            output: testCase.output,
          }),
          credentials: 'include'
        });

        const tcData = await tcRes.json();

        if (!tcRes.ok) {
          throw new Error(tcData.message || 'Klaida kuriant testą');
        }
      }

      showSuccessMessage("Problema, užuominos ir testai sėkmingai pridėti");
      navigate(-1);
    } catch (error) {
      showErrorMessage(`Klaida: ${error.message}`);
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

        <div className="hint-section">
          <h3>Užuominos (pasirinktinai)</h3>
          {hints.map((hint, index) => (
            <div key={index} className="hint-item">
              <textarea
                rows={3}
                placeholder={`Užuomina #${index + 1}`}
                value={hint}
                onChange={(e) => handleHintChange(index, e.target.value)}
              />
              {hints.length > 1 && (
                <Button extra="small secondary" onClick={() => removeHintField(index)}>
                  Pašalinti
                </Button>
              )}
            </div>
          ))}
          <Button extra="small" onClick={addHintField}>
            Pridėti dar vieną užuominą
          </Button>
        </div>

        <div className="testcase-section">
          <h3>Testų atvejai</h3>
          <div className="rules-list">
            <p>
              <strong>
                Esate pilnai atsakingas už visas potencines klaidas
              </strong>
              , kurios įvyks jeigu nesilaikysite taisyklių:
            </p>
            <li>
              Kodo sintaksė privalo <strong>būti teisinga.</strong>{" "}
              Nepamirškite kabliataškių (C++ atveju), patikrinkite
              operatorių teisingumą.
            </li>
            <li>
              Kintamųjų duomenų tipai privalo{" "}
              <strong>atitikti užduotį.</strong>{" "}
            </li>
            <li>
              Kintamųjų skaičius privalo <strong>būti lygus</strong>{" "}
              tarp C++ ir Python kalbų.
            </li>
            <li>
              Norimo rezultato reikšmė privalo{" "}
              <strong>laikytis užduotyje nustatytų gairių.</strong>{" "}
              Pavyzdžiui, jeigu užduotis prašo pateikti du skaičius po
              kablelio, norimas rezultatas taip pat pateiks du skaičius
              po kablelio ir t.t.
            </li>
            <li className="list-warning">
              Prieš išsaugojant testą,{" "}
              <strong>
                dar kartą patikrinkite visus testo laukus.
              </strong>
            </li>
          </div>
          {testCases.map((tc, index) => (
            <div key={index}>
              <h4>C++ įvestis:</h4>
              <textarea
                rows={2}
                value={tc.input.cpp}
                onChange={(e) => handleTestCaseChange(index, 'cpp', e.target.value)}
              />
              <h4>Python įvestis:</h4>
              <textarea
                rows={2}
                value={tc.input.python}
                onChange={(e) => handleTestCaseChange(index, 'python', e.target.value)}
              />
              <h4>Norimas rezultatas:</h4>
              <textarea
                rows={2}
                value={tc.output}
                onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
              />
              {testCases.length > 1 && (
                <Button extra="small secondary" onClick={() => removeTestCase(index)}>
                  Pašalinti
                </Button>
              )}
            </div>
          ))}
          <Button extra="small" onClick={addTestCase}>
            Pridėti dar vieną testą
          </Button>
        </div>

        <Button extra='submit-btn' onClick={handlePost}>Išsaugoti</Button>
      </div>
    </div>
  );
}

export default AddProblem;
