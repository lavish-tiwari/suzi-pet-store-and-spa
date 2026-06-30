import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function StoreStatus() {
  const shouldReduceMotion = useReducedMotion();
  const [status, setStatus] = useState({ isOpen: false, text: '' });

  const getKolkataTime = () => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
      const parts = formatter.formatToParts(new Date());
      const val = {};
      parts.forEach(({ type, value }) => {
        val[type] = value;
      });
      return {
        hour: parseInt(val.hour, 10),
        minute: parseInt(val.minute, 10)
      };
    } catch (e) {
      console.warn('Fallback to local browser time:', e);
      const d = new Date();
      return {
        hour: d.getHours(),
        minute: d.getMinutes()
      };
    }
  };

  const checkStatus = () => {
    const { hour, minute } = getKolkataTime();
    const currentMinutes = hour * 60 + minute;
    const startMinutes = 10 * 60; // 10:00 AM
    const endMinutes = 21 * 60;  // 9:00 PM

    const isOpen = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    
    setStatus({
      isOpen,
      text: isOpen ? 'Open Now' : 'Closed'
    });
  };

  useEffect(() => {
    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center space-x-2.5 bg-white/65 dark:bg-puppy-darkcard/30 border border-puppy-beige dark:border-puppy-emphasis/15 px-4 py-2 rounded-2xl shadow-puppy-sm">
      {/* Animated Clock Icon */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                rotate: status.isOpen ? [0, 360] : 0,
              }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
                repeat: Infinity,
                duration: 12,
                ease: 'linear',
              }
        }
        className="text-puppy-highlight dark:text-puppy-peach"
      >
        <Clock className="h-4 w-4" />
      </motion.div>

      {/* Timing Schedule Text */}
      <div className="flex flex-col text-left">
        <span className="text-[10px] text-puppy-brown/70 dark:text-puppy-cream/50 uppercase tracking-wider font-extrabold leading-none mb-0.5">
          Store Hours
        </span>
        <span className="text-xs font-bold text-puppy-emphasis dark:text-white leading-tight">
          10:00 AM – 9:00 PM
        </span>
      </div>

      <span className="text-puppy-brown/30 dark:text-puppy-cream/20 font-light text-sm">|</span>

      {/* Live Badge */}
      <div
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
          status.isOpen
            ? 'bg-puppy-sage/20 border-puppy-sage/40 text-[#4A5D3E] dark:text-puppy-sage'
            : 'bg-rose-100 dark:bg-rose-950/30 border border-rose-250 dark:border-rose-900/40 text-rose-600 dark:text-rose-450'
        }`}
      >
        {/* Pulsing indicator dot */}
        <motion.span
          animate={
            shouldReduceMotion || !status.isOpen
              ? {}
              : {
                  scale: [1, 1.35, 1],
                  opacity: [1, 0.6, 1],
                }
          }
          transition={
            shouldReduceMotion || !status.isOpen
              ? {}
              : {
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }
          }
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
            status.isOpen ? 'bg-puppy-sage' : 'bg-rose-500'
          }`}
        />
        <span>{status.text}</span>
      </div>
    </div>
  );
}
