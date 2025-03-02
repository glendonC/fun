import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';
import { selectRouteWithAI, convertRouteToRaceFormat, getFixedPoints } from '../services/routeService';

// This is a public token for development purposes
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZHBpY2siLCJhIjoiY203cWtya2liMGFiYzJsb282Y2x6N2ZzayJ9.UGn23wIO5M7r-_5yajMGTg';

const useRaceState = (modelId: string, parameters?: any) => {
  const isRat = modelId === 'dbrx';
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // Get fixed start and finish points
  const { startPoint, finishPoint } = getFixedPoints();
  
  // State for the selected route
  const [selectedRoute, setSelectedRoute] = useState<number[][]>([]);
  const [routeName, setRouteName] = useState<string>('');
  const [routeExplanation, setRouteExplanation] = useState<string>('');
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);
  
  // Current position of the racer
  const [racerPosition, setRacerPosition] = useState({
    x: 0,
    y: 0,
    z: 0,
    rotation: 0,
    longitude: startPoint.longitude,
    latitude: startPoint.latitude
  });
  
  // Opponent racer position (the other model)
  const [opponentPosition, setOpponentPosition] = useState({
    x: 0,
    y: 0,
    z: 0,
    rotation: 0,
    longitude: startPoint.longitude,
    latitude: startPoint.latitude
  });
  
  const [opponentRoute, setOpponentRoute] = useState<number[][]>([]);
  const [opponentRouteName, setOpponentRouteName] = useState<string>('');
  const [opponentRouteProgress, setOpponentRouteProgress] = useState(0);
  const [opponentSpeed, setOpponentSpeed] = useState(0.2);
  
  const [routeProgress, setRouteProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0.2);
  
  // Race result state
  const [raceWinner, setRaceWinner] = useState<string | null>(null);
  const [raceFinished, setRaceFinished] = useState(false);
  
  // Load the route when parameters change
  useEffect(() => {
    if (!parameters) return;
    
    const loadRoute = async () => {
      setIsRouteLoading(true);
      try {
        // Select a route using AI for the current model
        const { selectedRoute: routePoints, routeName, routeExplanation } = 
          await selectRouteWithAI(modelId, parameters);
        
        // Convert the route to the format expected by the race visualization
        const formattedRoute = convertRouteToRaceFormat(routePoints);
        
        setSelectedRoute(formattedRoute);
        setRouteName(routeName);
        setRouteExplanation(routeExplanation);
        
        // Reset position to the start of the new route
        const initialPosition = interpolatePosition(0, formattedRoute);
        setRacerPosition(initialPosition);
        
        console.log("Route loaded successfully:", routeName);
        
        // Also load a route for the opponent (the other model)
        const opponentModelId = isRat ? 'mistral' : 'dbrx';
        
        // Create opponent parameters with significantly different performance metrics
        // Ensure the opponent chooses a different route by adjusting parameters
        const opponentParams = {
          ...parameters,
          performance: {
            // Make significant changes to ensure different route selection
            speed: isRat ? Math.max(20, parameters.performance.speed - 30) : Math.min(80, parameters.performance.speed + 30),
            accuracy: isRat ? Math.min(80, parameters.performance.accuracy + 30) : Math.max(20, parameters.performance.accuracy - 30),
            adaptability: isRat ? Math.max(20, parameters.performance.adaptability - 30) : Math.min(80, parameters.performance.adaptability + 30)
          }
        };
        
        const { selectedRoute: opponentRoutePoints, routeName: opponentName } = 
          await selectRouteWithAI(opponentModelId, opponentParams);
        
        const formattedOpponentRoute = convertRouteToRaceFormat(opponentRoutePoints);
        setOpponentRoute(formattedOpponentRoute);
        setOpponentRouteName(opponentName);
        
        // Set opponent initial position
        const opponentInitialPosition = interpolatePosition(0, formattedOpponentRoute);
        setOpponentPosition(opponentInitialPosition);
        
        console.log("Opponent route loaded:", opponentName);
      } catch (error) {
        console.error('Error loading route:', error);
      } finally {
        setIsRouteLoading(false);
      }
    };
    
    loadRoute();
  }, [modelId, parameters]);
  
  // Convert geographic coordinates to 3D space
  const geoToWorld = (lon: number, lat: number, alt: number = 0): [number, number, number] => {
    // Use a scale factor to make the coordinates usable in 3D space
    // Center around the starting point
    const scale = 10000;
    const centerLon = startPoint.longitude;
    const centerLat = startPoint.latitude;
    
    // Convert to Mercator projection
    const x = (lon - centerLon) * scale;
    const z = (lat - centerLat) * scale;
    const y = alt; // Altitude becomes Y in 3D space
    
    return [x, y, z];
  };
  
  // Function to interpolate position along the route
  const interpolatePosition = (progress: number, route: number[][] = selectedRoute) => {
    if (!route || route.length < 2) {
      // Return default position if route is not available
      return {
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
        longitude: startPoint.longitude,
        latitude: startPoint.latitude
      };
    }
    
    const totalSegments = route.length - 1;
    
    // Calculate which segment we're on
    const segmentProgress = progress * totalSegments;
    const segmentIndex = Math.floor(segmentProgress);
    const segmentFraction = segmentProgress - segmentIndex;
    
    // If we're at the end of the route
    if (segmentIndex >= totalSegments) {
      const endPoint = route[totalSegments];
      const [x, y, z] = geoToWorld(endPoint[0], endPoint[1], endPoint[2]);
      
      // For the end point, calculate rotation based on the last segment
      const lastStart = route[totalSegments - 1];
      const lastEnd = route[totalSegments];
      
      // Calculate direction vector for the last segment
      const dirX = lastEnd[0] - lastStart[0];
      const dirZ = lastEnd[1] - lastStart[1];
      
      // Calculate rotation (in radians) based on direction
      let rotation = Math.atan2(dirZ, dirX);
      
      // Convert to degrees for easier use with Three.js rotations
      rotation = rotation * (180 / Math.PI);
      
      return {
        x,
        y,
        z,
        rotation,
        longitude: endPoint[0],
        latitude: endPoint[1]
      };
    }
    
    // Get the current segment's start and end points
    const start = route[segmentIndex];
    const end = route[segmentIndex + 1];
    
    // Calculate direction vector for this segment
    const dirX = end[0] - start[0];
    const dirZ = end[1] - start[1]; // Note: latitude is Z in our 3D world
    
    // Calculate rotation (in radians) based on direction
    let rotation = Math.atan2(dirZ, dirX);
    
    // Convert to degrees for easier use with Three.js rotations
    rotation = rotation * (180 / Math.PI);
    
    // Interpolate between the points in geographic coordinates
    const longitude = start[0] + segmentFraction * (end[0] - start[0]);
    const latitude = start[1] + segmentFraction * (end[1] - start[1]);
    const altitude = start[2] + segmentFraction * (end[2] - start[2]);
    
    // Convert to 3D world coordinates
    const [x, y, z] = geoToWorld(longitude, latitude, altitude);
    
    return {
      x,
      y,
      z,
      rotation,
      longitude,
      latitude
    };
  };
  
  // Initialize racer position
  useEffect(() => {
    if (selectedRoute.length > 0) {
      const initialPosition = interpolatePosition(0);
      setRacerPosition(initialPosition);
      cameraTarget.current.set(initialPosition.x, initialPosition.y, initialPosition.z);
      console.log("Racer position initialized:", initialPosition);
    }
    
    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;
  }, [selectedRoute]);
  
  // Update opponent position based on progress
  useEffect(() => {
    if (opponentRoute.length > 0 && opponentRouteProgress > 0) {
      const newPosition = interpolatePosition(opponentRouteProgress, opponentRoute);
      setOpponentPosition(newPosition);
    }
  }, [opponentRouteProgress, opponentRoute]);
  
  // Reset race state
  const resetRace = () => {
    setRouteProgress(0);
    setOpponentRouteProgress(0);
    setRaceWinner(null);
    setRaceFinished(false);
    
    // Reset positions
    if (selectedRoute.length > 0) {
      const initialPosition = interpolatePosition(0);
      setRacerPosition(initialPosition);
    }
    
    if (opponentRoute.length > 0) {
      const opponentInitialPosition = interpolatePosition(0, opponentRoute);
      setOpponentPosition(opponentInitialPosition);
    }
  };
  
  return {
    racerPosition,
    setRacerPosition,
    opponentPosition,
    setOpponentPosition,
    routeProgress,
    setRouteProgress,
    opponentRouteProgress,
    setOpponentRouteProgress,
    currentSpeed,
    setCurrentSpeed,
    opponentSpeed,
    setOpponentSpeed,
    selectedRoute,
    opponentRoute,
    routeName,
    opponentRouteName,
    routeExplanation,
    isRouteLoading,
    cameraTarget,
    interpolatePosition,
    mapRef,
    startPoint,
    finishPoint,
    raceWinner,
    setRaceWinner,
    raceFinished,
    setRaceFinished,
    resetRace
  };
};

export default useRaceState;