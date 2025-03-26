import { useEffect, useState, useContext } from "react";
import Card from "../../components/Card";
import "./AdminDash.css";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { MessageContext } from "../../utils/MessageProvider";
import AuthContext from "../../utils/AuthContext";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";

function AdminDash() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
  const { user, loggedIn } = useContext(AuthContext);

  if (!loggedIn || user.role != "admin") {
    navigate("/login");
  }

  const fetchData = async () => {
    try {
      const req = await fetch(`http://localhost:5000/course/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!req.ok) {
        throw new Error(res.status);
      }
      const res = await req.json();

      setCourses(res);
    } catch {
      showErrorMessage("Nepavyko rasti kursų");
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    navigate("/create_course");
  };

  const handleCardClick = (id) => {
    navigate(`/view_course/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ar tikrai norite ištrinti šį kursą?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/course/delete?id=${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        throw new Error("Nepavyko ištrinti kurso");
      }

      showSuccessMessage("Kursas sėkmingai ištrintas!");

      fetchData();
    } catch (error) {
      console.error("Klaida:", error);
      showErrorMessage(error.message || "Nepavyko ištrinti kurso");
    }
  };

  const handleRecover = async (id) => {
    if (!window.confirm("Ar tikrai norite atkurti šią problemą?")) return;

    try {
      const response = await fetch(`http://localhost:5000/course/restore?`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida atkuriant užduotį");
      }

      showSuccessMessage("Užduotis sėkmingai atkurta");
      window.location.reload();
    } catch {
      showErrorMessage("Klaida atkuriant užduotį");
    }
  };

  const sortedCourses = courses.sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
  const nonDeletedCourses = sortedCourses.filter((course) => !course.deleted);
  const deletedCourses = sortedCourses.filter((course) => course.deleted);

  return (
    <div className="dashboard">
      <h2>Administratoriaus skydelis</h2>
      <Button onClick={handleCreate}>Sukurti kursą</Button>

      <h2>Kursai</h2>
      {isLoaded ? (
        <>
          <div className="admin-dashboard">
            {nonDeletedCourses.map((course) => (
              <div className="course-card-container" key={course.id}>
                <Card
                  title={course.name}
                  paragraph={course.description}
                  onClick={() => handleCardClick(course.id)}
                  showActions={true}
                  onDelete={() => handleDelete(course.id)}
                  isDeleted={false}
                />
              </div>
            ))}
          </div>

          <h2>Ištrinti kursai</h2>
          <div className="admin-dashboard">
            {deletedCourses.map((course) => (
              <div className="course-card-container" key={course.id}>
                <Card
                  title={course.name}
                  paragraph={course.description}
                  onClick={() => handleCardClick(course.id)}
                  showActions={true}
                  onRestore={() => handleRecover(course.id)}
                  isDeleted={true}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <AnimatedLoadingText />
      )}
    </div>
  );
}

export default AdminDash;
