import { useNavigate, useParams } from "react-router-dom";
import "./course.css";
import ProgressBar from "./ProgressBar";
import Button from "../../components/Button";
import { useEffect, useState } from "react";

const Course = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState(null);
  const [courseProblems, setCourseProblems] = useState([]);
  const [problemProgress, setProblemProgress] = useState("Nepradėtaa");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/course/?id=${id}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        if (data.length > 0) {
          setCourseInfo(data[0]);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setCourseInfo(null);
      }
    };

    const fetchProblems = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/course/problems?id=${id}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        setCourseProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
        setCourseProblems([]);
      }
    };

    fetchCourse();
    fetchProblems();
  }, [id]);

  console.log(courseInfo);
  console.log(courseProblems);

  return (
    <div className="course-container">
      <div className="course-info-container">
        <div className="course-info-top-row">
          <h2>{courseInfo?.name}</h2>
          <div className="inline-elements">
            <strong>2/10</strong>
            <ProgressBar progress={20} />
          </div>
        </div>
        <p className="course-info-description">{courseInfo?.description}</p>
        <br />
        <div className="inline-elements">
          <Button extra="small secondary" onClick={() => navigate("/")}>
            Atgal į sąrašą
          </Button>
          <Button extra="small">Pradėti</Button>
        </div>
      </div>
      <div className="course-info-container">
        <div className="course-info-top-row">
          <h2>Kurso problemos</h2>
        </div>
        <div className="problems-container">
          {courseProblems && courseProblems?.length > 0 ? (
            courseProblems?.map((problem, index) => (
              <div key={index} className="course-problem-item">
                <strong>{problem?.name}</strong>
                <strong className={problem?.difficulty}>
                  {problem?.difficulty}
                </strong>
                <strong
                  className={
                    problemProgress === "Nepradėta"
                      ? "course-not-started"
                      : problemProgress === "Pradėta"
                      ? "course-in-progress"
                      : "course-finished"
                  }
                >
                  {problemProgress}
                </strong>
              </div>
            ))
          ) : (
            <p>No problems available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
