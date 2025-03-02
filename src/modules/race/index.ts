// Export all race-related components and hooks from this central file
// This makes imports cleaner in other files

// Core race components
export { default as RaceVisualization } from './components/RaceVisualization';
export { default as RaceMap } from './components/RaceMap';
export { default as MapboxRace3DView } from './components/MapboxRace3DView';

// UI Components
export { default as RaceEffects } from './components/RaceEffects';
export { default as RaceNotifications } from './components/RaceNotifications';
export { default as RaceCommentary } from './components/RaceCommentary';
export { default as RaceControlPanel } from './components/RaceControlPanel';
export { default as RaceMapControls } from './components/RaceMapControls';
export { default as RaceWinnerModal } from './components/RaceWinnerModal';
export { default as RouteInfoOverlay } from './components/RouteInfoOverlay';
export { default as SpecialAbilities } from './components/SpecialAbilities';
export { default as AbilityEffects } from './components/AbilityEffects';
export { default as RaceObstacles } from './components/RaceObstacles';
export { default as ObstacleEffects } from './components/ObstacleEffects';

// Map-specific components
export { default as MapboxRouteLayer } from './components/MapboxRouteLayer';
export { default as MapboxRacerMarker } from './components/MapboxRacerMarker';
export { default as SpeedIndicator } from './components/SpeedIndicator';
export { default as CheckpointIndicator } from './components/CheckpointIndicator';
export { default as MotionEffects } from './components/MotionEffects';

// Hooks
export { default as useRaceState } from './hooks/useRaceState';
export { default as useRaceControls } from './hooks/useRaceControls';
export { default as useAIGeneration } from './hooks/useAIGeneration';
export { default as useAbilities } from './hooks/useAbilities';
export { default as useObstacles } from './hooks/useObstacles';

// Types
export * from './types';