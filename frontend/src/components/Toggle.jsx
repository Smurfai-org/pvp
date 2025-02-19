import React, { useState } from 'react';
import './styles.css';

function ToggleSwitch({ children }) {
  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => setIsOn(!isOn);

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
