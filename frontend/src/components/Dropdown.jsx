import { useState } from "react";
import chevronIcon from "../assets/Chevron-icon.png";

const Dropdown = ({
  options = ["Option 1", "Option 2", "Option 3"],
  placeholder = "Dropdown",
  showArrow = true,
  onSelect = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <div
        className={`dropdown-header ${!showArrow ? "no-arrow" : ""}`}
        onClick={toggleDropdown}
      >
        {selectedOption ? selectedOption : placeholder}
        {showArrow && (
          <img src={chevronIcon} className={isOpen ? "flip-vertically" : ""} />
        )}
      </div>
      <div className="dropdown-bottom-line" />
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((option, index) => (
            <li
              key={index}
              className="dropdown-item"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
