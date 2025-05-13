import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewTC.css";
import Button from "../../components/Button";
import { MessageContext } from "../../utils/MessageProvider";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import AuthContext from "../../utils/AuthContext";
import cookies from "js-cookie";
import LoginPrompt from "../../components/LoginPrompt";

const ViewTC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
  const { loggedIn, user } = useContext(AuthContext);
  const [testCases, setTestCases] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditMode, setIsEditMode] = useState({});
  const [problemDescription, setProblemDescription] = useState("");
  const [editedTestCases, setEditedTestCases] = useState({});
  const [isCreatingNewTest, setIsCreatingNewTest] = useState(false);
  const [newTestCase, setNewTestCase] = useState({
    input: { cpp: "", python: "" },
    expected_output: "",
    fk_PROBLEMid: id,
  });

  if (!loggedIn) {
    return <LoginPrompt />;
  }

  if (user.role != "admin") {
    navigate("/404");
    return;
  }

  useEffect(() => {
    fetchTestCases();
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

  const fetchTestCases = async () => {
    try {
      setIsLoaded(false);
      const response = await fetch(`http://localhost:5000/test_cases?id=${id}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      const formattedData = data.map((tc) => ({
        ...tc,
        input:
          typeof tc.input === "string"
            ? JSON.parse(tc.input || "{}")
            : tc.input,
      }));

      setTestCases(formattedData);

      const initialEditModes = {};
      const initialEditedCases = {};
      formattedData.forEach((tc) => {
        initialEditModes[tc.id] = false;
        initialEditedCases[tc.id] = { ...tc };
      });

      setIsEditMode(initialEditModes);
      setEditedTestCases(initialEditedCases);
    } catch (err) {
      showErrorMessage("Nepavyko gauti testų");
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  };

  const handleEdit = (testCaseId) => {
    setIsEditMode((prev) => ({
      ...prev,
      [testCaseId]: true,
    }));
  };

  const handleSave = async (testCaseId) => {
    if (
      !editedTestCases[testCaseId].input.cpp.trim() ||
      !editedTestCases[testCaseId].input.python.trim() ||
      !editedTestCases[testCaseId].expected_output.trim()
    ) {
      showErrorMessage("Visi laukai turi būti užpildyti");
      return;
    }
    try {
      const updatedTestCase = editedTestCases[testCaseId];

      const formattedInput = JSON.stringify(updatedTestCase.input);
      
      const response = await fetch(
        `http://localhost:5000/test_cases/${testCaseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.get("token")}`,
          },
          body: JSON.stringify({
            ...updatedTestCase,
            input: formattedInput,
            output: updatedTestCase.expected_output,
            visibility: updatedTestCase.visibility || 0,
          }),
          credentials: "include",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida atnaujinant testą");
      }

      showSuccessMessage("Testas sėkmingai atnaujintas");

      setIsEditMode((prev) => ({
        ...prev,
        [testCaseId]: false,
      }));

      fetchTestCases();
    } catch (error) {
      showErrorMessage("Klaida išsaugant testą");
      console.error(error);
    }
  };

  const handleDelete = async (testCaseId) => {
    if (!window.confirm("Ar tikrai norite ištrinti šį testą?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/test_cases/${testCaseId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.get("token")}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida šalinant testą");
      }

      showSuccessMessage("Testas sėkmingai ištrintas");
      fetchTestCases();
    } catch (error) {
      showErrorMessage("Klaida trinant testą");
      console.error(error);
    }
  };

  const handleCancel = (testCaseId) => {
    setEditedTestCases((prev) => ({
      ...prev,
      [testCaseId]: { ...testCases.find((tc) => tc.id === testCaseId) },
    }));

    setIsEditMode((prev) => ({
      ...prev,
      [testCaseId]: false,
    }));
  };

  const handleInputChange = (testCaseId, language, value) => {
    setEditedTestCases((prev) => ({
      ...prev,
      [testCaseId]: {
        ...prev[testCaseId],
        input: {
          ...prev[testCaseId].input,
          [language]: value,
        },
      },
    }));
  };

  const handleOutputChange = (testCaseId, value) => {
    setEditedTestCases((prev) => ({
      ...prev,
      [testCaseId]: {
        ...prev[testCaseId],
        expected_output: value,
      },
    }));
  };

  const handleNewTestInputChange = (language, value) => {
    setNewTestCase((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        [language]: value,
      },
    }));
  };

  const handleNewTestOutputChange = (value) => {
    setNewTestCase((prev) => ({
      ...prev,
      expected_output: value,
    }));
  };

  const handleCreateTest = async () => {
    if (
      !newTestCase.input.cpp.trim() ||
      !newTestCase.input.python.trim() ||
      !newTestCase.expected_output.trim()
    ) {
      showErrorMessage("Visi laukai turi būti užpildyti");
      return;
    }
    try {
      const formattedInput = JSON.stringify(newTestCase.input);

      const response = await fetch("http://localhost:5000/test_cases/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("token")}`,
        },
        body: JSON.stringify({
          ...newTestCase,
          problemId: id,
          input: formattedInput,
          output: newTestCase.expected_output,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Klaida kuriant testą");
      }

      showSuccessMessage("Testas sėkmingai sukurtas");

      setNewTestCase({
        input: { cpp: "", python: "" },
        expected_output: "",
        fk_PROBLEMid: id,
      });
      setIsCreatingNewTest(false);

      fetchTestCases();
    } catch (error) {
      showErrorMessage("Klaida kuriant testą");
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(`/view_problem/${id}`);
  };

  return (
    <div className="testcases-container">
      <h2>Užduoties #{id} testai</h2>

      <div className="testcases-actions">
        <Button extra="small secondary" onClick={handleBack}>
          Grįžti atgal
        </Button>

        <Button extra="small" onClick={() => setIsCreatingNewTest(true)}>
          Pridėti naują testą
        </Button>
      </div>

      {!isLoaded ? (
        <AnimatedLoadingText />
      ) : (
        <>
          {isCreatingNewTest && (
            <div className="testcase-item new-testcase">
              <div className="testcase-header">
                <h3>Naujas testas</h3>
                <div className="testcase-actions">
                  <Button extra="small" onClick={handleCreateTest}>
                    Suprantu taisykles, sukurti testą
                  </Button>
                  <Button
                    extra="small secondary"
                    onClick={() => setIsCreatingNewTest(false)}
                  >
                    Atšaukti
                  </Button>
                </div>
              </div>

              <div className="testcase-content">
                <div className="input-section">
                  <div className="rules-list">
                    <p>
                      Įspėjimas: jūs kuriate testą{" "}
                      <a href={`/view_problem/${id}`}>užduočiai su ID {id}:</a>
                    </p>
                    <div className="problem-description">
                      <p>{problemDescription}</p>
                    </div>
                    <p>
                      <strong>
                        Esate pilnai atsakingas už visas potencines klaidas
                      </strong>
                      , kurios įvyks jeigu nesilaikysite taisyklių:
                    </p>
                    <li>
                      Kodo sintaksė privalo <strong>būti teisinga.</strong>{" "}
                      Nepamirškite kabliataškių (C++ atveju), patikrinkite
                      operatorių teisingumą.
                    </li>
                    <li>
                      Kintamųjų duomenų tipai privalo{" "}
                      <strong>atitikti užduotį.</strong>{" "}
                    </li>
                    <li>
                      Kintamųjų skaičius privalo <strong>būti lygus</strong>{" "}
                      tarp C++ ir Python kalbų.
                    </li>
                    <li>
                      Norimo rezultato reikšmė privalo{" "}
                      <strong>laikytis užduotyje nustatytų gairių.</strong>{" "}
                      Pavyzdžiui, jeigu užduotis prašo pateikti du skaičius po
                      kablelio, norimas rezultatas taip pat pateiks du skaičius
                      po kablelio ir t.t.
                    </li>
                    <li className="list-warning">
                      Prieš išsaugojant testą,{" "}
                      <strong>
                        dar kartą patikrinkite visus testo laukus.
                      </strong>
                    </li>
                  </div>
                  <h4>C++ įvestis:</h4>
                  <textarea
                    required
                    rows={5}
                    value={newTestCase.input.cpp}
                    onChange={(e) =>
                      handleNewTestInputChange("cpp", e.target.value)
                    }
                  />

                  <h4>Python įvestis:</h4>
                  <textarea
                    required
                    rows={5}
                    value={newTestCase.input.python}
                    onChange={(e) =>
                      handleNewTestInputChange("python", e.target.value)
                    }
                  />

                  <h4>Norimas rezultatas:</h4>
                  <textarea
                    required
                    value={newTestCase.expected_output}
                    onChange={(e) => handleNewTestOutputChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {testCases.length === 0 ? (
            <p>Nėra testų</p>
          ) : (
            <div className="testcases-list">
              {testCases.map((tc, index) => (
                <div key={tc.id} className="testcase-item">
                  <div className="testcase-header">
                    <h3>Testas #{index + 1}</h3>
                    {isEditMode[tc.id] ? (
                      <div className="testcase-actions">
                        <Button extra="small" onClick={() => handleSave(tc.id)}>
                          Išsaugoti
                        </Button>
                        <Button
                          extra="small secondary"
                          onClick={() => handleCancel(tc.id)}
                        >
                          Atšaukti
                        </Button>
                      </div>
                    ) : (
                      <div className="testcase-actions">
                        <Button extra="small" onClick={() => handleEdit(tc.id)}>
                          Redaguoti
                        </Button>
                        <Button
                          extra="small secondary"
                          onClick={() => handleDelete(tc.id)}
                        >
                          Ištrinti
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="testcase-content">
                    {isEditMode[tc.id] ? (
                      <>
                        <div className="rules-list">
                          <p>
                            Ispėjimas: jūs redaguojate testą{" "}
                            <a href={`/view_problem/${id}`}>
                              užduočiai su ID {id}:
                            </a>
                          </p>
                          <div className="problem-description">
                            <p>{problemDescription}</p>
                          </div>
                          <p>
                            <strong>
                              Esate pilnai atsakingas už visas potencines
                              klaidas
                            </strong>
                            , kurios įvyks jeigu nesilaikysite taisyklių:
                          </p>
                          <li>
                            Kodo sintaksė privalo{" "}
                            <strong>būti teisinga.</strong> Nepamirškite
                            kabliataškių (C++ atveju), patikrinkite operatorių
                            teisingumą.
                          </li>
                          <li>
                            Kintamųjų duomenų tipai privalo{" "}
                            <strong>atitikti užduotį.</strong>{" "}
                          </li>
                          <li>
                            Kintamųjų skaičius privalo{" "}
                            <strong>būti lygus</strong> tarp C++ ir Python
                            kalbų.
                          </li>
                          <li>
                            Norimo rezultato reikšmė privalo{" "}
                            <strong>
                              laikytis užduotyje nustatytų gairių.
                            </strong>{" "}
                            Pavyzdžiui, jeigu užduotis prašo pateikti du
                            skaičius po kablelio, norimas rezultatas taip pat
                            pateiks du skaičius po kablelio ir t.t.
                          </li>
                          <li className="list-warning">
                            Prieš išsaugojant testą,{" "}
                            <strong>
                              dar kartą patikrinkite visus testo laukus.
                            </strong>
                          </li>
                        </div>
                        <div className="input-section">
                          <h4>C++ įvestis:</h4>
                          <textarea
                            required
                            rows={5}
                            value={editedTestCases[tc.id].input.cpp || ""}
                            onChange={(e) =>
                              handleInputChange(tc.id, "cpp", e.target.value)
                            }
                          />

                          <h4>Python įvestis:</h4>
                          <textarea
                            required
                            rows={5}
                            value={editedTestCases[tc.id].input.python || ""}
                            onChange={(e) =>
                              handleInputChange(tc.id, "python", e.target.value)
                            }
                          />

                          <h4>Norimas rezultatas:</h4>
                          <textarea
                            required
                            value={editedTestCases[tc.id].expected_output || ""}
                            onChange={(e) =>
                              handleOutputChange(tc.id, e.target.value)
                            }
                          />
                          <div className="visibility-toggle">
                            <label>
                              <input
                                type="checkbox"
                                checked={!!editedTestCases[tc.id].visibility}
                                onChange={(e) =>
                                  setEditedTestCases((prev) => ({
                                    ...prev,
                                    [tc.id]: {
                                      ...prev[tc.id],
                                      visibility: e.target.checked ? 1 : 0,
                                    },
                                  }))
                                }
                              />
                              Viešas testas (matomas vartotojui)
                            </label>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="input-section">
                          <h4>C++ įvestis:</h4>
                          <pre>{tc.input.cpp}</pre>

                          <h4>Python įvestis:</h4>
                          <pre>{tc.input.python}</pre>

                          <h4>Norimas rezultatas:</h4>
                          <pre>{tc.expected_output}</pre>
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

export default ViewTC;
