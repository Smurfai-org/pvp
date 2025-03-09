import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ViewProblem.css'
import Button from '../../components/Button';

const ProblemDetails = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`http://localhost:5000/problem?id=${id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setProblem(data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  if (loading) return <p>Kraunama...</p>;
  if (error) return <p style={{ color: 'red' }}>Klaida: {error}</p>;
  if (!problem) return <p>Problema nerasta.</p>;

  const handleDelete = async (id) => {
    if (!window.confirm("Ar tikrai norite ištrinti šią problemą?")) return;
  
    try {
      const response = await fetch(`http://localhost:5000/problem/delete?id=${id}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Klaida šalinant problemą');
      }
  
      alert("Problema sėkmingai ištrinta!");
      window.location.reload();
    } catch (error) {
      alert(`Klaida: ${error.message}`);
    }
  };
  

  return (
    <>
    <div className="problem-container">
      <h2>{problem.name}</h2>
      <p><strong>Aprašymas:</strong> {problem.description}</p>
      <p><strong>Sudėtingumas:</strong> {problem.difficulty}</p>
      <p><strong>Sprendimai:</strong> {problem.solution || 'Nėra'}</p>
      <p><strong>Užuominos:</strong> {problem.hints || 'Nėra'}</p>
      <p><strong>Generuota:</strong> {problem.generated ? 'Taip' : 'Ne'}</p>
      <p><strong>Kurso ID:</strong> {problem.fk_COURSEid || '-'}</p>
      <p><strong>AI Atsakymo ID:</strong> {problem.fk_AI_RESPONSEid || '-'}</p>
      <p><strong>Ištrinta:</strong> {problem.deleted || '-'}</p>
      { !problem.deleted ?
      <Button onClick={() => {handleDelete(id)}}>Ištrinti problemą</Button>
      :
      <Button>Grąžinti problemą</Button>
      }
    </div>
    </>
  );
};

export default ProblemDetails;
