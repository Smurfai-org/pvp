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
  const courseProblemsOrder = location.state?.courseProblemsOrder;
  const { user } = useContext(AuthContext);

  const [isOutputWindowMaximised, setIsOutputWindowMaximised] = useState(false);

  const [problem, setProblem] = useState("");
  const [previousProblemId, setPreviousProblemId] = useState(null);
  const [nextProblemId, setNextProblemId] = useState(null);
  const [selectedLanguageValue, setSelectedLanguageValue] = useState(
    languages[0]?.value
  );
  const [inputsAndOutputs, setInputsAndOutputs] = useState([]);
  const [cppInputCode, setCppInputCode] = useState("");
  const [pythonInputCode, setPythonInputCode] = useState("");
  const [courseInfo, setCourseInfo] = useState(null);

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
    navigate("/");
  };

  const handleRunButtonClick = () => {
    if (outputRef.current) {
      outputRef.current.runCode();
      setIsOutputWindowMaximised(true);
    }
  };

  useEffect(() => {
    const fetchProblem = async () => {
      setProblem("");
      setCppInputCode("");
      setPythonInputCode("");
      try {
        const res = await fetch(`http://localhost:5000/problem?id=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        setProblem(data[0]);
        const parsedCode = JSON.parse(data[0]?.starting_code || "{}");
        setCppInputCode(parsedCode?.cpp);
        setPythonInputCode(parsedCode?.python);
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchTestCases = async () => {
      setInputsAndOutputs([]);
      try {
        const res = await fetch(`http://localhost:5000/test_cases?id=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        setInputsAndOutputs(data);
      } catch (error) {
        console.error(error.message);
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

    fetchProblem();
    fetchTestCases();
    updateProblemNavigation();

    setIsOutputWindowMaximised(false);
  }, [id, courseProblemsOrder]);

  useEffect(() => {
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
    };

    fetchCourse();
  }, [problem]);

  return (
    <div className="full-screen-container">
      <div className="problem-page-left">
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button extra="small secondary" onClick={handleBackToListButtonClick}>
            Atgal į sąrašą
          </Button>
          <div style={{ display: "flex", gap: "3px" }}>
            {previousProblemId !== null && (
              <Button
                extra="small secondary"
                onClick={() =>
                  handleArrowNavigationButtonClick(previousProblemId)
                }
              >
                {"< praeita"}
              </Button>
            )}
            {nextProblemId !== null && (
              <Button
                extra="small secondary"
                onClick={() => handleArrowNavigationButtonClick(nextProblemId)}
              >
                {"kita >"}
              </Button>
            )}
          </div>
        </div>

        <div className="problem-info-screen">
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
            {problem?.name}
          </h2>
          <strong className={problem?.difficulty}>
            {difficulty_dictionary[problem?.difficulty]}
          </strong>
          <Hyperlink href={`/courses/${courseInfo?.id}`}>
            {courseInfo?.name}
          </Hyperlink>

          <div className="problem-related-courses">
            {problem?.courses?.map((course) => (
              <Hyperlink key={course?.id} href={`/course/${course.id}`}>
                {course?.name}
              </Hyperlink>
            ))}
          </div>

          <div>
            <p>{problem?.description}</p>
          </div>

          <div className="IO-examples-list">
            {inputsAndOutputs?.map((item, index) => (
              <div key={index} className="IO-example">
                <p style={{ fontWeight: "600" }}>Pavyzdys {index + 1}</p>
                <p>
                  <strong>Įvestis:</strong> {item?.input}
                </p>
                <p>
                  <strong>Rezultatas:</strong> {item?.expected_output}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="problem-page-right">
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button extra="small" onClick={handleRunButtonClick}>
            Leisti programą
          </Button>
          <Button
            extra="small bright"
            onClick={() => {
              console.log("AI Suggestions");
            }}
          >
            AI pasiūlymai
          </Button>
          <Dropdown
            options={languages?.map((language) => language?.label)}
            placeholder={languages[0]?.label}
            onSelect={(value) => {
              onDropdownSelect(value);
            }}
          />
        </div>
        <div
          className="code-editor-area"
          onClick={() => {
            setIsOutputWindowMaximised(false);
          }}
        >
          <CodeEditor
            language={selectedLanguageValue}
            value={
              selectedLanguageValue === "cpp" ? cppInputCode : pythonInputCode
            }
            setValue={
              selectedLanguageValue === "cpp"
                ? (value) => {
                    setCppInputCode(value);
                  }
                : (value) => {
                    setPythonInputCode(value);
                  }
            }
          />
        </div>
        <div
          style={{
            height: isOutputWindowMaximised ? "50%" : "15%",
          }}
          className="output-window"
        >
          <OutputSection
            ref={outputRef}
            sourceCode={
              selectedLanguageValue === "cpp" ? cppInputCode : pythonInputCode
            }
            language={selectedLanguageValue}
            isOutputWindowMaximised={isOutputWindowMaximised}
            setIsOutputWindowMaximised={setIsOutputWindowMaximised}
          />
        </div>
      </div>
    </div>
  );
};

export default Problem;
