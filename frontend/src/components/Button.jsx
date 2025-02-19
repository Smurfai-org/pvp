import React from 'react'
import './styles.css'

function Button({children="ASDASDASD", extra}) {
  return (
        <button className={`default-button ${extra || ''}`}>{children}</button>
  )
}

export default Button