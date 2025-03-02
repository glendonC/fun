import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimatedRacerModel3DProps {
  isRat: boolean;
  isMoving: boolean;
  speed: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

const AnimatedRacerModel3D: React.FC<AnimatedRacerModel3DProps> = ({
  isRat,
  isMoving,
  speed,
  position,
  rotation
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const animationRef = useRef<{ time: number }>({ time: 0 });
  
  // Animation parameters
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Update animation time
    if (isMoving) {
      animationRef.current.time += delta * speed * 10;
    }
    
    const group = groupRef.current;
    
    if (isRat) {
      // Rat running animation
      if (isMoving) {
        // Bobbing up and down motion
        group.position.y = position[1] + Math.sin(animationRef.current.time * 15) * 0.1;
        
        // Slight tilting based on speed
        group.rotation.z = Math.sin(animationRef.current.time * 12) * 0.15 * speed;
      }
    } else {
      // Pigeon flying animation
      if (isMoving) {
        // Wing flapping and body movement
        group.position.y = position[1] + Math.sin(animationRef.current.time * 8) * 0.15;
        
        // Slight rolling motion for flying
        group.rotation.z = Math.sin(animationRef.current.time * 5) * 0.2;
      }
    }
    
    // Apply base position and rotation
    group.position.x = position[0];
    group.position.z = position[2];
    group.rotation.y = rotation[1];
  });
  
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {isRat ? (
        // Rat model - made larger and more detailed
        <group scale={[1, 1, 1]}>
          {/* Rat body */}
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.5, 1.5, 8, 16]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          
          {/* Rat head */}
          <mesh castShadow receiveShadow position={[0, 0, -1]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          
          {/* Rat ears */}
          <mesh castShadow position={[0.4, 0.5, -1]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.4, 0.5, -1]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          
          {/* Rat eyes */}
          <mesh position={[0.25, 0.2, -1.5]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[-0.25, 0.2, -1.5]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
          
          {/* Rat nose */}
          <mesh position={[0, 0, -1.6]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="pink" />
          </mesh>
          
          {/* Rat tail */}
          <mesh castShadow position={[0, 0, 1.5]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.05, 0.1, 3, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          
          {/* Rat legs - animated based on movement */}
          <group>
            {/* Front legs */}
            <mesh 
              castShadow 
              position={[0.4, -0.4, -0.7]} 
              rotation={[
                0, 
                0, 
                -Math.PI / 4 + (isMoving ? Math.sin(animationRef.current.time * 20) * 0.7 : 0)
              ]}
            >
              <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            <mesh 
              castShadow 
              position={[-0.4, -0.4, -0.7]} 
              rotation={[
                0, 
                0, 
                Math.PI / 4 + (isMoving ? Math.cos(animationRef.current.time * 20) * 0.7 : 0)
              ]}
            >
              <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            
            {/* Back legs */}
            <mesh 
              castShadow 
              position={[0.4, -0.4, 0.7]} 
              rotation={[
                0, 
                0, 
                -Math.PI / 4 + (isMoving ? Math.cos(animationRef.current.time * 20) * 0.7 : 0)
              ]}
            >
              <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            <mesh 
              castShadow 
              position={[-0.4, -0.4, 0.7]} 
              rotation={[
                0, 
                0, 
                Math.PI / 4 + (isMoving ? Math.sin(animationRef.current.time * 20) * 0.7 : 0)
              ]}
            >
              <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
          </group>
          
          {/* Add a racing helmet */}
          <mesh castShadow position={[0, 0.7, -0.8]}>
            <sphereGeometry args={[0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.7} roughness={0.3} />
          </mesh>
          
          {/* Add racing goggles */}
          <mesh position={[0.3, 0.3, -1.5]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" metalness={0.5} roughness={0.2} />
          </mesh>
          <mesh position={[-0.3, 0.3, -1.5]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" metalness={0.5} roughness={0.2} />
          </mesh>
        </group>
      ) : (
        // Pigeon model - made larger and more detailed
        <group scale={[1.2, 1.2, 1.2]}>
          {/* Pigeon body */}
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.6, 1.2, 8, 16]} />
            <meshStandardMaterial color="#708090" roughness={0.6} />
          </mesh>
          
          {/* Pigeon head */}
          <mesh castShadow receiveShadow position={[0, 0.3, -1]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#708090" roughness={0.6} />
          </mesh>
          
          {/* Pigeon eyes */}
          <mesh position={[0.2, 0.5, -1.3]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[-0.2, 0.5, -1.3]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
          
          {/* Pigeon beak */}
          <mesh castShadow position={[0, 0.3, -1.5]} rotation={[Math.PI / 8, 0, 0]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial color="#FFA500" />
          </mesh>
          
          {/* Pigeon wings - animated based on movement */}
          <group>
            {/* Left wing */}
            <mesh 
              castShadow 
              position={[-0.8, 0.2, 0]} 
              rotation={[
                0, 
                0, 
                isMoving ? 
                  Math.sin(animationRef.current.time * 15) * 0.8 * speed : 
                  -0.2
              ]}
            >
              <boxGeometry args={[1, 0.1, 1.2]} />
              <meshStandardMaterial color="#708090" roughness={0.6} />
            </mesh>
            
            {/* Right wing */}
            <mesh 
              castShadow 
              position={[0.8, 0.2, 0]} 
              rotation={[
                0, 
                0, 
                isMoving ? 
                  -Math.sin(animationRef.current.time * 15) * 0.8 * speed : 
                  0.2
              ]}
            >
              <boxGeometry args={[1, 0.1, 1.2]} />
              <meshStandardMaterial color="#708090" roughness={0.6} />
            </mesh>
          </group>
          
          {/* Pigeon tail */}
          <mesh 
            castShadow 
            position={[0, 0, 1]} 
            rotation={[
              Math.PI / 8 + (isMoving ? Math.sin(animationRef.current.time * 8) * 0.2 : 0), 
              0, 
              0
            ]}
          >
            <boxGeometry args={[0.8, 0.1, 0.6]} />
            <meshStandardMaterial color="#708090" roughness={0.6} />
          </mesh>
          
          {/* Pigeon legs */}
          <mesh castShadow position={[0.2, -0.6, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
            <meshStandardMaterial color="#FFA500" />
          </mesh>
          <mesh castShadow position={[-0.2, -0.6, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
            <meshStandardMaterial color="#FFA500" />
          </mesh>
          
          {/* Add a racing helmet */}
          <mesh castShadow position={[0, 0.7, -0.8]}>
            <sphereGeometry args={[0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#3B82F6" metalness={0.7} roughness={0.3} />
          </mesh>
          
          {/* Add racing goggles */}
          <mesh position={[0.3, 0.5, -1.3]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" metalness={0.5} roughness={0.2} />
          </mesh>
          <mesh position={[-0.3, 0.5, -1.3]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" metalness={0.5} roughness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default AnimatedRacerModel3D;