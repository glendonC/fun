import React from 'react';
import { Sparkles, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.div 
      className="text-center mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="inline-flex items-center justify-center mb-4"
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 5,
            ease: "easeInOut"
          }}
        >
          <Flag className="h-12 w-12 text-indigo-400 mr-4" />
        </motion.div>
        <h1 className="text-6xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
          AI Rat Race
        </h1>
      </motion.div>
      <motion.p 
        className="text-2xl text-gray-300 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Choose your AI racer and optimize it for the ultimate competition
      </motion.p>
    </motion.div>
  );
};

export default Header;