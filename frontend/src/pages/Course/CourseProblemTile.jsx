import { useNavigate } from "react-router-dom";
import { difficulty_dictionary, progress_dictionary } from "../../constants";
import AuthContext from "../../utils/AuthContext";
import { useContext } from "react";

const CourseProblemTile = ({
  problem,
  courseId,
  courseProblemsOrder = null,
}) => {
  const navigate = useNavigate();

  const { loggedIn } = useContext(AuthContext);

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
          loggedIn
            ? "course-problem-status"
            : "course-problem-status problem-progress-missing"
        }
      >
        <strong className={problem?.difficulty}>
          {difficulty_dictionary[problem?.difficulty]}
        </strong>
        {loggedIn && (
          <strong
            className={
              problem?.progress?.status === "finished"
                ? "course-finished"
                : problem?.progress?.status === "in progress"
                ? "course-in-progress"
                : "course-not-started"
            }
          >
            {progress_dictionary[problem?.progress?.status] ||
              progress_dictionary["not started"]}
            {problem?.progress?.status === "finished"
              ? `: ${problem?.progress?.score}/100`
              : ""}
          </strong>
        )}
      </div>
    </div>
  );
};

export default CourseProblemTile;
