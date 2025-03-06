import Editor from "@monaco-editor/react";
import { useRef } from "react";

const CodeEditor = ({ language = "cpp", value = "", setValue = () => {} }) => {
  const editorRef = useRef();
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: 0,
        width: "100%",
      }}
    >
      {/* Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#dddddd",
          minHeight: "2rem",
          width: "100%",
          padding: "0 1rem",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
        }}
      >
        <strong>Your code</strong>
      </div>

      {/* Editor Container */}
      <div
        style={{
          flexGrow: 1,
          minHeight: 0,
          display: "flex",
        }}
      >
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
          style={{ width: "100%", height: "100%" }} // Ensures it stretches properly
        />
      </div>
    </div>
  );
};

export default CodeEditor;
