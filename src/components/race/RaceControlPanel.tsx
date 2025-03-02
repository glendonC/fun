import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Eye, Compass, ChevronRight, ChevronLeft } from 'lucide-react';

interface RaceControlPanelProps {
  modelId: string;
  parameters: any;
  routeProgress: number;
  isRacing: boolean;
  cameraMode: 'thirdPerson' | 'firstPerson';
  viewMode: '3d' | 'map';
  panelCollapsed: boolean;
  setPanelCollapsed: (collapsed: boolean) => void;
  onStartRace: () => void;
  onResetPosition: () => void;
  onToggleCameraMode: () => void;
  onToggleViewMode: () => void;
  onBack: () => void;
}

const RaceControlPanel: React.FC<RaceControlPanelProps> = ({
  modelId,
  parameters,
  routeProgress,
  isRacing,
  cameraMode,
  viewMode,
  panelCollapsed,
  setPanelCollapsed,
  onStartRace,
  onResetPosition,
  onToggleCameraMode,
  onToggleViewMode,
  onBack
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  
  return (
    <motion.div 
      className="absolute top-4 right-4 z-50"
      initial={{ x: panelCollapsed ? 300 : 0 }}
      animate={{ x: panelCollapsed ? 300 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.button
        className="absolute -left-12 top-4 bg-gray-800/80 backdrop-blur-sm p-2 rounded-l-md border-l border-t border-b border-gray-700"
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {panelCollapsed ? <ChevronLeft className="h-6 w-6 text-white" /> : <ChevronRight className="h-6 w-6 text-white" />}
      </motion.button>
      
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-l-xl p-6 border border-gray-700 shadow-lg w-72">
        <h3 className={`text-xl font-bold text-${primaryColor}-400 mb-4`}>
          {isRat ? 'Rat Race Controls' : 'Pigeon Race Controls'}
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-2">Race Progress</h4>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-${primaryColor}-500`} 
                style={{ width: `${routeProgress * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {Math.round(routeProgress * 100)}% complete
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Race Controls</h4>
            <div className="flex space-x-3">
              <motion.button
                onClick={onStartRace}
                className={`flex-1 py-3 px-4 bg-${primaryColor}-500 text-white rounded-md hover:bg-${primaryColor}-600 transition-colors flex items-center justify-center`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRacing ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={onResetPosition}
                className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </motion.button>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">View Options</h4>
            <div className="space-y-3">
              <motion.button
                onClick={onToggleViewMode}
                className="w-full py-3 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {viewMode === '3d' ? (
                  <>
                    <Compass className="h-5 w-5 mr-2" />
                    Switch to Map View
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5 mr-2" />
                    Switch to 3D View
                  </>
                )}
              </motion.button>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Performance Metrics</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Speed</span>
                  <span className="text-white">{parameters.performance.speed}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${primaryColor}-500`} 
                    style={{ width: `${parameters.performance.speed}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Accuracy</span>
                  <span className="text-white">{parameters.performance.accuracy}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${primaryColor}-500`} 
                    style={{ width: `${parameters.performance.accuracy}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Adaptability</span>
                  <span className="text-white">{parameters.performance.adaptability}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${primaryColor}-500`} 
                    style={{ width: `${parameters.performance.adaptability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back button added to the control panel */}
          <div className="pt-4 border-t border-gray-700">
            <motion.button
              onClick={onBack}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Selection
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RaceControlPanel;