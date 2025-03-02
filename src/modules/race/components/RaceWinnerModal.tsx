import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Medal, Trophy, Building } from 'lucide-react';

interface RaceWinnerModalProps {
  isVisible: boolean;
  winner: string | null;
  modelId: string;
  onRaceAgain: () => void;
}

const RaceWinnerModal: React.FC<RaceWinnerModalProps> = ({ 
  isVisible, 
  winner, 
  modelId,
  onRaceAgain 
}) => {
  if (!isVisible) return null;
  
  const isRat = modelId === 'dbrx';
  const primaryColor = isRat ? 'amber' : 'blue';
  const opponentColor = isRat ? 'blue' : 'amber';
  
  const getWinnerMessage = () => {
    if (winner === 'player') {
      return isRat 
        ? "Your algorithmic speedster has calculated its way to victory at the NASDAQ building!" 
        : "Your instinctive flyer has soared to the finish line first at the NASDAQ building!";
    } else if (winner === 'opponent') {
      return isRat 
        ? "The Pigeon's intuition beat your algorithmic approach to the NASDAQ building!" 
        : "The Rat's calculations outpaced your intuitive flyer to the NASDAQ building!";
    } else {
      return "It's a photo finish at the NASDAQ building! Both racers crossed the line at the same time!";
    }
  };
  
  const getWinnerIcon = () => {
    if (winner === 'player') {
      return <Trophy className={`h-16 w-16 text-${primaryColor}-400`} />;
    } else if (winner === 'opponent') {
      return <Medal className={`h-16 w-16 text-${opponentColor}-400`} />;
    } else {
      return <Award className="h-16 w-16 text-purple-400" />;
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="absolute inset-0 pointer-events-auto z-40 flex items-center justify-center bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-gray-900/90 backdrop-blur-md p-8 rounded-xl border border-gray-700 shadow-2xl max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 0.5,
            y: { 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            {winner === 'player' ? 'Victory!' : winner === 'opponent' ? 'Defeated!' : 'Photo Finish!'}
          </h2>
          
          <div className="flex justify-center mb-6">
            <motion.div 
              className={`p-4 rounded-full ${
                winner === 'player' 
                  ? `bg-${primaryColor}-500/30` 
                  : winner === 'opponent' 
                    ? `bg-${opponentColor}-500/30`
                    : 'bg-purple-500/30'
              }`}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {getWinnerIcon()}
            </motion.div>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <Building className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-300">NASDAQ Building, San Francisco</span>
          </div>
          
          <p className="text-xl text-gray-200 text-center mb-6">
            {getWinnerMessage()}
          </p>
          
          <div className="flex justify-center">
            <motion.button
              className={`px-6 py-3 bg-${primaryColor}-500 text-white rounded-lg shadow-lg`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRaceAgain}
            >
              Race Again
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RaceWinnerModal;