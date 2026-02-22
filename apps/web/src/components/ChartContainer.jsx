import React from 'react';

const ChartContainer = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`bg-[#0F172A] rounded-xl p-6 shadow-lg border border-gray-800 flex flex-col ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex-grow w-full h-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;