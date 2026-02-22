import React from 'react';

const LogicGate = ({ type = 'AND', x, y, size = 40 }) => {
  if (type === 'AND') {
    // AND gate: half-circle with flat bottom
    return (
      <g>
        <path
          d={`M ${x - size / 2} ${y} 
              L ${x - size / 2} ${y - size / 2}
              A ${size / 2} ${size / 2} 0 0 1 ${x + size / 2} ${y - size / 2}
              L ${x + size / 2} ${y}
              Z`}
          fill="#0F172A"
          stroke="#F97316"
          strokeWidth="2"
        />
        <text
          x={x}
          y={y - size / 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="14"
          fontWeight="bold"
        >
          &
        </text>
      </g>
    );
  } else {
    // OR gate: half-circle with curved bottom
    return (
      <g>
        <path
          d={`M ${x - size / 2} ${y}
              Q ${x} ${y + size / 4} ${x + size / 2} ${y}
              L ${x + size / 2} ${y - size / 2}
              A ${size / 2} ${size / 2} 0 0 0 ${x - size / 2} ${y - size / 2}
              Z`}
          fill="#0F172A"
          stroke="#F97316"
          strokeWidth="2"
        />
        <text
          x={x}
          y={y - size / 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="14"
          fontWeight="bold"
        >
          ≥1
        </text>
      </g>
    );
  }
};

export default LogicGate;