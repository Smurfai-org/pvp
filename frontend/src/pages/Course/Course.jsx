import { useNavigate, useParams } from "react-router-dom";
import "./course.css";
import ProgressBar from "./ProgressBar";
import Button from "../../components/Button";

const Course = () => {
  const params = useParams();
  const navigate = useNavigate();

  return (
    <div className="course-container">
      <div className="course-info">
        <div className="course-info-top-row">
          <h2>Pavadinimas</h2>
          <div className="inline-elements">
            <strong>2/10</strong>
            <ProgressBar progress={20} />
          </div>
        </div>
        <p className="course-info-description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </p>
        <br />
        <div className="inline-elements">
          <Button extra="small secondary" onClick={() => navigate("/")}>
            Atgal į sąrašą
          </Button>
          <Button extra="small">Tęsti</Button>
        </div>
      </div>
      <div className="course-info">
        <div className="course-info-top-row">
          <h2>Kurso problemos</h2>
        </div>
      </div>
    </div>
  );
};

export default Course;
