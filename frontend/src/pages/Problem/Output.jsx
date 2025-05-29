import { useState, forwardRef, useImperativeHandle } from "react";
import { executeCode } from "./piston-api";
import chevronIcon from "../../assets/Chevron-icon.png";

const OutputSection = forwardRef(
  (
    {
      outputText,
      language,
      isOutputWindowMaximised,
      setIsOutputWindowMaximised = () => {},
    },
    ref
  ) => {
    const [isError, setIsError] = useState(false);

    const runCode = async (sourceCode) => {
      if (!sourceCode) return;
      try {
        const { run: result } = await executeCode(language, sourceCode);
        result.stderr ? setIsError(true) : setIsError(false);
        if (result.signal === "SIGKILL") {
          setIsError(true);
          return "Kompiuteris nutraukė kodo veikimą. Patikrinkite, ar ciklai turi teisingas sąlygas sustabdymui ir ar nėra klaidų.";
        }
        return result.output;
      } catch (err) {
        console.error("Execution error:", err);
        setIsError(true);
        return err?.message;
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
            dangerouslySetInnerHTML={{
              __html: outputText
                ? outputText
                : 'Spauskite mygtuką "Leisti programą" ir pamatykite programos rezultatą.',
            }}
          />
        </div>
      </div>
    );
  }
);

OutputSection.displayName = "OutputSection";

export default OutputSection;
