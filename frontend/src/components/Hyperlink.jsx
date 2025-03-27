import React from 'react'

function Hyperlink({children, href, onClick}) {
  return (
    <a href={href} className='hyperlink' onClick={onClick}>{children}</a>
  )
}

export default Hyperlink