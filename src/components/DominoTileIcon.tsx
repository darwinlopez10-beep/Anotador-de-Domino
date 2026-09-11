import React from 'react';

interface DominoTileIconProps {
  top?: number;
  bottom?: number;
  className?: string;
  horizontal?: boolean;
}

// Coordinate positions for standard domino pips in a 40x40 square
const PIP_COORDINATES: Record<number, [number, number][]> = {
  0: [],
  1: [[20, 20]],
  2: [
    [10, 10],
    [30, 30],
  ],
  3: [
    [10, 10],
    [20, 20],
    [30, 30],
  ],
  4: [
    [10, 10],
    [30, 10],
    [10, 30],
    [30, 30],
  ],
  5: [
    [10, 10],
    [30, 10],
    [20, 20],
    [10, 30],
    [30, 30],
  ],
  6: [
    [10, 10],
    [30, 10],
    [10, 20],
    [30, 20],
    [10, 30],
    [30, 30],
  ],
};

export const DominoTileIcon: React.FC<DominoTileIconProps> = ({
  top = 6,
  bottom = 6,
  className = 'w-8 h-16',
  horizontal = false,
}) => {
  const safeTop = Math.max(0, Math.min(6, top));
  const safeBottom = Math.max(0, Math.min(6, bottom));

  if (horizontal) {
    return (
      <svg
        viewBox="0 0 84 44"
        className={`${className} select-none drop-shadow-sm`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tile base */}
        <rect
          x="2"
          y="2"
          width="80"
          height="40"
          rx="6"
          fill="#fbf9f4"
          stroke="#d6d1c4"
          strokeWidth="1.5"
        />
        {/* Center Divider */}
        <line
          x1="42"
          y1="5"
          x2="42"
          y2="39"
          stroke="#948b7d"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Center Brass Spinner pin */}
        <circle cx="42" cy="22" r="2.2" fill="#c29b38" stroke="#96731e" strokeWidth="0.8" />

        {/* Left pips (translated by +2, +2) */}
        <g transform="translate(2, 2)">
          {PIP_COORDINATES[safeTop].map(([px, py], i) => (
            <circle
              key={`top-${i}`}
              cx={px}
              cy={py}
              r="3.2"
              fill="#1c1917"
              stroke="#0c0a09"
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Right pips (translated by +42, +2) */}
        <g transform="translate(42, 2)">
          {PIP_COORDINATES[safeBottom].map(([px, py], i) => (
            <circle
              key={`bot-${i}`}
              cx={px}
              cy={py}
              r="3.2"
              fill="#1c1917"
              stroke="#0c0a09"
              strokeWidth="0.5"
            />
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 44 84"
      className={`${className} select-none drop-shadow-sm`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tile base */}
      <rect
        x="2"
        y="2"
        width="40"
        height="80"
        rx="6"
        fill="#fcfaf6"
        stroke="#d6d1c4"
        strokeWidth="1.5"
      />
      {/* Center Divider */}
      <line
        x1="5"
        y1="42"
        x2="39"
        y2="42"
        stroke="#948b7d"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Center Brass Spinner pin */}
      <circle cx="22" cy="42" r="2.2" fill="#c29b38" stroke="#96731e" strokeWidth="0.8" />

      {/* Top half pips (translate 2, 2) */}
      <g transform="translate(2, 2)">
        {PIP_COORDINATES[safeTop].map(([px, py], i) => (
          <circle
            key={`top-${i}`}
            cx={px}
            cy={py}
            r="3.2"
            fill="#1c1917"
            stroke="#0c0a09"
            strokeWidth="0.5"
          />
        ))}
      </g>

      {/* Bottom half pips (translate 2, 42) */}
      <g transform="translate(2, 42)">
        {PIP_COORDINATES[safeBottom].map(([px, py], i) => (
          <circle
            key={`bot-${i}`}
            cx={px}
            cy={py}
            r="3.2"
            fill="#1c1917"
            stroke="#0c0a09"
            strokeWidth="0.5"
          />
        ))}
      </g>
    </svg>
  );
};
