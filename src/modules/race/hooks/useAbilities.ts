import { useState, useEffect, useRef } from 'react';
import { RacerPosition } from '../types';

interface UseAbilitiesProps {
  modelId: string;
  isRacing: boolean;
  setCurrentSpeed: (speed: number) => void;
  setOpponentSpeed: (speed: number) => void;
  currentSpeed: number;
  opponentSpeed: number;
  racerPosition: RacerPosition;
  opponentPosition: RacerPosition;
  routeProgress: number;
  opponentRouteProgress: number;
  selectedRoute: number[][];
  opponentRoute: number[][];
  interpolatePosition: (progress: number, route?: number[][]) => RacerPosition;
  setRacerPosition: (position: RacerPosition) => void;
  setOpponentPosition: (position: RacerPosition) => void;
  setRouteProgress: (progress: number) => void;
  setOpponentRouteProgress: (progress: number) => void;
}

interface AbilityEffects {
  speedBoost: boolean;
  dataFlood: boolean;
  pathOptimization: boolean;
}

interface AbilityCooldowns {
  speed: number;
  attack: number;
  optimize: number;
}

const useAbilities = ({
  modelId,
  isRacing,
  setCurrentSpeed,
  setOpponentSpeed,
  currentSpeed,
  opponentSpeed,
  racerPosition,
  opponentPosition,
  routeProgress,
  opponentRouteProgress,
  selectedRoute,
  opponentRoute,
  interpolatePosition,
  setRacerPosition,
  setOpponentPosition,
  setRouteProgress,
  setOpponentRouteProgress
}: UseAbilitiesProps) => {
  // Ability cooldowns in seconds
  const [cooldowns, setCooldowns] = useState<AbilityCooldowns>({
    speed: 0,
    attack: 0,
    optimize: 0
  });
  
  // Active ability effects
  const [activeEffects, setActiveEffects] = useState<AbilityEffects>({
    speedBoost: false,
    dataFlood: false,
    pathOptimization: false
  });
  
  // Timers for ability effects
  const speedBoostTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataFloodTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathOptimizationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cooldown interval
  useEffect(() => {
    if (!isRacing) return;
    
    const interval = setInterval(() => {
      setCooldowns(prev => ({
        speed: Math.max(0, prev.speed - 1),
        attack: Math.max(0, prev.attack - 1),
        optimize: Math.max(0, prev.optimize - 1)
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRacing]);
  
  // Reset abilities when race ends
  useEffect(() => {
    if (!isRacing) {
      // Clear all active effects
      setActiveEffects({
        speedBoost: false,
        dataFlood: false,
        pathOptimization: false
      });
      
      // Clear all timers
      if (speedBoostTimerRef.current) {
        clearTimeout(speedBoostTimerRef.current);
        speedBoostTimerRef.current = null;
      }
      
      if (dataFloodTimerRef.current) {
        clearTimeout(dataFloodTimerRef.current);
        dataFloodTimerRef.current = null;
      }
      
      if (pathOptimizationTimerRef.current) {
        clearTimeout(pathOptimizationTimerRef.current);
        pathOptimizationTimerRef.current = null;
      }
    }
  }, [isRacing]);
  
  // Handle ability activation
  const activateAbility = (abilityType: 'speed' | 'attack' | 'optimize', targetSelf: boolean) => {
    if (!isRacing) return;
    
    // Check if ability is on cooldown
    if (cooldowns[abilityType] > 0) return;
    
    // Set cooldown
    setCooldowns(prev => ({
      ...prev,
      [abilityType]: 10 // 10 seconds cooldown
    }));
    
    // Trigger ability effect
    switch (abilityType) {
      case 'speed':
        activateSpeedBoost();
        break;
      case 'attack':
        activateDataFlood();
        break;
      case 'optimize':
        activatePathOptimization();
        break;
    }
    
    // Create a custom event for the ability activation
    const abilityEvent = new CustomEvent('ability-activated', {
      detail: { 
        type: abilityType, 
        targetSelf,
        modelId
      }
    });
    window.dispatchEvent(abilityEvent);
  };
  
  // Speed boost ability
  const activateSpeedBoost = () => {
    // Clear any existing speed boost
    if (speedBoostTimerRef.current) {
      clearTimeout(speedBoostTimerRef.current);
    }
    
    // Set speed boost effect
    setActiveEffects(prev => ({ ...prev, speedBoost: true }));
    
    // Double the current speed
    const boostedSpeed = currentSpeed * 2;
    setCurrentSpeed(boostedSpeed);
    
    // After 5 seconds, end the speed boost
    speedBoostTimerRef.current = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, speedBoost: false }));
      
      // Return to normal speed
      setCurrentSpeed(boostedSpeed / 2);
      
      // 20% chance of miscalculation (slight deviation from path)
      if (Math.random() < 0.2) {
        // Simulate a miscalculation by adding a random deviation to the current position
        const deviation = 0.0001; // Small deviation
        const newPosition = {
          ...racerPosition,
          longitude: racerPosition.longitude + (Math.random() * 2 - 1) * deviation,
          latitude: racerPosition.latitude + (Math.random() * 2 - 1) * deviation
        };
        setRacerPosition(newPosition);
        
        // Create a custom event for the miscalculation
        const miscalculationEvent = new CustomEvent('ability-miscalculation', {
          detail: { 
            type: 'speed',
            modelId
          }
        });
        window.dispatchEvent(miscalculationEvent);
      }
      
      speedBoostTimerRef.current = null;
    }, 5000);
  };
  
  // Data flood ability (opponent slowdown)
  const activateDataFlood = () => {
    // Clear any existing data flood
    if (dataFloodTimerRef.current) {
      clearTimeout(dataFloodTimerRef.current);
    }
    
    // Set data flood effect
    setActiveEffects(prev => ({ ...prev, dataFlood: true }));
    
    // Slow down the opponent by 70%
    const slowedSpeed = opponentSpeed * 0.3;
    setOpponentSpeed(slowedSpeed);
    
    // After 3 seconds, end the data flood
    dataFloodTimerRef.current = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, dataFlood: false }));
      
      // Return to normal speed
      setOpponentSpeed(slowedSpeed / 0.3);
      
      dataFloodTimerRef.current = null;
    }, 3000);
  };
  
  // Path optimization ability
  const activatePathOptimization = () => {
    // Clear any existing path optimization
    if (pathOptimizationTimerRef.current) {
      clearTimeout(pathOptimizationTimerRef.current);
    }
    
    // Set path optimization effect
    setActiveEffects(prev => ({ ...prev, pathOptimization: true }));
    
    // After 2 seconds, end the path optimization effect and apply the optimization
    pathOptimizationTimerRef.current = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, pathOptimization: false }));
      
      // Simulate path optimization by skipping ahead slightly
      // This represents finding a better route
      const optimizationBoost = 0.05; // Skip ahead 5% of the route
      const newProgress = Math.min(1, routeProgress + optimizationBoost);
      setRouteProgress(newProgress);
      
      // Update position to the new optimized point
      const newPosition = interpolatePosition(newProgress);
      setRacerPosition(newPosition);
      
      pathOptimizationTimerRef.current = null;
    }, 2000);
  };
  
  return {
    cooldowns,
    activeEffects,
    activateAbility
  };
};

export default useAbilities;