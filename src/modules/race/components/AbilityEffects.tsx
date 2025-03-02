import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Database, Cpu, Rocket, Wind, AlertCircle, Target } from 'lucide-react';

interface AbilityEffectsProps {
  modelId: string;
  isRacing: boolean;
  activeEffects: {
    speedBoost: boolean;
    dataFlood: boolean;
    pathOptimization: boolean;
  };
}

const AbilityEffects: React.FC<AbilityEffectsProps> = ({
  modelId,
  isRacing,
  activeEffects
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  
  // Speed boost effect
  const renderSpeedBoostEffect = () => {
    if (!activeEffects.speedBoost) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Motion blur effect */}
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            opacity: 0.3
          }}
        />
        
        {/* Speed lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`speedline-boost-${i}`}
              className={`absolute h-1 bg-${primaryColor}-400`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${100 + Math.random() * 200}px`,
                opacity: 0.7
              }}
              animate={{
                x: [-200, window.innerWidth + 200],
                opacity: [0, 0.7, 0]
              }}
              transition={{
                duration: 0.3 + Math.random() * 0.2,
                repeat: Infinity,
                delay: Math.random() * 0.5,
                ease: "linear"
              }}
            />
          ))}
        </div>
        
        {/* Glow effect around the edges */}
        <div 
          className={`absolute inset-0 bg-${primaryColor}-500`}
          style={{
            opacity: 0.15,
            boxShadow: `inset 0 0 50px 20px rgba(var(--${primaryColor}-500-rgb), 0.5)`
          }}
        />
      </motion.div>
    );
  };
  
  // Data flood effect (opponent slowdown)
  const renderDataFloodEffect = () => {
    if (!activeEffects.dataFlood) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Static noise effect */}
        <div className="absolute inset-0 bg-black opacity-20" />
        
        {/* Digital glitch elements */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`glitch-${i}`}
            className="absolute bg-red-500"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 100}px`,
              height: `${2 + Math.random() * 5}px`,
              opacity: 0.3
            }}
            animate={{
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatType: 'loop',
              ease: "linear"
            }}
          />
        ))}
        
        {/* "Processing" text in the center */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 px-6 py-3 rounded-lg"
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="flex items-center">
            <Database className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400 font-mono">Processing... Please Wait</span>
            <motion.span
              className="text-red-400 ml-1"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Path optimization effect
  const renderPathOptimizationEffect = () => {
    if (!activeEffects.pathOptimization) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Scanning grid effect */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(0,255,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            opacity: 0.5
          }}
        />
        
        {/* Scanning line */}
        <motion.div
          className="absolute inset-x-0 h-1 bg-green-400"
          style={{ top: '50%' }}
          animate={{
            top: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* "Optimizing" text */}
        <motion.div
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 px-6 py-3 rounded-lg"
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="flex items-center">
            <Target className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-400 font-mono">Optimizing Path</span>
            <motion.span
              className="text-green-400 ml-1"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  if (!isRacing) return null;
  
  return (
    <>
      <AnimatePresence>
        {activeEffects.speedBoost && renderSpeedBoostEffect()}
      </AnimatePresence>
      
      <AnimatePresence>
        {activeEffects.dataFlood && renderDataFloodEffect()}
      </AnimatePresence>
      
      <AnimatePresence>
        {activeEffects.pathOptimization && renderPathOptimizationEffect()}
      </AnimatePresence>
    </>
  );
};

export default AbilityEffects;