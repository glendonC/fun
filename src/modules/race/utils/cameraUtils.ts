/**
 * Calculates the camera position behind the racer
 * @param longitude The racer's longitude
 * @param latitude The racer's latitude
 * @param rotation The racer's rotation in degrees
 * @param offsetDistance The distance behind the racer (in degrees)
 * @returns The offset position for the camera
 */
export const calculateCameraPosition = (
  longitude: number, 
  latitude: number, 
  rotation: number,
  offsetDistance: number = 0.00015 // Approximately 15 meters
) => {
  // Convert rotation to radians
  const bearingRad = (rotation * Math.PI) / 180;
  
  // Calculate the offset position (behind the racer)
  const offsetLng = longitude - Math.sin(bearingRad) * offsetDistance;
  const offsetLat = latitude - Math.cos(bearingRad) * offsetDistance;
  
  return { offsetLng, offsetLat };
};

/**
 * Calculates the camera position for first-person view
 * @param longitude The racer's longitude
 * @param latitude The racer's latitude
 * @param rotation The racer's rotation in degrees
 * @param offsetDistance The distance in front of the racer (in degrees)
 * @returns The offset position for the camera
 */
export const calculateFirstPersonPosition = (
  longitude: number, 
  latitude: number, 
  rotation: number,
  offsetDistance: number = 0.00005 // Approximately 5 meters
) => {
  // Convert rotation to radians
  const bearingRad = (rotation * Math.PI) / 180;
  
  // Calculate the offset position (in front of the racer)
  const offsetLng = longitude + Math.sin(bearingRad) * offsetDistance;
  const offsetLat = latitude + Math.cos(bearingRad) * offsetDistance;
  
  return { offsetLng, offsetLat };
};

/**
 * Calculates the camera settings for different view modes
 * @param mode The camera mode ('thirdPerson' or 'firstPerson')
 * @param racerPosition The racer's position
 * @returns Camera settings including position, zoom, pitch, and bearing
 */
export const getCameraSettings = (
  mode: 'thirdPerson' | 'firstPerson',
  racerPosition: {
    longitude: number;
    latitude: number;
    rotation: number;
  }
) => {
  if (mode === 'firstPerson') {
    const { offsetLng, offsetLat } = calculateFirstPersonPosition(
      racerPosition.longitude,
      racerPosition.latitude,
      racerPosition.rotation
    );
    
    return {
      center: [offsetLng, offsetLat],
      zoom: 20,
      pitch: 10, // Lower pitch for first-person view
      bearing: racerPosition.rotation
    };
  } else {
    const { offsetLng, offsetLat } = calculateCameraPosition(
      racerPosition.longitude,
      racerPosition.latitude,
      racerPosition.rotation
    );
    
    return {
      center: [offsetLng, offsetLat],
      zoom: 19.5,
      pitch: 75,
      bearing: racerPosition.rotation
    };
  }
};

/**
 * Calculates a position offset from a given point in a specific direction
 * @param longitude The starting longitude
 * @param latitude The starting latitude
 * @param rotation The direction in degrees
 * @param distance The distance to offset (in degrees)
 * @returns The new position
 */
export const calculatePositionOffset = (
  longitude: number,
  latitude: number,
  rotation: number,
  distance: number
) => {
  // Convert rotation to radians
  const bearingRad = (rotation * Math.PI) / 180;
  
  // Calculate the offset position
  const offsetLng = longitude + Math.sin(bearingRad) * distance;
  const offsetLat = latitude + Math.cos(bearingRad) * distance;
  
  return { longitude: offsetLng, latitude: offsetLat };
};