import axios from 'axios';
import { RoutePoint } from './routeService';

// Mapbox API token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZHBpY2siLCJhIjoiY203cWtya2liMGFiYzJsb282Y2x6N2ZzayJ9.UGn23wIO5M7r-_5yajMGTg';

// Interface for Mapbox route response
interface MapboxRoute {
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  legs: any[];
  distance: number;
  duration: number;
}

// Interface for route options with variations
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

// Function to get a route from Mapbox Directions API
export const getMapboxRoute = async (
  startPoint: RoutePoint,
  endPoint: RoutePoint,
  waypoints: RoutePoint[] = []
): Promise<RoutePoint[]> => {
  try {
    // Format coordinates for the API request
    const coordinates = [
      `${startPoint.longitude},${startPoint.latitude}`,
      ...waypoints.map(point => `${point.longitude},${point.latitude}`),
      `${endPoint.longitude},${endPoint.latitude}`
    ].join(';');

    // Make request to Mapbox Directions API
    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          geometries: 'geojson',
          overview: 'full',
          steps: 'true',
          alternatives: 'true'
        }
      }
    );

    // Extract route from response
    const route = response.data.routes[0] as MapboxRoute;
    
    // Convert to our RoutePoint format
    return route.geometry.coordinates.map(coord => ({
      longitude: coord[0],
      latitude: coord[1],
      altitude: 0 // Default to ground level
    }));
  } catch (error) {
    console.error('Error fetching route from Mapbox:', error);
    throw error;
  }
};

// Function to generate route variations between two points
export const generateRouteVariations = async (
  startPoint: RoutePoint,
  endPoint: RoutePoint,
  isFlying: boolean = false
): Promise<RouteVariation[]> => {
  try {
    // Generate different waypoint configurations for varied routes
    const variations: RouteVariation[] = [];
    
    // Direct route (no waypoints)
    const directRoute = await getMapboxRoute(startPoint, endPoint);
    variations.push({
      name: isFlying ? 'Direct Flight Path' : 'Direct Route',
      description: isFlying 
        ? 'A direct aerial route flying straight to the NASDAQ building.' 
        : 'The most direct path to the NASDAQ building. Efficient but potentially challenging.',
      points: isFlying 
        ? addAltitudeVariation(directRoute, 0, 40) 
        : directRoute,
      characteristics: {
        efficiency: 90,
        complexity: 30,
        risk: 40
      }
    });
    
    // Complex route (with multiple waypoints)
    // Create waypoints that force the route through Chinatown
    const complexWaypoints = [
      { longitude: -122.4059, latitude: 37.7957, altitude: 0 }, // Near Chinatown
      { longitude: -122.4022, latitude: 37.7952, altitude: 0 }  // Another point in Chinatown
    ];
    
    const complexRoute = await getMapboxRoute(startPoint, endPoint, complexWaypoints);
    variations.push({
      name: isFlying ? 'Chinatown Flight Path' : 'Chinatown Route',
      description: isFlying
        ? 'A challenging aerial path through Chinatown with many altitude changes and direction shifts.'
        : 'A challenging path through Chinatown with many turns and decision points.',
      points: isFlying 
        ? addAltitudeVariation(complexRoute, 20, 80) 
        : complexRoute,
      characteristics: {
        efficiency: 40,
        complexity: 90,
        risk: 70
      }
    });
    
    // Scenic route (with different waypoints)
    // Create waypoints that route through Union Square and the Financial District
    const scenicWaypoints = [
      { longitude: -122.4038, latitude: 37.7873, altitude: 0 }, // Union Square
      { longitude: -122.4010, latitude: 37.7914, altitude: 0 }  // Financial District
    ];
    
    const scenicRoute = await getMapboxRoute(startPoint, endPoint, scenicWaypoints);
    variations.push({
      name: isFlying ? 'Financial District Flight' : 'Financial District Route',
      description: isFlying
        ? 'A scenic aerial route through the Financial District with beautiful views of skyscrapers.'
        : 'A scenic path through the Financial District with less traffic and complexity.',
      points: isFlying 
        ? addAltitudeVariation(scenicRoute, 30, 60) 
        : scenicRoute,
      characteristics: {
        efficiency: 60,
        complexity: 20,
        risk: 20
      }
    });
    
    // Risky route (shorter but potentially more challenging)
    // Create waypoints that force a route through narrow streets
    const riskyWaypoints = [
      { longitude: -122.4020, latitude: 37.7900, altitude: 0 }, // Narrow street
      { longitude: -122.3980, latitude: 37.7920, altitude: 0 }  // Another narrow passage
    ];
    
    const riskyRoute = await getMapboxRoute(startPoint, endPoint, riskyWaypoints);
    variations.push({
      name: isFlying ? 'Risky Shortcut Flight' : 'Risky Shortcut',
      description: isFlying
        ? 'A potentially faster but riskier aerial path with rapid altitude changes between buildings.'
        : 'A potentially faster but riskier path with challenging terrain and narrow streets.',
      points: isFlying 
        ? addAltitudeVariation(riskyRoute, 5, 100, true) 
        : riskyRoute,
      characteristics: {
        efficiency: 80,
        complexity: 50,
        risk: 90
      }
    });
    
    // Balanced route
    // Create waypoints that provide a balanced path
    const balancedWaypoints = [
      { longitude: -122.4010, latitude: 37.7900, altitude: 0 } // Midpoint
    ];
    
    const balancedRoute = await getMapboxRoute(startPoint, endPoint, balancedWaypoints);
    variations.push({
      name: isFlying ? 'Balanced Flight Path' : 'Balanced Route',
      description: isFlying
        ? 'A well-balanced aerial path with moderate altitude changes and efficiency to the NASDAQ building.'
        : 'A well-balanced path with moderate efficiency and complexity to the NASDAQ building.',
      points: isFlying 
        ? addAltitudeVariation(balancedRoute, 15, 50) 
        : balancedRoute,
      characteristics: {
        efficiency: 70,
        complexity: 60,
        risk: 50
      }
    });
    
    // For flying routes, add one more specialized option
    if (isFlying) {
      // Thermal riding path (with altitude variations optimized for thermals)
      // Create a completely different path for the thermal route
      const thermalWaypoints = [
        { longitude: -122.4050, latitude: 37.7920, altitude: 0 }, // Different path
        { longitude: -122.3990, latitude: 37.7890, altitude: 0 }  // Another point
      ];
      
      const thermalRoute = await getMapboxRoute(startPoint, endPoint, thermalWaypoints);
      variations.push({
        name: 'Thermal Riding Path',
        description: 'A path that takes advantage of thermal updrafts between skyscrapers for efficient flying to the NASDAQ building.',
        points: addAltitudeVariation(thermalRoute, 10, 70, false, true),
        characteristics: {
          efficiency: 80,
          complexity: 60,
          risk: 40
        }
      });
    }
    
    return variations;
  } catch (error) {
    console.error('Error generating route variations:', error);
    throw error;
  }
};

// Helper function to add altitude variations to a route for flying
const addAltitudeVariation = (
  route: RoutePoint[], 
  minAlt: number, 
  maxAlt: number, 
  isRisky: boolean = false,
  isThermal: boolean = false
): RoutePoint[] => {
  // Keep start and end points at ground level
  const result = [...route];
  
  // Calculate the middle point index
  const midPoint = Math.floor(route.length / 2);
  
  for (let i = 1; i < route.length - 1; i++) {
    let altitude = 0;
    
    if (isRisky) {
      // Risky paths have more erratic altitude changes
      altitude = minAlt + Math.random() * (maxAlt - minAlt);
    } else if (isThermal) {
      // Thermal paths have wave-like patterns to simulate thermal updrafts
      const phase = (i / route.length) * Math.PI * 4;
      altitude = minAlt + (Math.sin(phase) + 1) / 2 * (maxAlt - minAlt);
    } else {
      // Normal paths have a bell curve altitude profile
      const distFromMiddle = Math.abs(i - midPoint) / midPoint;
      altitude = maxAlt * (1 - distFromMiddle * distFromMiddle);
    }
    
    result[i] = {
      ...result[i],
      altitude: Math.max(minAlt, Math.min(maxAlt, altitude))
    };
  }
  
  return result;
};