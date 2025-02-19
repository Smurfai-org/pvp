import PropTypes from "prop-types";
import "./text-input.css";

export const TextBox = ({
  text = "TextBox",
  type = "text",
  value,
  onChange,
  errorText = "Error",
  throwError = true,
}) => {
  return (
    <div style={{ height: "42px", padding: "20px" }}>
      <label className="textbox">
        <input
          type={type}
          placeholder=""
          value={value}
          onChange={onChange}
          required
        />
        <span>{throwError ? errorText : text}</span>
        <div
          className={throwError ? "rectangle-24 error" : "rectangle-24"}
        ></div>
      </label>
    </div>
  );
};
TextBox.propTypes = {
  text: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  errorText: PropTypes.string,
  throwError: PropTypes.bool,
};
