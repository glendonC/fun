import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Bird, Rat } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

interface MapboxRacerMarkerProps {
  map: mapboxgl.Map;
  position: {
    longitude: number;
    latitude: number;
    rotation: number;
  };
  isRat: boolean;
  isRacing: boolean;
  primaryColor: string;
  markerId: string;
  isOpponent?: boolean;
}

const MapboxRacerMarker: React.FC<MapboxRacerMarkerProps> = ({
  map,
  position,
  isRat,
  isRacing,
  primaryColor,
  markerId,
  isOpponent = false
}) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = `racer-marker-${markerId}`;
      
      // Use Lucide icons
      const ratIcon = ReactDOMServer.renderToString(
        <Rat 
          size={40} 
          color="#F59E0B" // Orange/Amber color
          strokeWidth={2}
        />
      );
      
      const birdIcon = ReactDOMServer.renderToString(
        <Bird 
          size={40} 
          color="#3B82F6" // Blue color
          strokeWidth={2}
        />
      );

      el.innerHTML = isRat ? ratIcon : birdIcon;
      el.style.transform = `rotate(${position.rotation}deg)`;

      // Create marker aligned to the route
      markerRef.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map',
        pitchAlignment: 'map'
      })
      .setLngLat([position.longitude, position.latitude])
      .addTo(map);
    }

    // Update position
    if (markerRef.current) {
      markerRef.current.setLngLat([position.longitude, position.latitude]);
      const el = markerRef.current.getElement();
      el.style.transform = `rotate(${position.rotation}deg)`;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, position, isRat, isRacing, primaryColor, markerId, isOpponent]);

  return null;
};

export default MapboxRacerMarker;