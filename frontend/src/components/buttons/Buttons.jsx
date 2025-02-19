import PropTypes from "prop-types";
import "./buttons.css";

const ButtonGeneric = ({ text = "Generic button", onClick, className }) => {
  return (
    <button className={`generic-button ${className || ""}`} onClick={onClick}>
      {text}
    </button>
  );
};
ButtonGeneric.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

const ButtonInheritedPropTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export const PrimaryButton = ({ text = "Primary button", onClick }) => {
  return (
    <ButtonGeneric className="primary-button" onClick={onClick} text={text} />
  );
};
PrimaryButton.propTypes = ButtonInheritedPropTypes;

export const SecondaryButton = ({ text = "Secondary", onClick }) => {
  return (
    <ButtonGeneric className="secondary-button" onClick={onClick} text={text} />
  );
};
SecondaryButton.propTypes = ButtonInheritedPropTypes;

export const BrightButton = ({ text = "Bright button", onClick }) => {
  return (
    <ButtonGeneric className="bright-button" onClick={onClick} text={text} />
  );
};
BrightButton.propTypes = ButtonInheritedPropTypes;

export const DisabledButton = ({ text = "Disabled", onClick }) => {
  return (
    <ButtonGeneric className="disabled-button" onClick={onClick} text={text} />
  );
};
DisabledButton.propTypes = ButtonInheritedPropTypes;
