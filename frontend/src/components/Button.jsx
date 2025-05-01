import React from 'react'
import './styles.css'

function Button({children, extra, onClick, disabled}) {
  return (
        <button disabled={disabled}onClick={onClick}className={`default-button ${extra || ''}`}>{children}</button>
  )
}

export default Button