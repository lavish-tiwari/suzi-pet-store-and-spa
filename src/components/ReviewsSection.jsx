import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Star, Sparkles, Quote, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import GlassCard from './GlassCard';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const timerRef = useRef(null);

  // Fetch reviews in real-time
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsList = [];
      snapshot.forEach((doc) => {
        reviewsList.push({ id: doc.id, ...doc.data() });
      });
      setReviews(reviewsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Autoscroll timer
  useEffect(() => {
    if (loading || reviews.length <= 1 || shouldReduceMotion || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reviews, loading, isHovered, shouldReduceMotion]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  // Star twinkling variants
  const starMotion = shouldReduceMotion ? {} : {
    hover: {
      scale: 1.25,
      filter: "drop-shadow(0 0 8px rgba(255, 174, 99, 0.95))",
      transition: { type: "spring", stiffness: 300, damping: 10 }
    }
  };

  return (
    <div className="w-full">
      {/* 1. Verified Aggregate Badge */}
      <div className="max-w-xl mx-auto mb-12">
        <GlassCard className="border border-puppy-beige dark:border-puppy-emphasis/25 bg-white/80 dark:bg-puppy-darkcard/40 p-6 text-center space-y-4 shadow-puppy-md">
          <div className="flex flex-col items-center font-bold">
            <div className="flex items-center space-x-1 text-puppy-highlight mb-2">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  whileHover="hover"
                  variants={starMotion}
                  className="cursor-pointer"
                >
                  <Star className="h-6 w-6 fill-puppy-highlight text-puppy-highlight" />
                </motion.span>
              ))}
            </div>
            <h3 className="font-display font-extrabold text-4xl text-puppy-emphasis dark:text-white leading-none">
              5.0 ★
            </h3>
            <p className="text-[10px] font-extrabold tracking-wider text-puppy-brown dark:text-puppy-peach uppercase mt-1">
              Google Rating
            </p>
            <p className="text-[10px] text-puppy-brown/70 dark:text-puppy-cream/50 mt-0.5 font-semibold">
              Based on {reviews.length} Verified Google Reviews
            </p>
          </div>
        </GlassCard>
      </div>

      {/* 2. Reviews Carousel */}
      <div className="max-w-3xl mx-auto relative px-4 sm:px-12">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <span className="text-xs text-puppy-brown/60 dark:text-puppy-cream/55 font-bold tracking-wider animate-pulse">
              Loading verified reviews...
            </span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-puppy-beige dark:border-puppy-emphasis/25 rounded-3xl p-6 bg-white/40">
            <AlertCircle className="h-8 w-8 text-puppy-brown/30 dark:text-puppy-cream/30" />
            <p className="text-xs text-puppy-brown/60 dark:text-puppy-cream/60 font-semibold">
              No reviews available yet.
            </p>
          </div>
        ) : (
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Slider frame */}
            <div className="overflow-hidden min-h-[220px] sm:min-h-[180px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="w-full"
                >
                  <GlassCard
                    animate={false}
                    className="bg-white/80 dark:bg-puppy-darkcard/50 p-8 relative overflow-hidden shadow-puppy-sm border border-puppy-beige dark:border-puppy-emphasis/25"
                  >
                    <Quote className="absolute top-4 right-4 h-12 w-12 text-puppy-beige/30 dark:text-puppy-emphasis/10 pointer-events-none" />
                    
                    <div className="space-y-4 font-semibold text-left">
                      {/* Rating stars */}
                      <div className="flex items-center space-x-0.5 text-puppy-highlight">
                        {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="h-4.5 w-4.5 fill-puppy-highlight text-puppy-highlight" />
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-puppy-emphasis dark:text-puppy-cream/90 text-sm sm:text-base leading-relaxed italic relative z-10 font-medium">
                        "{reviews[currentIndex].reviewText}"
                      </p>

                      {/* Reviewer name */}
                      {reviews[currentIndex].reviewerName && (
                        <p className="text-xs sm:text-sm font-bold text-puppy-brown dark:text-puppy-peach/90 text-right pr-4 mt-2">
                          — {reviews[currentIndex].reviewerName}
                        </p>
                      )}

                      {/* Source details */}
                      <div className="pt-4 border-t border-puppy-beige/50 dark:border-puppy-emphasis/20 flex items-center justify-between text-xs font-bold">
                        <span className="text-puppy-emphasis/65 dark:text-puppy-cream/55 uppercase tracking-wider text-[10px]">
                          {reviews[currentIndex].rating}★ {reviews[currentIndex].source} review
                        </span>
                        <span className="text-puppy-emphasis dark:text-puppy-peach font-bold flex items-center text-[10px] uppercase tracking-wider">
                          <Sparkles className="h-3.5 w-3.5 mr-1" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Carousel navigation controls */}
            <div className="flex justify-center items-center space-x-6 mt-6">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-white dark:bg-puppy-darkcard border border-puppy-beige dark:border-puppy-emphasis/25 text-puppy-emphasis dark:text-puppy-cream hover:bg-puppy-peach dark:hover:bg-puppy-highlight hover:text-puppy-emphasis dark:hover:text-puppy-darkbg transition-colors shadow-xs cursor-pointer"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Slider dots indicator */}
              <div className="flex space-x-2">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-6 bg-puppy-peach dark:bg-puppy-highlight'
                        : 'w-2 bg-puppy-beige dark:bg-puppy-emphasis/30'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-white dark:bg-puppy-darkcard border border-puppy-beige dark:border-puppy-emphasis/25 text-puppy-emphasis dark:text-puppy-cream hover:bg-puppy-peach dark:hover:bg-puppy-highlight hover:text-puppy-emphasis dark:hover:text-puppy-darkbg transition-colors shadow-xs cursor-pointer"
                aria-label="Next review"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
