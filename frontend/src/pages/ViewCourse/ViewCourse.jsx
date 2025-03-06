import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button';

function ViewCourse() {
    const params = useParams();
    const id = params.id;

    const [course, setCourse] = useState(""); 
    const [problems, setProblems] = useState([]);
    const [noProblems, setNoProblems] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const req = await fetch(`http://localhost:5000/course/?id=${id}`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'},
                });

                if(!req.ok) {
                    throw new Error(`HTTP error: ${req.status}`);
                }

                const res = await req.json();
                setCourse(res[0]);
            } catch (error) {
                setCourse([]);
            }
        };

        const fetchProblems = async () => {
            try {
                const req = await fetch(`http://localhost:5000/course/problems?id=${id}`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'},
                });

                if(!req.ok) {
                    throw new Error(`HTTP error: ${req.status}`);
                }

                const res = await req.json();
                if(res.length === 0) {
                    setNoProblems(true);
                } else {
                    setProblems(res);
                    setNoProblems(false);
                }
            } catch (error) {
                setProblems([]);
            }
        };

        fetchCourse();
        fetchProblems();
    }, [id]);

    const handleAddProblem = async () => {
        // try {
        //     const req = await fetch(`http://localhost:5000/problems`,
        //         {
        //             method: 'POST',
        //             headers: {'Content-Type': 'application/json'},
        //             body: {}
        //         }
        //     )
        // } catch (error) {
        //     console.error(error.message);
        // }
        navigate('/add_problem')
    }

  return (
    <div>
        <h2>Kursas: {course.name}</h2>
        <h4>Aprašymas: {course.description}</h4>
        {noProblems ? 
        <>
            <p>Problemų šis kursas neturi</p> 
            <Button onClick={handleAddProblem}>Pritėti problemą</Button>
        </>
        :
        problems.map((problem) => (
            <div key={problem.id}>
                <p>{problem.name}</p>
                <p>{problem.description}</p>
                <p>{problem.generated}</p>
                <p>{problem.hints}</p>
                <p>{problem.solution}</p>
                <p>{problem.difficulty}</p>
            </div>
        ))}
    </div>
  )
}

export default ViewCourse