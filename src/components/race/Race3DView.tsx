import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import RacerModel from '../RacerModel';
import RaceEnvironment from '../RaceEnvironment';
import * as THREE from 'three';

interface Race3DViewProps {
  modelId: string;
  racerPosition: {
    x: number;
    y: number;
    z: number;
    rotation: number;
  };
  cameraMode: 'thirdPerson' | 'firstPerson';
  isRacing: boolean;
  currentSpeed: number;
  cameraTarget: React.RefObject<THREE.Vector3>;
  selectedRoute: number[][];
}

const Race3DView: React.FC<Race3DViewProps> = ({
  modelId,
  racerPosition,
  cameraMode,
  isRacing,
  currentSpeed,
  cameraTarget,
  selectedRoute
}) => {
  const isRat = modelId === 'dbrx';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate camera position based on racer position and camera mode
  // Adjusted for better visibility and more immersive third-person view
  const cameraPosition = cameraMode === 'thirdPerson' 
    ? [
        // Position camera behind and slightly above the racer
        racerPosition.x - Math.cos(racerPosition.rotation * Math.PI / 180) * 8, 
        racerPosition.y + 3, // Lower height for better view
        racerPosition.z - Math.sin(racerPosition.rotation * Math.PI / 180) * 8
      ]
    : [
        // First person view from racer's perspective
        racerPosition.x + Math.cos(racerPosition.rotation * Math.PI / 180) * 0.5, 
        racerPosition.y + (isRat ? 0.5 : 1.5), // Eye level
        racerPosition.z + Math.sin(racerPosition.rotation * Math.PI / 180) * 0.5
      ];
  
  // Calculate look-at point - always looking ahead of the racer
  const lookAtPoint = [
    racerPosition.x + Math.cos(racerPosition.rotation * Math.PI / 180) * 10,
    racerPosition.y + (cameraMode === 'firstPerson' ? 0 : 1), // Look slightly up in third person
    racerPosition.z + Math.sin(racerPosition.rotation * Math.PI / 180) * 10
  ];
  
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        {/* Camera Setup */}
        <PerspectiveCamera
          makeDefault
          position={cameraPosition as [number, number, number]}
          fov={cameraMode === 'thirdPerson' ? 75 : 90} // Wider FOV for better visibility
          near={0.1}
          far={2000}
          lookAt={lookAtPoint as [number, number, number]}
        />
        
        {/* Environment lighting */}
        <ambientLight intensity={0.8} /> {/* Brighter ambient light */}
        <directionalLight 
          position={[100, 100, 50]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
        />
        <Environment preset="sunset" /> {/* Changed environment for better visibility */}
        
        {/* Race Environment (streets, buildings, etc.) */}
        <RaceEnvironment route={selectedRoute} />
        
        {/* Racer Model */}
        <RacerModel 
          isRat={isRat} 
          position={[racerPosition.x, racerPosition.y, racerPosition.z]} 
          rotation={[0, racerPosition.rotation * Math.PI / 180, 0]}
          isMoving={isRacing}
          speed={currentSpeed}
        />
      </Canvas>
    </div>
  );
};

export default Race3DView;