import React, { useState, useContext } from 'react';
import { TextBox } from '../../components/textBox/TextBox';
import Button from '../../components/Button';
import "./CourseCreate.css";
import Card from '../../components/Card';
import { useNavigate } from 'react-router-dom';
import { MessageContext } from '../../utils/MessageProvider';

function CourseCreate() {

    const navigate = useNavigate();
    const [courseTitle, setCourseTitle] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [courseIcon, setCourseIcon] = useState("");
    const { showSuccessMessage, showErrorMessage, showWarningMessage } = useContext(MessageContext);
    

    const handleSubmit = async () => {
        const data = {
            name: courseTitle, 
            description: courseDescription,
            icon_url: courseIcon
        }

        console.log(data);
        try {
            const req = await fetch('http://localhost:5000/course/create', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if(!req.ok) {
                throw new Error(`HTTP Error: ${req.status}`);
            }

            const res = await req.json();
            showSuccessMessage('Kursas sėkmingai sukurtas');
            navigate(`/view_course/${res.id}`);
        } catch (error) {
            console.error("Update failed:", error);
            showErrorMessage('Nepavyko sukurti kurso');
        }
    };

    return (
    <div className='create'>
        <div className='create-form'>
            <TextBox 
                id='name'
                text='Kurso pavadinimas' 
                value={courseTitle} 
                onChange={(e) => setCourseTitle(e.target.value)} 
                placeholder="Kurso pavadinimas"
            />

            <TextBox 
                id='paragraph'
                text='Kurso aprašymas' 
                value={courseDescription} 
                onChange={(e) => setCourseDescription(e.target.value)} 
                placeholder="Kurso aprašymas"
            />

            <Button onClick={handleSubmit}>Pateikti</Button>
        </div>
        <div className='create-card'>
            <h4>Peržiūra:</h4>
            <Card 
            title={courseTitle || "Kurso pavadinimas"} 
            paragraph={courseDescription || "Kurso aprašymas"} 
            />
        </div>
    </div>
    );
}

export default CourseCreate;
