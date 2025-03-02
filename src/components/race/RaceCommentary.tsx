import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader, Brain, Sparkles } from 'lucide-react';
import useAIGeneration from '../../hooks/useAIGeneration';

interface RaceCommentaryProps {
  modelId: string;
  isRacing: boolean;
  routeProgress: number;
  opponentRouteProgress: number;
  performance: any;
}

const RaceCommentary: React.FC<RaceCommentaryProps> = ({
  modelId,
  isRacing,
  routeProgress,
  opponentRouteProgress,
  performance
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const [showCommentary, setShowCommentary] = useState(false);
  const [lastCommentaryProgress, setLastCommentaryProgress] = useState(-0.2);
  
  const { loading, error, response, generateRaceCommentary } = useAIGeneration();

  // Generate commentary at specific points in the race
  useEffect(() => {
    const commentaryPoints = [0.2, 0.5, 0.8, 0.95];
    
    // Check if we've passed a commentary point and haven't generated commentary recently
    const shouldGenerateCommentary = commentaryPoints.some(point => 
      routeProgress >= point && 
      lastCommentaryProgress < point - 0.05 && 
      isRacing
    );
    
    if (shouldGenerateCommentary) {
      setShowCommentary(true);
      
      // Include opponent progress in the commentary generation
      const progressDifference = routeProgress - opponentRouteProgress;
      const isLeading = progressDifference > 0.05;
      const isBehind = progressDifference < -0.05;
      const raceStatus = isLeading ? 'leading' : isBehind ? 'behind' : 'neck-and-neck';
      
      generateRaceCommentary(modelId, routeProgress, performance, raceStatus);
      setLastCommentaryProgress(routeProgress);
    }
  }, [routeProgress, opponentRouteProgress, isRacing, modelId, performance, lastCommentaryProgress, generateRaceCommentary]);

  // Hide commentary after a delay
  useEffect(() => {
    if (showCommentary && response) {
      const timer = setTimeout(() => {
        setShowCommentary(false);
      }, 8000); // Show for 8 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showCommentary, response]);

  // Generate performance-specific commentary
  const getPerformanceInsight = () => {
    const { speed, accuracy, adaptability } = performance || { speed: 50, accuracy: 50, adaptability: 50 };
    
    if (isRat) {
      if (speed > 70 && accuracy < 40) {
        return "High speed but low accuracy is causing path deviations.";
      } else if (accuracy > 70 && speed < 40) {
        return "High accuracy but low speed is limiting race progress.";
      } else if (adaptability < 30) {
        return "Low adaptability is causing difficulty with unexpected obstacles.";
      } else if (speed > 70 && accuracy > 70) {
        return "Optimal balance of speed and accuracy is producing excellent results!";
      }
    } else {
      if (adaptability > 70 && accuracy < 40) {
        return "High adaptability but low accuracy is causing erratic movements.";
      } else if (accuracy > 70 && adaptability < 40) {
        return "High accuracy but low adaptability is limiting reaction time.";
      } else if (speed < 30) {
        return "Low speed is preventing the racer from reaching full potential.";
      } else if (adaptability > 70 && speed > 70) {
        return "Excellent combination of adaptability and speed is creating fluid movement!";
      }
    }
    
    return null;
  };

  const performanceInsight = getPerformanceInsight();

  return (
    <AnimatePresence>
      {showCommentary && (
        <motion.div 
          className="absolute bottom-24 right-6 max-w-md z-50"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex items-start mb-3">
              <div className={`p-2 rounded-full bg-${primaryColor}-500/30 mr-3 flex-shrink-0`}>
                {isRat ? (
                  <Brain className={`h-5 w-5 text-${primaryColor}-400`} />
                ) : (
                  <Sparkles className={`h-5 w-5 text-${primaryColor}-400`} />
                )}
              </div>
              <div>
                <h4 className="text-white font-medium">Race Commentary</h4>
                <p className="text-xs text-gray-400">
                  {isRat ? 'DBRX Analysis' : 'Mistral Insights'}
                </p>
              </div>
            </div>
            
            <div className="min-h-[60px]">
              {loading ? (
                <div className="flex items-center justify-center h-full py-4">
                  <Loader className={`h-5 w-5 text-${primaryColor}-400 animate-spin mr-2`} />
                  <span className="text-gray-300">Generating commentary...</span>
                </div>
              ) : error ? (
                <p className="text-red-400 text-sm">{error}</p>
              ) : response ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-gray-200 mb-2">
                    {response.content}
                  </p>
                  {performanceInsight && (
                    <p className={`text-${primaryColor}-400 text-sm italic`}>
                      {performanceInsight}
                    </p>
                  )}
                </motion.div>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RaceCommentary;