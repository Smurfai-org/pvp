import "./styles.css";
import loadingIcon from "../assets/loading-anim.svg";

function Button({
  children,
  extra,
  onClick,
  disabled,
  loading = false,
  iconSrc,
  iconRotationDegrees,
  iconHeight = "14px",
  iconInvertColor = false,
  iconOnTheRight = false,
  width,
  height,
}) {
  return (
    <button
      disabled={loading || disabled}
      onClick={onClick}
      className={
        loading
          ? `default-button ${extra || ""} clicked`
          : `default-button ${extra || ""}`
      }
      style={{
        ...(width && { width }),
        ...(height && { height }),
      }}
    >
      {loading ? (
        <>
          <img src={loadingIcon} alt="Įkeliama..." className="loading" />
          <div style={{ color: "transparent" }}>{children}</div>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem",
          }}
        >
          {iconOnTheRight && children}
          {iconSrc && (
            <img
              src={iconSrc}
              alt={typeof children === "string" ? children : "icon"}
              height={iconHeight}
              style={{
                ...(iconRotationDegrees && {
                  transform: `rotate(${iconRotationDegrees}deg)`,
                }),
                ...(iconInvertColor && {
                  filter: `brightness(0) invert(1)`,
                }),
              }}
            />
          )}
          {!iconOnTheRight && children}
        </div>
      )}
    </button>
  );
}

export default Button;
