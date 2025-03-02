import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Rat, Bird, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RaceEffects from './race/RaceEffects';
import RaceNotifications from './race/RaceNotifications';
import MapboxRouteLayer from './race/MapboxRouteLayer';
import SpeedIndicator from './race/SpeedIndicator';
import CheckpointIndicator from './race/CheckpointIndicator';
import RaceWinnerModal from './race/RaceWinnerModal';
import MapboxRacerMarker from './race/MapboxRacerMarker';
import RaceCommentary from './race/RaceCommentary';
import 'mapbox-gl/dist/mapbox-gl.css';

// This is a public token for development purposes
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZHBpY2siLCJhIjoiY203cWtya2liMGFiYzJsb282Y2x6N2ZzayJ9.UGn23wIO5M7r-_5yajMGTg';

interface MapboxRace3DViewProps {
  modelId: string;
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
  isRacing: boolean;
  currentSpeed: number;
  opponentSpeed: number;
  mapRef: React.RefObject<mapboxgl.Map>;
  parameters: any;
}

const MapboxRace3DView: React.FC<MapboxRace3DViewProps> = ({
  modelId,
  racerPosition,
  opponentPosition,
  isRacing,
  currentSpeed,
  opponentSpeed,
  mapRef,
  parameters
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const opponentColor = isRat ? 'blue' : 'amber';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize map only if it doesn't exist yet
    if (!mapRef.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11', // Street style for realistic view
        center: [racerPosition.longitude, racerPosition.latitude],
        zoom: 18, // Closer zoom for street-level view
        pitch: 60, // Tilted view
        bearing: racerPosition.rotation,
        antialias: true // Smoother rendering
      });
      
      map.on('load', () => {
        setMapLoaded(true);
        
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
      });
      
      // Save map reference
      mapRef.current = map;
    }
    
    return () => {
      // Don't destroy the map as it's shared with other components
    };
  }, [mapContainerRef]);
  
  // Update map position and bearing when racer position changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.easeTo({
      center: [racerPosition.longitude, racerPosition.latitude],
      bearing: racerPosition.rotation,
      duration: 100 // Smoother transitions
    });
  }, [racerPosition]);
  
  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Layers and Markers */}
      {mapRef.current && mapLoaded && (
        <>
          {/* Opponent Route - Render first so it's underneath */}
          <MapboxRouteLayer 
            map={mapRef.current} 
            route={parameters.opponentRoute} 
            isRat={!isRat}
            layerIdSuffix="opponent"
            isOpponent={true}
          />
          
          {/* Player Route - Render second so it's on top */}
          <MapboxRouteLayer 
            map={mapRef.current} 
            route={parameters.selectedRoute} 
            isRat={isRat}
            layerIdSuffix="player"
            isOpponent={false}
          />
          
          {/* Player Marker with animated 3D model */}
          <MapboxRacerMarker 
            map={mapRef.current}
            position={racerPosition}
            isRacing={isRacing}
            isRat={isRat}
            primaryColor={primaryColor}
            markerId="player-3d"
          />
          
          {/* Opponent Marker with animated 3D model */}
          <MapboxRacerMarker 
            map={mapRef.current}
            position={opponentPosition}
            isRacing={isRacing}
            isRat={!isRat}
            primaryColor={opponentColor}
            markerId="opponent-3d"
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
        routeProgress={parameters.routeProgress}
        opponentRouteProgress={parameters.opponentRouteProgress}
      />
      
      {/* Race Commentary */}
      <RaceCommentary
        modelId={modelId}
        isRacing={isRacing}
        routeProgress={parameters.routeProgress}
        opponentRouteProgress={parameters.opponentRouteProgress}
        performance={parameters.performance}
      />
      
      {/* Speed indicator */}
      <SpeedIndicator 
        currentSpeed={currentSpeed} 
        primaryColor={primaryColor} 
      />
      
      {/* Checkpoint indicators */}
      {isRacing && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-700 shadow-lg">
          <div className="flex flex-col items-center space-y-2">
            {/* Player progress */}
            <div className="flex items-center space-x-2">
              <span className={`text-${primaryColor}-400 text-sm font-medium`}>You:</span>
              <CheckpointIndicator 
                routeProgress={parameters.routeProgress} 
                primaryColor={primaryColor} 
              />
            </div>
            
            {/* Opponent progress */}
            <div className="flex items-center space-x-2">
              <span className={`text-${opponentColor}-400 text-sm font-medium`}>Opponent:</span>
              <CheckpointIndicator 
                routeProgress={parameters.opponentRouteProgress} 
                primaryColor={opponentColor} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Race completion celebration */}
      <AnimatePresence>
        {parameters.routeProgress >= 0.99 && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="bg-gray-900/70 backdrop-blur-md p-8 rounded-xl border border-gray-700 shadow-2xl max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 0.5,
                y: { 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <h2 className="text-3xl font-bold text-white mb-4 text-center">Race Complete!</h2>
              <div className="flex justify-center mb-6">
                <motion.div 
                  className={`p-4 rounded-full bg-${primaryColor}-500/30`}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Award className={`h-16 w-16 text-${primaryColor}-400`} />
                </motion.div>
              </div>
              <p className="text-xl text-gray-200 text-center mb-6">
                {isRat ? 
                  "Your algorithmic speedster has calculated its way to victory!" : 
                  "Your instinctive flyer has soared to the finish line!"}
              </p>
              <div className="flex justify-center">
                <motion.button
                  className={`px-6 py-3 bg-${primaryColor}-500 text-white rounded-lg shadow-lg`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.dispatchEvent(new Event('race-reset'))}
                >
                  Race Again
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapboxRace3DView;