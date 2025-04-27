import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import TextBox from "../../components/textBox/TextBox";
import "./ViewCourse.css";
import editButton from "../../assets/edit-icon.svg";
import exitButton from "../../assets/exit-icon.svg";
import checkButton from "../../assets/check-icon.svg";
import { MessageContext } from "../../utils/MessageProvider";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import cookies from "js-cookie";
import AuthContext from "../../utils/AuthContext";
import LoginPrompt from "../../components/LoginPrompt";

function ViewCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState({
    course: false,
    problems: false,
  });
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
  const [course, setCourse] = useState(null);
  const [problems, setProblems] = useState([]);
  const [editActive, setEditActive] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseIcon, setcourseIcon] = useState("");
  const { user, loggedIn } = useContext(AuthContext);

  if(!loggedIn) {
    return <LoginPrompt />
  }

  if(user.role != 'admin') {
    navigate('/404');
    return;
  }

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/course/?id=${id}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        if (data.length > 0) {
          setCourse(data[0]);
          setCourseTitle(data[0].name || "");
          setCourseDescription(data[0].description || "");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        showErrorMessage("Nepavyko gauti kurso");
        setCourse(null);
      } finally {
        setIsLoaded((prev) => ({ ...prev, course: true }));
      }
    };

    const fetchProblems = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/course/problems?id=${id}`
        );

        if (!res.ok) {
          if (res.status === 404) {
            console.warn("No problems found, skipping error message.");
            return;
          }
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        if (data.length === 0) {
          console.warn("No problems available for the given ID.");
          return;
        }

        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
        showErrorMessage("Nepavyko gauti užduočių");
      } finally {
        setIsLoaded((prev) => ({ ...prev, problems: true }));
      }
    };

    fetchCourse();
    fetchProblems();
  }, [id]);

  const tokenCookie = cookies.get("token");

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
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${tokenCookie}`
         },
        body: JSON.stringify({
          id,
          name: courseTitle,
          description: courseDescription,
          icon_url: "",
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const updatedCourse = {
        ...course,
        name: courseTitle,
        description: courseDescription,
        icon_url: courseIcon,
      };
      setCourse(updatedCourse);
      showSuccessMessage("Kurso informacija sėkmingai atnaujinta");
    } catch (error) {
      console.error("Error updating course:", error);
      showErrorMessage("Klaida atnaujinant kursą");
    }

    setEditActive(false);
  };

  const handleAddProblem = () => navigate(`/add_problem/${id}`);
  const handleGenProblem = () => navigate(`/generate_problem/${id}`);

  problems.sort((a, b) => (a.deleted ? 1 : 0) - (b.deleted ? 1 : 0));

  return (
    <div style={{ margin: "2rem" }}>
      <div className="course-data">
        {isLoaded.course ? (
          editActive ? (
            <>
              <div className="edit-form">
                <TextBox
                  text="Kurso pavadinimas"
                  value={courseTitle}
                  id="name"
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
                <p>Aprašymas</p>
                <textarea
                  required
                  rows={5}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                />
              </div>
              <div>
                <img
                  src={checkButton}
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
                <h2>Kursas: {course?.name}</h2>
                <h4>Aprašymas: {course?.description}</h4>
              </div>
              <img src={editButton} onClick={handleEdit} />
            </>
          )
        ) : (
          <AnimatedLoadingText />
        )}
      </div>

      <div>
        <Button onClick={handleAddProblem}>Kurti problemą</Button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pavadinimas</th>
              <th>Aprašymas</th>
              <th>Sugeneruota</th>
              <th>Sudėtingumas</th>
              <th>Ištrinta</th>
            </tr>
          </thead>
          <tbody>
            {isLoaded.problems ? (
              problems.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <p>Šis kursas neturi sukurtų problemų</p>
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr
                    key={problem.id}
                    onClick={() => navigate(`/view_problem/${problem.id}`)}
                  >
                    <td>{problem.name}</td>
                    <td>{problem.description}</td>
                    <td>{problem.generated ? "Taip" : "NE"}</td>
                    <td>{problem.difficulty}</td>
                    <td>{problem.deleted ? "Taip" : "NE"}</td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan="5">
                  <AnimatedLoadingText />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewCourse;
