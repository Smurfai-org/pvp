import { useState, useRef, useEffect } from "react";
import chevronIcon from "../assets/Chevron-icon.png";

const HyperlinkDropdown = ({
  links = [], 
  placeholder = "Select a link",
  showArrow = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (dropdownRef.current && isOpen) {
        const dropdown = dropdownRef.current;
        const button = dropdownButtonRef.current;

        const rect = button.getBoundingClientRect();
        const dropdownWidth = dropdown.offsetWidth;
        const screenWidth = window.innerWidth;

        const margin = 20;
        const spaceOnRight = screenWidth - rect.right;

        if (spaceOnRight < dropdownWidth + margin) {
          dropdown.style.left = `${-dropdownWidth + rect.width + margin}px`;
        } else {
          dropdown.style.left = "0";
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (link) => {
    if (link.onClick) {
      link.onClick(); // ✅ Executes the function
    } else if (link.url) {
      window.location.href = link.url;
      setSelectedLink(link.text);
    }
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <div 
        className={`dropdown-header ${!showArrow ? 'no-arrow' : ''}`} 
        onClick={toggleDropdown}
        ref={dropdownButtonRef}
      >
        {selectedLink ? selectedLink : placeholder}
        {showArrow && (
          <img src={chevronIcon} className={isOpen ? "flip-vertically" : ""} />
        )}
      </div>
      <div className="dropdown-bottom-line" />
      {isOpen && (
        <ul ref={dropdownRef} className="dropdown-list">
          {links.length > 0 ? (
            links.map((link, index) => (
              <li
                key={index}
                className="dropdown-item"
                onClick={() => handleLinkClick(link)}
              >
                {link.url ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.text}
                  </a>
                ) : (
                  <span>{link.text}</span> // ✅ This allows click functions
                )}
              </li>
            ))
          ) : (
            <li className="dropdown-item no-links">No options available</li> 
          )}
        </ul>
      )}
    </div>
  );
};

export default HyperlinkDropdown;
