import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function BouncingPawLoader({ size = "md", className = "" }) {
  const shouldReduceMotion = useReducedMotion();

  const dimensions = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10"
  }[size] || "w-6 h-6";

  const paws = [0, 1, 2];

  return (
    <div className={`flex items-center justify-center space-x-2 py-4 ${className}`}>
      {paws.map((index) => (
        <motion.div
          key={index}
          animate={shouldReduceMotion ? { opacity: [0.3, 1, 0.3] } : { y: [0, -12, 0] }}
          transition={{
            duration: shouldReduceMotion ? 1.2 : 0.6,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut"
          }}
          className="text-puppy-rose dark:text-puppy-brightrose"
        >
          <svg className={dimensions} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="6" r="3" />
            <circle cx="16" cy="6" r="3" />
            <circle cx="4" cy="11" r="3.5" />
            <circle cx="20" cy="11" r="3.5" />
            <path d="M12,12 C9.5,12 8,14.5 8,17 C8,19.5 10,21 12,21 C14,21 16,19.5 16,17 C16,14.5 14.5,12 12,12 Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
