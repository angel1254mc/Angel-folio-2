import React from 'react'
import { animated } from 'react-spring';

const Sheen = ({ children, style = {}, className  ="" }) => {
    return (
        <span
          className={className}
          style={{
            color: 'transparent',
            background: "rgb(255,255,255)",
            background:
              " linear-gradient(65deg, rgba(255,255,255,1) 0%, rgba(70,229,230,1) 0%, rgba(255,147,225,1) 100%)",
            backgroundClip: 'text',
            WebkitBackgroundClip:'text',
            fontWeight: 'bold',
            display: 'inline',
            ...style
          }}
        >
          {children}
        </span>
    );
}

export default Sheen