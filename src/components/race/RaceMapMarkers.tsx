import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface RaceMapMarkersProps {
  map: mapboxgl.Map;
  startPoint: {
    longitude: number;
    latitude: number;
  };
  finishPoint: {
    longitude: number;
    latitude: number;
  };
  racerPosition: {
    longitude: number;
    latitude: number;
    rotation: number;
  };
  isRacing: boolean;
  isRat: boolean;
  markerId?: string;
}

const RaceMapMarkers: React.FC<RaceMapMarkersProps> = ({
  map,
  startPoint,
  finishPoint,
  racerPosition,
  isRacing,
  isRat,
  markerId = 'default'
}) => {
  const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const finishMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const racerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  // Add start and finish markers
  useEffect(() => {
    // Only add start/finish markers for the default marker set
    if (markerId === 'default' || markerId === 'player') {
      // Add start marker if it doesn't exist
      if (!startMarkerRef.current) {
        startMarkerRef.current = new mapboxgl.Marker({ color: '#10B981' })
          .setLngLat([startPoint.longitude, startPoint.latitude])
          .addTo(map);
      }
      
      // Add finish marker if it doesn't exist
      if (!finishMarkerRef.current) {
        finishMarkerRef.current = new mapboxgl.Marker({ color: '#EF4444' })
          .setLngLat([finishPoint.longitude, finishPoint.latitude])
          .addTo(map);
      }
    }
    
    return () => {
      // Clean up markers when component unmounts
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
      
      if (finishMarkerRef.current) {
        finishMarkerRef.current.remove();
        finishMarkerRef.current = null;
      }
    };
  }, [map, startPoint, finishPoint, markerId]);
  
  // Create and update racer marker
  useEffect(() => {
    // Create racer marker if it doesn't exist
    if (!racerMarkerRef.current) {
      // Create a custom HTML element for the marker
      const el = document.createElement('div');
      el.className = `racer-marker-${markerId}`;
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.backgroundColor = isRat ? 'rgba(245, 158, 11, 0.8)' : 'rgba(59, 130, 246, 0.8)';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      
      // Add the icon
      const icon = document.createElement('div');
      icon.innerHTML = isRat 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16.5v-.77a2.73 2.73 0 0 1 3.27-2.68l3.02.6a1.4 1.4 0 0 0 1.5-2.08l-1.63-2.8a3 3 0 0 0-3.93-1.13l-2.46 1.1a2.73 2.73 0 0 1-3.63-2.24l-.21-1.9a2 2 0 0 0-2-1.8h-.59a2 2 0 0 0-2 2v.06a3.04 3.04 0 0 0 .67 1.9l1.33 1.77"/><path d="M16 15h.01"/><path d="M19 17h.01"/><path d="M11.5 14.5a3.5 3.5 0 0 0-7 0"/><path d="M9 11.5V11"/><path d="M5 11.5V11"/><path d="M8 19a2 2 0 0 1-2-2"/><path d="M2 5l3 2"/><path d="M19 5l-3 2"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3.5h-7l.5 3.5-3.5 3.5 3.5 3.5-.5 3.5h7l-.5-3.5 3.5-3.5-3.5-3.5.5-3.5Z"/><path d="M10 8.5l-2.5 2.5 2.5 2.5"/><path d="M14 8.5l2.5 2.5-2.5 2.5"/><path d="M9 18.5l1.5 2.5h3l1.5-2.5"/></svg>';
      el.appendChild(icon);
      
      // Create the marker
      racerMarkerRef.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map'
      })
      .setLngLat([racerPosition.longitude, racerPosition.latitude])
      .addTo(map);
    }
    
    // Update marker position and rotation
    if (racerMarkerRef.current) {
      racerMarkerRef.current.setLngLat([racerPosition.longitude, racerPosition.latitude]);
      
      // Set rotation
      const el = racerMarkerRef.current.getElement();
      el.style.transform = `rotate(${racerPosition.rotation}deg)`;
      
      // Add animation effect when racing
      if (isRacing) {
        el.classList.add('racing');
        el.style.animation = 'pulse 1s infinite alternate';
      } else {
        el.classList.remove('racing');
        el.style.animation = '';
      }
    }
    
    // Add animation keyframes to document if not already added
    if (!document.getElementById(`racer-marker-style-${markerId}`)) {
      const style = document.createElement('style');
      style.id = `racer-marker-style-${markerId}`;
      style.innerHTML = `
        @keyframes pulse {
          0% { transform: rotate(${racerPosition.rotation}deg) scale(1); }
          100% { transform: rotate(${racerPosition.rotation}deg) scale(1.1); }
        }
        .racing {
          animation: pulse 0.5s infinite alternate;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Clean up racer marker when component unmounts
      if (racerMarkerRef.current) {
        racerMarkerRef.current.remove();
        racerMarkerRef.current = null;
      }
    };
  }, [map, racerPosition, isRacing, isRat, markerId]);
  
  // This is a non-rendering component
  return null;
};

export default RaceMapMarkers;