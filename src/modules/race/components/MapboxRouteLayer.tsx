import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapboxRouteLayerProps {
  map: mapboxgl.Map;
  route: number[][];
  isRat: boolean;
  layerIdSuffix?: string;
  isOpponent?: boolean;
}

const MapboxRouteLayer: React.FC<MapboxRouteLayerProps> = ({ 
  map, 
  route, 
  isRat,
  layerIdSuffix = '',
  isOpponent = false
}) => {
  const [routeAdded, setRouteAdded] = useState(false);
  const suffix = layerIdSuffix ? `-${layerIdSuffix}` : '';
  
  // Clean up previous route layers when component unmounts or route changes
  useEffect(() => {
    return () => {
      // Remove previous route layers if they exist
      const sourceId = `race-route${suffix}`;
      if (map.getSource(sourceId)) {
        try {
          // Remove layers first
          if (map.getLayer(`race-route-path${suffix}`)) {
            map.removeLayer(`race-route-path${suffix}`);
          }
          if (map.getLayer(`race-route-glow${suffix}`)) {
            map.removeLayer(`race-route-glow${suffix}`);
          }
          if (map.getLayer(`race-route-dash${suffix}`)) {
            map.removeLayer(`race-route-dash${suffix}`);
          }
          // Then remove source
          map.removeSource(sourceId);
        } catch (error) {
          console.error(`Error removing route layers: ${error}`);
        }
      }
    };
  }, [map, route, suffix]);
  
  useEffect(() => {
    if (!map || !route || route.length === 0) return;
    
    // Reset route added state when route changes
    setRouteAdded(false);
    
    // Wait for the map style to load
    if (!map.isStyleLoaded()) {
      const checkStyleLoaded = setInterval(() => {
        if (map.isStyleLoaded()) {
          clearInterval(checkStyleLoaded);
          addRouteToMap();
        }
      }, 100);
      
      return () => clearInterval(checkStyleLoaded);
    } else {
      addRouteToMap();
    }
    
    function addRouteToMap() {
      // Source ID for this route
      const sourceId = `race-route${suffix}`;
      
      // Remove previous route layers if they exist
      if (map.getSource(sourceId)) {
        try {
          // Remove layers first
          if (map.getLayer(`race-route-path${suffix}`)) {
            map.removeLayer(`race-route-path${suffix}`);
          }
          if (map.getLayer(`race-route-glow${suffix}`)) {
            map.removeLayer(`race-route-glow${suffix}`);
          }
          if (map.getLayer(`race-route-dash${suffix}`)) {
            map.removeLayer(`race-route-dash${suffix}`);
          }
          // Then remove source
          map.removeSource(sourceId);
        } catch (error) {
          console.error(`Error removing route layers: ${error}`);
        }
      }
      
      // Format route coordinates for Mapbox
      const coordinates = route.map((point: number[]) => [point[0], point[1]]);
      
      // Add route source
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });
      
      // Adjust opacity and width based on whether this is the player's or opponent's route
      const mainOpacity = isOpponent ? 0.5 : 0.9;
      const glowOpacity = isOpponent ? 0.2 : 0.4;
      const lineWidth = isOpponent ? 4 : 6;
      const glowWidth = isOpponent ? 8 : 12;
      
      // Add route layer - main path
      map.addLayer({
        id: `race-route-path${suffix}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': isRat ? '#F59E0B' : '#3B82F6',
          'line-width': lineWidth,
          'line-opacity': mainOpacity
        }
      });
      
      // Add route layer - glowing effect
      map.addLayer({
        id: `race-route-glow${suffix}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': isRat ? '#FCD34D' : '#93C5FD',
          'line-width': glowWidth,
          'line-opacity': glowOpacity,
          'line-blur': 3
        }
      });
      
      // Add animated dash pattern only for player's route
      if (!isOpponent) {
        map.addLayer({
          id: `race-route-dash${suffix}`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 2,
            'line-opacity': 0.8,
            'line-dasharray': [0, 4, 3]
          }
        });
        
        // Animate the dash pattern
        let dashOffset = 0;
        const animateDash = () => {
          dashOffset = (dashOffset + 1) % 8;
          if (map.getLayer(`race-route-dash${suffix}`)) {
            map.setPaintProperty(`race-route-dash${suffix}`, 'line-dasharray', [0, 4, 3, dashOffset]);
          }
          requestAnimationFrame(animateDash);
        };
        
        requestAnimationFrame(animateDash);
      }
      
      setRouteAdded(true);
    }
  }, [map, route, isRat, suffix, isOpponent]);
  
  // This is a non-rendering component
  return null;
};

export default MapboxRouteLayer;