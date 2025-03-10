import Editor from "@monaco-editor/react";
import { useRef } from "react";

const CodeEditor = ({ language = "cpp", value = "", setValue = () => {} }) => {
  const editorRef = useRef();
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div className="code-editor-container">
      <div className="problem-sticky-header">
        <strong>Jūsų kodas</strong>
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
