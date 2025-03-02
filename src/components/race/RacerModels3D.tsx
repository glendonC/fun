import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rat, Bird } from 'lucide-react';

interface RacerModels3DProps {
  isRat: boolean;
  isRacing: boolean;
  primaryColor: string;
  opponentIsRacing: boolean;
  opponentColor: string;
}

const RacerModels3D: React.FC<RacerModels3DProps> = ({ 
  isRat, 
  isRacing, 
  primaryColor,
  opponentIsRacing,
  opponentColor
}) => {
  // References for animation elements
  const playerLegsRef = useRef<HTMLDivElement>(null);
  const playerWingsRef = useRef<HTMLDivElement>(null);
  const playerTailRef = useRef<HTMLDivElement>(null);
  
  const opponentLegsRef = useRef<HTMLDivElement>(null);
  const opponentWingsRef = useRef<HTMLDivElement>(null);
  const opponentTailRef = useRef<HTMLDivElement>(null);
  
  // Player model animation
  useEffect(() => {
    if (!isRacing) return;
    
    let animationFrameId: number;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (isRat) {
        // Animate rat legs
        if (playerLegsRef.current) {
          const legAngle = Math.sin(elapsed * 0.02) * 30;
          playerLegsRef.current.style.transform = `rotate(${legAngle}deg)`;
        }
        
        // Animate rat tail
        if (playerTailRef.current) {
          const tailAngle = Math.sin(elapsed * 0.01) * 15;
          playerTailRef.current.style.transform = `rotate(${tailAngle}deg)`;
        }
      } else {
        // Animate bird wings
        if (playerWingsRef.current) {
          const wingAngle = Math.sin(elapsed * 0.03) * 40;
          playerWingsRef.current.style.transform = `rotate(${wingAngle}deg)`;
        }
        
        // Animate bird tail
        if (playerTailRef.current) {
          const tailAngle = Math.sin(elapsed * 0.01) * 10;
          playerTailRef.current.style.transform = `rotate(${tailAngle}deg)`;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRacing, isRat]);
  
  // Opponent model animation
  useEffect(() => {
    if (!opponentIsRacing) return;
    
    let animationFrameId: number;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (!isRat) { // Opponent is rat if player is not
        // Animate rat legs
        if (opponentLegsRef.current) {
          const legAngle = Math.sin(elapsed * 0.02) * 30;
          opponentLegsRef.current.style.transform = `rotate(${legAngle}deg)`;
        }
        
        // Animate rat tail
        if (opponentTailRef.current) {
          const tailAngle = Math.sin(elapsed * 0.01) * 15;
          opponentTailRef.current.style.transform = `rotate(${tailAngle}deg)`;
        }
      } else {
        // Animate bird wings
        if (opponentWingsRef.current) {
          const wingAngle = Math.sin(elapsed * 0.03) * 40;
          opponentWingsRef.current.style.transform = `rotate(${wingAngle}deg)`;
        }
        
        // Animate bird tail
        if (opponentTailRef.current) {
          const tailAngle = Math.sin(elapsed * 0.01) * 10;
          opponentTailRef.current.style.transform = `rotate(${tailAngle}deg)`;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [opponentIsRacing, isRat]);
  
  return (
    <>
      {/* Player Model */}
      <div className="absolute left-1/2 bottom-20 transform -translate-x-1/2 pointer-events-none">
        <motion.div 
          className={`bg-${primaryColor}-500/80 p-3 rounded-full`}
          animate={{ 
            y: isRacing ? [0, -5, 0] : 0,
            scale: isRacing ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            duration: 0.5,
            repeat: isRacing ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isRat ? (
            // Rat model with animated parts
            <div className="relative">
              <Rat className="h-10 w-10 text-white" />
              
              {/* Animated legs */}
              <div className="absolute bottom-0 left-1 w-2 h-2">
                <div 
                  ref={playerLegsRef}
                  className="w-1 h-2 bg-white rounded-full origin-top"
                />
              </div>
              
              {/* Animated tail */}
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                <div 
                  ref={playerTailRef}
                  className="w-3 h-1 bg-white rounded-full origin-left"
                />
              </div>
            </div>
          ) : (
            // Bird model with animated parts
            <div className="relative">
              <Bird className="h-10 w-10 text-white" />
              
              {/* Animated wings */}
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
                <div 
                  ref={playerWingsRef}
                  className="w-3 h-1 bg-white rounded-full origin-right"
                />
              </div>
              
              {/* Animated tail */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div 
                  ref={playerTailRef}
                  className="w-2 h-3 bg-white rounded-full origin-top"
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Opponent Model (smaller and to the side) */}
      <div className="absolute right-20 bottom-24 transform -translate-x-1/2 pointer-events-none scale-75 opacity-70">
        <motion.div 
          className={`bg-${opponentColor}-500/80 p-3 rounded-full`}
          animate={{ 
            y: opponentIsRacing ? [0, -5, 0] : 0,
            scale: opponentIsRacing ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            duration: 0.5,
            repeat: opponentIsRacing ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {!isRat ? ( // Opponent is rat if player is bird
            // Rat model with animated parts
            <div className="relative">
              <Rat className="h-10 w-10 text-white" />
              
              {/* Animated legs */}
              <div className="absolute bottom-0 left-1 w-2 h-2">
                <div 
                  ref={opponentLegsRef}
                  className="w-1 h-2 bg-white rounded-full origin-top"
                />
              </div>
              
              {/* Animated tail */}
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                <div 
                  ref={opponentTailRef}
                  className="w-3 h-1 bg-white rounded-full origin-left"
                />
              </div>
            </div>
          ) : (
            // Bird model with animated parts
            <div className="relative">
              <Bird className="h-10 w-10 text-white" />
              
              {/* Animated wings */}
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
                <div 
                  ref={opponentWingsRef}
                  className="w-3 h-1 bg-white rounded-full origin-right"
                />
              </div>
              
              {/* Animated tail */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div 
                  ref={opponentTailRef}
                  className="w-2 h-3 bg-white rounded-full origin-top"
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default RacerModels3D;