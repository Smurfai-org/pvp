import { useState, useEffect } from "react";
import searchIcon from "../assets/Search-icon.png";

export const SearchBar = ({ text = "Ieškoti...", onSearch }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChangeInputValue = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(inputValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  return (
    <div style={{ padding: "10px 0" }}>
      <div className="search-bar">
        <input
          type="text"
          value={inputValue}
          onChange={handleChangeInputValue}
          placeholder={text}
        />
        <img src={searchIcon} alt="search icon" />
        <div className="search-bottom-line" />
      </div>
    </div>
  );
};

