import { useState, forwardRef, useImperativeHandle } from "react";
import { executeCode } from "./piston-api";

const OutputSection = forwardRef(({ sourceCode, language }, ref) => {
  const [outputText, setOutputText] = useState("");
  const [isError, setIsError] = useState(false);

  console.log(outputText);
  const runCode = async () => {
    if (!sourceCode) return;
    try {
      const { run: result } = await executeCode(language, sourceCode);
      setOutputText(result.output);
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (err) {
      console.error("Execution error:", err);
    }
  };

  useImperativeHandle(ref, () => ({
    runCode,
  }));

  return (
    <p style={{ color: isError ? "red" : "black" }}>
      <strong>Output</strong>
      <br />
      {outputText
        ? outputText.split("\n").map((line) => (
            <>
              {line}
              <br />
            </>
          ))
        : 'Click button "Run code" to see the output.'}
    </p>
  );
});

OutputSection.displayName = "OutputSection";

export default OutputSection;
