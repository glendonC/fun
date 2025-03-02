const calculateDynamicSpeed = (isOpponent = false) => {
  const { speed, accuracy, adaptability } = parameters.performance || { speed: 50, accuracy: 50, adaptability: 50 };
  
  let baseSpeed = 0.1 + (speed / 100) * 0.4;
  
  const randomFactor = (100 - adaptability) / 100;
  const fluctuation = (Math.random() * 2 - 1) * randomFactor * 0.01;
  
  // Rest of the function remains the same...
};

const updateRacerPosition = () => {
  const progressIncrement = (deltaTime * currentSpeed * speedMultiplier) / 5;
  
  // Rest of the function remains the same...
};

const triggerObstruction = (type: 'blocked' | 'rerouting' | 'evading') => {
  // ... existing code ...

  if (type === 'rerouting') {
    setIsRerouting(true);
    setRerouteProgress(0);
    setRerouteStartPoint(racerPosition);
    setRerouteStartProgress(routeProgress);
    
    // Calculate a more significant deviation for the reroute
    const rejoinProgress = Math.min(1, routeProgress + 0.15); // Increased from 0.05
    const idealRejoinPoint = interpolatePosition(rejoinProgress);
    
    // Add some lateral deviation to make the reroute more visible
    const deviation = 0.0005; // About 50 meters
    const rerouteEndPoint = {
      ...idealRejoinPoint,
      longitude: idealRejoinPoint.longitude + (Math.random() - 0.5) * deviation,
      latitude: idealRejoinPoint.latitude + (Math.random() - 0.5) * deviation
    };
    
    setRerouteEndPoint(rerouteEndPoint);
  }
  
  // Reduce obstruction duration for faster-paced race
  const duration = type === 'blocked' ? 2000 : type === 'rerouting' ? 3000 : 1500; // Reduced durations
  
  // ... rest of the function ...
}; 