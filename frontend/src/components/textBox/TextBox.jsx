import "./textBox.css";
import passwordHideIcon from "../../assets/password-hide.png";
import passwordShowIcon from "../../assets/password-show.png";
import { useState } from "react";

export const TextBox = ({
  text = "TextBox",
  type = "text",
  value,
  onChange,
  errorText = "",
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <div style={{ height: "42px", padding: "20px 0" }}>
      <label className="textbox">
        <input
          type={type === "password" && isPasswordVisible ? "text" : type}
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
        {type === "password" && (
          <img
            src={isPasswordVisible ? passwordHideIcon : passwordShowIcon}
            alt="Toggle Password Visibility"
            onClick={togglePasswordVisibility}
            className="show-password-icon"
          />
        )}
      </label>
    </div>
  );
};
