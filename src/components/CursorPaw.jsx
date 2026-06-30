import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export default function CursorPaw() {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { damping: 45, stiffness: 350, mass: 0.4 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if the device matches desktop / has a fine pointer (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsDesktop(mediaQuery.matches);

    const handleMouseMove = (e) => {
      // Centered offset of 14px (half of 28px width/height)
      mouseX.set(e.clientX - 14);
      mouseY.set(e.clientY - 14);
    };

    if (mediaQuery.matches && !shouldReduceMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [shouldReduceMotion]);

  if (!isDesktop || shouldReduceMotion) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: springX,
        top: springY,
        width: 28,
        height: 28,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.35,
      }}
      className="text-puppy-highlight pointer-events-none"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <circle cx="8" cy="6" r="3" />
        <circle cx="16" cy="6" r="3" />
        <circle cx="4" cy="11" r="3.5" />
        <circle cx="20" cy="11" r="3.5" />
        <path d="M12,12 C9.5,12 8,14.5 8,17 C8,19.5 10,21 12,21 C14,21 16,19.5 16,17 C16,14.5 14.5,12 12,12 Z" />
      </svg>
    </motion.div>
  );
}
