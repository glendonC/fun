import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Clock, Award, Medal, Building } from 'lucide-react';

interface RaceNotificationsProps {
  modelId: string;
  isRacing: boolean;
  routeProgress: number;
  opponentRouteProgress?: number;
}

const RaceNotifications: React.FC<RaceNotificationsProps> = ({ 
  modelId, 
  isRacing,
  routeProgress,
  opponentRouteProgress = 0
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const opponentColor = isRat ? 'blue' : 'amber';
  
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'checkpoint' | 'start' | 'complete' | 'reset' | 'nasdaq' | 'lead' | 'behind';
    message: string;
    icon: React.ReactNode;
    timestamp: number;
    color?: string;
  }>>([]);
  
  // Listen for race events
  useEffect(() => {
    const handleCheckpoint = (e: CustomEvent) => {
      const { checkpoint } = e.detail;
      const checkpointNumber = Math.round(checkpoint * 5);
      
      setNotifications(prev => [
        ...prev,
        {
          id: `checkpoint-${Date.now()}`,
          type: 'checkpoint',
          message: `Checkpoint ${checkpointNumber} reached!`,
          icon: <Flag className="h-5 w-5" />,
          timestamp: Date.now()
        }
      ]);
    };
    
    const handleRaceStart = () => {
      setNotifications(prev => [
        ...prev,
        {
          id: `start-${Date.now()}`,
          type: 'start',
          message: 'Race started! Heading to NASDAQ building.',
          icon: <Clock className="h-5 w-5" />,
          timestamp: Date.now()
        }
      ]);
    };
    
    const handleRaceComplete = (e: CustomEvent) => {
      const { winner } = e.detail;
      
      let message = '';
      let color = '';
      
      if (winner === 'player') {
        message = 'You won the race! Congratulations!';
        color = primaryColor;
      } else if (winner === 'opponent') {
        message = 'Your opponent won the race!';
        color = opponentColor;
      } else {
        message = "It's a tie! Both racers finished at the same time!";
        color = 'purple';
      }
      
      setNotifications(prev => [
        ...prev,
        {
          id: `complete-${Date.now()}`,
          type: 'complete',
          message,
          icon: <Award className="h-5 w-5" />,
          timestamp: Date.now(),
          color
        }
      ]);
    };
    
    const handleRaceReset = () => {
      setNotifications(prev => [
        ...prev,
        {
          id: `reset-${Date.now()}`,
          type: 'reset',
          message: 'Race reset',
          icon: <Clock className="h-5 w-5" />,
          timestamp: Date.now()
        }
      ]);
    };
    
    // Add event listeners
    window.addEventListener('checkpoint-passed', handleCheckpoint as EventListener);
    window.addEventListener('race-start', handleRaceStart);
    window.addEventListener('race-complete', handleRaceComplete as EventListener);
    window.addEventListener('race-reset', handleRaceReset);
    
    return () => {
      // Remove event listeners
      window.removeEventListener('checkpoint-passed', handleCheckpoint as EventListener);
      window.removeEventListener('race-start', handleRaceStart);
      window.removeEventListener('race-complete', handleRaceComplete as EventListener);
      window.removeEventListener('race-reset', handleRaceReset);
    };
  }, [primaryColor, opponentColor]);
  
  // Check for lead changes
  useEffect(() => {
    if (!isRacing || opponentRouteProgress === undefined) return;
    
    const progressDifference = routeProgress - opponentRouteProgress;
    const significantLead = 0.1; // 10% lead is considered significant
    
    // Only notify about significant lead changes
    if (progressDifference > significantLead) {
      // Player is significantly ahead
      setNotifications(prev => {
        // Check if we already have a recent lead notification
        const hasRecentLead = prev.some(n => 
          n.type === 'lead' && 
          Date.now() - n.timestamp < 5000
        );
        
        if (hasRecentLead) return prev;
        
        return [
          ...prev,
          {
            id: `lead-${Date.now()}`,
            type: 'lead',
            message: isRat 
              ? 'Your calculations are paying off! You have a significant lead!' 
              : 'Your intuition is giving you an edge! You have a significant lead!',
            icon: <Medal className="h-5 w-5" />,
            timestamp: Date.now(),
            color: primaryColor
          }
        ];
      });
    } else if (progressDifference < -significantLead) {
      // Opponent is significantly ahead
      setNotifications(prev => {
        // Check if we already have a recent behind notification
        const hasRecentBehind = prev.some(n => 
          n.type === 'behind' && 
          Date.now() - n.timestamp < 5000
        );
        
        if (hasRecentBehind) return prev;
        
        return [
          ...prev,
          {
            id: `behind-${Date.now()}`,
            type: 'behind',
            message: isRat 
              ? 'The Pigeon is flying ahead! You need to optimize your calculations!' 
              : 'The Rat is calculating faster! You need to trust your instincts more!',
            icon: <Medal className="h-5 w-5" />,
            timestamp: Date.now(),
            color: opponentColor
          }
        ];
      });
    }
  }, [isRacing, routeProgress, opponentRouteProgress, isRat, primaryColor, opponentColor]);
  
  // Remove notifications after they've been displayed
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notification => now - notification.timestamp < 3000)
      );
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Show race completion notification when reaching the end
  useEffect(() => {
    if (routeProgress >= 0.99) {
      setNotifications(prev => {
        // Check if we already have a completion notification
        if (prev.some(n => n.type === 'complete')) return prev;
        
        return [
          ...prev,
          {
            id: `complete-${Date.now()}`,
            type: 'complete',
            message: 'Race completed! Arrived at NASDAQ building.',
            icon: <Medal className="h-5 w-5" />,
            timestamp: Date.now(),
            color: primaryColor
          }
        ];
      });
    }
    
    // Add NASDAQ notification when approaching the end
    if (routeProgress >= 0.8 && routeProgress < 0.9) {
      setNotifications(prev => {
        // Check if we already have a NASDAQ notification
        if (prev.some(n => n.type === 'nasdaq')) return prev;
        
        return [
          ...prev,
          {
            id: `nasdaq-${Date.now()}`,
            type: 'nasdaq',
            message: 'NASDAQ building in sight! Almost there.',
            icon: <Building className="h-5 w-5" />,
            timestamp: Date.now()
          }
        ];
      });
    }
  }, [routeProgress, primaryColor]);
  
  return (
    <div className="absolute top-6 right-6 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            className={`bg-${notification.color || primaryColor}-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="mr-2">
              {notification.icon}
            </div>
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RaceNotifications;