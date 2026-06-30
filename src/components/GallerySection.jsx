import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Camera, Video, ZoomIn, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import GlassCard from './GlassCard';

// Interactive Before/After Image Comparison Slider
function BeforeAfterSlider({ beforeUrl, afterUrl, isLightbox = false }) {
  const shouldReduceMotion = useReducedMotion();
  const [sliderX, setSliderX] = useState(50);
  const [userInteracted, setUserInteracted] = useState(false);

  // Auto sine-wave sweep animation on load
  useEffect(() => {
    if (shouldReduceMotion || userInteracted) return;

    let startTime = Date.now();
    let animId;

    const animateSweep = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Oscillate gently between 35% and 65%
      const value = 50 + Math.sin(elapsed * 1.5) * 15;
      setSliderX(value);
      animId = requestAnimationFrame(animateSweep);
    };

    animId = requestAnimationFrame(animateSweep);
    return () => cancelAnimationFrame(animId);
  }, [shouldReduceMotion, userInteracted]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-puppy-beige dark:bg-puppy-darkbg rounded-3xl border border-puppy-beige/55 dark:border-puppy-emphasis/20">
      {/* After image (Base layer) */}
      <img
        src={afterUrl}
        alt="After grooming"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Before image (Clipped top layer) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderX}% 0, ${sliderX}% 100%, 0 100%)` }}
      >
        <img
          src={beforeUrl}
          alt="Before grooming"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Badges */}
      <div className="absolute left-3 top-3 bg-black/60 text-white text-[9px] uppercase px-2 py-0.5 rounded font-extrabold tracking-wider pointer-events-none z-10">
        Before
      </div>
      <div className="absolute right-3 top-3 bg-puppy-highlight text-puppy-darkbg text-[9px] uppercase px-2 py-0.5 rounded font-extrabold tracking-wider pointer-events-none z-10">
        After
      </div>

      {/* Splitter Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-10 shadow-md"
        style={{ left: `${sliderX}%` }}
      />

      {/* Splitter Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-puppy-emphasis border-2 border-puppy-beige shadow-md flex items-center justify-center pointer-events-none z-10"
        style={{ left: `${sliderX}%` }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
        </svg>
      </div>

      {/* Invisible Input Range overlay to capture touch/mouse moves natively */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderX}
        onChange={(e) => {
          setSliderX(Number(e.target.value));
          setUserInteracted(true);
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
      />
    </div>
  );
}

export default function GallerySection() {
  const [mediaItems, setMediaItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'before-after', label: 'Before-After' },
    { id: 'customer-pets', label: 'Customer Pets' },
  ];

  // Fetch gallery items in real-time
  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsList = [];
      snapshot.forEach((doc) => {
        itemsList.push({ id: doc.id, ...doc.data() });
      });
      setMediaItems(itemsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching gallery items:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter items client-side
  const filteredItems = mediaItems.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  // Render styled placeholders when category yields empty array
  const renderPlaceholders = () => {
    const placeholderCount = activeTab === 'before-after' ? 2 : 4;
    const label = activeTab === 'before-after' 
      ? 'Before/After photo coming soon' 
      : activeTab === 'videos' 
      ? 'Video coming soon' 
      : 'Photo coming soon';

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {[...Array(placeholderCount)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <GlassCard
              animate={false}
              className="bg-white/40 dark:bg-puppy-darkcard/10 border-2 border-dashed border-puppy-beige dark:border-puppy-emphasis/20 rounded-3xl h-64 flex flex-col items-center justify-center text-center p-6 space-y-3"
            >
              <div className="p-4 rounded-full bg-puppy-peach/20 text-puppy-emphasis dark:text-puppy-peach">
                {activeTab === 'videos' ? (
                  <Video className="h-6 w-6 stroke-1" />
                ) : (
                  <Camera className="h-6 w-6 stroke-1" />
                )}
              </div>
              <p className="text-xs text-puppy-brown/70 dark:text-puppy-cream/50 font-bold tracking-wide uppercase leading-snug">
                {label}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    );
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full">
      {/* Tab Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-puppy-peach text-puppy-emphasis font-extrabold shadow-puppy-sm'
                : 'bg-white dark:bg-puppy-darkcard border border-puppy-beige text-puppy-brown dark:text-puppy-cream/70 hover:bg-puppy-beige/40 dark:hover:bg-puppy-darkcard/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <span className="text-xs text-puppy-brown/70 dark:text-puppy-cream/50 font-bold tracking-wider animate-pulse">
            Loading gallery...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        renderPlaceholders()
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layoutId={`gallery-item-${item.id}`}
              className="group relative rounded-3xl overflow-hidden shadow-puppy-sm hover:shadow-puppy-md transition-all duration-300 border border-puppy-beige dark:border-puppy-emphasis/15 h-64 bg-white dark:bg-puppy-darkcard flex items-center justify-center"
            >
              {/* Media Display */}
              {item.type === 'before-after' ? (
                <BeforeAfterSlider beforeUrl={item.beforeUrl} afterUrl={item.afterUrl} />
              ) : item.type === 'video' ? (
                <div className="relative w-full h-full cursor-pointer" onClick={() => setLightboxIndex(index)}>
                  <video src={item.mediaUrl} className="w-full h-full object-cover" muted playsInline />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <span className="p-3 rounded-full bg-white/90 text-puppy-emphasis group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 fill-current" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full cursor-pointer" onClick={() => setLightboxIndex(index)}>
                  <motion.img
                    src={item.mediaUrl}
                    alt={item.caption || "Pet gallery image"}
                    className="w-full h-full object-cover"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
              )}

              {/* Caption Overlay */}
              <div 
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end text-left z-10 pointer-events-none`}
              >
                <span className="text-[9px] text-puppy-highlight uppercase font-extrabold tracking-wider mb-1">
                  {tabs.find((t) => t.id === item.category)?.label || item.category}
                </span>
                <p className="text-white text-xs font-bold leading-snug drop-shadow-sm">
                  {item.caption || 'Beautiful Suzi Pet'}
                </p>
              </div>

              {/* Zoom Trigger Button - Separate click target from the range input for Before-After items */}
              <button 
                onClick={() => setLightboxIndex(index)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 backdrop-blur-xs text-puppy-emphasis hover:bg-white transition-all shadow-sm z-30 cursor-pointer"
                title="Zoom image"
              >
                <ZoomIn className="h-4.5 w-4.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Pop-up Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer z-50"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer z-45"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer z-45"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Media wrapper */}
            <div
              className="max-w-4xl max-h-[75vh] w-full flex items-center justify-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightboxIndex}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center w-full"
                >
                  {filteredItems[lightboxIndex].type === 'before-after' ? (
                    <div className="w-full max-w-2xl aspect-[4/3] relative">
                      <BeforeAfterSlider 
                        beforeUrl={filteredItems[lightboxIndex].beforeUrl} 
                        afterUrl={filteredItems[lightboxIndex].afterUrl} 
                        isLightbox={true}
                      />
                    </div>
                  ) : filteredItems[lightboxIndex].type === 'video' ? (
                    <video
                      src={filteredItems[lightboxIndex].mediaUrl}
                      controls
                      autoPlay
                      className="max-w-full max-h-[65vh] rounded-2xl shadow-2xl"
                    />
                  ) : (
                    <img
                      src={filteredItems[lightboxIndex].mediaUrl}
                      alt={filteredItems[lightboxIndex].caption || "Pet gallery image"}
                      className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                    />
                  )}

                  {/* Caption & Category tag */}
                  <div className="mt-4 text-center max-w-xl">
                    <span className="inline-block px-3 py-1 rounded-full bg-puppy-peach/20 text-puppy-highlight text-[10px] font-extrabold uppercase tracking-wider mb-2">
                      {tabs.find((t) => t.id === filteredItems[lightboxIndex].category)?.label || filteredItems[lightboxIndex].category}
                    </span>
                    <p className="text-white font-medium text-sm sm:text-base leading-relaxed px-4">
                      {filteredItems[lightboxIndex].caption || 'Suzi Pet'}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
