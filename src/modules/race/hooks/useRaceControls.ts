import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { calculateCameraPosition } from '../utils/cameraUtils';
import { RacerPosition } from '../types';

const useRaceControls = (
  parameters: any, 
  racerPosition: RacerPosition,
  setRacerPosition: (position: RacerPosition) => void,
  opponentPosition: RacerPosition,
  setOpponentPosition: (position: RacerPosition) => void,
  interpolatePosition: (progress: number, route?: number[][]) => RacerPosition,
  cameraTarget: React.RefObject<THREE.Vector3>,
  mapRef: React.RefObject<mapboxgl.Map>,
  routeProgress: number,
  setRouteProgress: (progress: number) => void,
  opponentRouteProgress: number,
  setOpponentRouteProgress: (progress: number) => void,
  opponentRoute: number[][],
  setRaceWinner: (winner: string | null) => void,
  setRaceFinished: (finished: boolean) => void,
  resetRace: () => void
) => {
  const [isRacing, setIsRacing] = useState(false);
  const [cameraMode, setCameraMode] = useState<'thirdPerson' | 'firstPerson'>('thirdPerson');
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [currentSpeed, setCurrentSpeed] = useState(0.2); // Reduced default speed
  const [opponentSpeed, setOpponentSpeed] = useState(0.2); // Opponent speed
  
  // Track checkpoints for events
  const checkpointsRef = useRef<number[]>([0.2, 0.4, 0.6, 0.8, 1.0]);
  const passedCheckpointsRef = useRef<Set<number>>(new Set());
  
  // Track obstruction events
  const [isObstructed, setIsObstructed] = useState(false);
  const [obstructionType, setObstructionType] = useState<'blocked' | 'rerouting' | 'evading' | null>(null);
  const [obstructionTimer, setObstructionTimer] = useState<NodeJS.Timeout | null>(null);
  const lastObstructionTimeRef = useRef<number>(0);
  const obstructionCooldownMs = 8000; // 8 seconds cooldown between obstructions
  
  // Track rerouting state
  const [isRerouting, setIsRerouting] = useState(false);
  const [rerouteProgress, setRerouteProgress] = useState(0);
  const [rerouteStartPoint, setRerouteStartPoint] = useState<RacerPosition | null>(null);
  const [rerouteEndPoint, setRerouteEndPoint] = useState<RacerPosition | null>(null);
  const [rerouteStartProgress, setRerouteStartProgress] = useState(0);
  
  // Track opponent obstruction state
  const [isOpponentObstructed, setIsOpponentObstructed] = useState(false);
  const [opponentObstructionType, setOpponentObstructionType] = useState<'blocked' | 'rerouting' | 'evading' | null>(null);
  
  // Smoothing for position updates to reduce jitter
  const positionSmoothingFactor = 0.85; // Higher value = more smoothing
  const lastPositionRef = useRef<RacerPosition>(racerPosition);
  const lastOpponentPositionRef = useRef<RacerPosition>(opponentPosition);
  
  // Dynamic speed calculation based on performance parameters
  const calculateDynamicSpeed = (isOpponent = false) => {
    const { speed, accuracy, adaptability } = parameters.performance || { speed: 50, accuracy: 50, adaptability: 50 };
    
    // Base speed from the speed parameter (0.05 to 0.3) - significantly reduced for better control
    // Higher speed parameter = faster base speed
    let baseSpeed = 0.05 + (speed / 100) * 0.25;
    
    // Random fluctuations based on adaptability (lower adaptability = more random fluctuations)
    // Reduce fluctuation amount to minimize jitter
    const randomFactor = (100 - adaptability) / 100;
    const fluctuation = (Math.random() * 2 - 1) * randomFactor * 0.02; // Reduced fluctuation by 60%
    
    // Accuracy affects how consistent the speed is (higher accuracy = more consistent)
    const consistencyFactor = accuracy / 100;
    const smoothedFluctuation = fluctuation * (1 - consistencyFactor);
    
    // Calculate final speed
    let finalSpeed = baseSpeed + smoothedFluctuation;
    
    // For opponent, add a slight variation to make the race more interesting
    if (isOpponent) {
      // Opponent speed varies slightly from the player's model
      const opponentVariation = (Math.random() * 0.05) - 0.025; // Reduced variation by 50%
      finalSpeed += opponentVariation;
      
      // Make the opponent slightly faster or slower based on the player's performance
      // This creates a more competitive race
      const playerPerformanceAvg = (speed + accuracy + adaptability) / 300; // 0 to 1 scale
      const competitiveFactor = 0.1 * (0.5 - playerPerformanceAvg); // -0.05 to 0.05
      finalSpeed += competitiveFactor;
    }
    
    // Apply obstruction penalty if currently obstructed
    if ((isObstructed && !isOpponent) || (isOpponentObstructed && isOpponent)) {
      finalSpeed *= 0.5; // 50% speed reduction when obstructed
    }
    
    // Apply rerouting penalty if currently rerouting
    if (isRerouting && !isOpponent) {
      finalSpeed *= 0.7; // 30% speed reduction when rerouting
    }
    
    // Ensure speed is within reasonable bounds
    finalSpeed = Math.max(0.03, Math.min(0.4, finalSpeed)); // Reduced max speed
    
    return finalSpeed;
  };
  
  // Calculate path adherence based on accuracy parameter
  const calculatePathAdherence = () => {
    const { accuracy } = parameters.performance || { accuracy: 50 };
    
    // Higher accuracy = better path adherence
    // Returns a value between 0 (poor adherence) and 1 (perfect adherence)
    return Math.min(1, accuracy / 100);
  };
  
  // Calculate obstacle avoidance based on adaptability parameter
  const calculateObstacleAvoidance = () => {
    const { adaptability } = parameters.performance || { adaptability: 50 };
    
    // Higher adaptability = better obstacle avoidance
    // Returns a value between 0 (poor avoidance) and 1 (perfect avoidance)
    return Math.min(1, adaptability / 100);
  };
  
  // Check if racers are close enough to interfere with each other
  const checkForObstruction = () => {
    if (!isRacing) return false;
    
    // Don't check for obstructions if we're in cooldown period
    const now = Date.now();
    if (now - lastObstructionTimeRef.current < obstructionCooldownMs) {
      return false;
    }
    
    // Don't check for obstructions if already rerouting
    if (isRerouting) {
      return false;
    }
    
    // Calculate distance between racers
    const distance = calculateDistance(
      racerPosition.longitude, 
      racerPosition.latitude,
      opponentPosition.longitude,
      opponentPosition.latitude
    );
    
    // Define threshold for obstruction (in degrees of longitude/latitude)
    const obstructionThreshold = 0.0002; // Approximately 20 meters
    
    // Check if racers are close enough for potential obstruction
    if (distance < obstructionThreshold) {
      // Calculate relative progress difference to determine who's ahead
      const progressDifference = routeProgress - opponentRouteProgress;
      
      // Calculate crossing paths - are they moving in different directions?
      const racerHeading = racerPosition.rotation;
      const opponentHeading = opponentPosition.rotation;
      const headingDifference = Math.abs(racerHeading - opponentHeading);
      const pathsCrossing = headingDifference > 45 && headingDifference < 135;
      
      // Calculate probability of obstruction based on adaptability
      const adaptability = parameters.performance?.adaptability || 50;
      const obstructionProbability = 0.8 - (adaptability / 100) * 0.6; // 0.2 to 0.8 range
      
      // Random chance based on adaptability and proximity
      if (Math.random() < obstructionProbability) {
        // Determine obstruction type based on situation
        let type: 'blocked' | 'rerouting' | 'evading' = 'blocked';
        
        if (pathsCrossing) {
          type = 'evading';
        } else if (Math.abs(progressDifference) < 0.05) {
          // They're neck and neck
          type = Math.random() > 0.5 ? 'blocked' : 'rerouting';
        } else if (progressDifference > 0) {
          // Player is ahead, opponent might block
          type = 'blocked';
        } else {
          // Opponent is ahead, player needs to reroute
          type = 'rerouting';
        }
        
        // Trigger obstruction for player
        triggerObstruction(type);
        
        // Also trigger obstruction for opponent with 70% probability
        if (Math.random() < 0.7) {
          // Opponent gets a different obstruction type
          let opponentType: 'blocked' | 'rerouting' | 'evading';
          
          if (type === 'blocked') {
            opponentType = 'evading';
          } else if (type === 'rerouting') {
            opponentType = 'blocked';
          } else {
            opponentType = 'rerouting';
          }
          
          triggerOpponentObstruction(opponentType);
        }
        
        return true;
      }
    }
    
    return false;
  };
  
  // Calculate distance between two geographic points
  const calculateDistance = (lon1: number, lat1: number, lon2: number, lat2: number): number => {
    // Simple Euclidean distance for small distances
    const x = lon2 - lon1;
    const y = lat2 - lat1;
    return Math.sqrt(x * x + y * y);
  };
  
  // Trigger an obstruction event for the player
  const triggerObstruction = (type: 'blocked' | 'rerouting' | 'evading') => {
    // Set obstruction state
    setIsObstructed(true);
    setObstructionType(type);
    lastObstructionTimeRef.current = Date.now();
    
    // Create a custom event for the obstruction
    const obstructionEvent = new CustomEvent('path-obstruction', {
      detail: { type, time: Date.now() }
    });
    window.dispatchEvent(obstructionEvent);
    
    // Clear any existing obstruction timer
    if (obstructionTimer) {
      clearTimeout(obstructionTimer);
    }
    
    // If rerouting, set up reroute parameters
    if (type === 'rerouting') {
      setIsRerouting(true);
      setRerouteProgress(0);
      setRerouteStartPoint(racerPosition);
      setRerouteStartProgress(routeProgress);
      
      // Calculate a point ahead on the route to rejoin
      const rejoinProgress = Math.min(1, routeProgress + 0.05);
      const rejoinPoint = interpolatePosition(rejoinProgress);
      setRerouteEndPoint(rejoinPoint);
    }
    
    // Set a timer to clear the obstruction
    const duration = type === 'blocked' ? 3000 : type === 'rerouting' ? 4000 : 2000;
    const timer = setTimeout(() => {
      setIsObstructed(false);
      setObstructionType(null);
      
      // If rerouting, we'll clear that separately when the reroute is complete
      if (type !== 'rerouting') {
        setIsRerouting(false);
      }
    }, duration);
    
    setObstructionTimer(timer);
  };
  
  // Trigger an obstruction event for the opponent
  const triggerOpponentObstruction = (type: 'blocked' | 'rerouting' | 'evading') => {
    setIsOpponentObstructed(true);
    setOpponentObstructionType(type);
    
    // Create a custom event for the opponent obstruction
    const opponentObstructionEvent = new CustomEvent('opponent-obstruction', {
      detail: { type, time: Date.now() }
    });
    window.dispatchEvent(opponentObstructionEvent);
    
    // Set a timer to clear the obstruction
    const duration = type === 'blocked' ? 3000 : type === 'rerouting' ? 4000 : 2000;
    setTimeout(() => {
      setIsOpponentObstructed(false);
      setOpponentObstructionType(null);
    }, duration);
  };
  
  // Trigger a reroute manually (for abilities or obstacles)
  const triggerReroute = (isOpponent: boolean) => {
    if (isOpponent) {
      triggerOpponentObstruction('rerouting');
    } else {
      triggerObstruction('rerouting');
    }
  };
  
  // Interpolate between two points for rerouting
  const interpolateReroute = (
    startPoint: RacerPosition,
    endPoint: RacerPosition,
    progress: number
  ): RacerPosition => {
    // Linear interpolation between start and end points
    const longitude = startPoint.longitude + (endPoint.longitude - startPoint.longitude) * progress;
    const latitude = startPoint.latitude + (endPoint.latitude - startPoint.latitude) * progress;
    
    // Calculate rotation based on direction
    const dx = endPoint.longitude - startPoint.longitude;
    const dy = endPoint.latitude - startPoint.latitude;
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Interpolate 3D coordinates
    const x = startPoint.x + (endPoint.x - startPoint.x) * progress;
    const y = startPoint.y + (endPoint.y - startPoint.y) * progress;
    const z = startPoint.z + (endPoint.z - startPoint.z) * progress;
    
    return {
      longitude,
      latitude,
      rotation,
      x,
      y,
      z
    };
  };
  
  // Apply position smoothing to reduce jitter
  const smoothPosition = (
    currentPosition: RacerPosition,
    newPosition: RacerPosition
  ): RacerPosition => {
    // Apply smoothing factor to reduce jitter
    return {
      longitude: currentPosition.longitude * positionSmoothingFactor + newPosition.longitude * (1 - positionSmoothingFactor),
      latitude: currentPosition.latitude * positionSmoothingFactor + newPosition.latitude * (1 - positionSmoothingFactor),
      rotation: newPosition.rotation, // Don't smooth rotation to avoid lag in direction changes
      x: currentPosition.x * positionSmoothingFactor + newPosition.x * (1 - positionSmoothingFactor),
      y: currentPosition.y * positionSmoothingFactor + newPosition.y * (1 - positionSmoothingFactor),
      z: currentPosition.z * positionSmoothingFactor + newPosition.z * (1 - positionSmoothingFactor)
    };
  };
  
  // Update racer position based on dynamic speed and performance parameters
  const updateRacerPosition = () => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
    setLastUpdateTime(now);
    
    // Update speed with some randomness based on performance parameters
    if (Math.random() < 0.05) { // Only update speed occasionally for smoother movement
      const newSpeed = calculateDynamicSpeed();
      setCurrentSpeed(newSpeed);
      
      // Store the current speed in parameters for other components to use
      parameters.currentSpeed = newSpeed;
      
      const newOpponentSpeed = calculateDynamicSpeed(true);
      setOpponentSpeed(newOpponentSpeed);
      
      // Store the opponent speed in parameters for other components to use
      parameters.opponentSpeed = newOpponentSpeed;
    }
    
    // Check for potential obstructions between racers
    checkForObstruction();
    
    // Handle rerouting if active
    if (isRerouting && rerouteStartPoint && rerouteEndPoint) {
      // Update reroute progress
      const rerouteSpeed = 0.5; // Rerouting happens faster than normal movement
      const newRerouteProgress = Math.min(1, rerouteProgress + deltaTime * rerouteSpeed);
      setRerouteProgress(newRerouteProgress);
      
      // Calculate position along reroute path
      const reroutedPosition = interpolateReroute(
        rerouteStartPoint,
        rerouteEndPoint,
        newRerouteProgress
      );
      
      // Apply smoothing to reduce jitter
      const smoothedPosition = smoothPosition(lastPositionRef.current, reroutedPosition);
      lastPositionRef.current = smoothedPosition;
      
      // Update racer position
      setRacerPosition(smoothedPosition);
      
      // If reroute is complete, return to normal route
      if (newRerouteProgress >= 1) {
        setIsRerouting(false);
        setRerouteProgress(0);
        setRerouteStartPoint(null);
        setRerouteEndPoint(null);
        
        // Update route progress to the rejoin point
        const rejoinProgress = Math.min(1, rerouteStartProgress + 0.05);
        setRouteProgress(rejoinProgress);
      }
      
      // Update camera target
      if (cameraTarget.current) {
        cameraTarget.current.set(smoothedPosition.x, smoothedPosition.y, smoothedPosition.z);
      }
      
      // Update map position if available
      if (mapRef.current) {
        const { offsetLng, offsetLat } = calculateCameraPosition(
          smoothedPosition.longitude, 
          smoothedPosition.latitude, 
          smoothedPosition.rotation
        );
        
        mapRef.current.easeTo({
          center: [offsetLng, offsetLat],
          bearing: smoothedPosition.rotation,
          duration: 100 // Smoother transitions
        });
      }
      
      // Continue with opponent update
      updateOpponentPosition(deltaTime);
      
      return;
    }
    
    // Calculate how much to advance along the route - MUCH slower progression
    // Apply obstruction penalty if currently obstructed
    const speedMultiplier = isObstructed ? 0.3 : 1.0; // 70% speed reduction when obstructed
    const progressIncrement = (deltaTime * currentSpeed * speedMultiplier) / 10; // Adjusted for better control
    const newProgress = Math.min(1, routeProgress + progressIncrement);
    
    // Update route progress
    setRouteProgress(newProgress);
    
    // Get the ideal position on the route
    const idealPosition = interpolatePosition(newProgress);
    
    // Apply path adherence based on accuracy parameter
    // Higher accuracy = closer to the ideal path
    const pathAdherence = calculatePathAdherence();
    
    // Calculate a deviation from the ideal path based on accuracy
    // Lower accuracy = more deviation
    const maxDeviation = 0.00002 * (1 - pathAdherence); // Maximum deviation in degrees
    
    // If obstructed, increase deviation to simulate evasive maneuvers
    const obstructionDeviation = isObstructed ? 0.00005 : 0;
    const totalMaxDeviation = maxDeviation + obstructionDeviation;
    
    // Reduce random deviation to minimize jitter
    // Use a consistent random seed based on progress to make deviations smoother
    const progressSeed = Math.floor(newProgress * 1000);
    const pseudoRandom1 = Math.sin(progressSeed * 0.1) * 0.5 + 0.5;
    const pseudoRandom2 = Math.cos(progressSeed * 0.1) * 0.5 + 0.5;
    
    const longitudeDeviation = (pseudoRandom1 * 2 - 1) * totalMaxDeviation;
    const latitudeDeviation = (pseudoRandom2 * 2 - 1) * totalMaxDeviation;
    
    // Apply the deviation to create a more realistic path
    // Higher accuracy = smaller deviation
    const adjustedPosition = {
      ...idealPosition,
      longitude: idealPosition.longitude + longitudeDeviation,
      latitude: idealPosition.latitude + latitudeDeviation
    };
    
    // Apply smoothing to reduce jitter
    const smoothedPosition = smoothPosition(lastPositionRef.current, adjustedPosition);
    lastPositionRef.current = smoothedPosition;
    
    // Set the racer position with the smoothed coordinates
    setRacerPosition(smoothedPosition);
    
    // Update opponent position
    updateOpponentPosition(deltaTime);
    
    // Update camera target
    if (cameraTarget.current) {
      cameraTarget.current.set(smoothedPosition.x, smoothedPosition.y, smoothedPosition.z);
    }
    
    // Update map position if available
    if (mapRef.current) {
      const { offsetLng, offsetLat } = calculateCameraPosition(
        smoothedPosition.longitude, 
        smoothedPosition.latitude, 
        smoothedPosition.rotation
      );
      
      mapRef.current.easeTo({
        center: [offsetLng, offsetLat],
        bearing: smoothedPosition.rotation,
        duration: 100 // Smoother transitions
      });
    }
  };
  
  // Update opponent position
  const updateOpponentPosition = (deltaTime: number) => {
    // Update opponent progress
    const opponentSpeedMultiplier = isOpponentObstructed ? 0.3 : 1.0;
    const opponentIncrement = (deltaTime * opponentSpeed * opponentSpeedMultiplier) / 10;
    const newOpponentProgress = Math.min(1, opponentRouteProgress + opponentIncrement);
    
    // Check if either racer has reached the finish line
    const playerFinished = routeProgress >= 1;
    const opponentFinished = newOpponentProgress >= 1;
    
    // Determine the winner if the race is finished
    if (playerFinished || opponentFinished) {
      setIsRacing(false);
      setRaceFinished(true);
      
      if (playerFinished && !opponentFinished) {
        // Player wins
        setRaceWinner('player');
      } else if (opponentFinished && !playerFinished) {
        // Opponent wins
        setRaceWinner('opponent');
      } else {
        // It's a tie
        setRaceWinner('tie');
      }
      
      // Set final positions
      setRouteProgress(playerFinished ? 1 : routeProgress);
      setOpponentRouteProgress(opponentFinished ? 1 : newOpponentProgress);
      
      const finalPosition = interpolatePosition(playerFinished ? 1 : routeProgress);
      setRacerPosition(finalPosition);
      
      // Make sure to use the opponent route for opponent position calculation
      const opponentFinalPosition = interpolatePosition(opponentFinished ? 1 : newOpponentProgress, opponentRoute);
      setOpponentPosition(opponentFinalPosition);
      
      // Trigger race completion event
      const raceCompleteEvent = new CustomEvent('race-complete', {
        detail: { 
          winner: playerFinished && !opponentFinished ? 'player' : 
                 opponentFinished && !playerFinished ? 'opponent' : 'tie',
          playerProgress: playerFinished ? 1 : routeProgress,
          opponentProgress: opponentFinished ? 1 : newOpponentProgress
        }
      });
      window.dispatchEvent(raceCompleteEvent);
      
      // Update map position if available
      if (mapRef.current) {
        const { offsetLng, offsetLat } = calculateCameraPosition(
          finalPosition.longitude, 
          finalPosition.latitude, 
          finalPosition.rotation
        );
        
        mapRef.current.flyTo({
          center: [offsetLng, offsetLat],
          zoom: 19.5,
          pitch: 75,
          bearing: finalPosition.rotation,
          duration: 1000
        });
      }
      
      return;
    }
    
    // Update opponent progress
    setOpponentRouteProgress(newOpponentProgress);
    
    // Make sure to use the opponent route for opponent position calculation
    // Apply similar path adherence logic for the opponent
    const idealOpponentPosition = interpolatePosition(newOpponentProgress, opponentRoute);
    
    // Opponent has different path adherence characteristics
    const opponentPathAdherence = isRacing ? Math.random() * 0.3 + 0.7 : 1; // 0.7 to 1.0 range
    const opponentMaxDeviation = 0.00002 * (1 - opponentPathAdherence);
    
    // Use consistent random seed for opponent too
    const opponentProgressSeed = Math.floor(newOpponentProgress * 1000);
    const opponentPseudoRandom1 = Math.sin(opponentProgressSeed * 0.1 + 0.5) * 0.5 + 0.5;
    const opponentPseudoRandom2 = Math.cos(opponentProgressSeed * 0.1 + 0.5) * 0.5 + 0.5;
    
    const opponentLongitudeDeviation = (opponentPseudoRandom1 * 2 - 1) * opponentMaxDeviation;
    const opponentLatitudeDeviation = (opponentPseudoRandom2 * 2 - 1) * opponentMaxDeviation;
    
    const adjustedOpponentPosition = {
      ...idealOpponentPosition,
      longitude: idealOpponentPosition.longitude + opponentLongitudeDeviation,
      latitude: idealOpponentPosition.latitude + opponentLatitudeDeviation
    };
    
    // Apply smoothing to opponent position too
    const smoothedOpponentPosition = smoothPosition(lastOpponentPositionRef.current, adjustedOpponentPosition);
    lastOpponentPositionRef.current = smoothedOpponentPosition;
    
    setOpponentPosition(smoothedOpponentPosition);
  };
  
  // Start/pause race button handler
  const handleStartRace = () => {
    if (isRacing) {
      setIsRacing(false);
      return;
    }
    
    // Reset checkpoints if starting from beginning
    if (routeProgress === 0) {
      passedCheckpointsRef.current.clear();
    }
    
    setIsRacing(true);
    setLastUpdateTime(Date.now());
    
    // Initialize position smoothing references
    lastPositionRef.current = racerPosition;
    lastOpponentPositionRef.current = opponentPosition;
    
    // Zoom in to street level when starting the race
    if (mapRef.current) {
      const { offsetLng, offsetLat } = calculateCameraPosition(
        racerPosition.longitude, 
        racerPosition.latitude, 
        racerPosition.rotation
      );
      
      mapRef.current.flyTo({
        center: [offsetLng, offsetLat],
        zoom: 19.5, // Closer zoom for street-level view
        pitch: 75, // Tilted view for better perspective
        bearing: racerPosition.rotation,
        duration: 1500, // Smooth transition
        essential: true // This animation is considered essential for the user experience
      });
    }
    
    // Trigger race start event
    const raceStartEvent = new CustomEvent('race-start', {
      detail: { startTime: Date.now() }
    });
    window.dispatchEvent(raceStartEvent);
  };
  
  // Reset position button handler
  const handleResetPosition = () => {
    setIsRacing(false);
    setIsObstructed(false);
    setObstructionType(null);
    setIsRerouting(false);
    setRerouteProgress(0);
    setRerouteStartPoint(null);
    setRerouteEndPoint(null);
    setIsOpponentObstructed(false);
    setOpponentObstructionType(null);
    
    if (obstructionTimer) {
      clearTimeout(obstructionTimer);
    }
    
    resetRace();
    passedCheckpointsRef.current.clear();
    lastObstructionTimeRef.current = 0;
    
    // Reset position smoothing references
    const initialPosition = interpolatePosition(0);
    lastPositionRef.current = initialPosition;
    
    const opponentInitialPosition = interpolatePosition(0, opponentRoute);
    lastOpponentPositionRef.current = opponentInitialPosition;
    
    // Trigger race reset event
    const raceResetEvent = new CustomEvent('race-reset');
    window.dispatchEvent(raceResetEvent);
    
    // Reset map position if available
    if (mapRef.current) {
      const { offsetLng, offsetLat } = calculateCameraPosition(
        initialPosition.longitude, 
        initialPosition.latitude, 
        initialPosition.rotation
      );
      
      mapRef.current.flyTo({
        center: [offsetLng, offsetLat],
        zoom: 19.5,
        pitch: 75,
        bearing: initialPosition.rotation,
        duration: 1000
      });
    }
  };
  
  // Toggle camera mode
  const toggleCameraMode = () => {
    setCameraMode(prev => prev === 'thirdPerson' ? 'firstPerson' : 'thirdPerson');
  };
  
  // Move the racer when racing is active using requestAnimationFrame for smoother animation
  useEffect(() => {
    if (!isRacing) return;
    
    let animationFrameId: number;
    
    const animate = () => {
      updateRacerPosition();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRacing, routeProgress, opponentRouteProgress, currentSpeed, opponentSpeed, lastUpdateTime, isObstructed, isRerouting, rerouteProgress]);
  
  // Clean up obstruction timer on unmount
  useEffect(() => {
    return () => {
      if (obstructionTimer) {
        clearTimeout(obstructionTimer);
      }
    };
  }, [obstructionTimer]);
  
  return {
    isRacing,
    cameraMode,
    routeProgress,
    opponentRouteProgress,
    currentSpeed,
    opponentSpeed,
    isObstructed,
    obstructionType,
    isRerouting,
    isOpponentObstructed,
    opponentObstructionType,
    handleStartRace,
    handleResetPosition,
    toggleCameraMode,
    triggerReroute
  };
};

export default useRaceControls;