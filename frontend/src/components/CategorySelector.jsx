import { useState } from "react";
import categoryIcon from "../assets/Category-icon.png";

const CategorySelector = ({ text = "Category", onChange = () => {} }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleOnClick = (isSelected) => {
    setIsSelected(!isSelected);
    onChange();
  };

  return (
    <div
      className={
        isSelected
          ? "category-selector category-selector-selected"
          : "category-selector"
      }
      onClick={() => handleOnClick(isSelected)}
    >
      <img src={categoryIcon} />
      <p>{text}</p>
    </div>
  );
};

export default CategorySelector;
