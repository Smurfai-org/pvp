export const getTestCaseVariables = (test_case) => {
  const cppCode = test_case?.input?.cpp || "";
  const lines = cppCode.split("\n");

  // Supported base types and modifiers
  const baseTypes = new Set([
    "int",
    "double",
    "float",
    "long",
    "short",
    "char",
    "bool",
    "string",
    "unsigned",
  ]);

  const results = [];

  // Helper to parse a declaration string into type and name
  const parseDecl = (decl) => {
    // Remove any initialization (anything after '=') and semicolons
    decl = decl.replace(/=.*/g, "").replace(/;/g, "").trim();
    if (!decl) return;

    // Separate pointer stars attached to type or name
    decl = decl.replace(/\*/g, " * ");

    // Tokenize by whitespace
    const tokens = decl.split(/\s+/);
    if (tokens.length < 2) return;

    // The last token is the variable name (including array brackets or pointer)
    let name = tokens.pop();

    // Determine special type and dimensions
    let special_type = "normal";
    let dimensions = [];
    
    if (name.includes("[")) {
      // Extract all dimensions
      const bracketMatches = name.match(/\[([^\]]*)\]/g) || [];
      
      if (bracketMatches.length === 1) {
        special_type = "array";
      } else if (bracketMatches.length > 1) {
        special_type = "multi_array";
        // Store the dimensions (empty or with sizes)
        dimensions = bracketMatches.map(dim => dim.replace(/[[\]]/g, "").trim());
      }
    } else if (name.includes("*")) {
      // Count asterisks to determine pointer depth
      const asterisks = name.match(/\*+/)[0];
      if (asterisks.length > 1) {
        special_type = "multi_pointer";
        dimensions = [asterisks.length]; // Count of asterisks represents dimensions
      } else {
        special_type = "pointer";
      }
    }

    // Remove array brackets and pointer asterisks from the name
    name = name
      .replace(/\[.*?\]/g, "") // Remove all array brackets
      .replace(/\*/g, "")
      .trim();

    // Remaining tokens form the full type
    const type = tokens.join(" ").trim();

    // Add special_type and dimensions to the result
    results.push({ type, name, special_type, dimensions });
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // 1) Extract parameters from function definitions
    if (line.includes("(") && line.includes(")") && line.endsWith("{")) {
      const paramsSection = line
        .slice(line.indexOf("(") + 1, line.lastIndexOf(")"))
        .trim();
      if (paramsSection) {
        const params = paramsSection.split(",");
        for (const p of params) {
          parseDecl(p);
        }
      }
      continue;
    }

    // 2) Handle standalone variable declarations
    // Skip lines that don't start with a type or 'const'
    const firstWord = line.split(/\s+/)[0];
    if (!baseTypes.has(firstWord) && firstWord !== "const") continue;

    // Remove trailing '{' or ')' if any
    const cleanLine = line.replace(/[{}();]/g, "");
    // Split multiple declarations by comma
    const parts = cleanLine.split(",");
    for (const part of parts) {
      parseDecl(part);
    }
  }

  return results;
};

export const getStartingCodeFromVariables = (
  variables = null,
  result_type = null
) => {
  if (variables?.length > 0 && result_type?.length > 0) {
    const cppCode = `${result_type} Sprendimas(${variables
      ?.map((m) => {
        if (!m?.type || !m?.name) return "";

        let typePrefix = m.type;
        let nameSuffix = "";

        if (m.special_type === "array") {
          nameSuffix = "[]";
        } else if (m.special_type === "multi_array") {
          // For multi-dimensional arrays: first dimension can be omitted
          // Example: char board[][3] for a 2D char array
          nameSuffix = "[]" + (m.dimensions || []).slice(1).map(dim => 
            dim ? `[${dim}]` : "[]"
          ).join("");
        } else if (m.special_type === "pointer") {
          typePrefix = typePrefix + "*";
        } else if (m.special_type === "multi_pointer") {
          // For multi-level pointers like char**
          typePrefix = typePrefix + "*".repeat(m.dimensions?.[0] || 2);
        } else if (m.special_type === "const_pointer") {
          typePrefix = "const " + typePrefix + "*";
        }

        return `${typePrefix} ${m.name}${nameSuffix}`.trim();
      })
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

  // Default code when no variables provided
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
  userCode,
  printResult = true
) => {
  const outputType = determineOutputType(test_case?.expected_output || "");

  // Create a list of parameters for the function declaration
  const functionParams = test_case_variables
    ?.map((m) => {
      if (!m?.type || !m?.name) return "";

      let typePrefix = m.type;
      let nameSuffix = "";

      if (m.special_type === "array") {
        nameSuffix = "[]";
      } else if (m.special_type === "multi_array") {
        // For multi-dimensional arrays
        nameSuffix = "[]" + (m.dimensions || []).slice(1).map(dim => 
          dim ? `[${dim}]` : "[]"
        ).join("");
      } else if (m.special_type === "pointer") {
        typePrefix = typePrefix + "*";
      } else if (m.special_type === "multi_pointer") {
        typePrefix = typePrefix + "*".repeat(m.dimensions?.[0] || 2);
      } else if (m.special_type === "const_pointer") {
        typePrefix = "const " + typePrefix + "*";
      }

      return `${typePrefix} ${m.name}${nameSuffix}`.trim();
    })
    .filter(Boolean)
    .join(", ");

  // Simple comma-separated list of argument names for the function call
  const functionArgs = test_case_variables
    ?.map((m) => (m?.name ? m.name : ""))
    .filter(Boolean)
    .join(", ");

  const inputCode = test_case?.input?.cpp || "";
  const expectedOutput = test_case?.expected_output || "";

  const code = `
#include <iostream>
#include <cmath>
#include <string>
using namespace std;

// Function prototype
${outputType} Sprendimas(${functionParams});

${userCode}

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

  ${
    printResult
      ? `
  cout << "Rezultatas: " << user_result << endl;
  if (result == user_result) {
      cout << "Testas įveiktas!" << endl;
  } else {
      cout << "Testas nepraeitas." << endl;
  }`
      : `cout << user_result << endl;`
  }`
  }
  
  return 0;
}
`;
  return code;
};

export const problemCodeFullPython = (
  test_case = {},
  test_case_variables = [],
  userCode,
  printResult = true
) => {
  const inputCode = test_case?.input?.python || "";
  const expectedOutput = test_case?.expected_output || "";

  const functionArgs = test_case_variables
    ?.map((m) => (m?.name ? m.name : ""))
    .filter(Boolean)
    .join(", ");

  const codeWithTestCases = `
import math
${inputCode}

${userCode}

user_result = Sprendimas(${functionArgs})

result = ${
    typeof expectedOutput === "string" && isNaN(expectedOutput)
      ? `"${expectedOutput}"`
      : expectedOutput
  }

${
  printResult
    ? `
print("Rezultatas:", user_result)
if result == user_result:
  print("Testas įveiktas!")
else:
  print("Testas nepraeitas.")`
    : `print(user_result)`
}
`;

  const codeWithNoTestCases = `
import math
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
