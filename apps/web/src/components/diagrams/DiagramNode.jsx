import React from 'react';

const DiagramNode = ({ 
  type = 'rectangle', 
  x, 
  y, 
  width = 120, 
  height = 60, 
  text = '', 
  fill = '#0F172A',
  textColor = '#FFFFFF',
  onClick,
  className = ''
}) => {
  const renderShape = () => {
    switch (type) {
      case 'circle':
        return (
          <circle
            cx={x}
            cy={y}
            r={width / 2}
            fill={fill}
            stroke="#F97316"
            strokeWidth="2"
            className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
            onClick={onClick}
          />
        );
      
      case 'hexagon':
        const hexPoints = [
          [x - width / 2, y],
          [x - width / 4, y - height / 2],
          [x + width / 4, y - height / 2],
          [x + width / 2, y],
          [x + width / 4, y + height / 2],
          [x - width / 4, y + height / 2]
        ].map(p => p.join(',')).join(' ');
        
        return (
          <polygon
            points={hexPoints}
            fill={fill}
            stroke="#F97316"
            strokeWidth="2"
            className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
            onClick={onClick}
          />
        );
      
      case 'rectangle':
      default:
        return (
          <rect
            x={x - width / 2}
            y={y - height / 2}
            width={width}
            height={height}
            fill={fill}
            stroke="#F97316"
            strokeWidth="2"
            rx="4"
            className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
            onClick={onClick}
          />
        );
    }
  };

  return (
    <g>
      {renderShape()}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize="12"
        fontWeight="500"
        className="pointer-events-none select-none"
      >
        {text.length > 15 ? text.substring(0, 15) + '...' : text}
      </text>
    </g>
  );
};

export default DiagramNode;