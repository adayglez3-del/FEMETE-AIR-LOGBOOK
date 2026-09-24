import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
}

export const FemeteLogo: React.FC<LogoProps> = ({
  className = 'h-9 w-auto',
  variant = 'auto',
  showSubtitle = false,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Official circular symbol */}
      <svg
        className="h-full w-auto shrink-0 aspect-[120/120]"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="54" fill="#005596" />
        <path
          d="M60 12 C86.5 12 108 33.5 108 60 C108 86.5 86.5 108 60 108 L60 12 Z"
          fill="#E2E8F0"
        />
        <rect x="52" y="26" width="46" height="68" rx="4" fill="#CBD5E1" />
        <path d="M52 46 L78 60 L52 74 Z" fill="#DC2626" />
      </svg>

      <div className="flex flex-col justify-center min-w-0">
        <span
          className={`font-black italic tracking-tighter text-lg leading-none ${
            variant === 'dark'
              ? 'text-white'
              : variant === 'light'
              ? 'text-[#005596]'
              : 'text-[#005596] dark:text-white'
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          femete
        </span>
        {showSubtitle && (
          <span
            className={`text-[6.5px] uppercase font-bold tracking-tight leading-none mt-0.5 ${
              variant === 'dark'
                ? 'text-slate-400'
                : variant === 'light'
                ? 'text-slate-600'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Federación Provincial del Metal y TIC · S/C de Tenerife
          </span>
        )}
      </div>
    </div>
  );
};
