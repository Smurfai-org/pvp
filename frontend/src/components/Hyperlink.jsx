import React from 'react'

function Hyperlink({children, href, onClick, className}) {
  return (
    <a href={href} className={`hyperlink ${className}`} onClick={onClick}>{children}</a>
  )
}

export default Hyperlink