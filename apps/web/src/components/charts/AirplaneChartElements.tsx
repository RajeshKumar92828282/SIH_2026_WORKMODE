"use client";

import React from "react";

/**
 * Custom Airplane Active Dot for Recharts Line & Area charts.
 * Renders a glowing radar ring and an animated 3D-styled airplane icon tilted upwards along the chart trajectory.
 */
export const AirplaneActiveDot = (props: any) => {
  const { cx, cy, stroke = "#00B8D9" } = props;
  if (cx == null || cy == null || isNaN(cx) || isNaN(cy)) return null;

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* Outer pulsing radar ring */}
      <circle cx="0" cy="0" r="16" fill={stroke} fillOpacity="0.12" stroke={stroke} strokeWidth="1" />
      <circle cx="0" cy="0" r="10" fill={stroke} fillOpacity="0.25" stroke={stroke} strokeWidth="1.5" />
      
      {/* Airplane icon tilted 35 deg upwards as if climbing */}
      <g transform="rotate(-35) translate(-10, -10)">
        <path
          d="M17.5 13v-1.75l-6.5-4.1V3c0-.68-.54-1.25-1.22-1.25S8.55 2.32 8.55 3v4.15l-6.5 4.1V13l6.5-2v4.5l-1.6 1.25V18l3.32-.8 3.33.8v-1.25l-1.6-1.25V11l6.5 2z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
};

/**
 * Custom Airplane Leading Dot for static line end-points.
 */
export const AirplaneLeadingDot = (props: any) => {
  const { cx, cy, stroke = "#16C7A3", index, dataLength } = props;
  if (cx == null || cy == null || isNaN(cx) || isNaN(cy)) return null;

  const isLatest = dataLength ? index === dataLength - 1 : true;

  if (!isLatest) {
    return <circle cx={cx} cy={cy} r="3" fill={stroke} />;
  }

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <circle cx="0" cy="0" r="14" fill={stroke} fillOpacity="0.2" stroke={stroke} strokeWidth="1.5" />
      <g transform="rotate(-25) translate(-9, -9)">
        <path
          d="M16 12v-1.6l-6-3.8V2.8c0-.6-.5-1.1-1.1-1.1s-1.1.5-1.1 1.1v3.8l-6 3.8V12l6-1.8v4.1l-1.5 1.1V16.5l2.6-.7 2.6.7v-1.1l-1.5-1.1V10.2l6 1.8z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth="1"
        />
      </g>
    </g>
  );
};

/**
 * Custom Bar Shape with Airplane flying atop each bar for Bar Charts.
 */
export const AirplaneBarShape = (props: any) => {
  const { fill, x, y, width, height } = props;
  if (x == null || y == null || width == null || height == null) return null;

  const planeY = Math.max(y - 14, 0);

  return (
    <g>
      {/* Bar rectangle with top rounded corners */}
      <path
        d={`M ${x},${y + height} L ${x},${y + 6} Q ${x},${y} ${x + 6},${y} L ${x + width - 6},${y} Q ${x + width},${y} ${x + width},${y + 6} L ${x + width},${y + height} Z`}
        fill={fill}
        fillOpacity="0.85"
      />

      {/* Airplane icon on top of bar */}
      <g transform={`translate(${x + width / 2 - 8}, ${planeY}) scale(0.85)`}>
        <g transform="rotate(-45 9 9)">
          <path
            d="M16 12v-1.6l-6-3.8V2.8c0-.6-.5-1.1-1.1-1.1s-1.1.5-1.1 1.1v3.8l-6 3.8V12l6-1.8v4.1l-1.5 1.1V16.5l2.6-.7 2.6.7v-1.1l-1.5-1.1V10.2l6 1.8z"
            fill="#FFFFFF"
            stroke={fill || "#6366f1"}
            strokeWidth="1.2"
          />
        </g>
      </g>
    </g>
  );
};
