import React from 'react';

interface SpeedIndicatorProps {
  currentSpeed: number;
  primaryColor: string;
}

const SpeedIndicator: React.FC<SpeedIndicatorProps> = ({ currentSpeed, primaryColor }) => {
  // Convert the speed value to a percentage for display
  // currentSpeed is typically between 0.03 and 0.4
  const speedPercentage = Math.min(100, Math.max(0, (currentSpeed / 0.4) * 100));
  
  return (
    <div className="absolute bottom-6 left-6 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700 shadow-lg flex items-center">
      <span className="text-white text-sm mr-2">Current Speed:</span>
      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${primaryColor}-500`} 
          style={{ width: `${speedPercentage}%` }}
        ></div>
      </div>
      <span className="text-white text-xs ml-2">{Math.round(speedPercentage)}%</span>
    </div>
  );
};

export default SpeedIndicator;