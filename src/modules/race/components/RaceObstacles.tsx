import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Construction, Bird as BirdIcon, Zap, Car, ArrowUpRight } from 'lucide-react';

interface RaceObstaclesProps {
  modelId: string;
  isRacing: boolean;
  performance: {
    speed: number;
    accuracy: number;
    adaptability: number;
  };
  onObstacleAppear: (type: 'construction' | 'pigeons' | 'dataOverflow' | 'traffic' | 'shortcut') => void;
}

const RaceObstacles: React.FC<RaceObstaclesProps> = ({
  modelId,
  isRacing,
  performance,
  onObstacleAppear
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  
  const [activeObstacle, setActiveObstacle] = useState<{
    type: 'construction' | 'pigeons' | 'dataOverflow' | 'traffic' | 'shortcut';
    message: string;
    icon: React.ReactNode;
    color: string;
  } | null>(null);
  
  // Obstacle generation logic
  useEffect(() => {
    if (!isRacing) {
      setActiveObstacle(null);
      return;
    }
    
    // Generate obstacles at random intervals
    const minInterval = 8000; // Minimum 8 seconds between obstacles
    const maxInterval = 15000; // Maximum 15 seconds between obstacles
    
    const generateObstacle = () => {
      // Determine if an obstacle should appear based on adaptability
      // Higher adaptability = lower chance of obstacles
      const adaptabilityFactor = 1 - (performance.adaptability / 150); // 0.33 to 0.83 range
      const obstacleChance = 0.7 * adaptabilityFactor; // 0.23 to 0.58 chance
      
      if (Math.random() < obstacleChance) {
        // Select obstacle type
        let obstacleTypes: ('construction' | 'pigeons' | 'dataOverflow' | 'traffic' | 'shortcut')[] = [
          'construction',
          'pigeons',
          'dataOverflow',
          'traffic'
        ];
        
        // Only add shortcut if adaptability is high
        if (performance.adaptability > 70) {
          obstacleTypes.push('shortcut');
        }
        
        // Weight obstacle types based on AI characteristics
        let weightedTypes: ('construction' | 'pigeons' | 'dataOverflow' | 'traffic' | 'shortcut')[] = [...obstacleTypes];
        
        // Add more instances of obstacles that are relevant to this AI
        if (isRat) {
          // Rat is more likely to encounter data overflow
          weightedTypes.push('dataOverflow', 'dataOverflow');
          // Rat is less affected by pigeons
          const pigeonIndex = weightedTypes.indexOf('pigeons');
          if (pigeonIndex !== -1) {
            weightedTypes.splice(pigeonIndex, 1);
          }
        } else {
          // Pigeon is more likely to encounter other pigeons
          weightedTypes.push('pigeons', 'pigeons');
        }
        
        // If speed is high, more likely to encounter traffic
        if (performance.speed > 70) {
          weightedTypes.push('traffic', 'traffic');
        }
        
        // If accuracy is high, more likely to encounter construction (need to reroute)
        if (performance.accuracy > 70) {
          weightedTypes.push('construction', 'construction');
        }
        
        // Randomly select from weighted types
        const selectedType = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
        
        // Create obstacle data
        let obstacleData = {
          type: selectedType,
          message: '',
          icon: <AlertTriangle className="h-6 w-6" />,
          color: 'red'
        };
        
        // Set obstacle details based on type
        switch (selectedType) {
          case 'construction':
            obstacleData.message = '🚧 Construction Detour! Rerouting...';
            obstacleData.icon = <Construction className="h-6 w-6" />;
            obstacleData.color = 'yellow';
            break;
          case 'pigeons':
            obstacleData.message = isRat 
              ? '🐦 Flock of Pigeons! Calculating path through...' 
              : '🐦 Flock of Fellow Pigeons! Getting distracted...';
            obstacleData.icon = <BirdIcon className="h-6 w-6" />;
            obstacleData.color = 'blue';
            break;
          case 'dataOverflow':
            obstacleData.message = '🔥 Data Overflow! Processing bottleneck...';
            obstacleData.icon = <Zap className="h-6 w-6" />;
            obstacleData.color = 'red';
            break;
          case 'traffic':
            obstacleData.message = '⚠️ Unexpected Traffic! Calculating response...';
            obstacleData.icon = <Car className="h-6 w-6" />;
            obstacleData.color = 'orange';
            break;
          case 'shortcut':
            obstacleData.message = '🏁 Shortcut Discovered! Optimizing route...';
            obstacleData.icon = <ArrowUpRight className="h-6 w-6" />;
            obstacleData.color = 'green';
            break;
        }
        
        // Set active obstacle
        setActiveObstacle(obstacleData);
        
        // Notify parent component
        onObstacleAppear(selectedType);
        
        // Clear obstacle after a delay
        setTimeout(() => {
          setActiveObstacle(null);
        }, 4000);
      }
    };
    
    // Set up interval for obstacle generation
    const interval = setInterval(() => {
      generateObstacle();
    }, Math.random() * (maxInterval - minInterval) + minInterval);
    
    // Initial obstacle after a short delay
    const initialTimeout = setTimeout(() => {
      generateObstacle();
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [isRacing, performance, isRat, modelId, onObstacleAppear]);
  
  return (
    <AnimatePresence>
      {activeObstacle && (
        <motion.div 
          className={`fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 
                     bg-${activeObstacle.color === 'red' ? 'red' : 
                       activeObstacle.color === 'yellow' ? 'yellow' : 
                       activeObstacle.color === 'blue' ? 'blue' : 
                       activeObstacle.color === 'orange' ? 'orange' : 
                       activeObstacle.color === 'green' ? 'green' : primaryColor}-500 
                     text-white px-6 py-3 rounded-full shadow-lg flex items-center`}
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: [1, 1.05, 1],
            x: [0, -5, 5, -5, 0]
          }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ 
            duration: 0.5,
            scale: { repeat: 2, duration: 0.3 },
            x: { repeat: 2, duration: 0.3 }
          }}
        >
          <div className="mr-3">
            {activeObstacle.icon}
          </div>
          <span className="text-xl font-bold whitespace-nowrap">{activeObstacle.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RaceObstacles;