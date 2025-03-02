import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getFixedPoints } from '../services/routeService';
import 'mapbox-gl/dist/mapbox-gl.css';

// This is a public token for development purposes
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZHBpY2siLCJhIjoiY203cWtya2liMGFiYzJsb282Y2x6N2ZzayJ9.UGn23wIO5M7r-_5yajMGTg';

interface RoutePreviewProps {
  route: any[];
  modelId: string;
}

const RoutePreview: React.FC<RoutePreviewProps> = ({ route, modelId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const animationRef = useRef<number | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? '#F59E0B' : '#3B82F6';
  
  // Get fixed start and finish points
  const { startPoint, finishPoint } = getFixedPoints();
  
  useEffect(() => {
    if (!mapContainerRef.current || !route || route.length === 0) return;
    
    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [startPoint.longitude, startPoint.latitude],
      zoom: 13,
      pitch: 45,
      bearing: 0,
      interactive: false // Disable interactions for preview
    });
    
    map.on('load', () => {
      setMapLoaded(true);
      
      // Format route coordinates properly
      const coordinates = Array.isArray(route[0]) 
        ? route.map(point => [point[0], point[1]]) // Handle array format
        : route.map(point => [point.longitude, point.latitude]); // Handle object format
      
      console.log('Route Preview Coordinates:', coordinates);
      
      // Add route source
      map.addSource('route', {
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
      
      // Add route layer
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': primaryColor,
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
      
      // Add animated route layer
      map.addLayer({
        id: 'route-animated',
        type: 'line',
        source: 'route',
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
      
      // Add start marker
      new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([startPoint.longitude, startPoint.latitude])
        .addTo(map);
      
      // Add finish marker - NASDAQ building
      new mapboxgl.Marker({ color: '#EF4444' })
        .setLngLat([finishPoint.longitude, finishPoint.latitude])
        .addTo(map);
      
      // Create a custom HTML element for the racer marker
      const el = document.createElement('div');
      el.className = 'racer-marker-preview';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.backgroundColor = isRat ? 'rgba(245, 158, 11, 0.8)' : 'rgba(59, 130, 246, 0.8)';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      
      // Add the icon
      const icon = document.createElement('div');
      icon.innerHTML = isRat 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16.5v-.77a2.73 2.73 0 0 1 3.27-2.68l3.02.6a1.4 1.4 0 0 0 1.5-2.08l-1.63-2.8a3 3 0 0 0-3.93-1.13l-2.46 1.1a2.73 2.73 0 0 1-3.63-2.24l-.21-1.9a2 2 0 0 0-2-1.8h-.59a2 2 0 0 0-2 2v.06a3.04 3.04 0 0 0 .67 1.9l1.33 1.77"/><path d="M16 15h.01"/><path d="M19 17h.01"/><path d="M11.5 14.5a3.5 3.5 0 0 0-7 0"/><path d="M9 11.5V11"/><path d="M5 11.5V11"/><path d="M8 19a2 2 0 0 1-2-2"/><path d="M2 5l3 2"/><path d="M19 5l-3 2"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3.5h-7l.5 3.5-3.5 3.5 3.5 3.5-.5 3.5h7l-.5-3.5 3.5-3.5-3.5-3.5.5-3.5Z"/><path d="M10 8.5l-2.5 2.5 2.5 2.5"/><path d="M14 8.5l2.5 2.5-2.5 2.5"/><path d="M9 18.5l1.5 2.5h3l1.5-2.5"/></svg>';
      el.appendChild(icon);
      
      // Create the marker and add it to the map
      markerRef.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map'
      })
      .setLngLat(coordinates[0])
      .addTo(map);
      
      // Animate the line
      let step = 0;
      const animateLine = () => {
        if (!map || !map.getLayer('route-animated')) return;
        
        step = (step + 1) % 300;
        
        if (map.isStyleLoaded()) {
          map.setPaintProperty('route-animated', 'line-dasharray', [
            0,
            4,
            3,
            step
          ]);
        }
        
        // Animate marker along the route
        const routeProgress = (step % 100) / 100;
        const pointIndex = Math.min(
          Math.floor(routeProgress * coordinates.length),
          coordinates.length - 1
        );
        
        if (markerRef.current && pointIndex < coordinates.length) {
          // Calculate direction for rotation
          const currentPoint = coordinates[pointIndex];
          const nextPoint = coordinates[Math.min(pointIndex + 1, coordinates.length - 1)];
          
          // Calculate angle between points
          const angle = Math.atan2(
            nextPoint[1] - currentPoint[1],
            nextPoint[0] - currentPoint[0]
          ) * 180 / Math.PI;
          
          // Update marker position and rotation
          markerRef.current.setLngLat(currentPoint);
          
          // Rotate the marker element
          const markerEl = markerRef.current.getElement();
          markerEl.style.transform = `rotate(${angle}deg)`;
        }
        
        animationRef.current = requestAnimationFrame(animateLine);
      };
      
      animationRef.current = requestAnimationFrame(animateLine);
      
      // Fit map to route bounds with padding
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord as [number, number]);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      
      map.fitBounds(bounds, {
        padding: 40,
        duration: 1000
      });
    });
    
    mapRef.current = map;
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [route, modelId]);
  
  return (
    <div ref={mapContainerRef} className="w-full h-full" />
  );
};

export default RoutePreview;