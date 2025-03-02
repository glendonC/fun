import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Rat, Bird } from 'lucide-react';

interface AnimatedRacerModelProps {
  isRat: boolean;
  isRacing: boolean;
  primaryColor: string;
  scale?: number;
  position?: 'center' | 'bottom-center';
  opacity?: number;
}

const AnimatedRacerModel: React.FC<AnimatedRacerModelProps> = ({ 
  isRat, 
  isRacing, 
  primaryColor,
  scale = 1,
  position = 'center',
  opacity = 0.8
}) => {
  const controls = useAnimation();
  const legsControls = useAnimation();
  const wingsControls = useAnimation();
  const tailControls = useAnimation();
  const bodyControls = useAnimation();
  
  // Position classes based on the position prop
  const positionClasses = position === 'center' 
    ? "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" 
    : "absolute left-1/2 bottom-20 transform -translate-x-1/2";
  
  // Start animations when racing state changes
  useEffect(() => {
    if (isRacing) {
      // Start running/flying animation
      controls.start({
        y: [0, -5, 0],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
      
      // Animate legs for rat or wings for bird
      if (isRat) {
        // Rat legs animation
        legsControls.start({
          rotate: [0, 30, -30, 0],
          transition: {
            duration: 0.3,
            repeat: Infinity,
            ease: "linear"
          }
        });
        
        // Rat tail animation
        tailControls.start({
          rotate: [0, 10, -10, 0],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        });
        
        // Rat body animation
        bodyControls.start({
          scaleX: [1, 1.05, 1],
          transition: {
            duration: 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        });
      } else {
        // Bird wings animation
        wingsControls.start({
          rotate: [0, 30, -10, 0],
          transition: {
            duration: 0.2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        });
        
        // Bird tail animation
        tailControls.start({
          rotate: [0, 5, -5, 0],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        });
      }
    } else {
      // Stop animations when not racing
      controls.stop();
      legsControls.stop();
      wingsControls.stop();
      tailControls.stop();
      bodyControls.stop();
      
      // Reset to idle state
      controls.start({ y: 0 });
      legsControls.start({ rotate: 0 });
      wingsControls.start({ rotate: 0 });
      tailControls.start({ rotate: 0 });
      bodyControls.start({ scaleX: 1 });
    }
  }, [isRacing, isRat]);
  
  return (
    <div className={positionClasses}>
      <motion.div 
        className={`bg-${primaryColor}-500/${Math.round(opacity * 100)} p-3 rounded-full`}
        animate={controls}
        style={{ scale }}
      >
        {isRat ? (
          // Animated Rat Model
          <div className="relative w-10 h-10">
            {/* Rat body */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={bodyControls}
            >
              <Rat className="h-10 w-10 text-white" />
            </motion.div>
            
            {/* Animated legs (overlaid) */}
            <div className="absolute bottom-0 left-1 w-2 h-2">
              <motion.div 
                className="w-1 h-2 bg-white rounded-full origin-top"
                animate={legsControls}
              />
            </div>
            <div className="absolute bottom-0 right-1 w-2 h-2">
              <motion.div 
                className="w-1 h-2 bg-white rounded-full origin-top"
                animate={legsControls}
                style={{ animationDelay: '0.15s' }}
              />
            </div>
            
            {/* Animated tail */}
            <motion.div 
              className="absolute -right-2 top-1/2 w-3 h-1 bg-white rounded-full origin-left"
              animate={tailControls}
            />
          </div>
        ) : (
          // Animated Bird Model
          <div className="relative w-10 h-10">
            {/* Bird body */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Bird className="h-10 w-10 text-white" />
            </div>
            
            {/* Animated wings (overlaid) */}
            <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
              <motion.div 
                className="w-3 h-1 bg-white rounded-full origin-right"
                animate={wingsControls}
              />
            </div>
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
              <motion.div 
                className="w-3 h-1 bg-white rounded-full origin-left"
                animate={wingsControls}
                style={{ animationDelay: '0.1s' }}
              />
            </div>
            
            {/* Animated tail */}
            <motion.div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-white rounded-full origin-top"
              animate={tailControls}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AnimatedRacerModel;