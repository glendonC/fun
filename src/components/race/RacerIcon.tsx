import React from 'react';
import { motion } from 'framer-motion';
import { Rat, Bird } from 'lucide-react';

interface RacerIconProps {
  isRat: boolean;
  isRacing: boolean;
  primaryColor: string;
}

const RacerIcon: React.FC<RacerIconProps> = ({ isRat, isRacing, primaryColor }) => {
  return (
    <div className="absolute left-1/2 bottom-20 transform -translate-x-1/2 pointer-events-none">
      <motion.div 
        className={`bg-${primaryColor}-500/80 p-3 rounded-full`}
        animate={{ 
          y: isRacing ? [0, -5, 0] : 0,
          scale: isRacing ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          duration: 0.5,
          repeat: isRacing ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {isRat ? (
          <Rat className="h-10 w-10 text-white" />
        ) : (
          <Bird className="h-10 w-10 text-white" />
        )}
      </motion.div>
    </div>
  );
};

export default RacerIcon;