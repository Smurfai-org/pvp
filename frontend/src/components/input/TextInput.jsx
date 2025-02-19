import "./text-input.css";

export const TextBox = ({
  text = "TextBox",
  type = "text",
  value,
  onChange,
  errorText = "",
}) => {
  return (
    <div style={{ height: "42px", padding: "20px 0" }}>
      <label className="textbox">
        <input
          type={type}
          placeholder=""
          value={value}
          onChange={onChange}
          required
        />
        <span className={errorText ? "error-font" : ""}>
          {errorText ? errorText : text}
        </span>
        <div
          className={errorText ? "rectangle-24 error-backdrop" : "rectangle-24"}
        ></div>
      </label>
    </div>
  );
};
