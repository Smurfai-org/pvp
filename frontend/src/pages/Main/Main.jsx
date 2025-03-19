import "./main.css";
import SideImage from "../../assets/Smurfai-landing-page-image.png";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";

const specialSpaces = (num) => {
  let spacesArray = [];
  for (let i = 0; i < num; i++) {
    spacesArray.push(<span key={i}>&nbsp;</span>);
  }
  return spacesArray;
};

const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="full-container-page">
      {console.log(document.cookie)}
      <div className="content-wrapper">
        <div className="image-container">
          <img
            src={SideImage}
            className="image-box"
            alt="Smurfai landing page"
          />
        </div>

        <div className="headline-button-container">
          <div className="headline">
            <h1>
              Transform Your Skills,{specialSpaces(20)}
              <br />
              {specialSpaces(10)}Transform Your Future
            </h1>
          </div>
          <div className="button-container">
            <Button extra="button-style" onClick={() => navigate("/register")}>
              Create account {">"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
