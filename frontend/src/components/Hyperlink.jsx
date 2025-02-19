import React from 'react'

function Hyperlink({children, href}) {
  return (
    <a href={href} className='hyperlink'>{children}</a>
  )
}

export default Hyperlink