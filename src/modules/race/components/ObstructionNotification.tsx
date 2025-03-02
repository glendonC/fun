import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CornerUpRight, Shuffle } from 'lucide-react';

interface ObstructionNotificationProps {
  modelId: string;
  isRacing: boolean;
}

const ObstructionNotification: React.FC<ObstructionNotificationProps> = ({ 
  modelId, 
  isRacing
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const opponentName = isRat ? 'Pigeon' : 'Rat';
  
  const [showNotification, setShowNotification] = useState(false);
  const [obstructionType, setObstructionType] = useState<'blocked' | 'rerouting' | 'evading' | null>(null);
  const [showOpponentNotification, setShowOpponentNotification] = useState(false);
  const [opponentObstructionType, setOpponentObstructionType] = useState<'blocked' | 'rerouting' | 'evading' | null>(null);
  
  // Listen for obstruction events
  useEffect(() => {
    const handleObstruction = (e: CustomEvent) => {
      const { type } = e.detail;
      
      setObstructionType(type);
      setShowNotification(true);
      
      // Hide notification after a delay
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    };
    
    const handleOpponentObstruction = (e: CustomEvent) => {
      const { type } = e.detail;
      
      setOpponentObstructionType(type);
      setShowOpponentNotification(true);
      
      // Hide notification after a delay
      const timer = setTimeout(() => {
        setShowOpponentNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    };
    
    window.addEventListener('path-obstruction', handleObstruction as EventListener);
    window.addEventListener('opponent-obstruction', handleOpponentObstruction as EventListener);
    
    return () => {
      window.removeEventListener('path-obstruction', handleObstruction as EventListener);
      window.removeEventListener('opponent-obstruction', handleOpponentObstruction as EventListener);
    };
  }, []);
  
  // Hide notification when race is not active
  useEffect(() => {
    if (!isRacing) {
      setShowNotification(false);
      setShowOpponentNotification(false);
    }
  }, [isRacing]);
  
  // Get notification content based on obstruction type
  const getNotificationContent = (type: 'blocked' | 'rerouting' | 'evading' | null, isOpponent: boolean) => {
    const actor = isOpponent ? opponentName : 'You';
    const target = isOpponent ? 'you' : opponentName;
    
    switch (type) {
      case 'blocked':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          message: isOpponent 
            ? `🛑 ${opponentName} blocked by your path!` 
            : `⚠️ Path blocked by ${opponentName}! Slowing down...`,
          color: 'red'
        };
      case 'rerouting':
        return {
          icon: <CornerUpRight className="h-6 w-6" />,
          message: isOpponent 
            ? `🔄 ${opponentName} rerouting to avoid your path...` 
            : `↪️ Calculating new route to avoid ${opponentName}!`,
          color: 'yellow'
        };
      case 'evading':
        return {
          icon: <Shuffle className="h-6 w-6" />,
          message: isOpponent 
            ? `💨 ${opponentName} making evasive maneuvers!` 
            : `⚡ Quick dodge! ${opponentName} crossing path!`,
          color: 'blue'
        };
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          message: 'Path interference detected!',
          color: primaryColor
        };
    }
  };
  
  const playerContent = getNotificationContent(obstructionType, false);
  const opponentContent = getNotificationContent(opponentObstructionType, true);
  
  return (
    <>
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 
                       bg-${playerContent.color === 'red' ? 'red' : playerContent.color === 'yellow' ? 'yellow' : playerContent.color === 'blue' ? 'blue' : primaryColor}-500 
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
              {playerContent.icon}
            </div>
            <span className="text-xl font-bold whitespace-nowrap">{playerContent.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showOpponentNotification && (
          <motion.div 
            className={`fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 
                       bg-${opponentContent.color === 'red' ? 'red' : opponentContent.color === 'yellow' ? 'yellow' : opponentContent.color === 'blue' ? 'blue' : 'gray'}-500 
                       text-white px-6 py-3 rounded-full shadow-lg flex items-center opacity-80`}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ 
              opacity: 0.8, 
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
              {opponentContent.icon}
            </div>
            <span className="text-xl font-bold whitespace-nowrap">{opponentContent.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ObstructionNotification;