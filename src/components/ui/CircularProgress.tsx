import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  threshold?: number;
  showText?: boolean;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 110,
  strokeWidth = 9,
  threshold = 75,
  showText = true,
  label,
}) => {
  const cleanPct = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cleanPct / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let trackClass = 'text-slate-100 dark:text-slate-800';

  if (cleanPct < 65) {
    colorClass = 'text-rose-500';
  } else if (cleanPct < threshold) {
    colorClass = 'text-amber-500';
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={`${colorClass} transition-all duration-500 ease-out`}
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {cleanPct.toFixed(1)}%
          </span>
          {label && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
