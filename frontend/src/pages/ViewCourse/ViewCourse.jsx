import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import TextBox from '../../components/textBox/TextBox';
import './ViewCourse.css';
import editButton from '../../assets/edit-icon.svg';
import exitButton from '../../assets/exit-icon.svg';
import checkButton from '../../assets/check-icon.svg';
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import TextBox from "../../components/textBox/TextBox";
import "./ViewCourse.css";
import editButton from "../../assets/edit-icon.svg";
import exitButton from "../../assets/exit-icon.svg";

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

  // Handle editing course
  const handleEdit = () => setEditActive(true);
  const exitEdit = () => setEditActive(false);

  const handleEditConfirm = async () => {
    if (
      courseTitle === course?.name &&
      courseDescription === course?.description
    ) {
      setEditActive(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/course/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: courseTitle,
          description: courseDescription,
          icon_url: "",
        }),
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const updatedCourse = {
        ...course,
        name: courseTitle,
        description: courseDescription,
        icon_url: courseIcon,
      };
      setCourse(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
    }

    setEditActive(false);
  };

  const handleAddProblem = () => navigate("/add_problem");
  return (
    <div style={{ margin: "2rem" }}>
      <div className="course-data">
        {editActive ? (
          <>
            <div>
              <TextBox
                text="Kurso pavadinimas"
                value={courseTitle}
                id="name"
                onChange={(e) => setCourseTitle(e.target.value)}
              />
              <TextBox
                text="Kurso aprašymas"
                value={courseDescription}
                id="description"
                onChange={(e) => setCourseDescription(e.target.value)}
              />
            </div>
            <div>
              <img
                src={editButton}
                onClick={handleEditConfirm}
                style={{
                  cursor:
                    courseTitle === course?.name &&
                    courseDescription === course?.description
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    courseTitle === course?.name &&
                    courseDescription === course?.description
                      ? 0.5
                      : 1,
                }}
              />
              <img src={exitButton} onClick={exitEdit} />
            </div>
          </>
        ) : (
          <>
            <div>
              <h2>Kursas: {course?.name || "Įkeliama..."} </h2>
              <h4>Aprašymas: {course?.description || "Įkeliama..."}</h4>
            </div>
            <img src={editButton} onClick={handleEdit} />
          </>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pavadinimas</th>
              <th>Aprašymas</th>
              <th>Sugeneruota</th>
              <th>Sudėtingumas</th>
            </tr>
          </thead>
          <tbody>
            {problems.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <p>Šis kursas neturi sukurtų problemų</p>
                </td>
              </tr>
            ) : (
              problems.map((problem) => (
                <tr
                  key={problem.id}
                  onClick={() => navigate(`/problems/${problem.id}`)}
                >
                  <td>{problem.name}</td>
                  <td>{problem.description}</td>
                  <td>{problem.generated ? "Taip" : "NE"}</td>
                  <td>{problem.difficulty}</td>
                </tr>
              ))
            )}
            <tr>
              <td colSpan="4" className="add-button" onClick={handleAddProblem}>
                +
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default ViewCourse;
