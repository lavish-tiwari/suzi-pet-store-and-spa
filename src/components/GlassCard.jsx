import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function GlassCard({ children, className = '', animate = true, delay = 0 }) {
  const shouldReduceMotion = useReducedMotion();
  const Component = (animate && !shouldReduceMotion) ? motion.div : 'div';
  
  const animationProps = (animate && !shouldReduceMotion)
    ? {
        initial: { opacity: 0, y: 15 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: { duration: 0.5, delay: delay, ease: 'easeOut' },
      }
    : {};

  return (
    <Component
      className={`bg-white dark:bg-puppy-darkcard/50 rounded-[28px] p-6 sm:p-8 shadow-puppy-sm hover:shadow-puppy-md dark:shadow-none dark:hover:shadow-puppy-glow border border-puppy-beige dark:border-puppy-emphasis/20 hover:border-puppy-peach/50 dark:hover:border-puppy-highlight/35 transition-all duration-300 ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}
