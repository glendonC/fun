import React from 'react';
import { motion } from 'framer-motion';

interface MotionEffectsProps {
  isRacing: boolean;
  currentSpeed: number;
  rotation: number;
}

const MotionEffects: React.FC<MotionEffectsProps> = ({ isRacing, currentSpeed, rotation }) => {
  if (!isRacing) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Motion blur effect at higher speeds */}
      {currentSpeed > 0.3 && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backdropFilter: `blur(${currentSpeed * 10}px)`,
            WebkitBackdropFilter: `blur(${currentSpeed * 10}px)`
          }}
        />
      )}
      
      {/* Speed lines at edges of screen */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-1 bg-white opacity-70`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 80}px`,
              transform: `rotate(${rotation}deg)`,
              opacity: isRacing ? 0.3 : 0
            }}
            animate={{
              opacity: isRacing ? [0, 0.3, 0] : 0,
              width: isRacing ? ['20px', `${20 + currentSpeed * 200}px`] : '20px'
            }}
            transition={{
              duration: 0.3 + Math.random() * 0.5,
              repeat: Infinity,
              repeatType: 'loop'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MotionEffects;