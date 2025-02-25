import courseDefaultImage from "../assets/course-default-image.png";

const Card = ({
  title = "Course name",
  paragraph = "Learn this course in 30 days!",
  onClick = () => {},
}) => {
  return (
    <div className="course-card" onClick={onClick}>
      <img src={courseDefaultImage} />
      <div className="course-info">
        <p>{title}</p>
        <p className="course-card-paragraph">{paragraph}</p>
      </div>
    </div>
  );
};

export default Card;
