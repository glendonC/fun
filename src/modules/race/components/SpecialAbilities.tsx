import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Database, Rocket, Wind, AlertCircle, Target } from 'lucide-react';

interface SpecialAbilitiesProps {
  modelId: string;
  isRacing: boolean;
  onUseAbility: (abilityType: 'speed' | 'attack' | 'optimize', targetSelf: boolean) => void;
  cooldowns: {
    speed: number;
    attack: number;
    optimize: number;
  };
}

const SpecialAbilities: React.FC<SpecialAbilitiesProps> = ({
  modelId,
  isRacing,
  onUseAbility,
  cooldowns
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  
  const [showPanel, setShowPanel] = useState(false);
  const [abilityUsed, setAbilityUsed] = useState<{
    type: 'speed' | 'attack' | 'optimize';
    targetSelf: boolean;
    name: string;
  } | null>(null);
  
  // Show abilities panel when race starts
  useEffect(() => {
    if (isRacing) {
      setShowPanel(true);
    } else {
      setShowPanel(false);
      setAbilityUsed(null);
    }
  }, [isRacing]);
  
  // Handle ability activation
  const handleAbilityClick = (type: 'speed' | 'attack' | 'optimize', targetSelf: boolean) => {
    // Check if ability is on cooldown
    if (cooldowns[type] > 0) return;
    
    // Get ability name
    let abilityName = '';
    if (type === 'speed') {
      abilityName = isRat ? 'Algorithmic Overclock' : 'Instinctive Wind Boost';
    } else if (type === 'attack') {
      abilityName = 'Data Flood';
    } else if (type === 'optimize') {
      abilityName = 'Path Optimization';
    }
    
    // Set ability as used
    setAbilityUsed({
      type,
      targetSelf,
      name: abilityName
    });
    
    // Trigger ability effect
    onUseAbility(type, targetSelf);
    
    // Hide ability notification after a delay
    setTimeout(() => {
      setAbilityUsed(null);
    }, 3000);
  };
  
  // Calculate cooldown percentage for progress bars
  const getCooldownPercentage = (type: 'speed' | 'attack' | 'optimize') => {
    const maxCooldown = 10; // 10 seconds max cooldown
    return (cooldowns[type] / maxCooldown) * 100;
  };
  
  return (
    <>
      {/* Abilities Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div 
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800/80 backdrop-blur-md p-3 rounded-xl border border-gray-700 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <h3 className="text-white font-bold mb-2 text-center">Special Abilities</h3>
            <div className="flex space-x-3">
              {/* Speed Boost Ability */}
              <motion.button
                className={`relative p-3 ${cooldowns.speed > 0 ? 'bg-gray-700' : `bg-${primaryColor}-500`} rounded-lg shadow-lg flex flex-col items-center justify-center w-24 h-24`}
                whileHover={cooldowns.speed > 0 ? {} : { scale: 1.05 }}
                whileTap={cooldowns.speed > 0 ? {} : { scale: 0.95 }}
                onClick={() => handleAbilityClick('speed', true)}
                disabled={cooldowns.speed > 0}
              >
                {isRat ? (
                  <Rocket className={`h-8 w-8 ${cooldowns.speed > 0 ? 'text-gray-500' : 'text-white'}`} />
                ) : (
                  <Wind className={`h-8 w-8 ${cooldowns.speed > 0 ? 'text-gray-500' : 'text-white'}`} />
                )}
                <span className={`text-xs mt-1 ${cooldowns.speed > 0 ? 'text-gray-400' : 'text-white'} text-center`}>
                  {isRat ? 'Algorithmic Overclock' : 'Wind Boost'}
                </span>
                
                {/* Cooldown overlay */}
                {cooldowns.speed > 0 && (
                  <div className="absolute inset-0 bg-gray-800/60 rounded-lg flex items-center justify-center">
                    <div className="w-full h-1 bg-gray-700 absolute bottom-0 left-0 rounded-b-lg overflow-hidden">
                      <div 
                        className="h-full bg-gray-500"
                        style={{ width: `${100 - getCooldownPercentage('speed')}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-300 text-xs">{cooldowns.speed}s</span>
                  </div>
                )}
              </motion.button>
              
              {/* Attack Ability */}
              <motion.button
                className={`relative p-3 ${cooldowns.attack > 0 ? 'bg-gray-700' : 'bg-red-500'} rounded-lg shadow-lg flex flex-col items-center justify-center w-24 h-24`}
                whileHover={cooldowns.attack > 0 ? {} : { scale: 1.05 }}
                whileTap={cooldowns.attack > 0 ? {} : { scale: 0.95 }}
                onClick={() => handleAbilityClick('attack', false)}
                disabled={cooldowns.attack > 0}
              >
                <AlertCircle className={`h-8 w-8 ${cooldowns.attack > 0 ? 'text-gray-500' : 'text-white'}`} />
                <span className={`text-xs mt-1 ${cooldowns.attack > 0 ? 'text-gray-400' : 'text-white'} text-center`}>
                  Data Flood
                </span>
                
                {/* Cooldown overlay */}
                {cooldowns.attack > 0 && (
                  <div className="absolute inset-0 bg-gray-800/60 rounded-lg flex items-center justify-center">
                    <div className="w-full h-1 bg-gray-700 absolute bottom-0 left-0 rounded-b-lg overflow-hidden">
                      <div 
                        className="h-full bg-gray-500"
                        style={{ width: `${100 - getCooldownPercentage('attack')}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-300 text-xs">{cooldowns.attack}s</span>
                  </div>
                )}
              </motion.button>
              
              {/* Optimize Ability */}
              <motion.button
                className={`relative p-3 ${cooldowns.optimize > 0 ? 'bg-gray-700' : 'bg-green-500'} rounded-lg shadow-lg flex flex-col items-center justify-center w-24 h-24`}
                whileHover={cooldowns.optimize > 0 ? {} : { scale: 1.05 }}
                whileTap={cooldowns.optimize > 0 ? {} : { scale: 0.95 }}
                onClick={() => handleAbilityClick('optimize', true)}
                disabled={cooldowns.optimize > 0}
              >
                <Target className={`h-8 w-8 ${cooldowns.optimize > 0 ? 'text-gray-500' : 'text-white'}`} />
                <span className={`text-xs mt-1 ${cooldowns.optimize > 0 ? 'text-gray-400' : 'text-white'} text-center`}>
                  Path Optimization
                </span>
                
                {/* Cooldown overlay */}
                {cooldowns.optimize > 0 && (
                  <div className="absolute inset-0 bg-gray-800/60 rounded-lg flex items-center justify-center">
                    <div className="w-full h-1 bg-gray-700 absolute bottom-0 left-0 rounded-b-lg overflow-hidden">
                      <div 
                        className="h-full bg-gray-500"
                        style={{ width: `${100 - getCooldownPercentage('optimize')}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-300 text-xs">{cooldowns.optimize}s</span>
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ability Activation Notification */}
      <AnimatePresence>
        {abilityUsed && (
          <motion.div 
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 
                       ${abilityUsed.type === 'speed' ? `bg-${primaryColor}-500` : 
                         abilityUsed.type === 'attack' ? 'bg-red-500' : 
                         'bg-green-500'} 
                       text-white px-8 py-4 rounded-xl shadow-lg flex items-center`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: [1, 1.2, 1],
              y: [0, -20, 0]
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.5,
              scale: { duration: 0.7 },
              y: { duration: 0.7 }
            }}
          >
            <div className="mr-4">
              {abilityUsed.type === 'speed' ? (
                isRat ? <Rocket className="h-10 w-10" /> : <Wind className="h-10 w-10" />
              ) : abilityUsed.type === 'attack' ? (
                <AlertCircle className="h-10 w-10" />
              ) : (
                <Target className="h-10 w-10" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold">{abilityUsed.name} Activated!</h3>
              <p className="text-sm">
                {abilityUsed.type === 'speed' ? (
                  isRat ? 
                    "Algorithmic processing accelerated! Speed boost activated." : 
                    "Instinctive reflexes enhanced! Wind boost activated."
                ) : abilityUsed.type === 'attack' ? (
                  "Opponent slowed by data processing overload!"
                ) : (
                  "Recalculating optimal path to destination..."
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SpecialAbilities;