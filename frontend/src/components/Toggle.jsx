import React, { useState } from 'react';
import './styles.css';

function ToggleSwitch({ children, onToggleChange }) {
  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    
    if (onToggleChange) {
      onToggleChange(newState);
    }
  };

  return (
    <div className="toggle-container">
      <div 
        className={`toggle-switch ${isOn ? 'on' : 'off'}`} 
        onClick={toggleSwitch}
      >
        <div className="toggle-slider"></div>
      </div>
      {children && <span className="toggle-label">{children}</span>}
    </div>
  );
}

export default ToggleSwitch;
