import React, { useState, useEffect } from 'react';

const Checkbox = ({ children, checked = false, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    if (onChange) {
      onChange(e);
    }
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
