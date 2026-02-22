import React from 'react';

const DiagramConnector = ({ 
  x1, 
  y1, 
  x2, 
  y2, 
  type = 'straight',
  color = '#F97316',
  strokeWidth = 2,
  label = ''
}) => {
  const renderLine = () => {
    if (type === 'curved') {
      const midX = (x1 + x2) / 2;
      return (
        <path
          d={`M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${(y1 + y2) / 2} T ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          markerEnd="url(#arrowhead)"
        />
      );
    } else {
      return (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={strokeWidth}
          markerEnd="url(#arrowhead)"
        />
      );
    }
  };

  return (
    <g>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={color} />
        </marker>
      </defs>
      {renderLine()}
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 10}
          textAnchor="middle"
          fill="#0F172A"
          fontSize="11"
          fontWeight="500"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default DiagramConnector;