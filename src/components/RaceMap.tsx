import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Components
import RaceMapControls from './race/RaceMapControls';
import MapboxRouteLayer from './race/MapboxRouteLayer';
import SpeedIndicator from './race/SpeedIndicator';
import CheckpointIndicator from './race/CheckpointIndicator';
import RaceWinnerModal from './race/RaceWinnerModal';
import MotionEffects from './race/MotionEffects';
import MapboxRacerMarker from './race/MapboxRacerMarker';
import RaceEffects from './race/RaceEffects';
import RaceNotifications from './race/RaceNotifications';
import RaceCommentary from './race/RaceCommentary';

// This is a public token for development purposes
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZHBpY2siLCJhIjoiY203cWtya2liMGFiYzJsb282Y2x6N2ZzayJ9.UGn23wIO5M7r-_5yajMGTg';

interface RaceMapProps {
  modelId: string;
  parameters: any;
  racerPosition: {
    longitude: number;
    latitude: number;
    rotation: number;
  };
  opponentPosition: {
    longitude: number;
    latitude: number;
    rotation: number;
  };
  routeProgress: number;
  opponentRouteProgress: number;
  isRacing: boolean;
  selectedRoute: number[][];
  opponentRoute: number[][];
  startPoint: {
    longitude: number;
    latitude: number;
  };
  finishPoint: {
    longitude: number;
    latitude: number;
  };
  mapRef: React.RefObject<mapboxgl.Map>;
  onStartRace: () => void;
  onResetPosition: () => void;
  onBack: () => void;
  onToggleViewMode?: () => void;
}

const RaceMap: React.FC<RaceMapProps> = ({
  modelId,
  parameters,
  racerPosition,
  opponentPosition,
  routeProgress,
  opponentRouteProgress,
  isRacing,
  selectedRoute,
  opponentRoute,
  startPoint,
  finishPoint,
  mapRef,
  onStartRace,
  onResetPosition,
  onBack,
  onToggleViewMode
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const opponentColor = isRat ? 'blue' : 'amber';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const currentSpeed = parameters.currentSpeed || 0.2;
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize map only if it doesn't exist yet
    if (!mapRef.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [racerPosition.longitude, racerPosition.latitude],
        zoom: 16,
        pitch: 45,
        bearing: racerPosition.rotation
      });
      
      map.on('load', () => {
        setMapLoaded(true);
        console.log("Map loaded successfully");
        
        // Add 3D buildings layer for more realistic view
        map.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.9
          }
        });
        
        // Add start marker
        new mapboxgl.Marker({ color: '#10B981' })
          .setLngLat([startPoint.longitude, startPoint.latitude])
          .addTo(map);
        
        // Add finish marker
        new mapboxgl.Marker({ color: '#EF4444' })
          .setLngLat([finishPoint.longitude, finishPoint.latitude])
          .addTo(map);
      });
      
      // Save map reference
      mapRef.current = map;
    }
    
    return () => {
      // Don't destroy the map as it's shared with other components
    };
  }, [mapContainerRef]);
  
  // Listen for race events
  useEffect(() => {
    const handleRaceStart = () => {
      console.log('Race started');
    };
    
    window.addEventListener('race-start', handleRaceStart);
    
    return () => {
      window.removeEventListener('race-start', handleRaceStart);
    };
  }, [mapRef.current, racerPosition]);
  
  // Determine race winner
  const raceWinner = parameters.raceWinner;
  const raceFinished = parameters.raceFinished;
  
  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Toggle View Mode Button */}
      {onToggleViewMode && (
        <motion.button
          className="absolute top-6 left-6 z-50 bg-gray-800/80 backdrop-blur-sm p-3 rounded-full border border-gray-700 shadow-lg"
          onClick={onToggleViewMode}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Eye className="h-6 w-6 text-white" />
        </motion.button>
      )}
      
      {/* Map Layers and Markers */}
      {mapRef.current && mapLoaded && (
        <>
          {/* Opponent Route - Render first so it's underneath */}
          {opponentRoute && opponentRoute.length > 0 && (
            <MapboxRouteLayer 
              map={mapRef.current} 
              route={opponentRoute} 
              isRat={!isRat}
              layerIdSuffix="opponent"
              isOpponent={true}
            />
          )}
          
          {/* Player Route - Render second so it's on top */}
          {selectedRoute && selectedRoute.length > 0 && (
            <MapboxRouteLayer 
              map={mapRef.current} 
              route={selectedRoute} 
              isRat={isRat}
              layerIdSuffix="player"
              isOpponent={false}
            />
          )}
          
          {/* Player Marker with animated 3D model */}
          <MapboxRacerMarker 
            map={mapRef.current}
            position={racerPosition}
            isRacing={isRacing}
            isRat={isRat}
            primaryColor={primaryColor}
            markerId="player"
          />
          
          {/* Opponent Marker with animated 3D model */}
          <MapboxRacerMarker 
            map={mapRef.current}
            position={opponentPosition}
            isRacing={isRacing}
            isRat={!isRat}
            primaryColor={opponentColor}
            markerId="opponent"
            isOpponent={true}
          />
        </>
      )}
      
      {/* Race Effects Layer */}
      <RaceEffects 
        modelId={modelId}
        isRacing={isRacing}
        currentSpeed={currentSpeed}
        parameters={parameters}
      />
      
      {/* Race Notifications */}
      <RaceNotifications 
        modelId={modelId}
        isRacing={isRacing}
        routeProgress={routeProgress}
        opponentRouteProgress={opponentRouteProgress}
      />
      
      {/* Race Commentary */}
      <RaceCommentary
        modelId={modelId}
        isRacing={isRacing}
        routeProgress={routeProgress}
        opponentRouteProgress={opponentRouteProgress}
        performance={parameters.performance}
      />
      
      {/* Race Controls */}
      <RaceMapControls 
        modelId={modelId}
        parameters={parameters}
        routeProgress={routeProgress}
        opponentRouteProgress={opponentRouteProgress}
        isRacing={isRacing}
        onStartRace={onStartRace}
        onResetPosition={onResetPosition}
        onBack={onBack}
      />
      
      {/* Speed Indicator */}
      <SpeedIndicator 
        currentSpeed={currentSpeed} 
        primaryColor={primaryColor} 
      />
      
      {/* Checkpoint Indicator */}
      {isRacing && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-700 shadow-lg">
          <div className="flex flex-col items-center space-y-2">
            {/* Player progress */}
            <div className="flex items-center space-x-2">
              <span className={`text-${primaryColor}-400 text-sm font-medium`}>You:</span>
              <CheckpointIndicator 
                routeProgress={routeProgress} 
                primaryColor={primaryColor} 
              />
            </div>

            {/* Opponent progress */}
            <div className="flex items-center space-x-2">
              <span className={`text-${opponentColor}-400 text-sm font-medium`}>Opponent:</span>
              <CheckpointIndicator 
                routeProgress={opponentRouteProgress} 
                primaryColor={opponentColor} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Race Winner Modal */}
      <RaceWinnerModal
        isVisible={raceFinished}
        winner={raceWinner}
        modelId={modelId}
        onRaceAgain={onResetPosition}
      />

      {/* Motion Effects */}
      <MotionEffects 
        isRacing={isRacing} 
        currentSpeed={currentSpeed} 
        rotation={racerPosition.rotation} 
      />
    </div>
  );
};

export default RaceMap;