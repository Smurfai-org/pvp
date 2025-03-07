import React from 'react'
import './styles.css'

function Button({children, extra, onClick}) {
  return (
        <button onClick={onClick}className={`default-button ${extra || ''}`}>{children}</button>
  )
}

export default Button