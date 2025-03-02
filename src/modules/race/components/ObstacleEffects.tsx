import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Construction, Bird as BirdIcon, Zap, Car, ArrowUpRight } from 'lucide-react';

interface ObstacleEffectsProps {
  modelId: string;
  isRacing: boolean;
  activeEffects: {
    construction: boolean;
    pigeons: boolean;
    dataOverflow: boolean;
    traffic: boolean;
    shortcut: boolean;
  };
}

const ObstacleEffects: React.FC<ObstacleEffectsProps> = ({
  modelId,
  isRacing,
  activeEffects
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  
  // Construction effect - road blocked
  const renderConstructionEffect = () => {
    if (!activeEffects.construction) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Construction barrier overlay */}
        <div className="absolute inset-0 bg-yellow-500/10" />
        
        {/* Construction barriers */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`barrier-${i}`}
              className="absolute bg-yellow-500"
              style={{
                left: `${10 + (i * 8)}%`,
                top: `${30 + (Math.sin(i) * 20)}%`,
                width: '20px',
                height: '100px',
                backgroundImage: 'repeating-linear-gradient(45deg, black, black 10px, yellow 10px, yellow 20px)'
              }}
              animate={{
                y: [0, 5, 0],
                rotate: [0, 1, -1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'mirror',
                delay: i * 0.1
              }}
            />
          ))}
        </div>
        
        {/* "Rerouting" text */}
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
            <Construction className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-mono">Construction Ahead! Rerouting</span>
            <motion.span
              className="text-yellow-400 ml-1"
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
  
  // Pigeons effect - distraction
  const renderPigeonsEffect = () => {
    if (!activeEffects.pigeons) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Flying pigeons */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`pigeon-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
                rotate: [0, Math.random() * 360]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.1
              }}
            >
              <BirdIcon className="h-8 w-8 text-gray-300" />
            </motion.div>
          ))}
        </div>
        
        {/* Distraction message */}
        {!isRat && (
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
              <BirdIcon className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-blue-400 font-mono">Fellow Pigeons! Getting distracted</span>
              <motion.span
                className="text-blue-400 ml-1"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ...
              </motion.span>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };
  
  // Data overflow effect - computational bottleneck
  const renderDataOverflowEffect = () => {
    if (!activeEffects.dataOverflow) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Binary code rain */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`binary-${i}`}
              className="absolute text-red-500 font-mono text-opacity-60 text-xs"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                opacity: 0.6
              }}
              animate={{
                y: [0, window.innerHeight],
                opacity: [0.6, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            >
              {Array(10).fill(0).map(() => Math.round(Math.random())).join('')}
            </motion.div>
          ))}
        </div>
        
        {/* Error messages */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`error-${i}`}
            className="absolute bg-red-500/20 px-4 py-2 rounded-md font-mono text-xs text-red-400"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              transform: `rotate(${Math.random() * 10 - 5}deg)`
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            {[
              "ERROR: Stack overflow",
              "WARNING: Memory limit exceeded",
              "ERROR: Computation timeout",
              "WARNING: Buffer overflow",
              "ERROR: Null pointer exception"
            ][i % 5]}
          </motion.div>
        ))}
        
        {/* Processing message */}
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
            <Zap className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400 font-mono">Data Overflow! Processing</span>
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
  
  // Traffic effect - congestion
  const renderTrafficEffect = () => {
    if (!activeEffects.traffic) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Traffic congestion */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`car-${i}`}
              className="absolute"
              style={{
                left: `${10 + (i * 5)}%`,
                top: `${40 + (Math.sin(i) * 10)}%`,
              }}
              animate={{
                x: [0, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.1
              }}
            >
              <Car className={`h-6 w-6 text-${['red', 'blue', 'green', 'yellow', 'purple'][i % 5]}-400`} />
            </motion.div>
          ))}
        </div>
        
        {/* Traffic message */}
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
            <Car className="h-5 w-5 text-orange-400 mr-2" />
            <span className="text-orange-400 font-mono">Unexpected Traffic! Calculating response</span>
            <motion.span
              className="text-orange-400 ml-1"
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
  
  // Shortcut effect - faster path
  const renderShortcutEffect = () => {
    if (!activeEffects.shortcut) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Shortcut path highlight */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute left-1/2 top-1/2 w-[200%] h-2 bg-green-400 origin-left"
            style={{
              transform: 'translate(-50%, -50%) rotate(45deg)'
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Shortcut indicators */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`shortcut-${i}`}
            className="absolute"
            style={{
              left: `${30 + (i * 10)}%`,
              top: `${30 + (i * 8)}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          >
            <ArrowUpRight className="h-8 w-8 text-green-400" />
          </motion.div>
        ))}
        
        {/* Shortcut message */}
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
            <ArrowUpRight className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-400 font-mono">Shortcut Discovered! Optimizing route</span>
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
        {activeEffects.construction && renderConstructionEffect()}
      </AnimatePresence>
      
      <AnimatePresence>
        {activeEffects.pigeons && renderPigeonsEffect()}
      </AnimatePresence>
      
      <AnimatePresence>
        {activeEffects.dataOverflow && renderDataOverflowEffect()}
      </AnimatePresence>
      
      <AnimatePresence>
        {activeEffects.traffic && renderTrafficEffect()}
      </AnimatePresence>
      
      <AnimatePresence>
        {activeEffects.shortcut && renderShortcutEffect()}
      </AnimatePresence>
    </>
  );
};

export default ObstacleEffects;