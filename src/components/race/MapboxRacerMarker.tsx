import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

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
  const animationFrameRef = useRef<number | null>(null);
  
  // Create and update marker
  useEffect(() => {
    // Create marker if it doesn't exist
    if (!markerRef.current) {
      // Create a custom HTML element for the marker
      const el = document.createElement('div');
      el.className = `racer-marker-${markerId}`;
      // Make the markers much larger for better visibility
      el.style.width = isOpponent ? '80px' : '100px';
      el.style.height = isOpponent ? '80px' : '100px';
      el.style.position = 'relative';
      el.style.transform = `rotate(${position.rotation}deg)`;
      
      // Create the 3D model container with perspective
      const modelContainer = document.createElement('div');
      modelContainer.className = 'model-container';
      modelContainer.style.width = '100%';
      modelContainer.style.height = '100%';
      modelContainer.style.position = 'absolute';
      modelContainer.style.top = '0';
      modelContainer.style.left = '0';
      modelContainer.style.display = 'flex';
      modelContainer.style.alignItems = 'center';
      modelContainer.style.justifyContent = 'center';
      modelContainer.style.perspective = '800px';
      modelContainer.style.transformStyle = 'preserve-3d';
      
      if (isRat) {
        // Create 3D Rat model
        const ratModel = create3DRatModel();
        modelContainer.appendChild(ratModel);
      } else {
        // Create 3D Bird model
        const birdModel = create3DBirdModel();
        modelContainer.appendChild(birdModel);
      }
      
      // Add the container to the marker element
      el.appendChild(modelContainer);
      
      // Add background circle
      const bgCircle = document.createElement('div');
      bgCircle.style.position = 'absolute';
      bgCircle.style.width = '100%';
      bgCircle.style.height = '100%';
      bgCircle.style.borderRadius = '50%';
      bgCircle.style.backgroundColor = isRat ? 'rgba(245, 158, 11, 0.8)' : 'rgba(59, 130, 246, 0.8)';
      bgCircle.style.opacity = isOpponent ? '0.6' : '0.8';
      bgCircle.style.zIndex = '-1';
      el.insertBefore(bgCircle, modelContainer);
      
      // Create the marker
      markerRef.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map',
        pitchAlignment: 'map'
      })
      .setLngLat([position.longitude, position.latitude])
      .addTo(map);
      
      // Start animation
      startAnimation(el, isRat);
    }
    
    // Update marker position and rotation
    if (markerRef.current) {
      markerRef.current.setLngLat([position.longitude, position.latitude]);
      
      // Set rotation
      const el = markerRef.current.getElement();
      el.style.transform = `rotate(${position.rotation}deg)`;
      
      // Update animation state
      const modelContainer = el.querySelector('.model-container');
      if (modelContainer) {
        if (isRacing) {
          modelContainer.classList.add('racing');
        } else {
          modelContainer.classList.remove('racing');
        }
      }
    }
    
    return () => {
      // Clean up animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clean up marker when component unmounts
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, position, isRat, isRacing, primaryColor, markerId, isOpponent]);
  
  // Create 3D Rat model with proper 3D shapes
  const create3DRatModel = () => {
    const scene = document.createElement('div');
    scene.className = 'rat-model-3d';
    scene.style.position = 'relative';
    scene.style.width = '100%';
    scene.style.height = '100%';
    scene.style.transformStyle = 'preserve-3d';
    
    // Rat body - main capsule
    const body = document.createElement('div');
    body.className = 'rat-body-3d';
    body.style.position = 'absolute';
    body.style.width = '70%';
    body.style.height = '40%';
    body.style.left = '15%';
    body.style.top = '30%';
    body.style.backgroundColor = '#8B4513';
    body.style.borderRadius = '40% 60% 60% 40%';
    body.style.transformStyle = 'preserve-3d';
    body.style.transform = 'translateZ(15px)';
    scene.appendChild(body);
    
    // Rat head - sphere
    const head = document.createElement('div');
    head.className = 'rat-head-3d';
    head.style.position = 'absolute';
    head.style.width = '40%';
    head.style.height = '40%';
    head.style.left = '0%';
    head.style.top = '25%';
    head.style.backgroundColor = '#8B4513';
    head.style.borderRadius = '60%';
    head.style.transformStyle = 'preserve-3d';
    head.style.transform = 'translateZ(20px)';
    scene.appendChild(head);
    
    // Rat ears - two cones
    const leftEar = document.createElement('div');
    leftEar.className = 'rat-ear-left-3d';
    leftEar.style.position = 'absolute';
    leftEar.style.width = '15%';
    leftEar.style.height = '15%';
    leftEar.style.left = '10%';
    leftEar.style.top = '15%';
    leftEar.style.backgroundColor = '#8B4513';
    leftEar.style.borderRadius = '50% 50% 0 0';
    leftEar.style.transform = 'translateZ(25px) rotateX(-30deg)';
    scene.appendChild(leftEar);
    
    const rightEar = document.createElement('div');
    rightEar.className = 'rat-ear-right-3d';
    rightEar.style.position = 'absolute';
    rightEar.style.width = '15%';
    rightEar.style.height = '15%';
    rightEar.style.left = '30%';
    rightEar.style.top = '15%';
    rightEar.style.backgroundColor = '#8B4513';
    rightEar.style.borderRadius = '50% 50% 0 0';
    rightEar.style.transform = 'translateZ(25px) rotateX(-30deg)';
    scene.appendChild(rightEar);
    
    // Rat eyes - two spheres
    const leftEye = document.createElement('div');
    leftEye.className = 'rat-eye-left-3d';
    leftEye.style.position = 'absolute';
    leftEye.style.width = '8%';
    leftEye.style.height = '8%';
    leftEye.style.left = '10%';
    leftEye.style.top = '30%';
    leftEye.style.backgroundColor = 'black';
    leftEye.style.borderRadius = '50%';
    leftEye.style.transform = 'translateZ(30px)';
    scene.appendChild(leftEye);
    
    const rightEye = document.createElement('div');
    rightEye.className = 'rat-eye-right-3d';
    rightEye.style.position = 'absolute';
    rightEye.style.width = '8%';
    rightEye.style.height = '8%';
    rightEye.style.left = '25%';
    rightEye.style.top = '30%';
    rightEye.style.backgroundColor = 'black';
    rightEye.style.borderRadius = '50%';
    rightEye.style.transform = 'translateZ(30px)';
    scene.appendChild(rightEye);
    
    // Rat nose - small sphere
    const nose = document.createElement('div');
    nose.className = 'rat-nose-3d';
    nose.style.position = 'absolute';
    nose.style.width = '10%';
    nose.style.height = '10%';
    nose.style.left = '5%';
    nose.style.top = '35%';
    nose.style.backgroundColor = 'pink';
    nose.style.borderRadius = '50%';
    nose.style.transform = 'translateZ(35px)';
    scene.appendChild(nose);
    
    // Rat tail - cylinder
    const tail = document.createElement('div');
    tail.className = 'rat-tail-3d';
    tail.style.position = 'absolute';
    tail.style.width = '40%';
    tail.style.height = '5%';
    tail.style.left = '80%';
    tail.style.top = '50%';
    tail.style.backgroundColor = '#8B4513';
    tail.style.borderRadius = '5px';
    tail.style.transformOrigin = 'left center';
    tail.style.transform = 'translateZ(15px) rotateY(-10deg)';
    scene.appendChild(tail);
    
    // Rat front legs - two cylinders
    const frontLeftLeg = document.createElement('div');
    frontLeftLeg.className = 'rat-leg-front-left-3d';
    frontLeftLeg.style.position = 'absolute';
    frontLeftLeg.style.width = '5%';
    frontLeftLeg.style.height = '20%';
    frontLeftLeg.style.left = '25%';
    frontLeftLeg.style.top = '70%';
    frontLeftLeg.style.backgroundColor = '#8B4513';
    frontLeftLeg.style.borderRadius = '5px';
    frontLeftLeg.style.transformOrigin = 'top center';
    frontLeftLeg.style.transform = 'translateZ(18px) rotateX(10deg)';
    scene.appendChild(frontLeftLeg);
    
    const frontRightLeg = document.createElement('div');
    frontRightLeg.className = 'rat-leg-front-right-3d';
    frontRightLeg.style.position = 'absolute';
    frontRightLeg.style.width = '5%';
    frontRightLeg.style.height = '20%';
    frontRightLeg.style.left = '35%';
    frontRightLeg.style.top = '70%';
    frontRightLeg.style.backgroundColor = '#8B4513';
    frontRightLeg.style.borderRadius = '5px';
    frontRightLeg.style.transformOrigin = 'top center';
    frontRightLeg.style.transform = 'translateZ(12px) rotateX(10deg)';
    scene.appendChild(frontRightLeg);
    
    // Rat back legs - two cylinders
    const backLeftLeg = document.createElement('div');
    backLeftLeg.className = 'rat-leg-back-left-3d';
    backLeftLeg.style.position = 'absolute';
    backLeftLeg.style.width = '5%';
    backLeftLeg.style.height = '20%';
    backLeftLeg.style.left = '65%';
    backLeftLeg.style.top = '70%';
    backLeftLeg.style.backgroundColor = '#8B4513';
    backLeftLeg.style.borderRadius = '5px';
    backLeftLeg.style.transformOrigin = 'top center';
    backLeftLeg.style.transform = 'translateZ(18px) rotateX(10deg)';
    scene.appendChild(backLeftLeg);
    
    const backRightLeg = document.createElement('div');
    backRightLeg.className = 'rat-leg-back-right-3d';
    backRightLeg.style.position = 'absolute';
    backRightLeg.style.width = '5%';
    backRightLeg.style.height = '20%';
    backRightLeg.style.left = '75%';
    backRightLeg.style.top = '70%';
    backRightLeg.style.backgroundColor = '#8B4513';
    backRightLeg.style.borderRadius = '5px';
    backRightLeg.style.transformOrigin = 'top center';
    backRightLeg.style.transform = 'translateZ(12px) rotateX(10deg)';
    scene.appendChild(backRightLeg);
    
    // Racing helmet - half sphere
    const helmet = document.createElement('div');
    helmet.className = 'rat-helmet-3d';
    helmet.style.position = 'absolute';
    helmet.style.width = '35%';
    helmet.style.height = '20%';
    helmet.style.left = '10%';
    helmet.style.top = '10%';
    helmet.style.backgroundColor = '#F59E0B';
    helmet.style.borderRadius = '50% 50% 0 0';
    helmet.style.transform = 'translateZ(30px)';
    helmet.style.boxShadow = 'inset 0 -5px 10px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.3)';
    scene.appendChild(helmet);
    
    // Racing goggles - two spheres with glass effect
    const leftGoggle = document.createElement('div');
    leftGoggle.className = 'rat-goggle-left-3d';
    leftGoggle.style.position = 'absolute';
    leftGoggle.style.width = '10%';
    leftGoggle.style.height = '10%';
    leftGoggle.style.left = '12%';
    leftGoggle.style.top = '28%';
    leftGoggle.style.backgroundColor = 'rgba(255,255,255,0.7)';
    leftGoggle.style.borderRadius = '50%';
    leftGoggle.style.transform = 'translateZ(35px)';
    leftGoggle.style.boxShadow = 'inset 0 0 5px rgba(255,255,255,0.8), 0 0 2px rgba(0,0,0,0.3)';
    scene.appendChild(leftGoggle);
    
    const rightGoggle = document.createElement('div');
    rightGoggle.className = 'rat-goggle-right-3d';
    rightGoggle.style.position = 'absolute';
    rightGoggle.style.width = '10%';
    rightGoggle.style.height = '10%';
    rightGoggle.style.left = '27%';
    rightGoggle.style.top = '28%';
    rightGoggle.style.backgroundColor = 'rgba(255,255,255,0.7)';
    rightGoggle.style.borderRadius = '50%';
    rightGoggle.style.transform = 'translateZ(35px)';
    rightGoggle.style.boxShadow = 'inset 0 0 5px rgba(255,255,255,0.8), 0 0 2px rgba(0,0,0,0.3)';
    scene.appendChild(rightGoggle);
    
    // Add shadows for 3D effect
    const shadow = document.createElement('div');
    shadow.style.position = 'absolute';
    shadow.style.width = '90%';
    shadow.style.height = '10%';
    shadow.style.left = '5%';
    shadow.style.bottom = '-5%';
    shadow.style.backgroundColor = 'rgba(0,0,0,0.2)';
    shadow.style.borderRadius = '50%';
    shadow.style.filter = 'blur(2px)';
    shadow.style.transform = 'rotateX(90deg) translateZ(-10px)';
    scene.appendChild(shadow);
    
    return scene;
  };
  
  // Create 3D Bird model with proper 3D shapes
  const create3DBirdModel = () => {
    const scene = document.createElement('div');
    scene.className = 'bird-model-3d';
    scene.style.position = 'relative';
    scene.style.width = '100%';
    scene.style.height = '100%';
    scene.style.transformStyle = 'preserve-3d';
    
    // Bird body - main capsule
    const body = document.createElement('div');
    body.className = 'bird-body-3d';
    body.style.position = 'absolute';
    body.style.width = '60%';
    body.style.height = '50%';
    body.style.left = '20%';
    body.style.top = '30%';
    body.style.backgroundColor = '#708090';
    body.style.borderRadius = '60% 40% 40% 60%';
    body.style.transformStyle = 'preserve-3d';
    body.style.transform = 'translateZ(15px)';
    scene.appendChild(body);
    
    // Bird head - sphere
    const head = document.createElement('div');
    head.className = 'bird-head-3d';
    head.style.position = 'absolute';
    head.style.width = '35%';
    head.style.height = '35%';
    head.style.left = '10%';
    head.style.top = '20%';
    head.style.backgroundColor = '#708090';
    head.style.borderRadius = '50%';
    head.style.transformStyle = 'preserve-3d';
    head.style.transform = 'translateZ(20px)';
    scene.appendChild(head);
    
    // Bird eyes - two spheres
    const leftEye = document.createElement('div');
    leftEye.className = 'bird-eye-left-3d';
    leftEye.style.position = 'absolute';
    leftEye.style.width = '8%';
    leftEye.style.height = '8%';
    leftEye.style.left = '15%';
    leftEye.style.top = '25%';
    leftEye.style.backgroundColor = 'black';
    leftEye.style.borderRadius = '50%';
    leftEye.style.transform = 'translateZ(30px)';
    scene.appendChild(leftEye);
    
    const rightEye = document.createElement('div');
    rightEye.className = 'bird-eye-right-3d';
    rightEye.style.position = 'absolute';
    rightEye.style.width = '8%';
    rightEye.style.height = '8%';
    rightEye.style.left = '30%';
    rightEye.style.top = '25%';
    rightEye.style.backgroundColor = 'black';
    rightEye.style.borderRadius = '50%';
    rightEye.style.transform = 'translateZ(30px)';
    scene.appendChild(rightEye);
    
    // Bird beak - cone
    const beak = document.createElement('div');
    beak.className = 'bird-beak-3d';
    beak.style.position = 'absolute';
    beak.style.width = '15%';
    beak.style.height = '10%';
    beak.style.left = '5%';
    beak.style.top = '30%';
    beak.style.backgroundColor = '#FFA500';
    beak.style.borderRadius = '0 50% 50% 50%';
    beak.style.transform = 'translateZ(35px) rotateZ(-45deg)';
    scene.appendChild(beak);
    
    // Bird wings - two flat rectangles
    const leftWing = document.createElement('div');
    leftWing.className = 'bird-wing-left-3d';
    leftWing.style.position = 'absolute';
    leftWing.style.width = '30%';
    leftWing.style.height = '10%';
    leftWing.style.left = '0%';
    leftWing.style.top = '40%';
    leftWing.style.backgroundColor = '#708090';
    leftWing.style.borderRadius = '50% 50% 0 0';
    leftWing.style.transformOrigin = 'right center';
    leftWing.style.transform = 'translateZ(18px) rotateY(-20deg)';
    scene.appendChild(leftWing);
    
    const rightWing = document.createElement('div');
    rightWing.className = 'bird-wing-right-3d';
    rightWing.style.position = 'absolute';
    rightWing.style.width = '30%';
    rightWing.style.height = '10%';
    rightWing.style.left = '70%';
    rightWing.style.top = '40%';
    rightWing.style.backgroundColor = '#708090';
    rightWing.style.borderRadius = '50% 50% 0 0';
    rightWing.style.transformOrigin = 'left center';
    rightWing.style.transform = 'translateZ(18px) rotateY(20deg)';
    scene.appendChild(rightWing);
    
    // Bird tail - flat rectangle
    const tail = document.createElement('div');
    tail.className = 'bird-tail-3d';
    tail.style.position = 'absolute';
    tail.style.width = '20%';
    tail.style.height = '10%';
    tail.style.left = '80%';
    tail.style.top = '45%';
    tail.style.backgroundColor = '#708090';
    tail.style.borderRadius = '0 5px 5px 0';
    tail.style.transformOrigin = 'left center';
    tail.style.transform = 'translateZ(15px) rotateY(10deg)';
    scene.appendChild(tail);
    
    // Bird legs - two cylinders
    const leftLeg = document.createElement('div');
    leftLeg.className = 'bird-leg-left-3d';
    leftLeg.style.position = 'absolute';
    leftLeg.style.width = '5%';
    leftLeg.style.height = '20%';
    leftLeg.style.left = '40%';
    leftLeg.style.top = '70%';
    leftLeg.style.backgroundColor = '#FFA500';
    leftLeg.style.borderRadius = '5px';
    leftLeg.style.transformOrigin = 'top center';
    leftLeg.style.transform = 'translateZ(18px) rotateX(10deg)';
    scene.appendChild(leftLeg);
    
    const rightLeg = document.createElement('div');
    rightLeg.className = 'bird-leg-right-3d';
    rightLeg.style.position = 'absolute';
    rightLeg.style.width = '5%';
    rightLeg.style.height = '20%';
    rightLeg.style.left = '50%';
    rightLeg.style.top = '70%';
    rightLeg.style.backgroundColor = '#FFA500';
    rightLeg.style.borderRadius = '5px';
    rightLeg.style.transformOrigin = 'top center';
    rightLeg.style.transform = 'translateZ(12px) rotateX(10deg)';
    scene.appendChild(rightLeg);
    
    // Racing helmet - half sphere
    const helmet = document.createElement('div');
    helmet.className = 'bird-helmet-3d';
    helmet.style.position = 'absolute';
    helmet.style.width = '30%';
    helmet.style.height = '20%';
    helmet.style.left = '15%';
    helmet.style.top = '10%';
    helmet.style.backgroundColor = '#3B82F6';
    helmet.style.borderRadius = '50% 50% 0 0';
    helmet.style.transform = 'translateZ(30px)';
    helmet.style.boxShadow = 'inset 0 -5px 10px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.3)';
    scene.appendChild(helmet);
    
    // Racing goggles - two spheres with glass effect
    const leftGoggle = document.createElement('div');
    leftGoggle.className = 'bird-goggle-left-3d';
    leftGoggle.style.position = 'absolute';
    leftGoggle.style.width = '10%';
    leftGoggle.style.height = '10%';
    leftGoggle.style.left = '17%';
    leftGoggle.style.top = '23%';
    leftGoggle.style.backgroundColor = 'rgba(255,255,255,0.7)';
    leftGoggle.style.borderRadius = '50%';
    leftGoggle.style.transform = 'translateZ(35px)';
    leftGoggle.style.boxShadow = 'inset 0 0 5px rgba(255,255,255,0.8), 0 0 2px rgba(0,0,0,0.3)';
    scene.appendChild(leftGoggle);
    
    const rightGoggle = document.createElement('div');
    rightGoggle.className = 'bird-goggle-right-3d';
    rightGoggle.style.position = 'absolute';
    rightGoggle.style.width = '10%';
    rightGoggle.style.height = '10%';
    rightGoggle.style.left = '32%';
    rightGoggle.style.top = '23%';
    rightGoggle.style.backgroundColor = 'rgba(255,255,255,0.7)';
    rightGoggle.style.borderRadius = '50%';
    rightGoggle.style.transform = 'translateZ(35px)';
    rightGoggle.style.boxShadow = 'inset 0 0 5px rgba(255,255,255,0.8), 0 0 2px rgba(0,0,0,0.3)';
    scene.appendChild(rightGoggle);
    
    // Add shadows for 3D effect
    const shadow = document.createElement('div');
    shadow.style.position = 'absolute';
    shadow.style.width = '90%';
    shadow.style.height = '10%';
    shadow.style.left = '5%';
    shadow.style.bottom = '-5%';
    shadow.style.backgroundColor = 'rgba(0,0,0,0.2)';
    shadow.style.borderRadius = '50%';
    shadow.style.filter = 'blur(2px)';
    shadow.style.transform = 'rotateX(90deg) translateZ(-10px)';
    scene.appendChild(shadow);
    
    return scene;
  };
  
  // Animation function
  const startAnimation = (el: HTMLElement, isRat: boolean) => {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const modelContainer = el.querySelector('.model-container');
      
      if (modelContainer && modelContainer.classList.contains('racing')) {
        if (isRat) {
          // Animate rat legs
          const frontLeftLeg = el.querySelector('.rat-leg-front-left-3d');
          const frontRightLeg = el.querySelector('.rat-leg-front-right-3d');
          const backLeftLeg = el.querySelector('.rat-leg-back-left-3d');
          const backRightLeg = el.querySelector('.rat-leg-back-right-3d');
          const tail = el.querySelector('.rat-tail-3d');
          
          if (frontLeftLeg && frontRightLeg && backLeftLeg && backRightLeg && tail) {
            const legAngle = Math.sin(elapsed * 0.02) * 30;
            (frontLeftLeg as HTMLElement).style.transform = `translateZ(18px) rotateX(${legAngle + 10}deg)`;
            (frontRightLeg as HTMLElement).style.transform = `translateZ(12px) rotateX(${-legAngle + 10}deg)`;
            (backLeftLeg as HTMLElement).style.transform = `translateZ(18px) rotateX(${-legAngle + 10}deg)`;
            (backRightLeg as HTMLElement).style.transform = `translateZ(12px) rotateX(${legAngle + 10}deg)`;
            (tail as HTMLElement).style.transform = `translateZ(15px) rotateY(${Math.sin(elapsed * 0.01) * 15 - 10}deg)`;
          }
          
          // Animate rat body
          const body = el.querySelector('.rat-body-3d');
          if (body) {
            (body as HTMLElement).style.transform = `translateZ(15px) scaleX(${1 + Math.sin(elapsed * 0.02) * 0.05})`;
          }
        } else {
          // Animate bird wings
          const leftWing = el.querySelector('.bird-wing-left-3d');
          const rightWing = el.querySelector('.bird-wing-right-3d');
          const tail = el.querySelector('.bird-tail-3d');
          
          if (leftWing && rightWing && tail) {
            const wingAngle = Math.sin(elapsed * 0.03) * 40;
            (leftWing as HTMLElement).style.transform = `translateZ(18px) rotateY(${wingAngle - 20}deg)`;
            (rightWing as HTMLElement).style.transform = `translateZ(18px) rotateY(${-wingAngle + 20}deg)`;
            (tail as HTMLElement).style.transform = `translateZ(15px) rotateY(${Math.sin(elapsed * 0.01) * 10 + 10}deg)`;
          }
          
          // Animate bird body
          const body = el.querySelector('.bird-body-3d');
          if (body) {
            (body as HTMLElement).style.transform = `translateZ(15px) translateY(${Math.sin(elapsed * 0.02) * 2}px)`;
          }
        }
        
        // Add bobbing animation
        const model = el.querySelector(isRat ? '.rat-model-3d' : '.bird-model-3d');
        if (model) {
          (model as HTMLElement).style.transform = `translateY(${Math.sin(elapsed * 0.01) * 3}px) rotateX(20deg)`;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // This is a non-rendering component
  return null;
};

export default MapboxRacerMarker;