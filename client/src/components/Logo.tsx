import React from 'react';

interface LogoProps {
  size?: number;
  colorMark?: string;
  colorText?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 28,
  colorMark = '#0b3b2a',
  colorText = '#0f172a',
}) => {
  return (
    <span className="logo" aria-label="Chambea logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg
        className="logo-mark"
        width={size}
        height={size}
        viewBox="0 0 36 36"
        role="img"
        aria-hidden="true"
      >
        {/* Arco que sugiere una C con trazo grueso */}
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke={colorMark}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="60 100"
          transform="rotate(40 18 18)"
        />
      </svg>
      <span className="logo-text" style={{ color: colorText, fontWeight: 800, fontSize: 22, letterSpacing: 0.5 }}>
        chambea
      </span>
    </span>
  );
};

export default Logo;