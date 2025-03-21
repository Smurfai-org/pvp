import Editor from "@monaco-editor/react";
import { useRef } from "react";
import resetArrow from "../../assets/arrow-rotate-left.png";

const CodeEditor = ({
  language = "cpp",
  value = "",
  setValue = () => {},
  onResetClick = () => {},
}) => {
  const editorRef = useRef();
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div className="code-editor-container">
      <div className="problem-sticky-header">
        <strong>Jūsų kodas</strong>
        <div className="chevron-close-open" onClick={onResetClick}>
          <img src={resetArrow} style={{ height: "1.2rem" }} />
        </div>
      </div>

      <div className="code-editor">
        <Editor
          defaultLanguage={language}
          options={{
            minimap: { enabled: false },
            fontFamily: "Consolas",
            scrollBeyondLastLine: false,
          }}
          onMount={onMount}
          value={value}
          onChange={(value) => {
            setValue(value);
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
