import { useNavigate } from "react-router-dom";
import { difficulty_dictionary } from "../../constants";

const CourseProblemTile = ({
  problem,
  courseId,
  courseProblemsOrder = null,
  problemProgress = "",
}) => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate(`/problems/${problem?.id}`, {
      state: { courseId: courseId, courseProblemsOrder: courseProblemsOrder },
    });
  };

  return (
    <div className="course-problem-item" onClick={onClick}>
      <strong>{problem?.name}</strong>
      <div
        className={
          problemProgress
            ? "course-problem-status"
            : "course-problem-status problem-progress-missing"
        }
      >
        <strong className={problem?.difficulty}>
          {difficulty_dictionary[problem?.difficulty]}
        </strong>
        {problemProgress && (
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
        )}
      </div>
    </div>
  );
};

export default CourseProblemTile;
