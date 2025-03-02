import { useState, useEffect, useRef } from 'react';
import { RacerPosition } from '../types';

interface UseObstaclesProps {
  modelId: string;
  isRacing: boolean;
  performance: {
    speed: number;
    accuracy: number;
    adaptability: number;
  };
  setCurrentSpeed: (speed: number) => void;
  currentSpeed: number;
  setOpponentSpeed: (speed: number) => void;
  opponentSpeed: number;
  racerPosition: RacerPosition;
  opponentPosition: RacerPosition;
  routeProgress: number;
  opponentRouteProgress: number;
  setRouteProgress: (progress: number) => void;
  setOpponentRouteProgress: (progress: number) => void;
  interpolatePosition: (progress: number, route?: number[][]) => RacerPosition;
  setRacerPosition: (position: RacerPosition) => void;
  setOpponentPosition: (position: RacerPosition) => void;
  triggerReroute: (isOpponent: boolean) => void;
}

interface ObstacleEffects {
  construction: boolean;
  pigeons: boolean;
  dataOverflow: boolean;
  traffic: boolean;
  shortcut: boolean;
}

const useObstacles = ({
  modelId,
  isRacing,
  performance,
  setCurrentSpeed,
  currentSpeed,
  setOpponentSpeed,
  opponentSpeed,
  racerPosition,
  opponentPosition,
  routeProgress,
  opponentRouteProgress,
  setRouteProgress,
  setOpponentRouteProgress,
  interpolatePosition,
  setRacerPosition,
  setOpponentPosition,
  triggerReroute
}: UseObstaclesProps) => {
  const isRat = modelId === 'dbrx';
  
  // Active obstacle effects
  const [activeEffects, setActiveEffects] = useState<ObstacleEffects>({
    construction: false,
    pigeons: false,
    dataOverflow: false,
    traffic: false,
    shortcut: false
  });
  
  // Timers for obstacle effects
  const constructionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pigeonsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataOverflowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trafficTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shortcutTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset obstacles when race ends
  useEffect(() => {
    if (!isRacing) {
      // Clear all active effects
      setActiveEffects({
        construction: false,
        pigeons: false,
        dataOverflow: false,
        traffic: false,
        shortcut: false
      });
      
      // Clear all timers
      if (constructionTimerRef.current) {
        clearTimeout(constructionTimerRef.current);
        constructionTimerRef.current = null;
      }
      
      if (pigeonsTimerRef.current) {
        clearTimeout(pigeonsTimerRef.current);
        pigeonsTimerRef.current = null;
      }
      
      if (dataOverflowTimerRef.current) {
        clearTimeout(dataOverflowTimerRef.current);
        dataOverflowTimerRef.current = null;
      }
      
      if (trafficTimerRef.current) {
        clearTimeout(trafficTimerRef.current);
        trafficTimerRef.current = null;
      }
      
      if (shortcutTimerRef.current) {
        clearTimeout(shortcutTimerRef.current);
        shortcutTimerRef.current = null;
      }
    }
  }, [isRacing]);
  
  // Handle obstacle appearance
  const handleObstacleAppear = (type: 'construction' | 'pigeons' | 'dataOverflow' | 'traffic' | 'shortcut') => {
    if (!isRacing) return;
    
    // Apply obstacle effect based on type
    switch (type) {
      case 'construction':
        handleConstructionObstacle();
        break;
      case 'pigeons':
        handlePigeonsObstacle();
        break;
      case 'dataOverflow':
        handleDataOverflowObstacle();
        break;
      case 'traffic':
        handleTrafficObstacle();
        break;
      case 'shortcut':
        handleShortcutObstacle();
        break;
    }
    
    // Create a custom event for the obstacle
    const obstacleEvent = new CustomEvent('obstacle-appeared', {
      detail: { 
        type,
        modelId,
        performance
      }
    });
    window.dispatchEvent(obstacleEvent);
  };
  
  // Construction obstacle - forces rerouting
  const handleConstructionObstacle = () => {
    // Clear any existing construction effect
    if (constructionTimerRef.current) {
      clearTimeout(constructionTimerRef.current);
    }
    
    // Set construction effect
    setActiveEffects(prev => ({ ...prev, construction: true }));
    
    // Trigger reroute based on accuracy
    // Higher accuracy = better at finding alternative routes
    if (performance.accuracy > 50) {
      triggerReroute(false); // Reroute the player
    } else {
      // If accuracy is low, just slow down instead of rerouting
      const slowedSpeed = currentSpeed * 0.5;
      setCurrentSpeed(slowedSpeed);
      
      // After 3 seconds, return to normal speed
      constructionTimerRef.current = setTimeout(() => {
        setCurrentSpeed(slowedSpeed / 0.5);
      }, 3000);
    }
    
    // After 4 seconds, end the construction effect
    constructionTimerRef.current = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, construction: false }));
      constructionTimerRef.current = null;
    }, 4000);
  };
  
  // Pigeons obstacle - distracts the pigeon AI
  const handlePigeonsObstacle = () => {
    // Clear any existing pigeons effect
    if (pigeonsTimerRef.current) {
      clearTimeout(pigeonsTimerRef.current);
    }
    
    // Set pigeons effect
    setActiveEffects(prev => ({ ...prev, pigeons: true }));
    
    // Effect depends on whether the AI is a rat or pigeon
    if (!isRat) {
      // Pigeon gets distracted by other pigeons
      const slowedSpeed = currentSpeed * 0.6;
      setCurrentSpeed(slowedSpeed);
      
      // After 3 seconds, return to normal speed
      pigeonsTimerRef.current = setTimeout(() => {
        setCurrentSpeed(slowedSpeed / 0.6);
      }, 3000);
    } else {
      // Rat is mostly unaffected by pigeons
      // Maybe just a tiny slowdown
      const slowedSpeed = currentSpeed * 0.9;
      setCurrentSpeed(slowedSpeed);
      
      // After 1 second, return to normal speed
      pigeonsTimerRef.current = setTimeout(() => {
        setCurrentSpeed(slowedSpeed / 0.9);
      }, 1000);
    }
    
    // After 4 seconds, end the pigeons effect
    pigeonsTimerRef.current = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, pigeons: false }));
      pigeonsTimerRef.current = null;
    }, 4000);
  };
  
  // Data overflow obstacle - computational bottleneck
  const handleDataOverflowObstacle = () => {
    // Clear any existing data overflow effect
    if (dataOverflowTimerRef.current) {
      clearTimeout(dataOverflowTimerRef.current);
    }
    
    // Set data overflow effect
    setActiveEffects(prev => ({ ...prev, dataOverflow: true }));
    
    // Effect depends on adaptability
    // Higher adaptability = better at handling unexpected data
    const adaptabilityFactor = performance.adaptability / 100;
    const slowdownFactor = 0.3 + (adaptabilityFactor * 0.4); // 0.3 to 0.7 range
    
    const slowedSpeed = currentSpeed * slowdownFactor;
    setCurrentSpeed(slowedSpeed);
    
    // After 3 seconds, return to normal speed
    dataOverflowTimerRef.current = setTimeout(() => {
      setCurrentSpeed(slowedSpeed / slowdownFactor);
    }, 3000);
    
    // After 4 seconds, end the data overflow effect
    dataOverflowTimerRef.current = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, dataOverflow: false }));
      dataOverflowTimerRef.current = null;
    }, 4000);
  };
  
  // Traffic obstacle - congestion
  const handleTrafficObstacle = () => {
    // Clear any existing traffic effect
    if (trafficTimerRef.current) {
      clearTimeout(trafficTimerRef.current);
    }
    
    // Set traffic effect
    setActiveEffects(prev => ({ ...prev, traffic: true }));
    
    // Effect depends on speed preference
    // Higher speed = more likely to force through (risky)
    if (performance.speed > 70) {
      // High speed AI tries to force through
      // 30% chance of getting stuck (big slowdown)
      if (Math.random() < 0.3) {
        // Got stuck!
        const slowedSpeed = currentSpeed * 0.2;
        setCurrentSpeed(slowedSpeed);
        
        // After 4 seconds, return to normal speed
        trafficTimerRef.current = setTimeout(() => {
          setCurrentSpeed(slowedSpeed / 0.2);
        }, 4000);
      } else {
        // Made it through with minimal slowdown
        const slowedSpeed = currentSpeed * 0.8;
        setCurrentSpeed(slowedSpeed);
        
        // After 2 seconds, return to normal speed
        trafficTimerRef.current = setTimeout(() => {
          setCurrentSpeed(slowedSpeed / 0.8);
        }, 2000);
      }
    } else {
      // Lower speed AI takes a cautious approach
      const slowedSpeed = currentSpeed * 0.6;
      setCurrentSpeed(slowedSpeed);
      
      // After 3 seconds, return to normal speed
      trafficTimerRef.current = setTimeout(() => {
        setCurrentSpeed(slowedSpeed / 0.6);
      }, 3000);
    }
    
    // After 4 seconds, end the traffic effect
    trafficTimerRef.current = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, traffic: false }));
      trafficTimerRef.current = null;
    }, 4000);
  };
  
  // Shortcut obstacle - faster path
  const handleShortcutObstacle = () => {
    // Clear any existing shortcut effect
    if (shortcutTimerRef.current) {
      clearTimeout(shortcutTimerRef.current);
    }
    
    // Set shortcut effect
    setActiveEffects(prev => ({ ...prev, shortcut: true }));
    
    // Shortcut gives a progress boost
    const progressBoost = 0.05; // 5% boost
    const newProgress = Math.min(1, routeProgress + progressBoost);
    setRouteProgress(newProgress);
    
    // Update position to the new point
    const newPosition = interpolatePosition(newProgress);
    setRacerPosition(newPosition);
    
    // After 4 seconds, end the shortcut effect
    shortcutTimerRef.current = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, shortcut: false }));
      shortcutTimerRef.current = null;
    }, 4000);
  };
  
  return {
    activeEffects,
    handleObstacleAppear
  };
};

export default useObstacles;