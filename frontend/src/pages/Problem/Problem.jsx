import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Hyperlink from "../../components/Hyperlink";
import CodeEditor from "./CodeEditor";
import Dropdown from "../../components/Dropdown";
import OutputSection from "./Output";
import "./problem.css";

const languages = [
  { label: "C++", value: "cpp" },
  { label: "Python", value: "python" },
];

const mockProblem = {
  name: "Sum of Two Numbers",
  description:
    "Write a C++ program that takes two integers as input and returns their sum.",
  hints: [
    "Use the `+` operator to add two numbers.",
    "Make sure to handle input using `cin`.",
    "Output the result using `cout`.",
  ],
  difficulty: "Easy",
  inputsAndOutputs: [
    {
      input: "num1 = 5, num2 = 10",
      expectedOutput: "15",
    },
    {
      input: "num1 = -3, num2 = 7",
      expectedOutput: "4",
    },
    {
      input: "num1 = 0, num2 = 0",
      expectedOutput: "0",
    },
  ],
  courses: [
    {
      id: 1,
      name: "1. Data types",
    },
    {
      id: 2,
      name: "2. Arithmetic Operators",
    },
  ],
  codeTemplates: {
    cpp: {
      startingCode: `
#include <iostream>
using namespace std;

int main() {
    int num1, num2;
    num1 = 1;
    cout << num1 << endl;
    cout << num1 << endl;
    cout << num1 << endl;
    cout << num1 << endl;
    cout << num1 << endl;
    cout << num1 << endl;
    // Your code here
    return 0;
}
`,
      solutionCode: `
#include <iostream>
using namespace std;

int main() {
    int num1, num2;
    cout << "Enter two integers: ";
    cin >> num1 >> num2;
    int sum = num1 + num2;
    cout << "The sum is: " << sum << endl;
    return 0;
}
`,
    },
    python: {
      startingCode: `
# Your code here
print("aaaa")
print("aaaa")
print("aaaa")
print("aaaa")
print("aaaa")
print("aaaa")
`,
      solutionCode: `
num1 = int(input("Enter first number: "))
num2 = int(input("Enter second number: "))
sum = num1 + num2
print("The sum is:", sum)
`,
    },
  },
};

const Problem = () => {
  const params = useParams();
  const navigate = useNavigate();
  const outputRef = useRef(null);

  const [isOutputWindowMaximised, setIsOutputWindowMaximised] = useState(false);

  const [problem, setProblem] = useState("");
  const [previousProblemId, setPreviousProblemId] = useState(null);
  const [nextProblemId, setNextProblemId] = useState(null);
  const [selectedLanguageValue, setSelectedLanguageValue] = useState(
    languages[0]?.value
  );
  const [cppInputCode, setCppInputCode] = useState("");
  const [pythonInputCode, setPythonInputCode] = useState("");

  const onDropdownSelect = (selectedLabel) => {
    const selectedLang = languages.find((lang) => lang.label === selectedLabel);
    if (selectedLang) {
      setSelectedLanguageValue(selectedLang.value);
    }
  };

  const handleArrowNavigationButtonClick = (id) => {
    navigate(`/problems/${id}`);
  };

  const handleRunButtonClick = () => {
    if (outputRef.current) {
      outputRef.current.runCode();
      setIsOutputWindowMaximised(true);
    }
  };

  useEffect(() => {
    const id = params.id;

    const fetchProblem = async () => {
      try {
        const res = await fetch(`http://localhost:5000/problem?id=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        setProblem(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchProblem();

    setProblem(mockProblem);
    setCppInputCode(mockProblem?.codeTemplates?.cpp?.startingCode);
    setPythonInputCode(mockProblem?.codeTemplates?.python?.startingCode);
    setPreviousProblemId(Number(id) - 1);
    setNextProblemId(Number(id) + 1);
    setIsOutputWindowMaximised(false);
  }, [params.id]);

  return (
    <div className="full-screen-container">
      <div className="problem-page-left">
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button extra="small secondary" onClick={() => navigate("/")}>
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
          <strong className={problem?.difficulty}>{problem?.difficulty}</strong>

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
            {problem?.inputsAndOutputs?.map((item, index) => (
              <div key={index} className="IO-example">
                <p style={{ fontWeight: "600" }}>Pavyzdys {index + 1}</p>
                <p>
                  <strong>Įvestis:</strong> {item?.input}
                </p>
                <p>
                  <strong>Rezultatas:</strong> {item?.expectedOutput}
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
