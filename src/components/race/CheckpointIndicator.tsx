import React from 'react';
import { motion } from 'framer-motion';

interface CheckpointIndicatorProps {
  routeProgress: number;
  primaryColor: string;
}

const CheckpointIndicator: React.FC<CheckpointIndicatorProps> = ({ routeProgress, primaryColor }) => {
  return (
    <div className="flex items-center space-x-2">
      {[...Array(5)].map((_, i) => (
        <motion.div 
          key={i}
          className={`h-3 w-3 rounded-full ${i < Math.floor(routeProgress * 5) ? `bg-${primaryColor}-500` : 'bg-gray-600'}`}
          animate={i === Math.floor(routeProgress * 5) ? {
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default CheckpointIndicator;