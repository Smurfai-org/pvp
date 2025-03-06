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
      }
    };

    const onChevronClick = () => {
      setIsOutputWindowMaximised(!isOutputWindowMaximised);
    };

    useImperativeHandle(ref, () => ({
      runCode,
    }));

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Sticky Header */}
        <div
          style={{
            position: "sticky",
            top: "0",
            backgroundColor: "#dddddd",
            height: "2rem",
            width: "100%",
            padding: "0 1rem",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <strong>Results</strong>
          <div className="chevron-close-open" onClick={onChevronClick}>
            <img
              src={chevronIcon}
              className={isOutputWindowMaximised ? "flip-vertically" : ""}
            />
          </div>
        </div>

        {/* Scrollable Text Container */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            marginLeft: "1rem",
            minHeight: 0,
          }}
        >
          <br />
          <p
            style={{
              margin: "0",
              color: isError ? "red" : "black",
              fontFamily: "Consolas",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {outputText
              ? outputText.split("\n").map((line) => (
                  <>
                    {line}
                    <br />
                  </>
                ))
              : 'Click button "Run code" to see your program\'s result.'}
          </p>
        </div>
      </div>
    );
  }
);

OutputSection.displayName = "OutputSection";

export default OutputSection;
