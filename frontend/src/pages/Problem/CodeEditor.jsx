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
        height: "100%",
        width: "100%",
      }}
    >
      <Editor
        defaultLanguage={language}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
        onMount={onMount}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
      />
    </div>
  );
};

export default CodeEditor;
