import { useNavigate } from "react-router-dom";
import { difficulty_dictionary } from "../../constants";

const CourseProblemTile = ({ problem, courseId }) => {
  const problemProgress = "Nepradėta";
  const navigate = useNavigate();

  const onClick = () => {
    navigate(`/problems/${problem?.id}`, { state: { courseId } });
  };

  return (
    <div className="course-problem-item" onClick={onClick}>
      <strong>{problem?.name}</strong>
      <div className="course-problem-status">
        <strong className={problem?.difficulty}>
          {difficulty_dictionary[problem?.difficulty]}
        </strong>
        <strong
          className={
            problemProgress === "Baigta"
              ? "course-finished"
              : problemProgress === "Pradėta"
              ? "course-in-progress"
              : "course-not-started"
          }
        >
          {problemProgress}
        </strong>
      </div>
    </div>
  );
};

export default CourseProblemTile;
