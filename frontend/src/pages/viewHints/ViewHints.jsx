import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewHints.css";
import Button from "../../components/Button";
import { MessageContext } from "../../utils/MessageProvider";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import AuthContext from "../../utils/AuthContext";

const ViewHints = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
  const { loggedIn, user } = useContext(AuthContext);
  const [hints, setHints] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditMode, setIsEditMode] = useState({});
  const [problemDescription, setProblemDescription] = useState("");
  const [editedHints, setEditedHints] = useState({});
  const [isCreatingNewHint, setIsCreatingNewHint] = useState(false);
  const [newHint, setNewHint] = useState("");

  useEffect(() => {
    fetchHints();
    fetchProblemDetails();
  }, [id]);

  const fetchProblemDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/problem?id=${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setProblemDescription(data[0]?.description || "");
    } catch (err) {
      showErrorMessage("Nepavyko gauti užduoties aprašymo");
      console.error(err);
    }
  };

  loggedIn && user && user.role !== "admin" && navigate("/");
  if (!loggedIn) {
    navigate("/");
  }

  const fetchHints = async () => {
    try {
      setIsLoaded(false);
      const response = await fetch(`http://localhost:5000/hint?id=${id}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      setHints(data);

      const formattedData = data.reduce((acc, hint) => {
        acc[hint.id] = hint.hint;
        return acc;
      }, {});

      setEditedHints(formattedData);

      const initialEditModes = {};

      setIsEditMode(initialEditModes);
    } catch (err) {
      showErrorMessage("Nepavyko gauti užuominų");
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  };

  const handleEdit = (hintId) => {
    setIsEditMode((prev) => ({
      ...prev,
      [hintId]: true,
    }));
  };

  const handleSave = async (hintId) => {
    if (!editedHints[hintId].trim()) {
      showErrorMessage("Visi laukai turi būti užpildyti");
      return;
    }
    try {
      const updatedHint = editedHints[hintId];

      const response = await fetch(`http://localhost:5000/hint/${hintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedHint,
          hint: updatedHint,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida atnaujinant užuominą");
      }

      showSuccessMessage("Užuomina sėkmingai atnaujintas");

      setIsEditMode((prev) => ({
        ...prev,
        [hintId]: false,
      }));

      fetchHints();
    } catch (error) {
      showErrorMessage("Klaida išsaugant užuominą");
      console.error(error);
    }
  };

  const handleDelete = async (hintId) => {
    if (!window.confirm("Ar tikrai norite ištrinti šią užuominą?")) return;

    try {
      const response = await fetch(`http://localhost:5000/hint/${hintId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida šalinant užuominą");
      }

      showSuccessMessage("Užuomina sėkmingai ištrinta");
      fetchHints();
    } catch (error) {
      showErrorMessage("Klaida trinant užuominą");
      console.error(error);
    }
  };

  const handleCancel = (hintId) => {
    setEditedHints((prev) => ({
      ...prev,
      [hintId]: hints.find((hint) => hint.id === hintId)?.hint,
    }));

    setIsEditMode((prev) => ({
      ...prev,
      [hintId]: false,
    }));
  };

  const handleInputChange = (hintId, value) => {
    setEditedHints((prevHints) => ({
      ...prevHints,
      [hintId]: value,
    }));
  };

  const handleNewHintChange = (value) => {
    setNewHint(value);
  };

  const handleCreateHint = async () => {
    if (!newHint) {
      showErrorMessage("Visi laukai turi būti užpildyti");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/hint/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: id,
          hint: newHint,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida kuriant užuominą");
      }

      showSuccessMessage("Užuomina sėkmingai sukurta");

      setNewHint("");
      setIsCreatingNewHint(false);

      fetchHints();
    } catch (error) {
      showErrorMessage("Klaida kuriant užuominą");
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(`/view_problem/${id}`);
  };

  return (
    <div className="testcases-container">
      <h2>Užduoties #{id} užuominos</h2>

      <div className="testcases-actions">
        <Button extra="small secondary" onClick={handleBack}>
          Grįžti atgal
        </Button>

        <Button extra="small" onClick={() => setIsCreatingNewHint(true)}>
          Pridėti naują užuominą
        </Button>
      </div>

      {!isLoaded ? (
        <AnimatedLoadingText />
      ) : (
        <>
          {isCreatingNewHint && (
            <div className="testcase-item new-testcase">
              <div className="testcase-header">
                <h3>Nauja užuomina</h3>
                <div className="testcase-actions">
                  <Button extra="small" onClick={handleCreateHint}>
                    Sukurti užuominą
                  </Button>
                  <Button
                    extra="small secondary"
                    onClick={() => setIsCreatingNewHint(false)}
                  >
                    Atšaukti
                  </Button>
                </div>
              </div>

              <div className="testcase-content">
                <div className="input-section-hints">
                  <div className="rules-list">
                    <p>
                      Įspėjimas: jūs kuriate užuominą{" "}
                      <a href={`/view_problem/${id}`}>užduočiai su ID {id}:</a>
                    </p>
                    <div className="problem-description">
                      <p>{problemDescription}</p>
                    </div>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={newHint.hint}
                    onChange={(e) => handleNewHintChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {hints.length === 0 ? (
            <p>Nėra užuominų</p>
          ) : (
            <div className="testcases-list">
              {hints.map((hint, index) => (
                <div key={hint.id} className="testcase-item">
                  <div className="testcase-header">
                    <h3>Užuomina #{index + 1}</h3>
                    {isEditMode[hint.id] ? (
                      <div className="testcase-actions">
                        <Button
                          extra="small"
                          onClick={() => handleSave(hint.id)}
                        >
                          Išsaugoti
                        </Button>
                        <Button
                          extra="small secondary"
                          onClick={() => handleCancel(hint.id)}
                        >
                          Atšaukti
                        </Button>
                      </div>
                    ) : (
                      <div className="testcase-actions">
                        <Button
                          extra="small"
                          onClick={() => handleEdit(hint.id)}
                        >
                          Redaguoti
                        </Button>
                        <Button
                          extra="small secondary"
                          onClick={() => handleDelete(hint.id)}
                        >
                          Ištrinti
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="testcase-content">
                    {isEditMode[hint.id] ? (
                      <>
                        <div className="input-section-hints">
                          <div className="rules-list">
                            <p>
                              Įspėjimas: jūs kuriate užuominą{" "}
                              <a href={`/view_problem/${id}`}>
                                užduočiai su ID {id}:
                              </a>
                            </p>
                            <div className="problem-description">
                              <p>{problemDescription}</p>
                            </div>
                          </div>
                          <textarea
                            required
                            rows={5}
                            value={editedHints[hint.id] || ""}
                            onChange={(e) =>
                              handleInputChange(hint.id, e.target.value)
                            }
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="input-section-hints">
                          <pre>{hint.hint}</pre>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewHints;
