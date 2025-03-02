import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { calculateCameraPosition } from '../utils/cameraUtils';

interface RacerPosition {
  x: number;
  y: number;
  z: number;
  rotation: number;
  longitude: number;
  latitude: number;
}

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
  
  // Dynamic speed calculation based on performance parameters
  const calculateDynamicSpeed = (isOpponent = false) => {
    const { speed, accuracy, adaptability } = parameters.performance || { speed: 50, accuracy: 50, adaptability: 50 };
    
    // Base speed from the speed parameter (0.05 to 0.3) - significantly reduced for better control
    // Higher speed parameter = faster base speed
    let baseSpeed = 0.05 + (speed / 100) * 0.25;
    
    // Random fluctuations based on adaptability (lower adaptability = more random fluctuations)
    const randomFactor = (100 - adaptability) / 100;
    const fluctuation = (Math.random() * 2 - 1) * randomFactor * 0.05; // Reduced fluctuation
    
    // Accuracy affects how consistent the speed is (higher accuracy = more consistent)
    const consistencyFactor = accuracy / 100;
    const smoothedFluctuation = fluctuation * (1 - consistencyFactor);
    
    // Calculate final speed
    let finalSpeed = baseSpeed + smoothedFluctuation;
    
    // For opponent, add a slight variation to make the race more interesting
    if (isOpponent) {
      // Opponent speed varies slightly from the player's model
      const opponentVariation = (Math.random() * 0.1) - 0.05; // -0.05 to +0.05
      finalSpeed += opponentVariation;
      
      // Make the opponent slightly faster or slower based on the player's performance
      // This creates a more competitive race
      const playerPerformanceAvg = (speed + accuracy + adaptability) / 300; // 0 to 1 scale
      const competitiveFactor = 0.1 * (0.5 - playerPerformanceAvg); // -0.05 to 0.05
      finalSpeed += competitiveFactor;
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
    
    // Calculate how much to advance along the route - MUCH slower progression
    const progressIncrement = (deltaTime * currentSpeed) / 10; // Adjusted for better control
    const newProgress = Math.min(1, routeProgress + progressIncrement);
    
    // Update opponent progress
    const opponentIncrement = (deltaTime * opponentSpeed) / 10;
    const newOpponentProgress = Math.min(1, opponentRouteProgress + opponentIncrement);
    
    // Check for passing checkpoints
    checkpointsRef.current.forEach(checkpoint => {
      if (!passedCheckpointsRef.current.has(checkpoint) && 
          routeProgress < checkpoint && 
          newProgress >= checkpoint) {
        passedCheckpointsRef.current.add(checkpoint);
        
        // Trigger checkpoint event - handled by effects component
        const checkpointEvent = new CustomEvent('checkpoint-passed', {
          detail: { checkpoint, progress: newProgress }
        });
        window.dispatchEvent(checkpointEvent);
      }
    });
    
    // Check if either racer has reached the finish line
    const playerFinished = newProgress >= 1;
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
      setRouteProgress(playerFinished ? 1 : newProgress);
      setOpponentRouteProgress(opponentFinished ? 1 : newOpponentProgress);
      
      const finalPosition = interpolatePosition(playerFinished ? 1 : newProgress);
      setRacerPosition(finalPosition);
      
      // Make sure to use the opponent route for opponent position calculation
      const opponentFinalPosition = interpolatePosition(opponentFinished ? 1 : newOpponentProgress, opponentRoute);
      setOpponentPosition(opponentFinalPosition);
      
      // Trigger race completion event
      const raceCompleteEvent = new CustomEvent('race-complete', {
        detail: { 
          winner: playerFinished && !opponentFinished ? 'player' : 
                 opponentFinished && !playerFinished ? 'opponent' : 'tie',
          playerProgress: playerFinished ? 1 : newProgress,
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
    
    // Update progress and position
    setRouteProgress(newProgress);
    setOpponentRouteProgress(newOpponentProgress);
    
    // Get the ideal position on the route
    const idealPosition = interpolatePosition(newProgress);
    
    // Apply path adherence based on accuracy parameter
    // Higher accuracy = closer to the ideal path
    const pathAdherence = calculatePathAdherence();
    
    // Calculate a deviation from the ideal path based on accuracy
    // Lower accuracy = more deviation
    const maxDeviation = 0.00002 * (1 - pathAdherence); // Maximum deviation in degrees
    const longitudeDeviation = (Math.random() * 2 - 1) * maxDeviation;
    const latitudeDeviation = (Math.random() * 2 - 1) * maxDeviation;
    
    // Apply the deviation to create a more realistic path
    // Higher accuracy = smaller deviation
    const adjustedPosition = {
      ...idealPosition,
      longitude: idealPosition.longitude + longitudeDeviation,
      latitude: idealPosition.latitude + latitudeDeviation
    };
    
    // Set the racer position with the adjusted coordinates
    setRacerPosition(adjustedPosition);
    
    // Make sure to use the opponent route for opponent position calculation
    // Apply similar path adherence logic for the opponent
    const idealOpponentPosition = interpolatePosition(newOpponentProgress, opponentRoute);
    
    // Opponent has different path adherence characteristics
    const opponentPathAdherence = isRacing ? Math.random() * 0.3 + 0.7 : 1; // 0.7 to 1.0 range
    const opponentMaxDeviation = 0.00002 * (1 - opponentPathAdherence);
    const opponentLongitudeDeviation = (Math.random() * 2 - 1) * opponentMaxDeviation;
    const opponentLatitudeDeviation = (Math.random() * 2 - 1) * opponentMaxDeviation;
    
    const adjustedOpponentPosition = {
      ...idealOpponentPosition,
      longitude: idealOpponentPosition.longitude + opponentLongitudeDeviation,
      latitude: idealOpponentPosition.latitude + opponentLatitudeDeviation
    };
    
    setOpponentPosition(adjustedOpponentPosition);
    
    // Update camera target
    if (cameraTarget.current) {
      cameraTarget.current.set(adjustedPosition.x, adjustedPosition.y, adjustedPosition.z);
    }
    
    // Update map position if available
    if (mapRef.current) {
      const { offsetLng, offsetLat } = calculateCameraPosition(
        adjustedPosition.longitude, 
        adjustedPosition.latitude, 
        adjustedPosition.rotation
      );
      
      mapRef.current.easeTo({
        center: [offsetLng, offsetLat],
        bearing: adjustedPosition.rotation,
        duration: 100 // Smoother transitions
      });
    }
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
    resetRace();
    passedCheckpointsRef.current.clear();
    
    // Trigger race reset event
    const raceResetEvent = new CustomEvent('race-reset');
    window.dispatchEvent(raceResetEvent);
    
    // Reset map position if available
    if (mapRef.current) {
      const initialPosition = interpolatePosition(0);
      
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
  }, [isRacing, routeProgress, opponentRouteProgress, currentSpeed, opponentSpeed, lastUpdateTime]);
  
  return {
    isRacing,
    cameraMode,
    routeProgress,
    opponentRouteProgress,
    currentSpeed,
    opponentSpeed,
    handleStartRace,
    handleResetPosition,
    toggleCameraMode
  };
};

export default useRaceControls;