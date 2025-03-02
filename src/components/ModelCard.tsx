import React, { useState } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModelProps {
  id: string;
  name: string;
  fullName: string;
  icon: LucideIcon;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  textColor: string;
}

interface ModelCardProps {
  model: ModelProps;
  onSelect: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className={`relative rounded-2xl shadow-2xl overflow-hidden cursor-pointer h-[600px] group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => setShowDetails(!showDetails)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      {/* 3D Sculptural Background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden`}>
        {/* Abstract geometric shapes */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${model.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`stop-${model.primaryColor}`} />
                <stop offset="100%" className={`stop-${model.secondaryColor}`} />
              </linearGradient>
            </defs>
            <polygon points="0,0 100,0 100,100" fill={`url(#gradient-${model.id})`} className="opacity-10" />
            <circle cx="70" cy="30" r="20" fill={`url(#gradient-${model.id})`} className="opacity-20" />
            <rect x="10" y="50" width="30" height="30" fill={`url(#gradient-${model.id})`} className="opacity-15" />
          </svg>
        </div>
        
        {/* Glowing effect */}
        <div className={`absolute inset-0 bg-${model.glowColor} opacity-30 blur-3xl`}></div>
      </div>
      
      {/* 3D Icon Container */}
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center py-12"
        animate={{ 
          y: isHovered ? -10 : 0,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 10 
        }}
      >
        {/* 3D Icon */}
        <motion.div 
          className={`relative mb-10`}
          animate={{ 
            rotateY: isHovered ? 180 : 0,
            scale: isHovered ? 1.1 : 1,
            rotateZ: isHovered ? (model.id === 'dbrx' ? 15 : -15) : 0
          }}
          transition={{ 
            rotateY: { duration: 1.5, ease: "easeInOut" },
            scale: { duration: 0.3 },
            rotateZ: { duration: 0.5, ease: "easeOut" }
          }}
        >
          {/* Base layer - shadow */}
          <div className={`absolute -inset-1 bg-${model.accentColor} rounded-full blur-md opacity-70`}></div>
          
          {/* Middle layer - glow */}
          <div className={`absolute -inset-2 bg-${model.primaryColor} rounded-full blur-lg opacity-30 animate-pulse`}></div>
          
          {/* Icon container with 3D effect */}
          <div className={`relative h-48 w-48 rounded-full bg-gradient-to-br from-${model.secondaryColor} to-${model.primaryColor} p-6 shadow-lg`}>
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-20 rounded-full"></div>
              <div className={`absolute top-0 right-0 w-20 h-20 bg-${model.secondaryColor} rounded-full blur-md opacity-60 -mr-5 -mt-5`}></div>
              <div className={`absolute bottom-0 left-0 w-16 h-16 bg-${model.accentColor} rounded-full blur-md opacity-60 -ml-5 -mb-5`}></div>
            </div>
            
            {/* Icon with animation */}
            <motion.div
              animate={isHovered ? {
                scale: [1, 1.1, 1],
                rotate: model.id === 'dbrx' ? [0, -5, 5, 0] : [0, 5, -5, 0],
              } : {}}
              transition={{
                repeat: isHovered ? Infinity : 0,
                duration: 1.5
              }}
              className="h-full w-full relative z-10"
            >
              <model.icon className={`h-full w-full text-${model.textColor} drop-shadow-lg`} />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Model Name */}
        <motion.h2 
          className={`text-5xl font-bold text-${model.textColor} mb-6 drop-shadow-lg text-center z-10`}
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            y: isHovered ? 10 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {model.name}
        </motion.h2>
        
        {/* Racer Type Label - Only visible on hover */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className={`inline-block px-4 py-2 rounded-full bg-${model.primaryColor}/30 text-${model.textColor} text-lg font-medium`}>
            {model.id === 'dbrx' ? 'The Algorithmic Speedster' : 'The Instinctive Flyer'}
          </span>
        </motion.div>
        
        {/* Description - Only visible on hover */}
        <motion.div
          className="text-center px-12 mt-6"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isHovered ? 0.9 : 0
          }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className={`text-${model.textColor} text-lg`}>
            {model.description}
          </p>
        </motion.div>
        
        {/* Select Button - Always visible */}
        <motion.div 
          className="mt-auto px-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`w-full py-4 px-8 bg-${model.primaryColor} text-white text-xl font-medium rounded-lg shadow-lg hover:bg-${model.accentColor} transition-colors focus:outline-none focus:ring-2 focus:ring-${model.primaryColor} focus:ring-opacity-50`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Select This Racer
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* Details Panel - Shown on Click */}
      <motion.div 
        className={`absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col justify-center items-center p-10 z-20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: showDetails ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: showDetails ? 'auto' : 'none' }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: showDetails ? 0 : 20, opacity: showDetails ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <h2 className="text-4xl font-bold text-white mb-2">{model.fullName}</h2>
          <h3 className={`text-2xl font-medium text-${model.primaryColor} mb-6`}>
            {model.id === 'dbrx' ? 'The Algorithmic Speedster' : 'The Instinctive Flyer'}
          </h3>
          
          <div className={`p-5 rounded-full bg-${model.primaryColor}/20 mb-8 mx-auto w-32 h-32 flex items-center justify-center`}>
            <model.icon className={`h-20 w-20 text-${model.primaryColor}`} />
          </div>
          
          <p className="text-gray-200 text-xl mb-10 text-center">{model.description}</p>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`w-full py-4 px-8 bg-${model.primaryColor} text-white text-xl font-medium rounded-lg shadow-lg hover:bg-${model.accentColor} transition-colors focus:outline-none focus:ring-2 focus:ring-${model.primaryColor} focus:ring-opacity-50`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Select This Racer
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ModelCard;