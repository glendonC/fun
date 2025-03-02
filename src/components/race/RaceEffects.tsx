import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, Brain, Cpu } from 'lucide-react';

interface RaceEffectsProps {
  modelId: string;
  isRacing: boolean;
  currentSpeed: number;
  parameters: any;
}

const RaceEffects: React.FC<RaceEffectsProps> = ({ 
  modelId, 
  isRacing, 
  currentSpeed,
  parameters 
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  
  // State for various effects
  const [showSpeedBoost, setShowSpeedBoost] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showCrash, setShowCrash] = useState(false);
  const [showMotionBlur, setShowMotionBlur] = useState(false);
  const [showWobble, setShowWobble] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  
  // Trigger effects based on race conditions
  useEffect(() => {
    if (!isRacing) {
      // Reset all effects when not racing
      setShowSpeedBoost(false);
      setShowProcessing(false);
      setShowCrash(false);
      setShowMotionBlur(false);
      setShowWobble(false);
      setShowGlitch(false);
      return;
    }
    
    // Get performance parameters
    const { speed, accuracy, adaptability } = parameters.performance || { speed: 50, accuracy: 50, adaptability: 50 };
    
    // Set up intervals for random events
    const speedBoostInterval = setInterval(() => {
      // Higher chance of speed boost with higher speed parameter
      if (Math.random() < (speed / 150)) { // Increased probability based on speed parameter
        setShowSpeedBoost(true);
        setShowMotionBlur(true);
        
        // Hide after a delay
        setTimeout(() => {
          setShowSpeedBoost(false);
          setTimeout(() => setShowMotionBlur(false), 1000);
        }, 2000);
      }
    }, 5000);
    
    const processingInterval = setInterval(() => {
      // Higher chance of processing delay with lower accuracy
      if (Math.random() < ((100 - accuracy) / 150)) { // Increased probability based on low accuracy
        setShowProcessing(true);
        setShowWobble(true);
        
        // Hide after a delay
        setTimeout(() => {
          setShowProcessing(false);
          setTimeout(() => setShowWobble(false), 1000);
        }, 2000);
      }
    }, 7000);
    
    const crashInterval = setInterval(() => {
      // Higher chance of crash with lower adaptability and high speed
      if (Math.random() < ((100 - adaptability) / 200) * (speed / 40)) { // Increased probability based on low adaptability and high speed
        setShowCrash(true);
        setShowGlitch(true);
        
        // Hide after a delay
        setTimeout(() => {
          setShowCrash(false);
          setTimeout(() => setShowGlitch(false), 1000);
        }, 2000);
      }
    }, 10000);
    
    return () => {
      clearInterval(speedBoostInterval);
      clearInterval(processingInterval);
      clearInterval(crashInterval);
    };
  }, [isRacing, parameters.performance]);
  
  return (
    <>
      {/* Motion blur effect */}
      {showMotionBlur && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            opacity: 0.5
          }}
        />
      )}
      
      {/* Wobble effect */}
      {showWobble && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-10"
          animate={{ 
            x: [0, -10, 10, -5, 5, 0],
            rotate: [0, -1, 1, -0.5, 0.5, 0]
          }}
          transition={{ 
            duration: 0.5,
            repeat: 3,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Glitch effect */}
      {showGlitch && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-red-500/20"
            animate={{ 
              x: [0, -10, 5, -5, 0],
              opacity: [0, 0.8, 0.2, 0.6, 0]
            }}
            transition={{ 
              duration: 0.3,
              repeat: 5,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute inset-0 bg-blue-500/20"
            animate={{ 
              x: [0, 10, -5, 5, 0],
              opacity: [0, 0.6, 0.2, 0.8, 0]
            }}
            transition={{ 
              duration: 0.3,
              repeat: 5,
              ease: "easeInOut",
              delay: 0.05
            }}
          />
        </div>
      )}
      
      {/* Speed lines effect - Always visible when racing, intensity based on speed */}
      {isRacing && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`speedline-${i}`}
              className="absolute h-0.5 bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${(currentSpeed * 200) + (Math.random() * 50)}px`,
                opacity: 0.2 + (currentSpeed * 0.5),
                transform: `rotate(${parameters.racerPosition?.rotation || 0}deg)`
              }}
              animate={{
                x: [-100, window.innerWidth + 100],
                opacity: [0, 0.2 + (currentSpeed * 0.5), 0]
              }}
              transition={{
                duration: 0.8 - (currentSpeed * 0.5), // Faster at higher speeds
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Pop-up messages */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
        <AnimatePresence>
          {/* Speed boost message */}
          {showSpeedBoost && (
            <motion.div 
              className={`bg-${primaryColor}-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center`}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              key="speed-boost"
            >
              <Zap className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">
                {isRat ? 
                  `Turbocharged! Speed +${Math.round(parameters.performance.speed / 10)}%` : 
                  `Intuition Boost! Speed +${Math.round(parameters.performance.speed / 10)}%`}
              </span>
              <motion.div 
                className="absolute inset-0 rounded-full"
                animate={{ 
                  boxShadow: [
                    `0 0 0 0 rgba(var(--${primaryColor}-500-rgb), 0)`,
                    `0 0 0 15px rgba(var(--${primaryColor}-500-rgb), 0.4)`,
                    `0 0 0 20px rgba(var(--${primaryColor}-500-rgb), 0)`
                  ]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </motion.div>
          )}
          
          {/* Processing message */}
          {showProcessing && (
            <motion.div 
              className="bg-gray-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              key="processing"
            >
              <Brain className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">
                {isRat ? 
                  `Processing... Accuracy ${Math.round(parameters.performance.accuracy)}%` : 
                  `Recalibrating... Accuracy ${Math.round(parameters.performance.accuracy)}%`}
              </span>
              <motion.span 
                className="ml-2"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                •••
              </motion.span>
            </motion.div>
          )}
          
          {/* Crash message */}
          {showCrash && (
            <motion.div 
              className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: [1, 1.2, 1],
                rotate: [-2, 2, -1, 1, 0]
              }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                scale: { duration: 0.5 },
                rotate: { duration: 0.5 }
              }}
              key="crash"
            >
              <AlertTriangle className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">
                {isRat ? 
                  `💥 System Overload! Adaptability ${Math.round(parameters.performance.adaptability)}%` : 
                  `💥 Instinct Failure! Adaptability ${Math.round(parameters.performance.adaptability)}%`}
              </span>
              <motion.div 
                className="absolute inset-0 rounded-full"
                animate={{ 
                  boxShadow: [
                    `0 0 0 0 rgba(239, 68, 68, 0)`,
                    `0 0 0 15px rgba(239, 68, 68, 0.4)`,
                    `0 0 0 20px rgba(239, 68, 68, 0)`
                  ]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: 3,
                  ease: "easeOut"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Live interaction controls */}
      {isRacing && (
        <motion.div 
          className="absolute bottom-24 left-6 bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700 shadow-lg z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: 1 }}
        >
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Cpu className="h-4 w-4 mr-2" />
            {isRat ? 'Algorithm Metrics' : 'Intuition Metrics'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Speed vs. Accuracy</span>
                <span className="text-xs text-gray-400">{parameters.performance.speed}:{parameters.performance.accuracy}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${primaryColor}-500`} 
                  style={{ 
                    width: `${parameters.performance.speed}%`,
                    transition: 'width 0.5s ease-in-out'
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">Accuracy</span>
                <span className="text-xs text-gray-400">Speed</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">
                  {isRat ? 'Processing Intensity' : 'Intuition Strength'}
                </span>
                <motion.div 
                  className={`h-2 w-2 rounded-full bg-${primaryColor}-500`}
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-${primaryColor}-500`}
                  animate={{ 
                    width: [
                      `${parameters.performance.adaptability - 20}%`, 
                      `${parameters.performance.adaptability + 20}%`, 
                      `${parameters.performance.adaptability}%`
                    ]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default RaceEffects;