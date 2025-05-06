import React, { useState } from 'react';

const Checkbox = ({ children, checked=false }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  return (
    <div>
      <label className="container">
        {children}
        <input 
          type="checkbox" 
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span className="checkmark"></span>
      </label>
    </div>
  );
};

export default Checkbox;
