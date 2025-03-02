import React from 'react';
import { motion } from 'framer-motion';

interface ParameterSliderProps {
  icon: React.ReactNode;
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  description: string;
  leftLabel: string;
  rightLabel: string;
  color: string;
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({
  icon,
  name,
  label,
  value,
  onChange,
  description,
  leftLabel,
  rightLabel,
  color
}) => {
  return (
    <div className="parameter-slider">
      <div className="flex items-center mb-2">
        <div className={`p-2 rounded-full bg-${color}-500/20 mr-3`}>
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-medium text-white">{label}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      
      <div className="mt-3">
        <input
          type="range"
          id={name}
          name={name}
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-${color}`}
          style={{
            background: `linear-gradient(to right, var(--tw-gradient-stops))`,
            '--tw-gradient-from': `rgb(var(--${color}-500))`,
            '--tw-gradient-to': `rgb(var(--${color}-300))`,
            '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to)`,
          } as React.CSSProperties}
        />
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{leftLabel}</span>
          <span className="text-xs text-gray-400">{rightLabel}</span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .slider-${color}::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: rgb(var(--${color}-500));
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider-${color}::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: rgb(var(--${color}-500));
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}} />
    </div>
  );
};

export default ParameterSlider;