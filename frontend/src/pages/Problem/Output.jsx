import { useState, forwardRef, useImperativeHandle } from "react";
import { executeCode } from "./piston-api";
import chevronIcon from "../../assets/Chevron-icon.png";

const OutputSection = forwardRef(
  (
    {
      sourceCode,
      language,
      isOutputWindowMaximised,
      setIsOutputWindowMaximised = () => {},
    },
    ref
  ) => {
    const [outputText, setOutputText] = useState("");
    const [isError, setIsError] = useState(false);

    const runCode = async () => {
      if (!sourceCode) return;
      try {
        const { run: result } = await executeCode(language, sourceCode);
        setOutputText(result.output);
        result.stderr ? setIsError(true) : setIsError(false);
      } catch (err) {
        console.error("Execution error:", err);
        setOutputText(err?.message);
        setIsError(true);
      }
    };

    const onChevronClick = () => {
      setIsOutputWindowMaximised(!isOutputWindowMaximised);
    };

    useImperativeHandle(ref, () => ({
      runCode,
    }));

    return (
      <div className="output-wrapper">
        <div className="problem-sticky-header">
          <strong>Rezultatai</strong>
          <div className="chevron-close-open" onClick={onChevronClick}>
            <img
              src={chevronIcon}
              className={isOutputWindowMaximised ? "flip-vertically" : ""}
            />
          </div>
        </div>

        <div className="output-text-container">
          <br />
          <p
            style={{
              color: isError ? "red" : "black",
            }}
            className="output-text"
          >
            {outputText
              ? outputText.split("\n").map((line) => (
                  <>
                    {line}
                    <br />
                  </>
                ))
              : 'Spauskite mygtuką "Leisti programą" ir pamatykite programos rezultatą.'}
          </p>
        </div>
      </div>
    );
  }
);

OutputSection.displayName = "OutputSection";

export default OutputSection;
