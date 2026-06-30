import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, animate, useReducedMotion } from 'framer-motion';
import { Sparkles, Star, ShieldCheck, Heart, ArrowRight, Calendar, Scissors, CheckCircle, MapPin, Phone, Clock, Camera } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import StoreStatus from '../components/StoreStatus';
import GallerySection from '../components/GallerySection';
import ReviewsSection from '../components/ReviewsSection';
import BookAppointment from './BookAppointment';

// Polaroid Card Stack Component
function PolaroidStack() {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  
  // Custom inline SVG illustrations matching the warm color palette
  const dogBathingSVG = (
    <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 text-puppy-brown dark:text-puppy-peach" fill="currentColor">
      <circle cx="50" cy="50" r="40" className="fill-puppy-peach/20 dark:fill-puppy-highlight/10" />
      <circle cx="32" cy="28" r="3.5" className="fill-puppy-sage/50" />
      <circle cx="68" cy="24" r="4.5" className="fill-puppy-sage/50" />
      <circle cx="50" cy="18" r="2.5" className="fill-puppy-sage/50" />
      <path d="M30 60 C30 50, 70 50, 70 60 Z" className="fill-puppy-brown/30" />
      <path d="M40 50 C40 40, 60 40, 60 50 Z" className="fill-puppy-brown" />
      <path d="M38 42 C35 42, 35 48, 38 48 Z" className="fill-puppy-emphasis" />
      <path d="M62 42 C65 42, 65 48, 62 48 Z" className="fill-puppy-emphasis" />
      <circle cx="47" cy="45" r="1.2" className="fill-puppy-emphasis" />
      <circle cx="53" cy="45" r="1.2" className="fill-puppy-emphasis" />
      <circle cx="50" cy="48" r="1" className="fill-puppy-alert" />
      <path d="M25 60 L75 60 L70 80 L30 80 Z" className="fill-puppy-peach dark:fill-puppy-highlight" />
      <rect x="22" y="57" width="56" height="4" rx="2" className="fill-puppy-emphasis" />
    </svg>
  );

  const catGroomingSVG = (
    <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 text-puppy-brown dark:text-puppy-peach" fill="currentColor">
      <circle cx="50" cy="50" r="40" className="fill-puppy-peach/20 dark:fill-puppy-highlight/10" />
      <circle cx="50" cy="55" r="16" className="fill-puppy-brown" />
      <polygon points="36,45 42,32 46,45" className="fill-puppy-emphasis" />
      <polygon points="64,45 58,32 54,45" className="fill-puppy-emphasis" />
      <circle cx="45" cy="52" r="1.5" className="fill-puppy-cream" />
      <circle cx="55" cy="52" r="1.5" className="fill-puppy-cream" />
      <polygon points="49,56 51,56 50,58" className="fill-puppy-alert" />
      <path d="M70 20 L55 35 M70 30 L55 25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="22" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="70" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  const pawLoveSVG = (
    <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 text-puppy-brown dark:text-puppy-peach" fill="currentColor">
      <circle cx="50" cy="50" r="40" className="fill-puppy-peach/20 dark:fill-puppy-highlight/10" />
      <path d="M50 35 C50 30, 40 25, 33 32 C26 39, 32 50, 50 65 C68 50, 74 39, 67 32 C60 25, 50 30, 50 35 Z" className="fill-puppy-alert/30 dark:fill-puppy-alert/15" />
      <ellipse cx="50" cy="53" rx="10" ry="8" className="fill-puppy-emphasis" />
      <circle cx="35" cy="43" r="4.5" className="fill-puppy-emphasis" />
      <circle cx="43" cy="35" r="4.5" className="fill-puppy-emphasis" />
      <circle cx="57" cy="35" r="4.5" className="fill-puppy-emphasis" />
      <circle cx="65" cy="43" r="4.5" className="fill-puppy-emphasis" />
    </svg>
  );

  const happyDogSVG = (
    <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 text-puppy-brown dark:text-puppy-peach" fill="currentColor">
      <circle cx="50" cy="50" r="40" className="fill-puppy-peach/20 dark:fill-puppy-highlight/10" />
      <circle cx="50" cy="52" r="18" className="fill-puppy-brown" />
      <path d="M30 45 C25 45, 26 62, 33 60 Z" className="fill-puppy-emphasis" />
      <path d="M70 45 C75 45, 74 62, 67 60 Z" className="fill-puppy-emphasis" />
      <circle cx="44" cy="48" r="2" className="fill-puppy-emphasis" />
      <circle cx="56" cy="48" r="2" className="fill-puppy-emphasis" />
      <circle cx="43" cy="47" r="0.6" fill="white" />
      <circle cx="55" cy="47" r="0.6" fill="white" />
      <polygon points="47,53 53,53 50,56" className="fill-puppy-emphasis" />
      <path d="M50 56 Q50 63, 53 63 Q55 63, 55 60 Z" className="fill-puppy-alert" />
      <path d="M44 58 Q50 61, 56 58" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const [cards, setCards] = useState([
    { id: 1, caption: "Leo's Spa Day 🛁", imageContent: dogBathingSVG },
    { id: 2, caption: "Bella's Fresh Cut ✂️", imageContent: catGroomingSVG },
    { id: 3, caption: "Max's Care Day 🐾", imageContent: pawLoveSVG },
    { id: 4, caption: "Happy Tail Love ❤️", imageContent: happyDogSVG }
  ]);

  useEffect(() => {
    if (shouldReduceMotion || isHovered) return;
    
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const topCard = newCards.pop();
        newCards.unshift(topCard);
        return newCards;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [shouldReduceMotion, isHovered]);

  // Card fan offsets (Index 0: back, Index 3: front/top)
  const positions = [
    { rotate: -8, x: -16, y: 10, scale: 0.9, zIndex: 10 },
    { rotate: 4, x: 12, y: -6, scale: 0.94, zIndex: 20 },
    { rotate: -3, x: -8, y: 4, scale: 0.97, zIndex: 30 },
    { rotate: 6, x: 16, y: 12, scale: 1.0, zIndex: 40 }
  ];

  return (
    <div 
      className="relative w-72 h-80 sm:w-80 sm:h-96 flex items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setCards(prev => {
          const newCards = [...prev];
          const topCard = newCards.pop();
          newCards.unshift(topCard);
          return newCards;
        });
      }}
    >
      {cards.map((card, index) => {
        const layoutStyle = positions[index];
        return (
          <motion.div
            key={card.id}
            style={{
              position: 'absolute',
              zIndex: layoutStyle.zIndex,
            }}
            animate={shouldReduceMotion ? {
              // Static fanned arrangement for reduced motion
              rotate: (index - 1.5) * 5,
              x: (index - 1.5) * 15,
              y: 0,
              scale: 0.95 + index * 0.015,
            } : {
              rotate: layoutStyle.rotate,
              x: layoutStyle.x,
              y: layoutStyle.y,
              scale: layoutStyle.scale,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-52 h-64 sm:w-60 sm:h-76 bg-white dark:bg-puppy-darkcard p-3 pb-6 rounded-2xl shadow-puppy-md border border-puppy-beige/80 dark:border-puppy-emphasis/30 flex flex-col justify-between"
          >
            {/* Washi Tape Accent */}
            {index === 3 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-puppy-peach/60 dark:bg-puppy-highlight/60 backdrop-blur-xs -rotate-2 shadow-xs border border-white/20 z-50 text-[8px] font-bold text-puppy-emphasis/80 dark:text-puppy-darkbg flex items-center justify-center tracking-wider rounded-xs">
                SUZI PET
              </div>
            )}
            
            {/* Image Box */}
            <div className="w-full aspect-square rounded-xl bg-puppy-cream dark:bg-puppy-darkbg overflow-hidden flex items-center justify-center border border-puppy-beige/40 dark:border-puppy-emphasis/20">
              {card.imageContent}
            </div>

            {/* Caption */}
            <div className="pt-3 text-center">
              <span className="font-display font-bold text-xs sm:text-sm text-puppy-emphasis dark:text-puppy-peach tracking-wide">
                {card.caption}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Framer Motion based number counter component
function StatCounter({ from = 0, to, duration = 2, decimals = 0, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(from);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(to);
      return;
    }
    if (inView) {
      const controls = animate(from, to, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (value) => setCount(value)
      });
      return () => controls.stop();
    }
  }, [inView, from, to, duration, shouldReduceMotion]);

  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>;
}

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState('hero');
  const [bookingPref, setBookingPref] = useState({ category: 'Spa', service: 'Spa/Relaxation Services' });

  // Refs for scroll spy highlight
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const spaRef = useRef(null);
  const groomingRef = useRef(null);
  const galleryRef = useRef(null);
  const reviewsRef = useRef(null);
  const bookingFormRef = useRef(null);
  const contactRef = useRef(null);

  const isHeroInView = useInView(heroRef, { amount: 0.25, margin: "-10% 0px -10% 0px" });
  const isAboutInView = useInView(aboutRef, { amount: 0.25, margin: "-10% 0px -10% 0px" });
  const isSpaInView = useInView(spaRef, { amount: 0.25, margin: "-10% 0px -10% 0px" });
  const isGroomingInView = useInView(groomingRef, { amount: 0.25, margin: "-10% 0px -10% 0px" });
  const isGalleryInView = useInView(galleryRef, { amount: 0.25, margin: "-10% 0px -10% 0px" });
  const isReviewsInView = useInView(reviewsRef, { amount: 0.25, margin: "-10% 0px -10% 0px" });
  const isBookingInView = useInView(bookingFormRef, { amount: 0.25, margin: "-10% 0px -10% 0px" });
  const isContactInView = useInView(contactRef, { amount: 0.25, margin: "-10% 0px -10% 0px" });

  useEffect(() => {
    if (isHeroInView) setActiveSection('hero');
    else if (isAboutInView) setActiveSection('about');
    else if (isSpaInView) setActiveSection('spa');
    else if (isGroomingInView) setActiveSection('grooming');
    else if (isGalleryInView) setActiveSection('gallery');
    else if (isReviewsInView) setActiveSection('reviews');
    else if (isBookingInView) setActiveSection('booking');
    else if (isContactInView) setActiveSection('contact');
  }, [isHeroInView, isAboutInView, isSpaInView, isGroomingInView, isGalleryInView, isReviewsInView, isBookingInView, isContactInView]);

  const triggerBooking = (category, serviceName) => {
    setBookingPref({ category, service: serviceName });
    const element = document.getElementById('book-appointment');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Dynamic backgrounds based on active section and warm palette colors
  let bgClass = "bg-puppy-cream dark:bg-puppy-darkbg";
  if (!shouldReduceMotion) {
    if (activeSection === 'hero' || activeSection === 'about') {
      bgClass = "bg-puppy-cream dark:bg-puppy-darkbg transition-colors duration-1000";
    } else if (activeSection === 'spa') {
      bgClass = "bg-puppy-beige dark:bg-puppy-darkcard/40 transition-colors duration-1000";
    } else if (activeSection === 'grooming') {
      bgClass = "bg-[#FAF0E6] dark:bg-[#3D2C24]/30 transition-colors duration-1000";
    } else if (activeSection === 'gallery' || activeSection === 'reviews') {
      bgClass = "bg-puppy-cream dark:bg-puppy-darkbg transition-colors duration-1000";
    } else if (activeSection === 'booking' || activeSection === 'contact') {
      bgClass = "bg-puppy-beige dark:bg-puppy-darkcard/40 transition-colors duration-1000";
    }
  }

  const spaServices = [
    {
      name: 'Spa/Relaxation Services',
      description: 'A soothing and therapeutic session designed to relieve stress, nourish the skin, and rejuvenate your pet. We use premium, pet-safe, calming shampoos and techniques in a highly peaceful environment.',
      benefits: ['Promotes muscle relaxation', 'Reduces anxiety', 'Cleanses skin and nourishes coat'],
    }
  ];

  const groomingServices = [
    {
      name: 'Hygiene Cuts',
      description: 'Careful trim of sanitary areas (belly, paws, backend) to keep your pet clean, hygienic, and free from debris between full grooms.',
      benefits: ['Prevents matting in friction zones', 'Maintains cleanliness', 'Saves coat length elsewhere'],
    },
    {
      name: 'Nail Trimming',
      description: 'Careful clipping and filing of claws to the optimal length. Prevents nail cracking, scratching, and pain while walking.',
      benefits: ['Ensures healthy joint alignment', 'Prevents painful nail splits', 'Protects home flooring'],
    },
    {
      name: 'Ear Cleaning',
      description: 'Gentle debris removal and ear canal cleaning using pet-safe antiseptic solutions. Helps prevent irritation and bacterial/yeast infections.',
      benefits: ['Removes built-up wax', 'Prevents odor and infections', 'Identifies potential ear mites early'],
    }
  ];

  return (
    <div className={`relative min-h-screen pt-28 overflow-hidden ${bgClass}`}>
      
      {/* 1. HERO SECTION */}
      <section ref={heroRef} id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Left Column: Headline, Subheadline, Call Timings badge, CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div variants={itemVariants} className="inline-flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <span className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-puppy-peach/30 text-puppy-emphasis dark:bg-puppy-highlight/25 dark:text-puppy-peach text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Premium Spa & Pet Care</span>
              </span>
              <StoreStatus />
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-puppy-emphasis dark:text-white leading-tight"
            >
              Because every pet <br />
              deserves a <span className="text-puppy-emphasis underline decoration-puppy-highlight decoration-4 underline-offset-8 dark:text-puppy-peach dark:no-underline">little luxury</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-puppy-emphasis/95 dark:text-puppy-cream/90 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
            >
              Professional pet spa & grooming services to keep your pets happy, healthy, and beautiful. Secunderabad's premier destination for hygienic upkeep and relaxation.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="pt-2 flex justify-center lg:justify-start"
            >
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                onClick={() => triggerBooking('Spa', 'Spa/Relaxation Services')}
                className={`px-10 py-4.5 rounded-full text-sm font-extrabold tracking-wide bg-puppy-peach text-puppy-darkbg shadow-puppy-sm hover:shadow-puppy-md flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  !shouldReduceMotion ? 'animate-pulse-glow' : ''
                }`}
              >
                <span>Book Appointment Now</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </motion.button>
            </motion.div>
          </div>

          {/* Right Column: Polaroid Card Stack */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full max-w-sm flex justify-center"
            >
              <PolaroidStack />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 2. ABOUT & STATS SECTION */}
      <section ref={aboutRef} id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-puppy-beige/50 dark:border-puppy-emphasis/25">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Story Card */}
          <div className="lg:col-span-7 space-y-6">
            <GlassCard animate={false} className="bg-white dark:bg-puppy-darkcard p-8 space-y-6 shadow-puppy-sm border-puppy-beige/50 dark:border-puppy-emphasis/25">
              <h2 className="font-display font-extrabold text-2xl text-puppy-emphasis dark:text-puppy-peach">
                Our Story
              </h2>
              
              <p className="text-puppy-brown dark:text-puppy-cream/80 text-sm leading-relaxed font-semibold">
                Suzi Pet Store and Spa is your go-to place in Kapra, Hyderabad for professional pet grooming and relaxing spa services. We offer grooming, hygiene cuts, nail trimming, and ear cleaning in a clean, safe, and pet-friendly environment.
              </p>
              
              <p className="text-puppy-emphasis dark:text-puppy-cream/90 text-sm leading-relaxed font-bold italic border-l-4 border-puppy-peach pl-4 py-1 bg-puppy-peach/10 rounded-r-xl">
                "Your pets are treated with love, care, and attention — because they deserve the best."
              </p>
            </GlassCard>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassCard className="flex flex-col justify-center items-center p-6 border-puppy-beige/50 dark:border-puppy-emphasis/20 text-center">
                <div className="p-3 rounded-2xl bg-puppy-peach/20 text-puppy-emphasis dark:text-puppy-peach mb-3">
                  <Star className="h-6 w-6 fill-current" />
                </div>
                <h4 className="text-puppy-emphasis dark:text-white font-extrabold text-lg">
                  <StatCounter to={5.0} decimals={1} suffix=" Stars" />
                </h4>
                <p className="text-[10px] text-puppy-brown/70 dark:text-puppy-cream/60 font-bold uppercase tracking-wider mt-1">
                  Google Rating
                </p>
                <p className="text-[9px] text-puppy-brown/50 dark:text-puppy-cream/40 font-semibold">
                  Based on <StatCounter to={28} /> Reviews
                </p>
              </GlassCard>

              <GlassCard className="flex flex-col justify-center items-center p-6 border-puppy-beige/50 dark:border-puppy-emphasis/20 text-center">
                <div className="p-3 rounded-2xl bg-puppy-beige/50 text-puppy-brown dark:text-puppy-highlight mb-3">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-puppy-emphasis dark:text-white font-extrabold text-lg">
                  <StatCounter to={1} suffix=" Year" />
                </h4>
                <p className="text-[10px] text-puppy-brown/70 dark:text-puppy-cream/60 font-bold uppercase tracking-wider mt-1">
                  In Business
                </p>
                <p className="text-[9px] text-puppy-brown/50 dark:text-puppy-cream/40 font-semibold">
                  Established Local Brand
                </p>
              </GlassCard>
            </div>

            <GlassCard className="flex items-center space-x-4 p-5 border-puppy-beige/50 dark:border-puppy-emphasis/20">
              <div className="p-3 rounded-2xl bg-puppy-peach/15 text-puppy-emphasis dark:text-puppy-highlight">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h4 className="text-puppy-emphasis dark:text-white font-extrabold text-sm sm:text-base">
                  100% Love & Care
                </h4>
                <p className="text-[10px] text-puppy-brown/70 dark:text-puppy-cream/60 font-semibold">
                  Kapra, Secunderabad, Hyderabad
                </p>
              </div>
            </GlassCard>
          </div>

        </div>
      </section>

      {/* 3. SPA SERVICES SECTION */}
      <section ref={spaRef} id="spa-services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-puppy-beige/50 dark:border-puppy-emphasis/25">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-puppy-peach/20 text-puppy-emphasis mb-4 border border-puppy-peach/40">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-puppy-emphasis dark:text-white mb-3">
            Spa & Relaxation Services
          </h2>
          <p className="text-puppy-emphasis/90 dark:text-puppy-cream/70 text-xs sm:text-sm font-semibold max-w-xl">
            A gentle care experience tailored to ease pet anxiety, promote muscle relaxation, and restore coat shine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
          {spaServices.map((service) => (
            <GlassCard
              key={service.name}
              animate={false}
              className="bg-puppy-cream/85 dark:bg-puppy-darkcard/60 border-puppy-beige/70 dark:border-puppy-emphasis/20 hover:border-puppy-peach dark:hover:border-puppy-highlight/40 shadow-puppy-sm"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center font-semibold text-left">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <h3 className="font-display font-extrabold text-2xl text-puppy-emphasis dark:text-puppy-peach">
                      {service.name}
                    </h3>
                    <span className="px-3.5 py-1 rounded-full bg-puppy-peach/30 text-puppy-emphasis text-[10px] font-extrabold uppercase border border-puppy-peach/30 tracking-wide shrink-0">
                      [Pricing — to be confirmed]
                    </span>
                  </div>
                  <p className="text-puppy-emphasis/90 dark:text-puppy-cream/80 text-xs sm:text-sm leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="pt-2">
                    <h4 className="text-[10px] uppercase tracking-wider text-puppy-emphasis/60 dark:text-puppy-cream/50 font-bold mb-3">
                      Key Highlights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {service.benefits.map((b) => (
                        <div
                          key={b}
                          className="flex items-center space-x-2 text-xs bg-white/60 dark:bg-puppy-darkbg/40 border border-puppy-beige rounded-xl p-3 text-puppy-emphasis dark:text-puppy-cream font-bold"
                        >
                          <CheckCircle className="h-4 w-4 text-puppy-highlight shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex justify-start lg:justify-end w-full">
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    onClick={() => triggerBooking('Spa', service.name)}
                    className="px-8 py-4 rounded-full text-xs sm:text-sm font-extrabold bg-puppy-peach text-puppy-darkbg hover:bg-puppy-peachhover dark:bg-puppy-highlight dark:text-puppy-darkbg shadow-puppy-sm flex items-center justify-center space-x-2 w-full transition-all cursor-pointer border border-puppy-peach/40"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Book Spa Session</span>
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 4. GROOMING SERVICES SECTION */}
      <section ref={groomingRef} id="grooming-services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-puppy-beige/50 dark:border-puppy-emphasis/25">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-puppy-sage/20 text-puppy-emphasis mb-4 border border-puppy-sage/40">
            <Scissors className="h-6 w-6" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-puppy-emphasis dark:text-white mb-3">
            Professional Grooming Services
          </h2>
          <p className="text-puppy-emphasis/90 dark:text-puppy-cream/70 text-xs sm:text-sm font-semibold max-w-xl">
            Hygienic maintenance procedures from ear cleaning to hygiene trims, maintaining optimal skin condition and joint comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {groomingServices.map((service) => (
            <GlassCard
              key={service.name}
              animate={false}
              className="bg-puppy-cream/85 dark:bg-puppy-darkcard/60 border-puppy-beige/70 dark:border-puppy-emphasis/20 hover:border-puppy-sage dark:hover:border-puppy-sage/40 shadow-puppy-sm flex flex-col justify-between h-full"
            >
              <div className="space-y-4 font-semibold text-left">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-puppy-emphasis dark:text-puppy-sage">
                    {service.name}
                  </h3>
                </div>
                
                <p className="text-puppy-emphasis/90 dark:text-puppy-cream/80 text-xs sm:text-sm leading-relaxed min-h-[50px]">
                  {service.description}
                </p>
                
                <div className="pt-2">
                  <h4 className="text-[10px] uppercase tracking-wider text-puppy-emphasis/60 dark:text-puppy-cream/50 font-bold mb-2">
                    Key Highlights
                  </h4>
                  <div className="space-y-2">
                    {service.benefits.map((b) => (
                      <div key={b} className="flex items-center space-x-2 text-xs text-puppy-emphasis dark:text-puppy-cream font-bold">
                        <CheckCircle className="h-4 w-4 text-puppy-sage shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-puppy-beige/50 dark:border-puppy-emphasis/20 flex flex-col sm:flex-row gap-4 items-center justify-between font-bold">
                <div className="text-left w-full sm:w-auto">
                  <div className="text-[9px] uppercase tracking-wide text-puppy-emphasis/60 dark:text-puppy-cream/40">Grooming Rate</div>
                  <span className="text-[11px] text-puppy-emphasis dark:text-puppy-cream/70 font-semibold">[Pricing — TBD]</span>
                </div>
                
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  onClick={() => triggerBooking('Grooming', service.name)}
                  className="px-5 py-3 rounded-full text-xs font-extrabold bg-puppy-sage text-puppy-darkbg hover:bg-puppy-sage/90 dark:bg-puppy-sage dark:text-puppy-darkbg shadow-puppy-sm hover:shadow-puppy-md transition-all duration-300 flex items-center space-x-1.5 cursor-pointer border border-puppy-sage/40 w-full sm:w-auto justify-center"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Book Grooming</span>
                </motion.button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 5. GALLERY SECTION */}
      <section ref={galleryRef} id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-puppy-beige/50 dark:border-puppy-emphasis/25">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-puppy-peach/20 text-puppy-emphasis dark:bg-puppy-highlight/10 mb-4 border border-puppy-peach/30">
            <Camera className="h-6 w-6 text-puppy-emphasis dark:text-puppy-peach" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-puppy-emphasis dark:text-white mb-3">
            Our Gallery
          </h2>
          <p className="text-puppy-brown dark:text-puppy-cream/70 text-xs sm:text-sm font-semibold max-w-xl">
            Real snapshots and before-after clips of our happy, beautiful clients.
          </p>
        </div>

        <GallerySection />
      </section>

      {/* 6. REVIEWS SECTION */}
      <section ref={reviewsRef} id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-puppy-beige/50 dark:border-puppy-emphasis/25 text-center">
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-puppy-peach/25 text-puppy-emphasis dark:text-puppy-peach border border-puppy-peach/30 mb-4">
            <Star className="h-6 w-6 fill-current text-[#e3a82d] dark:text-puppy-peach" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-puppy-emphasis dark:text-white mb-3">
            Customer Reviews
          </h2>
          <p className="text-puppy-brown dark:text-puppy-cream/70 text-xs sm:text-sm font-semibold max-w-xl">
            See what verified pet parents say about their premium care experiences.
          </p>
        </div>

        <ReviewsSection />
      </section>

      {/* 7. BOOK APPOINTMENT FORM SECTION */}
      <section ref={bookingFormRef} id="book-appointment" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-puppy-beige/50 dark:border-puppy-emphasis/25 text-center">
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-puppy-peach/20 text-puppy-emphasis mb-4 border border-puppy-peach/30">
            <Calendar className="h-6 w-6 text-puppy-emphasis dark:text-puppy-peach" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-puppy-emphasis dark:text-white mb-3">
            Book an Appointment
          </h2>
          <p className="text-puppy-brown dark:text-puppy-cream/70 text-xs sm:text-sm font-semibold max-w-xl">
            Fill out this brief request form. Our team will review slots and contact you shortly to confirm dates.
          </p>
        </div>

        <BookAppointment initialCategory={bookingPref.category} initialService={bookingPref.service} />
      </section>

      {/* 8. CONTACT & HOURS SECTION (Includes Google Map) */}
      <section ref={contactRef} id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-puppy-beige/50 dark:border-puppy-emphasis/25">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Details Column */}
          <div className="lg:col-span-5">
            <GlassCard animate={false} className="bg-white dark:bg-puppy-darkcard p-8 space-y-6 shadow-puppy-sm border-puppy-beige/50 dark:border-puppy-emphasis/25">
              <h2 className="font-display font-extrabold text-2xl text-puppy-emphasis dark:text-puppy-peach text-left">
                Contact & Hours
              </h2>
              
              <div className="space-y-6 font-semibold text-left">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-5 w-5 text-puppy-highlight shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-puppy-brown/70 dark:text-puppy-cream/60 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Address
                    </h3>
                    <p className="text-puppy-emphasis dark:text-puppy-cream/90 text-xs sm:text-sm leading-relaxed">
                      H.No. 1-107/53, V S Colony, Kapra,<br />
                      Secunderabad, Hyderabad, Telangana 500062
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-5 w-5 text-puppy-highlight shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-puppy-brown/70 dark:text-puppy-cream/60 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Phone Numbers
                    </h3>
                    <p className="text-puppy-emphasis dark:text-puppy-cream/90 text-sm font-bold hover:text-puppy-highlight transition-colors">
                      <a href="tel:09000097424">090000 97424</a>
                    </p>
                    <p className="text-puppy-emphasis dark:text-puppy-cream/90 text-sm font-bold hover:text-puppy-highlight transition-colors mt-0.5">
                      <a href="tel:08401385510">084013 85510</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-5 w-5 text-puppy-highlight shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-puppy-brown/70 dark:text-puppy-cream/60 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Hours & Timings
                    </h3>
                    <p className="text-puppy-emphasis dark:text-puppy-cream/90 text-xs sm:text-sm leading-relaxed">
                      Open 10:00 AM – 9:00 PM every single day
                    </p>
                    <div className="mt-2">
                      <StoreStatus />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Interactive Google Map Column */}
          <div className="lg:col-span-7 h-96 rounded-[28px] overflow-hidden border border-puppy-beige dark:border-puppy-emphasis/20 shadow-puppy-md dark:shadow-puppy-glow bg-white dark:bg-puppy-darkcard">
            <iframe
              src="https://maps.google.com/maps?q=H.No.%201-107/53,%20V%20S%20Colony,%20Kapra,%20Secunderabad,%20Hyderabad,%20Telangana%20500062&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location of Suzi Pet Store and Spa"
              className="opacity-90 hover:opacity-100 transition-opacity duration-300 dark:invert-[90%] dark:hue-rotate-180"
            ></iframe>
          </div>

        </div>
      </section>

    </div>
  );
}
