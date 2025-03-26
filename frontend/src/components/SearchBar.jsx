import { useState } from "react";
import searchIcon from "../assets/Search-icon.png";

export const SearchBar = ({ text = "Ieškoti..." }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChangeInputValue = (e) => {
    setInputValue(e.target.value);
  };
  return (
    <div style={{ padding: "10px 0" }}>
      <div className="search-bar">
        <input
          type="text"
          value={inputValue}
          onChange={handleChangeInputValue}
          placeholder={text}
        />
        <img src={searchIcon} />
        <div className="search-bottom-line" />
      </div>
    </div>
  );
};
