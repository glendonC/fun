import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface RaceMapControlsProps {
  modelId: string;
  parameters: any;
  routeProgress: number;
  opponentRouteProgress: number;
  isRacing: boolean;
  onStartRace: () => void;
  onResetPosition: () => void;
  onBack: () => void;
}

const RaceMapControls: React.FC<RaceMapControlsProps> = ({
  modelId,
  parameters,
  routeProgress,
  opponentRouteProgress,
  isRacing,
  onStartRace,
  onResetPosition,
  onBack
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const opponentColor = isRat ? 'blue' : 'amber';
  
  return (
    <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg z-10">
      <h3 className={`text-xl font-bold text-${primaryColor}-400 mb-4`}>
        {isRat ? 'Rat Race Controls' : 'Pigeon Race Controls'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-white font-medium mb-2">Race Progress</h4>
          
          {/* Player progress */}
          <div className="mb-2">
            <div className="flex justify-between text-sm">
              <span className={`text-${primaryColor}-400`}>You</span>
              <span className="text-white">{Math.round(routeProgress * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-${primaryColor}-500`} 
                style={{ width: `${routeProgress * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Opponent progress */}
          <div>
            <div className="flex justify-between text-sm">
              <span className={`text-${opponentColor}-400`}>Opponent</span>
              <span className="text-white">{Math.round(opponentRouteProgress * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-${opponentColor}-500`} 
                style={{ width: `${opponentRouteProgress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-2">Race Controls</h4>
          <div className="flex space-x-3">
            <motion.button
              onClick={onStartRace}
              className={`flex-1 py-2 px-3 bg-${primaryColor}-500 text-white rounded-md hover:bg-${primaryColor}-600 transition-colors flex items-center justify-center`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRacing ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </motion.button>
            <motion.button
              onClick={onResetPosition}
              className="flex-1 py-2 px-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </motion.button>
          </div>
        </div>
        
        <PerformanceMetrics performance={parameters.performance} primaryColor={primaryColor} />
        
        <div className="pt-4 border-t border-gray-700">
          <motion.button
            onClick={onBack}
            className="w-full py-2 px-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </motion.button>
        </div>
      </div>
    </div>
  );
};

interface PerformanceMetricsProps {
  performance: {
    speed: number;
    accuracy: number;
    adaptability: number;
  };
  primaryColor: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ performance, primaryColor }) => {
  return (
    <div>
      <h4 className="text-white font-medium mb-2">Performance Metrics</h4>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Speed</span>
            <span className="text-white">{performance.speed}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-${primaryColor}-500`} 
              style={{ width: `${performance.speed}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Accuracy</span>
            <span className="text-white">{performance.accuracy}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-${primaryColor}-500`} 
              style={{ width: `${performance.accuracy}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Adaptability</span>
            <span className="text-white">{performance.adaptability}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-${primaryColor}-500`} 
              style={{ width: `${performance.adaptability}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceMapControls;