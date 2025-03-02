import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function ViewCourse() {
    const params = useParams();
    const id = params.id;

    const [course, setCourse] = useState(""); 
    const [problems, setProblems] = useState([]);

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
                console.error(error.message);
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
                setProblems(res);
                console.log(res);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchCourse();
        fetchProblems();
    }, [id]);

  return (
    <div>
        <h2>Kursas: {course.name}</h2>
        <h4>Aprašymas: {course.description}</h4>
        {problems.map((problem) => (
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