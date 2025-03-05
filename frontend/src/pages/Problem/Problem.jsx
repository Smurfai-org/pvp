import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Hyperlink from "../../components/Hyperlink";

import CodeEditor from "./CodeEditor";
import Dropdown from "../../components/Dropdown";
import OutputSection from "./Output";

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

  const handleButtonClick = () => {
    if (outputRef.current) {
      outputRef.current.runCode();
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
  }, [params.id]);

  return (
    // Full screen box without navbar
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "gray",
        padding: "1rem",
        boxSizing: "border-box",
        display: "flex",
        gap: "1rem",
      }}
    >
      {/* Left side of the screen */}
      <div
        style={{
          height: "100%",
          width: "40%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Navigation buttons */}
        <div>
          <Button
            extra="small"
            onClick={() => {
              navigate("/");
            }}
          >
            Back to list
          </Button>
        </div>
        {/* Box for the provided problem info */}
        <div
          style={{
            width: "100%",
            flexGrow: 1,
            backgroundColor: "white",
            padding: "1rem",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <h2>{problem?.name}</h2>
          <p>{problem?.difficulty}</p>
          {/* Tags of related courses */}
          <div>
            {problem?.courses?.map((course) => (
              <Hyperlink key={course?.id} href={`/course/${course.id}`}>
                {course?.name}
              </Hyperlink>
            ))}
          </div>
          {/* Problem description */}
          <div>
            <p>{problem?.description}</p>
          </div>
          {/* Expected input and output */}
          <div>
            {problem?.inputsAndOutputs?.map((item, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "20px",
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <p>
                  <strong>Example {index + 1}</strong>
                </p>
                <p>
                  <strong>Input: </strong> {item?.input}
                </p>
                <p>
                  <strong>Output: </strong>
                  {item?.expectedOutput}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right side of the screen */}
      <div
        style={{
          height: "100%",
          width: "60%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Program settings */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button extra="small" onClick={handleButtonClick}>
            Run code
          </Button>
          <Button
            extra="small bright"
            onClick={() => {
              console.log("AI Suggestions");
            }}
          >
            AI Suggestions
          </Button>
          <Dropdown
            options={languages?.map((language) => language?.label)}
            placeholder={languages[0]?.label}
            onSelect={(value) => {
              onDropdownSelect(value);
            }}
          />
        </div>
        {/* Code editor box */}
        <div
          style={{
            width: "100%",
            flexGrow: 1,
            backgroundColor: "white",
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
        {/* Program result */}
        <div
          style={{
            height: isOutputWindowMaximised ? "50%" : "15%",
            backgroundColor: "white",
            padding: "1rem",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <OutputSection
            ref={outputRef}
            sourceCode={
              selectedLanguageValue === "cpp" ? cppInputCode : pythonInputCode
            }
            language={selectedLanguageValue}
          />
        </div>
      </div>
    </div>
  );
};

export default Problem;
