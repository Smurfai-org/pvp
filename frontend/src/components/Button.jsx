import "./styles.css";
import loadingIcon from "../assets/loading-anim.svg";

function Button({ children, extra, onClick, disabled, loading = false }) {
  return (
    <button
      disabled={loading || disabled}
      onClick={onClick}
      className={
        loading
          ? `default-button ${extra || ""} clicked`
          : `default-button ${extra || ""}`
      }
    >
      {loading ? (
        <>
          <img src={loadingIcon} alt="Įkeliama..." className="loading" />
          <div style={{ color: "transparent" }}>{children}</div>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
