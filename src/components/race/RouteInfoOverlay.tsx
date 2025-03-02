import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface RouteInfoOverlayProps {
  routeName: string;
  routeExplanation: string;
  isRacing: boolean;
  modelId: string;
  opponentRouteName: string;
}

const RouteInfoOverlay: React.FC<RouteInfoOverlayProps> = ({
  routeName,
  routeExplanation,
  isRacing,
  modelId,
  opponentRouteName
}) => {
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const opponentColor = isRat ? 'blue' : 'amber';
  const opponentName = isRat ? 'Pigeon' : 'Rat';
  
  return (
    <motion.div 
      className="absolute top-6 left-20 z-50 max-w-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: 0.3 }}
    >
      <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex items-center mb-2">
          <MapPin className={`h-5 w-5 text-${primaryColor}-400 mr-2`} />
          <h3 className="text-white font-bold">Race to NASDAQ Building</h3>
        </div>
        
        <h4 className={`text-${primaryColor}-400 font-medium mb-1`}>Your Route: {routeName}</h4>
        <p className="text-gray-200 text-sm mb-3">{routeExplanation}</p>
        
        <h4 className={`text-${opponentColor}-400 font-medium mb-1`}>Opponent's Route: {opponentRouteName}</h4>
        <p className="text-gray-200 text-sm mb-2">
          The {opponentName} is taking the {opponentRouteName.toLowerCase()} to compete against you.
        </p>
        
        <div className="text-gray-400 text-xs italic mt-3">
          {isRacing ? "This info will disappear when the race begins..." : "Adjust parameters to see different route selections"}
        </div>
      </div>
    </motion.div>
  );
};

export default RouteInfoOverlay;