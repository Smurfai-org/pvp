import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import "./AdminDash.css";
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import CourseCreate from '../CourseCreate/CourseCreate';

function AdminDash() {
    const [courses, setCourses] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const req = await fetch(`http://localhost:5000/course/`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!req.ok) {
                    throw new Error(`HTTP error: ${req.status}`);
                }
                const res = await req.json();

                setCourses(res);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchData();
    }, []);

    const handleCreate = () => {
        navigate('/create_course')
    };

    const handleCardClick = (id) => {
        navigate(`/view_course/${id}`)
    }

    courses.sort((a, b) => a.creation_date.localeCompare(b.creation_date));

    return (
        <div className='dashboard'>
            <Button onClick={handleCreate}>Create course</Button>

            <div className="admin-dashboard">
                {courses.map((course) => {
                    return (
                        <Card 
                            key={course.id} 
                            title={course.name} 
                            paragraph={course.description}
                            onClick={() => handleCardClick(course.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default AdminDash;
