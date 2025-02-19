import "./styles.css";

function Button({ children = "ASDASDASD", extra, onClick }) {
  return (
    <button className={`default-button ${extra || ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
