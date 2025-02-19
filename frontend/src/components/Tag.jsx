import React, { useState } from 'react';

function Tag({ children, count, checked }) {
    const [isChecked, setChecked] = useState(checked || false);

    const handleClick = () => {
        setChecked(!isChecked);
    };

    return (
        <button 
            className={`tag ${isChecked ? 'checked' : ''}`} 
            onClick={handleClick}
        >
            {children}
            <span className='count'>{count}</span>
        </button>
    );
}

export default Tag;
