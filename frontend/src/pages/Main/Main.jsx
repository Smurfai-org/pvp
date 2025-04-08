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
              Tobulink savo įgūdžius,{specialSpaces(10)}
              <br />
              {specialSpaces(10)}Keisk savo ateitį
            </h1>
          </div>
          <div className="button-container">
            <Button extra="button-style" onClick={() => navigate("/register")}>
              Sukurti paskyrą {">"}
            </Button>
          </div>
        </div>
      </div>

      <div className="description-section">
        <div className="description-columns">
          <div className="column">
            <h2>Apie projektą</h2>
            <p>
              „Placeholder“ yra edukacinis projektas, skirtas mokyklų
              abiturientams ir ne tik, kurie nori gilintis į programavimą. Mūsų
              tikslas – suteikti galimybę mokytis ir tobulėti, pasirinkus vieną
              iš dviejų populiariausių programavimo kalbų – C++ arba Python.
            </p>
            <p>
              Šis projektas išsiskiria tuo, kad jame įdiegtas dirbtinis
              intelektas, kuris padeda mokiniams mokytis. Dirbtinis intelektas
              ne tik suteikia užuominas ir patarimus, bet ir adaptuojasi prie
              mokinio gebėjimų, kad užduotys būtų tinkamos ir skatinančios
              pažangą. Tai leidžia kiekvienam mokiniui dirbti savo tempu ir
              gauti individualizuotą pagalbą, taip užtikrinant, kad mokymosi
              procesas būtų efektyvus ir motyvuojantis.
            </p>
          </div>
          <div className="column">
            <h2>Projekto tikslas</h2>
            <p>
              Mūsų tikslas – ne tik padėti įsisavinti programavimo kalbas, bet
              ir išugdyti svarbius įgūdžius, kurie bus naudingi tiek tolimesnėje
              karjeroje, tiek kasdieniame gyvenime. Dirbtinis intelektas ir
              individualizuotas mokymosi kelias leis mokiniams pasiekti
              geriausių rezultatų.
            </p>
            <p>
              Prisijunk prie „Placeholder“ ir pradėk savo kelionę į programavimo
              pasaulį! Mūsų projektas atveria naujas galimybes ir padeda sukurti
              stiprų pagrindą, kuris padės tavo ateities karjerai.
            </p>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>© 2025 Placeholder. Visos teisės saugomos.</p>
      </div>
    </div>
  );
};

export default Main;
