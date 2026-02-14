import React from 'react'

function Logo({width = '100px'}) {
  return (
    <img
      src="/megablog-icon.svg"
      alt="MegaBlog logo"
      style={{ width }}
      className="brand-logo h-auto"
    />
  )
}

export default Logo
