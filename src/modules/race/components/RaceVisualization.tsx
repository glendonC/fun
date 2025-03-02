import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Compass } from 'lucide-react';

// Import from modules instead of direct paths
import { 
  RaceMap, 
  MapboxRace3DView, 
  RaceControlPanel, 
  RaceWinnerModal, 
  RouteInfoOverlay,
  RaceObstacles,
  ObstacleEffects,
  useRaceState,
  useRaceControls,
  useAbilities,
  useObstacles,
  SpecialAbilities,
  AbilityEffects,
  ViewMode,
  RaceParameters
} from '../';

// Add this import
import { RacerPosition } from '../types';

interface RaceVisualizationProps {
  modelId: string;
  parameters: any;
  onBack: () => void;
}

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
  interpolatePosition: (progress: number) => RacerPosition;
  setRacerPosition: (position: RacerPosition) => void;
  setOpponentPosition: (position: RacerPosition) => void;
  setRouteProgress: (progress: number) => void;
  setOpponentRouteProgress: (progress: number) => void;
  triggerReroute: () => void;
}

const RaceVisualization: React.FC<RaceVisualizationProps> = ({ modelId, parameters, onBack }) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const [viewMode, setViewMode] = useState<ViewMode>('map'); // Default to map view for better performance
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  
  // Use custom hooks to manage race state and controls
  const raceState = useRaceState(modelId, parameters);
  
  const {
    racerPosition, 
    opponentPosition,
    routeProgress, 
    opponentRouteProgress,
    currentSpeed,
    opponentSpeed,
    selectedRoute,
    opponentRoute,
    routeName,
    opponentRouteName,
    routeExplanation,
    isRouteLoading,
    cameraTarget,
    mapRef,
    startPoint,
    finishPoint,
    raceWinner,
    raceFinished,
    resetRace,
    setCurrentSpeed,
    setOpponentSpeed,
    setRacerPosition,
    setOpponentPosition,
    setRouteProgress,
    setOpponentRouteProgress,
    interpolatePosition
  } = raceState;
  
  const {
    isRacing,
    cameraMode,
    isObstructed,
    obstructionType,
    isRerouting,
    isOpponentObstructed,
    opponentObstructionType,
    handleStartRace,
    handleResetPosition,
    toggleCameraMode,
    triggerReroute
  } = useRaceControls(
    parameters, 
    racerPosition, 
    raceState.setRacerPosition,
    opponentPosition,
    raceState.setOpponentPosition,
    raceState.interpolatePosition, 
    cameraTarget,
    mapRef,
    routeProgress,
    raceState.setRouteProgress,
    opponentRouteProgress,
    raceState.setOpponentRouteProgress,
    opponentRoute,
    raceState.setRaceWinner,
    raceState.setRaceFinished,
    resetRace
  );
  
  // Use abilities hook
  const {
    cooldowns,
    activeEffects: abilityEffects,
    activateAbility
  } = useAbilities({
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
    setOpponentRouteProgress,
    triggerReroute
  });
  
  // Use obstacles hook
  const {
    activeEffects: obstacleEffects,
    handleObstacleAppear
  } = useObstacles({
    modelId,
    isRacing,
    performance: parameters.performance,
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
  });
  
  // Toggle view mode between 3D and map
  const toggleViewMode = () => {
    setViewMode(prev => prev === '3d' ? 'map' : '3d');
  };
  
  // Update parameters with current race state for effects
  const enhancedParameters: RaceParameters = {
    ...parameters,
    routeProgress,
    selectedRoute,
    currentSpeed,
    opponentRouteProgress,
    opponentRoute,
    opponentPosition,
    opponentSpeed,
    startPoint,
    finishPoint,
    raceWinner,
    raceFinished,
    isObstructed,
    obstructionType,
    isRerouting,
    isOpponentObstructed,
    opponentObstructionType
  };
  
  // Show route explanation at the beginning of the race
  const [showRouteInfo, setShowRouteInfo] = useState(true);
  
  useEffect(() => {
    if (isRacing) {
      // Hide route info when race starts
      const timer = setTimeout(() => {
        setShowRouteInfo(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      // Show route info when race is not in progress
      setShowRouteInfo(true);
    }
  }, [isRacing]);
  
  return (
    <motion.div 
      className="w-full h-screen absolute inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* View Mode Toggle Button */}
      <motion.button
        className="absolute top-6 left-6 z-50 bg-gray-800/80 backdrop-blur-sm p-3 rounded-full border border-gray-700 shadow-lg"
        onClick={toggleViewMode}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {viewMode === '3d' ? (
          <Compass className="h-6 w-6 text-white" />
        ) : (
          <Eye className="h-6 w-6 text-white" />
        )}
      </motion.button>
      
      {/* 3D View - Using Mapbox for 3D view */}
      {viewMode === '3d' && (
        <MapboxRace3DView 
          modelId={modelId}
          racerPosition={racerPosition}
          opponentPosition={opponentPosition}
          isRacing={isRacing}
          currentSpeed={currentSpeed}
          opponentSpeed={opponentSpeed}
          mapRef={mapRef}
          parameters={enhancedParameters}
        />
      )}
      
      {/* Map View */}
      {viewMode === 'map' && (
        <div className="w-full h-full">
          <RaceMap 
            modelId={modelId} 
            parameters={enhancedParameters}
            racerPosition={racerPosition}
            opponentPosition={opponentPosition}
            routeProgress={routeProgress}
            opponentRouteProgress={opponentRouteProgress}
            isRacing={isRacing}
            selectedRoute={selectedRoute}
            opponentRoute={opponentRoute}
            startPoint={startPoint}
            finishPoint={finishPoint}
            mapRef={mapRef}
            onStartRace={handleStartRace}
            onResetPosition={handleResetPosition}
            onBack={onBack}
            onToggleViewMode={toggleViewMode}
          />
        </div>
      )}
      
      {/* Special Abilities */}
      <SpecialAbilities
        modelId={modelId}
        isRacing={isRacing}
        onUseAbility={activateAbility}
        cooldowns={cooldowns}
      />
      
      {/* Ability Effects */}
      <AbilityEffects
        modelId={modelId}
        isRacing={isRacing}
        activeEffects={abilityEffects}
      />
      
      {/* Race Obstacles */}
      <RaceObstacles 
        modelId={modelId}
        isRacing={isRacing}
        performance={parameters.performance}
        onObstacleAppear={handleObstacleAppear}
      />
      
      {/* Obstacle Effects */}
      <ObstacleEffects
        modelId={modelId}
        isRacing={isRacing}
        activeEffects={obstacleEffects}
      />
      
      {/* Route Information Overlay */}
      {showRouteInfo && routeName && (
        <RouteInfoOverlay
          routeName={routeName}
          routeExplanation={routeExplanation}
          isRacing={isRacing}
          modelId={modelId}
          opponentRouteName={opponentRouteName}
        />
      )}
      
      {/* Race Winner Modal */}
      <RaceWinnerModal
        isVisible={raceFinished}
        winner={raceWinner}
        modelId={modelId}
        onRaceAgain={handleResetPosition}
      />
      
      {/* Control Panel - Only show in 3D view, Map view has its own controls */}
      {viewMode === '3d' && (
        <RaceControlPanel 
          modelId={modelId}
          parameters={parameters}
          routeProgress={routeProgress}
          isRacing={isRacing}
          cameraMode={cameraMode}
          viewMode={viewMode}
          panelCollapsed={panelCollapsed}
          setPanelCollapsed={setPanelCollapsed}
          onStartRace={handleStartRace}
          onResetPosition={handleResetPosition}
          onToggleCameraMode={toggleCameraMode}
          onToggleViewMode={toggleViewMode}
          onBack={onBack}
        />
      )}
    </motion.div>
  );
};

export default RaceVisualization;