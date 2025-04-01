import { useEffect, useState, useContext} from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewProblem.css";
import Button from "../../components/Button";
import TextBox from "../../components/textBox/TextBox";
import Checkbox from "../../components/Checkbox";
import Dropdown from "../../components/Dropdown";
import { MessageContext } from "../../utils/MessageProvider";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";

const ProblemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProblem, setEditedProblem] = useState({
    id: id,
    name: "",
    description: "",
    generated: 0,
    difficulty: "",
    fk_COURSEid: "",
    fk_AI_RESPONSEid: "",
  });
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`http://localhost:5000/problem?id=${id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setProblem(data[0]);
        setEditedProblem(data[0]);
      } catch (err) {
        setError(err.message);
        showErrorMessage("Nepavyko gauti užduoties");
      } finally {
        setIsLoaded(true);
      }
    };
    fetchProblem();
  }, [id]);

  const handleSave = async () => {
    console.log("Sending data:", editedProblem);

    try {
      const response = await fetch("http://localhost:5000/problem/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProblem),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida atnaujinant problemą");
      }

      alert("Problema sėkmingai atnaujinta!");
      setIsEditMode(false);
      window.location.reload();
      showSuccessMessage("Užduotis sėkmingai atnaujinta");
    } catch (error) {
      alert(`Klaida: ${error.message}`);
      showErrorMessage("Nepavyko išsaugoti pakeitimų");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ar tikrai norite ištrinti šią problemą?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/problem/delete?id=${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida šalinant problemą");
      }

      showSuccessMessage("Užduotis sėkmingai ištrinta");
      window.location.reload();
    } catch {
      showErrorMessage("Nepavyko ištrinti užduoties");
    }
  };

  const handleRecover = async (id) => {
    if (!window.confirm("Ar tikrai norite atkurti šią problemą?")) return;

    try {
      const response = await fetch(`http://localhost:5000/problem/restore?`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida atkuriant užduotį");
      }

      showSuccessMessage("Užduotis sėkmingai atkurta");
      window.location.reload();
    } catch {
      showErrorMessage("Klaida atkuriant užduotį");
    }
  };

  const handleDropdownChange = (selectedValue) => {
    setEditedProblem((prevProblem) => ({
      ...prevProblem,
      difficulty:
        selectedValue === "Lengvas"
          ? "easy"
          : selectedValue === "Sudėtingas"
          ? "medium"
          : selectedValue === "Sunkus"
          ? "hard"
          : "",
    }));
  };

  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    setEditedProblem((prevProblem) => ({
      ...prevProblem,
      generated: isChecked ? 1 : 0,
    }));
  };

  const handleViewTestCases = () => {
    navigate(`/view_problem/${id}/testcases`);
  }

  return (
    <div className="problem-container">
      {isLoaded ? (
        <>
          <h2>{problem.name}</h2>

          {isEditMode ? (
            <>
              <div className="form-group">
                <TextBox
                  text="Pavadinimas"
                  value={editedProblem.name}
                  onChange={(e) =>
                    setEditedProblem((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  name="name"
                />
              </div>
              <div className="form-group">
                <TextBox
                  text="Aprašymas"
                  value={editedProblem.description}
                  onChange={(e) =>
                    setEditedProblem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  name="description"
                />
              </div>
              <div className="form-group">
                <Dropdown
                  options={["Lengvas", "Sudėtingas", "Sunkus"]}
                  placeholder="Sudėtingumas"
                  initialValue={
                    editedProblem.difficulty === "easy"
                      ? "Lengvas"
                      : editedProblem.difficulty === "medium"
                      ? "Sudėtingas"
                      : editedProblem.difficulty === "hard"
                      ? "Sunkus"
                      : ""
                  }
                  onSelect={handleDropdownChange}
                />
              </div>
              <div className="form-group">
                <Checkbox
                  checked={Boolean(editedProblem.generated)}
                  onChange={handleCheckboxChange}
                >
                  Generuota
                </Checkbox>
              </div>
              <br />
              <Button onClick={handleSave}>Išsaugoti</Button>
            </>
          ) : (
            <>
              <p>
                <strong>Aprašymas:</strong> {problem.description}
              </p>
              <p>
                <strong>Sudėtingumas:</strong> {problem.difficulty}
              </p>
              <p>
                <strong>Sprendimai:</strong> {problem.solution || "Nėra"}
              </p>
              <p>
                <strong>Užuominos:</strong> {problem.hints || "Nėra"}
              </p>
              <p>
                <strong>Generuota:</strong> {problem.generated ? "Taip" : "Ne"}
              </p>
              <p>
                <strong>Kurso ID:</strong> {problem.fk_COURSEid || "-"}
              </p>
              <p>
                <strong>AI Atsakymo ID:</strong>{" "}
                {problem.fk_AI_RESPONSEid || "-"}
              </p>
              <p>
                <strong>Ištrinta:</strong> {problem.deleted ? "Taip" : "Ne"}
              </p>

              <Button onClick={() => setIsEditMode(true)}>Redaguoti</Button>

              {problem.deleted ? (
                <Button onClick={() => handleRecover(id)}>Grąžinti</Button>
              ) : (
                <Button onClick={() => handleDelete(id)}>Ištrinti</Button>
              )}

              <Button onClick={handleViewTestCases}>Testai</Button>
            </>
          )}
        </>
      ) : (
        <h2>
          <AnimatedLoadingText />
        </h2>
      )}
    </div>
  );
};

export default ProblemDetails;
