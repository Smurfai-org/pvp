import { useNavigate, useParams } from "react-router-dom";
import "./course.css";
import ProgressBar from "./ProgressBar";
import Button from "../../components/Button";
import { useContext, useEffect, useState } from "react";
import CourseProblemTile from "./CourseProblemTile";
import AuthContext from "../../utils/AuthContext";

const Course = () => {
  const { id } = useParams();
  const { loggedIn, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courseInfo, setCourseInfo] = useState(null);
  const [courseProblems, setCourseProblems] = useState([]);
  const [courseProblemsOrder, setCourseProblemsOrder] = useState([]);

  const onContinueCourseButtonClick = () => {
    navigate(`/problems/${courseProblems[0]?.id}`, {
      state: { courseId: id, courseProblemsOrder: courseProblemsOrder },
    });
  };

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
        const sortedData = data.sort((a, b) => a.order_index - b.order_index);
        const problemsOrder = sortedData?.map((item) => item?.id);
        setCourseProblemsOrder(problemsOrder);
        setCourseProblems(sortedData);
      } catch (error) {
        console.error("Error fetching problems:", error);
        setCourseProblems([]);
      }
    };

    fetchCourse();
    fetchProblems();
  }, [id]);

  return (
    <div className="course-container">
      <div className="course-info-container">
        <div className="course-info-top-row">
          <h2>{courseInfo?.name}</h2>
          {loggedIn && (
            <div className="inline-elements">
              <strong>2/10</strong>
              <ProgressBar progress={20} />
            </div>
          )}
        </div>
        <p className="course-info-description">{courseInfo?.description}</p>
        <br />
        <div className="inline-elements">
          <Button extra="small secondary" onClick={() => navigate("/")}>
            Atgal į sąrašą
          </Button>
          <Button extra="small" onClick={onContinueCourseButtonClick}>
            Pradėti
          </Button>
        </div>
      </div>
      <div className="course-info-container">
        <div className="course-info-top-row">
          <h2>Kurso problemos</h2>
        </div>
        <div className="problems-container">
          {courseProblems && courseProblems.length > 0 ? (
            courseProblems.map((problem, index, array) => (
              <div key={problem.id || index}>
                <CourseProblemTile
                  problem={problem}
                  courseId={id}
                  courseProblemsOrder={courseProblemsOrder}
                />
                {index !== array.length - 1 && <hr />}{" "}
              </div>
            ))
          ) : (
            <p>Kursas problemų neturi.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
