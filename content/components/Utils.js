import Link from "next/link";
import React from "react";

const Utils = ({ children, href=null, fontSize = '1rem' }) => {
  if (href)
    return (
      <Link
        className="gradient-link"
        href={href}
        style={{
          textDecoration: "underline",
          color: 'transparent',
          background: "rgb(255,255,255)",
          background:
            " linear-gradient(65deg, rgba(255,255,255,1) 0%, rgba(70,229,230,1) 0%, rgba(255,147,225,1) 100%)",
          backgroundClip: 'text',
          WebkitBackgroundClip:'text',
          fontSize: fontSize,
          fontWeight: 'bold',
          display: 'inline-block',
        }}
      >
        {children}
      </Link>
    )
  return (
      <p
        style={{
          color: 'transparent',
          background: "rgb(255,255,255)",
          background:
            " linear-gradient(65deg, rgba(255,255,255,1) 0%, rgba(70,229,230,1) 0%, rgba(255,147,225,1) 100%)",
          backgroundClip: 'text',
          WebkitBackgroundClip:'text',
          fontSize: fontSize,
          fontWeight: 'bold',
          display: 'inline-block',
        }}
      >
        {children}
      </p>
  );
};

export default Utils;
