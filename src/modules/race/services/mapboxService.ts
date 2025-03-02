import axios from 'axios';
import { RoutePoint, RouteVariation, GeoPoint } from '../types';

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

// Function to get a route from Mapbox Directions API
export const getMapboxRoute = async (
  startPoint: GeoPoint,
  endPoint: GeoPoint,
  waypoints: GeoPoint[] = []
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
  startPoint: GeoPoint,
  endPoint: GeoPoint,
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
    
    // Chinatown route
    const chinatownWaypoints = [
      { longitude: -122.4074, latitude: 37.7947, altitude: 0 }, // Chinatown Gate
      { longitude: -122.4055, latitude: 37.7957, altitude: 0 }  // Portsmouth Square
    ];
    
    // Market Street route
    const marketStreetWaypoints = [
      { longitude: -122.4294, latitude: 37.7726, altitude: 0 }, // Castro Station
      { longitude: -122.4124, latitude: 37.7835, altitude: 0 }, // Civic Center
      { longitude: -122.3991, latitude: 37.7902, altitude: 0 }  // Montgomery Station
    ];
    
    // Hayes Valley route
    const hayesValleyWaypoints = [
      { longitude: -122.4264, latitude: 37.7759, altitude: 0 }, // Hayes Valley
      { longitude: -122.4169, latitude: 37.7811, altitude: 0 }, // Opera House
      { longitude: -122.4037, latitude: 37.7873, altitude: 0 }  // Union Square
    ];
    
    // Golden Gate Park scenic route
    const parkWaypoints = [
      { longitude: -122.4699, latitude: 37.7686, altitude: 0 }, // Golden Gate Park
      { longitude: -122.4559, latitude: 37.7726, altitude: 0 }, // Haight Street
      { longitude: -122.4169, latitude: 37.7811, altitude: 0 }  // City Hall area
    ];
    
    // Generate routes with each set of waypoints
    const routes = await Promise.all([
      getMapboxRoute(startPoint, endPoint, chinatownWaypoints),
      getMapboxRoute(startPoint, endPoint, marketStreetWaypoints),
      getMapboxRoute(startPoint, endPoint, hayesValleyWaypoints),
      getMapboxRoute(startPoint, endPoint, parkWaypoints)
    ]);
    
    // Add routes to variations with appropriate characteristics
    variations.push(
      {
        name: isFlying ? 'Chinatown Flight Path' : 'Chinatown Route',
        description: 'A challenging path through Chinatown with many turns and cultural landmarks.',
        points: isFlying ? addAltitudeVariation(routes[0], 20, 80) : routes[0],
        characteristics: {
          efficiency: 60,
          complexity: 85,
          risk: 70
        }
      },
      {
        name: isFlying ? 'Market Street Corridor' : 'Market Street Route',
        description: 'Following the main artery of the city with predictable traffic patterns.',
        points: isFlying ? addAltitudeVariation(routes[1], 30, 60) : routes[1],
        characteristics: {
          efficiency: 75,
          complexity: 50,
          risk: 40
        }
      },
      {
        name: isFlying ? 'Hayes Valley Traverse' : 'Hayes Valley Route',
        description: 'A balanced route through diverse neighborhoods with moderate challenges.',
        points: isFlying ? addAltitudeVariation(routes[2], 15, 50) : routes[2],
        characteristics: {
          efficiency: 70,
          complexity: 65,
          risk: 55
        }
      },
      {
        name: isFlying ? 'Park & Haight Flight' : 'Park & Haight Route',
        description: 'A scenic route through Golden Gate Park and Haight Street.',
        points: isFlying ? addAltitudeVariation(routes[3], 10, 70) : routes[3],
        characteristics: {
          efficiency: 50,
          complexity: 75,
          risk: 60
        }
      }
    );
    
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