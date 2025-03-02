// Common types used across race components

// Position types
export interface RacerPosition {
  x: number;
  y: number;
  z: number;
  rotation: number;
  longitude: number;
  latitude: number;
}

export interface GeoPoint {
  longitude: number;
  latitude: number;
  altitude?: number;
}

// Route types
export interface RoutePoint {
  longitude: number;
  latitude: number;
  altitude: number;
}

export interface RouteVariation {
  name: string;
  description: string;
  points: RoutePoint[];
  characteristics: {
    efficiency: number;
    complexity: number;
    risk: number;
  };
}

// Performance metrics
export interface PerformanceMetrics {
  speed: number;
  accuracy: number;
  adaptability: number;
}

// Race parameters
export interface RaceParameters {
  modelId: string;
  performance: PerformanceMetrics;
  selectedRoute: number[][];
  opponentRoute: number[][];
  routeName: string;
  opponentRouteName: string;
  routeExplanation: string;
  routeProgress: number;
  opponentRouteProgress: number;
  currentSpeed: number;
  opponentSpeed: number;
  startPoint: GeoPoint;
  finishPoint: GeoPoint;
  raceWinner: string | null;
  raceFinished: boolean;
  isObstructed?: boolean;
  obstructionType?: 'blocked' | 'rerouting' | 'evading' | null;
  isRerouting?: boolean;
  isOpponentObstructed?: boolean;
  opponentObstructionType?: 'blocked' | 'rerouting' | 'evading' | null;
  [key: string]: any; // Allow for additional properties
}

// AI model response
export interface AIModelResponse {
  content: string;
  modelId: string;
}

// Camera modes
export type CameraMode = 'thirdPerson' | 'firstPerson';
export type ViewMode = '3d' | 'map';

// Obstruction types
export type ObstructionType = 'blocked' | 'rerouting' | 'evading';

// Ability types
export interface AbilityCooldowns {
  speed: number;
  attack: number;
  optimize: number;
}

export interface AbilityEffects {
  speedBoost: boolean;
  dataFlood: boolean;
  pathOptimization: boolean;
}