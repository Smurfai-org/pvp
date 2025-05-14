import courseDefaultImage from "../assets/Course-default-image.png";
import trashCan from "../assets/trash-can.svg";
import restoreIcon from "../assets/restore-icon.svg";

const Card = ({
  title = "Course name",
  paragraph = "Learn this course in 30 days!",
  onClick = () => {},
  showActions = false,
  onDelete = () => {},
  isDeleted = false,
}) => {
  return (
    <div className="course-card" onClick={onClick}>
      <img src={courseDefaultImage} alt="Course" />
      <div className="course-info">
        <div className="course-card-title">{title}</div>
        <div className="course-card-paragraph">{paragraph}</div>
      </div>

      {showActions && (
        <div className="card-actions">
          {isDeleted ? (
            <img
              className="restore-icon"
              src={restoreIcon}
              alt="Restore"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            />
          ) : (
            <img
              className="trash-can"
              src={trashCan}
              alt="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Card;
