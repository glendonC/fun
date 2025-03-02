import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';

interface RaceCompletionModalProps {
  isComplete: boolean;
  isRat: boolean;
  primaryColor: string;
}

const RaceCompletionModal: React.FC<RaceCompletionModalProps> = ({ isComplete, isRat, primaryColor }) => {
  return (
    <AnimatePresence>
      {isComplete && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-gray-900/70 backdrop-blur-md p-8 rounded-xl border border-gray-700 shadow-2xl max-w-md"
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
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Race Complete!</h2>
            <div className="flex justify-center mb-6">
              <motion.div 
                className={`p-4 rounded-full bg-${primaryColor}-500/30`}
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
                <Award className={`h-16 w-16 text-${primaryColor}-400`} />
              </motion.div>
            </div>
            <p className="text-xl text-gray-200 text-center mb-6">
              {isRat ? 
                "Your algorithmic speedster has calculated its way to victory!" : 
                "Your instinctive flyer has soared to the finish line!"}
            </p>
            <div className="flex justify-center">
              <motion.button
                className={`px-6 py-3 bg-${primaryColor}-500 text-white rounded-lg shadow-lg`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.dispatchEvent(new Event('race-reset'))}
              >
                Race Again
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RaceCompletionModal;