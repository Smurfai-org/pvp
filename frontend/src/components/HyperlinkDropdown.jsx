import { useState, useRef, useEffect } from "react";
import chevronIcon from "../assets/Chevron-icon.png";

const HyperlinkDropdown = ({
  links = [
    { text: "Google", url: "https://www.google.com" },
    { text: "Facebook", url: "https://www.facebook.com" },
    { text: "Twitter", url: "https://www.twitter.com" }
  ],
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
        
        const rect = button.getBoundingClientRect(); // Get button's position
        const dropdownWidth = dropdown.offsetWidth; // Get dropdown's width
        const screenWidth = window.innerWidth;

        // Calculate the margin for the dropdown (space between dropdown and screen edge)
        const margin = 20; // You can adjust this value
        const spaceOnRight = screenWidth - rect.right;

        // If the dropdown exceeds the screen width, adjust its position
        if (spaceOnRight < dropdownWidth + margin) {
          dropdown.style.left = `${-dropdownWidth + rect.width + margin}px`; // Move the dropdown to the left
        } else {
          dropdown.style.left = "0"; // Default positioning
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Run on initial render

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (url) => {
    window.location.href = url; // Navigate to the hyperlink
    setSelectedLink(url);
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
          {links.map((link, index) => (
            <li
              key={index}
              className="dropdown-item"
              onClick={() => handleLinkClick(link.url)}
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HyperlinkDropdown;
