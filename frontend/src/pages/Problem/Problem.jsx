import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Hyperlink from "../../components/Hyperlink";
import CodeEditor from "./CodeEditor";
import Dropdown from "../../components/Dropdown";
import OutputSection from "./Output";
import "./problem.css";
import { difficulty_dictionary } from "../../constants";
import AuthContext from "../../utils/AuthContext";
import {
  determineOutputType,
  getStartingCodeFromVariables,
  getTestCaseVariables,
  problemCodeFullCpp,
  problemCodeFullPython,
} from "./problemCodeUtilities";
import { MessageContext } from "../../utils/MessageProvider";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import LoginPrompt from "../../components/loginPrompt";

const languages = [
  { label: "C++", value: "cpp" },
  { label: "Python", value: "python" },
];

const Problem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const outputRef = useRef(null);
  const location = useLocation();
  const originalCourseId = location.state?.courseId;
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);

  const [isLoaded, setIsLoaded] = useState(false);
  const loadingText = "Įkeliama...";
  // Atėjus iš kurso pateikiamas kurso problemų id sąrašas pagal order_index. Pvz: [14, 13, 15, 16, 18]. Skirtas nurodyti previousProblemId ir nextProblemId
  const courseProblemsOrder = location.state?.courseProblemsOrder;
  const { loggedIn, user } = useContext(AuthContext);

  const [isOutputWindowMaximised, setIsOutputWindowMaximised] = useState(false);

  const [problem, setProblem] = useState("");
  const [previousProblemId, setPreviousProblemId] = useState(null);
  const [nextProblemId, setNextProblemId] = useState(null);
  const [selectedLanguageValue, setSelectedLanguageValue] = useState(
    languages[0]?.value
  );

  // SĄRAŠAS testavimo atveju. Vieno jų tipas pvz toks:
  // {id: 1, input: {cpp: 'const int num1 = 5;\nconst int num2 = 10;', python: 'num1 = 5\nnum2 = 10'}, expected_output: '15', fk_PROBLEMid: 18}
  const [testCases, setTestCases] = useState([]);

  // SĄRAŠAS pirmo testo kintamųjų. Tikimės, kad visų vienos problemos testų kintamųjų tipai ir pavadinimai tie patys. Vieno pavyzdys toks:
  // {type: 'int', name: 'num1'}
  const [testCaseVariables, setTestCaseVariables] = useState([]);

  // Basic pradinis kodas, sugeneruojamas pagal kintamuosius. Jis būna rodomas kai useris neturi jokio progreso. Pvz:
  // {cpp: 'int Sprendimas(int num1, int num2) {\n  return 0;\n}', python: 'def Sprendimas(num1, num2):\n  return 0\n'}
  const [inputCodeEmpty, setInputCodeEmpty] = useState({});

  // Tas pats kaip inputCodeEmpty, bet yra rodomas useriui ir gali būti keičiamas
  const [inputCode, setInputCode] = useState({});

  // Visa kurso informacija, naudojam tik courseInfo.id ir courseInfo.name, kad pateikti nuorodą į problemos kursą
  const [courseInfo, setCourseInfo] = useState(null);

  // Output lange atvaizduojamas tesktas
  const [outputText, setOutputText] = useState("");

  // Kai praeina bent vienas testas nustatom passScore ir saugom duomazėj "progress" lentelėj, taip pat pakeičiam statusą į "finished"
  const [passScore, setPassScore] = useState(null);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const onDropdownSelect = (selectedLabel) => {
    const selectedLang = languages.find((lang) => lang.label === selectedLabel);
    if (selectedLang) {
      setSelectedLanguageValue(selectedLang.value);
    }
  };

  const handleArrowNavigationButtonClick = (id) => {
    navigate(`/problems/${id}`, {
      state: {
        courseId: originalCourseId,
        courseProblemsOrder: courseProblemsOrder,
      },
    });
  };

  const handleBackToListButtonClick = () => {
    if (originalCourseId) {
      navigate(`/courses/${originalCourseId}`);
      return;
    }
    navigate("/courses");
  };

  const handleResetCodeButtonClick = () => {
    setInputCode({
      ...inputCode,
      [selectedLanguageValue]: inputCodeEmpty?.[selectedLanguageValue],
    });
  };

  const handleTestButtonClick = async (index = null, dontPrint = false) => {
    const sourceCode =
      selectedLanguageValue === "cpp"
        ? problemCodeFullCpp(
            testCases[index],
            testCaseVariables,
            inputCode?.cpp
          )
        : problemCodeFullPython(
            testCases[index],
            testCaseVariables,
            inputCode?.python
          );

    if (outputRef.current) {
      try {
        const resultNotFormatted = await outputRef.current.runCode(sourceCode);
        let didPass = false;

        const lines = resultNotFormatted.split("\n");
        const lastLine = lines[lines.length - 2];

        let coloredLastLine = lastLine;
        if (lastLine === "Testas nepraeitas.") {
          coloredLastLine = `<span style="color: #fc0303; font-family: 'Consolas';">${lastLine}</span>`;
        } else if (lastLine === "Testas įveiktas!") {
          coloredLastLine = `<span style="color: #00db1a; font-family: 'Consolas';">${lastLine}</span>`;
          didPass = true;
        }

        lines[lines.length - 2] = coloredLastLine;
        const result = lines.join("\n");

        if (!dontPrint) setOutputText(result);
        setIsOutputWindowMaximised(true);
        return { result, didPass };
      } catch (error) {
        console.error("Error running test case:", error);
        setOutputText(error.message);
      }
    }
  };

  const handleRunButtonClick = async () => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      console.log('click');
    }
    if (testCases.length < 1) {
      await handleTestButtonClick();
      return;
    }

    setOutputText([]);

    let countOfPasses = 0;
    for (const [index] of testCases.entries()) {
      const { result, didPass } = await handleTestButtonClick(index, true);
      if (didPass) countOfPasses++;
      setOutputText((prevOutput) => {
        return (
          prevOutput + `<strong>Testas ${index + 1}</strong>\n\n${result}\n`
        );
      });
    }

    setPassScore(null);
    if (countOfPasses > 0) {
      const score = Math.round((countOfPasses * 100) / testCases.length);
      setPassScore(score);
      showSuccessMessage(`Užduotis išlaikyta ${score}%`);
      return score;
    }
  };

  const handleAIclick = async () => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    //Paleisti, kad praeitu testus
    const score = await handleRunButtonClick();

    //AI CALLAS KAD IVERTINTU BUS CIA

    // Kodo saugojimo dalis
    const sourceCode =
      selectedLanguageValue === "cpp" ? inputCode?.cpp : inputCode?.python;
    console.log({ code: sourceCode, userId: user?.id, probId: id });
    try {
      const res = await fetch("http://localhost:5000/problem/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: inputCode,
          userId: user?.id,
          probId: id,
          score: score ? score : 0,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        showErrorMessage("Nepavyko įkelti sprendimo");
      }

      showSuccessMessage("Kodas sėkmingai įvertintas");
    } catch {
      showErrorMessage("Klaida įkeliant sprendimą");
    }

    try {
      const response = await fetch(
        `http://localhost:5000/enrolled/${user?.id}/${courseInfo?.id}`
      );
      if (!response.ok) throw new Error(response.status);
      const data = await response.json();

      try {
        const completed_problems =
          passScore === null && score > 0
            ? Number((data[0]?.completed_problems ?? 0) + 1)
            : passScore > 0 && score === undefined
            ? Number((data[0]?.completed_problems ?? 0) - 1)
            : data[0]?.completed_problems ?? 0;

        await fetch(
          `http://localhost:5000/enrolled/${user?.id}/${courseInfo?.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              completed_problems: completed_problems,
              language: selectedLanguageValue,
            }),
            credentials: "include",
          }
        );
      } catch {
        console.error("Nepavyko pakeisti kurso progreso");
      }
    } catch {
      try {
        await fetch(`http://localhost:5000/enrolled`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: courseInfo?.id,
            userId: user?.id,
            completed_problems: score ? 1 : 0,
            language: selectedLanguageValue,
          }),
          credentials: "include",
        });
      } catch {
        console.error("Nepavyko pradėti kurso");
      }
    }
  };

  useEffect(() => {
    const fetchProblem = async (automaticallyGeneratedInputCode) => {
      setProblem("");
      setPassScore(null);

      try {
        const [problemRes, userCodeRes] = await Promise.all([
          fetch(`http://localhost:5000/problem?id=${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          loggedIn
            ? fetch(`http://localhost:5000/progress/${user?.id}/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              })
            : null,
        ]);

        if (!problemRes.ok) throw new Error(`HTTP error: ${problemRes.status}`);
        const problemData = await problemRes.json();

        const parsedStartingCode = JSON.parse(
          problemData[0]?.starting_code || "{}"
        );

        problemData[0] = {
          ...problemData[0],
          starting_code: parsedStartingCode,
        };
        setProblem(problemData[0]);

        if (loggedIn && userCodeRes?.ok) {
          const userData = await userCodeRes.json();
          if (userData[0].score) setPassScore(userData[0].score);

          const parsedUserCode = JSON.parse(userData[0]?.code || "{}");

          setInputCode({
            cpp: parsedUserCode?.cpp
              ? parsedUserCode?.cpp
              : automaticallyGeneratedInputCode?.cpp,
            python: parsedUserCode?.python
              ? parsedUserCode?.python
              : automaticallyGeneratedInputCode?.python,
          });
          return;
        }

        setInputCode({
          cpp: automaticallyGeneratedInputCode?.cpp,
          python: automaticallyGeneratedInputCode?.python,
        });
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchTestCases = async () => {
      const starting_code_empty = getStartingCodeFromVariables();
      setTestCases([]);
      setTestCaseVariables([]);

      setInputCodeEmpty({
        cpp: starting_code_empty?.cpp,
        python: starting_code_empty?.python,
      });
      try {
        const res = await fetch(`http://localhost:5000/test_cases?id=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          return {
            cpp: starting_code_empty?.cpp,
            python: starting_code_empty?.python,
          };
        }

        const data = await res.json();

        const formatedInput = data?.map((element) => {
          return JSON.parse(element?.input || "{}");
        });
        const formatedData = data?.map((element, index) => ({
          ...element,
          input: formatedInput[index],
        }));
        setTestCases(formatedData);
        const testCaseVariablesLocal = getTestCaseVariables(formatedData[0]);
        setTestCaseVariables(testCaseVariablesLocal);
        const result_type = determineOutputType(
          formatedData[0]?.expected_output
        );
        const starting_code = getStartingCodeFromVariables(
          testCaseVariablesLocal,
          result_type
        );

        setInputCodeEmpty({
          cpp: starting_code?.cpp,
          python: starting_code?.python,
        });

        return {
          cpp: starting_code?.cpp,
          python: starting_code?.python,
        };
      } catch {
        console.error("Problema pavyzdžių neturi");
      }
    };

    const updateProblemNavigation = () => {
      const currentIndex = courseProblemsOrder?.indexOf(Number(id));

      if (currentIndex <= 0) {
        setPreviousProblemId(null);
      } else {
        setPreviousProblemId(
          courseProblemsOrder?.length > 0 && currentIndex > 0
            ? courseProblemsOrder[currentIndex - 1]
            : null
        );
      }

      if (currentIndex >= courseProblemsOrder?.length - 1) {
        setNextProblemId(null);
      } else {
        setNextProblemId(
          courseProblemsOrder?.length > 0 &&
            currentIndex < courseProblemsOrder.length - 1
            ? courseProblemsOrder[currentIndex + 1]
            : null
        );
      }
    };

    const fetchData = async () => {
      try {
        const automaticallyGeneratedInputCode = await fetchTestCases();
        fetchProblem(automaticallyGeneratedInputCode);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    updateProblemNavigation();
    setIsOutputWindowMaximised(false);
  }, [id, courseProblemsOrder]);

  useEffect(() => {
    if (!problem) return;
    const fetchCourse = async () => {
      setCourseInfo(null);
      try {
        const res = await fetch(
          `http://localhost:5000/course/?id=${problem?.fk_COURSEid}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        if (data.length > 0) {
          setCourseInfo(data[0]);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
      setIsLoaded(true);
    };

    fetchCourse();
  }, [problem]);

  return (
    <div className="relative">
        <>
          {showLoginPrompt ? (<LoginPrompt onClose={() => setShowLoginPrompt(false)}/>) : ''}
          <div className={`full-screen-container transition duration-300 ${showLoginPrompt ? "blur-effect" : ""}`}>
            <div className="problem-page-left">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <Button extra="small secondary" onClick={handleBackToListButtonClick}>
                    Atgal į sąrašą
                  </Button>
                  {previousProblemId !== null && (
                    <Button extra="small secondary" onClick={() => handleArrowNavigationButtonClick(previousProblemId)}>
                      <strong>{"<"}</strong>
                    </Button>
                  )}
                  {nextProblemId !== null && (
                    <Button extra="small secondary" onClick={() => handleArrowNavigationButtonClick(nextProblemId)}>
                      <strong>{">"}</strong>
                    </Button>
                  )}
                </div>
                {isLoaded && passScore && (
                  <div>
                    Jūsų sprendimas įvertintas <strong>{passScore}%</strong>
                  </div>
                )}
              </div>
  
              <div className="problem-info-screen">
                <h2>{isLoaded ? problem?.name : <AnimatedLoadingText />}</h2>
                {isLoaded && (
                  <div className="problem-related-courses">
                    <Hyperlink href={`/courses/${courseInfo?.id}`}>
                      {courseInfo?.name}
                    </Hyperlink>
                    <strong className={problem?.difficulty}>
                      {difficulty_dictionary[problem?.difficulty]}
                    </strong>
                  </div>
                )}
  
                {isLoaded && (
                  <div className="problem-related-courses">
                    {problem?.courses?.map((course) => (
                      <Hyperlink key={course?.id} href={`/course/${course.id}`}>
                        {course?.name}
                      </Hyperlink>
                    ))}
                  </div>
                )}
  
                {isLoaded && (
                  <div>
                    <p dangerouslySetInnerHTML={{ __html: problem?.description }}></p>
                  </div>
                )}
  
                {isLoaded && (
                  <div className="test-cases-list">
                    {testCases?.map((item, index) => (
                      <div key={index} className="test-case">
                        <div className="test-case-header">
                          <p style={{ fontWeight: "600", margin: 0 }}>Testas {index + 1}</p>
                          <Button extra="small" onClick={() => handleTestButtonClick(index)}>
                            Testuoti
                          </Button>
                        </div>
                        <pre>
                          {selectedLanguageValue === "cpp" ? item?.input?.cpp : item?.input?.python}
                        </pre>
                        <pre>
                          <strong>Rezultatas:</strong> <br />
                          {item?.expected_output}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
  
            <div className="problem-page-right">
              <div style={{ display: "flex", gap: "1rem" }}>
                <Button extra="small" onClick={handleRunButtonClick}>
                  Leisti programą
                </Button>
                <Button extra="small bright" onClick={handleAIclick}>
                  AI įvertinimas
                </Button>
                <Dropdown
                  options={languages?.map((language) => language?.label)}
                  placeholder={languages[0]?.label}
                  onSelect={(value) => {
                    onDropdownSelect(value);
                  }}
                />
              </div>
              <div className="code-editor-area" onClick={() => setIsOutputWindowMaximised(false)}>
                <CodeEditor
                  language={selectedLanguageValue}
                  value={
                    isLoaded
                      ? selectedLanguageValue === "cpp"
                        ? inputCode?.cpp
                        : inputCode?.python
                      : loadingText
                  }
                  setValue={(value) => {
                    setInputCode({
                      ...inputCode,
                      [selectedLanguageValue]: value,
                    });
                  }}
                  onResetClick={handleResetCodeButtonClick}
                />
              </div>
              <div
                style={{
                  height: isOutputWindowMaximised ? "50%" : "15%",
                }}
                className="output-window"
                onClick={() => setIsOutputWindowMaximised(true)}
              >
                <OutputSection
                  ref={outputRef}
                  outputText={outputText}
                  language={selectedLanguageValue}
                  isOutputWindowMaximised={isOutputWindowMaximised}
                  setIsOutputWindowMaximised={setIsOutputWindowMaximised}
                />
              </div>
            </div>
          </div>
        </>
    </div>
  );  
};

export default Problem;
