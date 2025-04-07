export const getTestCaseVariables = (test_case) => {
  const regex =
    /\b(?:const\s+)?(int|double|float|long long|long|short|char|bool|string|unsigned int)\s+(\w+)/g;

  const matches = [];
  let match;

  while ((match = regex.exec(test_case?.input?.cpp)) !== null) {
    matches.push({ type: match[1], name: match[2] });
  }

  return matches;
};

export const getStartingCodeFromVariables = (
  variables = null,
  result_type = null
) => {
  if (variables && result_type) {
    const cppCode = `${result_type} Sprendimas(${variables
      ?.map((m) => m?.type + " " + m?.name)
      .join(", ")}) {
  return 0;
}`;

    const pythonCode = `def Sprendimas(${variables
      ?.map((m) => m?.name)
      .join(", ")}):
  return 0
`;
    return { cpp: cppCode, python: pythonCode };
  }

  const cppCode = `void Sprendimas() {
  cout << "Hello world!";
}`;

  const pythonCode = `def Sprendimas():
  print("Hello world!")
`;
  return { cpp: cppCode, python: pythonCode };
};

export const problemCodeFullCpp = (
  test_case = {},
  test_case_variables = [],
  userCode
) => {
  const outputType = determineOutputType(test_case?.expected_output || "");

  const functionParams = test_case_variables
    ?.map((m) => (m?.type && m?.name ? `${m.type} ${m.name}` : ""))
    .filter(Boolean)
    .join(", ");

  const functionArgs = test_case_variables
    ?.map((m) => (m?.name ? m.name : ""))
    .filter(Boolean)
    .join(", ");

  const inputCode = test_case?.input?.cpp || "";
  const expectedOutput = test_case?.expected_output || "";

  const code = `
#include <iostream>
using namespace std;

${outputType} Sprendimas(${functionParams});

int main() {
  ${inputCode}

  ${
    outputType === "void"
      ? `Sprendimas(${functionArgs});`
      : `${outputType} user_result = Sprendimas(${functionArgs});`
  }

  ${
    outputType === "void"
      ? ""
      : `${outputType} result = ${
          outputType === "string" ? `"${expectedOutput}"` : expectedOutput
        };
  cout << "Rezultatas: " << user_result << endl;
  if (result == user_result) {
      cout << "Testas įveiktas!" << endl;
  } else {
      cout << "Testas nepraeitas." << endl;
  }`
  }
  
  return 0;
}

${userCode}
`;

  return code;
};

export const problemCodeFullPython = (
  test_case = {},
  test_case_variables = [],
  userCode
) => {
  const inputCode = test_case?.input?.python || "";
  const expectedOutput = test_case?.expected_output || "";

  const functionArgs = test_case_variables
    ?.map((m) => (m?.name ? m.name : ""))
    .filter(Boolean)
    .join(", ");

  const codeWithTestCases = `
${inputCode}

${userCode}

user_result = Sprendimas(${functionArgs})
print("Rezultatas:", user_result)

result = ${
    typeof expectedOutput === "string" ? `"${expectedOutput}"` : expectedOutput
  }
if result == user_result:
  print("Testas įveiktas!")
else:
  print("Testas nepraeitas.")
`;

  const codeWithNoTestCases = `
${userCode}

Sprendimas()
`;
  return expectedOutput ? codeWithTestCases : codeWithNoTestCases;
};

export const determineOutputType = (output) => {
  if (!output) return "void";
  const num = Number(output);

  if (!isNaN(num)) {
    return Number.isInteger(num) ? "int" : "double";
  }

  return "string";
};
