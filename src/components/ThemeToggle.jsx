import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 focus:outline-none cursor-pointer"
      aria-label="Toggle theme"
    >
      <div className="w-14 h-8 bg-puppy-beige dark:bg-puppy-darkcard border border-puppy-beige/40 dark:border-puppy-emphasis/15 rounded-full p-1 transition-colors duration-300 flex items-center relative">
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          animate={{ x: theme === 'dark' ? 24 : 0 }}
          className="w-6 h-6 bg-white dark:bg-puppy-highlight rounded-full shadow-md flex items-center justify-center relative z-10"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -180, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-puppy-emphasis dark:text-puppy-darkbg"
          >
            {theme === 'dark' ? (
              <Moon className="h-3.5 w-3.5 fill-puppy-darkbg text-puppy-darkbg" />
            ) : (
              <Sun className="h-3.5 w-3.5 fill-puppy-highlight text-puppy-emphasis" />
            )}
          </motion.div>
        </motion.div>
        
        {/* Underlay icons for visual feedback */}
        <Sun className="absolute left-2.5 h-3.5 w-3.5 text-puppy-emphasis/45 pointer-events-none" />
        <Moon className="absolute right-2.5 h-3.5 w-3.5 text-puppy-cream/35 pointer-events-none" />
      </div>
    </button>
  );
}
