import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showBadge?: boolean;
}

export const AlisiosLogo: React.FC<LogoProps> = ({
  className = 'h-7 w-auto',
  variant = 'auto',
  showBadge = false,
}) => {
  const textColor =
    variant === 'dark'
      ? '#ffffff'
      : variant === 'light'
      ? '#0b1c30'
      : 'currentColor';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        className="h-full w-auto aspect-[240/76]"
        viewBox="0 0 240 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ALISIOS top text */}
        <text
          x="4"
          y="34"
          fill={textColor}
          fontFamily="'Space Grotesk', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="-0.5"
        >
          ALISIOS
        </text>

        {/* Dynamic Blue Atlantic Ocean Waves under ALIS */}
        <path
          d="M 6 52 C 22 41, 48 58, 86 42 C 68 53, 38 49, 12 59 Z"
          fill="#1A80E6"
        />
        <path
          d="M 6 68 C 24 57, 50 72, 86 59 C 68 70, 36 67, 10 74 Z"
          fill="#005596"
        />

        {/* DRON text right of the waves */}
        <text
          x="94"
          y="72"
          fill={textColor}
          fontFamily="'Space Grotesk', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="-0.5"
        >
          DRON
        </text>
      </svg>

      {showBadge && (
        <span className="hidden sm:inline-flex text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase font-semibold">
          PARTNER UAS
        </span>
      )}
    </div>
  );
};
