import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, trend, trendLabel, accentColor = '#F97316' }) => {
  return (
    <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg border border-gray-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
            trend.isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {trend.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {trendLabel && (
            <span className="text-xs text-gray-500">{trendLabel}</span>
          )}
        </div>
      </div>
      
      {/* Decorative bottom line */}
      <div 
        className="h-1 w-0 group-hover:w-full transition-all duration-500 mt-4 rounded-full opacity-50"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
};

export default KPICard;