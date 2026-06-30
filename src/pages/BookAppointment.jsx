import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, Scissors, Calendar, Phone, Mail, User, Info, CheckCircle, Plus } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import BouncingPawLoader from '../components/BouncingPawLoader';

// Popular Indian & global breeds array (~85 entries)
const BREEDS = [
  "Indie / Street Dog", "Indie / Stray Cat", "Persian Cat", "Golden Retriever", 
  "Shih Tzu", "Pug", "Labrador Retriever", "German Shepherd", "Beagle", 
  "Indie (Pariah Dog)", "Spitz (Indian Spitz)", "Cocker Spaniel", "Siberian Husky", 
  "Pomeranian", "Rottweiler", "Doberman Pinscher", "French Bulldog", "Chihuahua", 
  "Siamese Cat", "British Shorthair", "Maine Coon", "Bengal Cat", "Ragdoll", 
  "Maltese", "Tibetan Mastiff", "Great Dane", "Boxer", "Saint Bernard", 
  "Dachshund", "Yorkshire Terrier", "Toy Poodle", "Standard Poodle", "Miniature Poodle", 
  "Border Collie", "Australian Shepherd", "Shiba Inu", "Akita", "Chippiparai", 
  "Mudhol Hound", "Rajapalayam", "Kanni", "Kombai", "Gaddi Kutta", 
  "Bully Kutta", "Rampur Greyhound", "Bhutia Dog", "Bakharwal Dog", 
  "Cavalier King Charles Spaniel", "Boston Terrier", "Havanese", "Bichon Frise", 
  "Lhasa Apso", "Pekingese", "Basset Hound", "Samoyed", "Alaskan Malamute", 
  "Chow Chow", "Bullmastiff", "Cane Corso", "Presa Canario", "Jack Russell Terrier", 
  "Staffordshire Bull Terrier", "American Pit Bull Terrier", "Greyhound", "Whippet", 
  "Dalmatian", "Irish Setter", "English Cocker Spaniel", "English Springer Spaniel", 
  "Afghan Hound", "Saluki", "Belgian Malinois", "Weimaraner", "Bernese Mountain Dog", 
  "Newfoundland", "Shetland Sheepdog", "Cardigan Welsh Corgi", "Pembroke Welsh Corgi", 
  "Sphynx Cat", "Abyssinian Cat", "Burmese Cat", "Russian Blue Cat", "Scottish Fold Cat", 
  "Birman Cat", "Himalayan Cat", "Turkish Angora", "Bombay Cat", "American Shorthair"
];

export default function BookAppointment({ initialCategory, initialService }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  
  // Confirmed services
  const servicesMap = {
    Spa: ['Spa/Relaxation Services'],
    Grooming: ['Hygiene Cuts', 'Nail Trimming', 'Ear Cleaning']
  };

  // Initial state setup
  const defaultCategory = initialCategory || location.state?.category || 'Spa';
  const defaultService = initialService || location.state?.service || servicesMap[defaultCategory][0];

  const [formData, setFormData] = useState({
    category: defaultCategory,
    service: defaultService,
    petName: '',
    petTypeBreed: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '',
    notes: ''
  });

  const [status, setStatus] = useState({ loading: false, success: false, error: '', bookingId: '', calendarUrl: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const comboboxRef = useRef(null);

  // Update form if props change
  useEffect(() => {
    if (initialCategory) {
      setFormData(prev => ({
        ...prev,
        category: initialCategory,
        service: initialService || servicesMap[initialCategory][0]
      }));
    }
  }, [initialCategory, initialService]);

  // Update specific service list if category changes
  useEffect(() => {
    if (!servicesMap[formData.category].includes(formData.service)) {
      setFormData(prev => ({
        ...prev,
        service: servicesMap[prev.category][0]
      }));
    }
  }, [formData.category]);

  // Suggestion filtering (limit to 6 entries)
  const getFilteredBreeds = () => {
    const val = formData.petTypeBreed.trim().toLowerCase();
    if (!val) {
      // Default selections when empty
      return ["Indie / Street Dog", "Indie / Stray Cat", "Persian Cat", "Golden Retriever", "Shih Tzu"];
    }
    return BREEDS.filter(b => b.toLowerCase().includes(val)).slice(0, 6);
  };
  const suggestions = getFilteredBreeds();

  // Close suggestions dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (cat) => {
    setFormData(prev => ({ ...prev, category: cat, service: servicesMap[cat][0] }));
  };

  const generateCalendarUrl = (bookingData) => {
    const { customerName, petName, service, date, time, notes, customerEmail, customerPhone } = bookingData;
    const startLocal = new Date(`${date}T${time}`);
    const endLocal = new Date(startLocal.getTime() + 60 * 60 * 1000); 
    
    const formatToBasicIso = (d) => {
      try {
        return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
      } catch (e) {
        return '';
      }
    };
    
    const startIso = formatToBasicIso(startLocal);
    const endIso = formatToBasicIso(endLocal);
    
    const title = `Suzi Pet Store & Spa: ${service} for ${petName}`;
    const description = `Appointment Details:\n- Customer Name: ${customerName}\n- Contact Number: ${customerPhone}\n- Email: ${customerEmail}\n- Pet Name: ${petName}\n- Service Type: ${service}\n- Notes: ${notes || 'None'}\n\nThank you for choosing Suzi Pet Store and Spa!`;
    const loc = "H.No. 1-107/53, V S Colony, Kapra, Secunderabad, Hyderabad, Telangana 500062";
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(loc)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { petName, petTypeBreed, customerName, customerEmail, customerPhone, date, time, category, service, notes } = formData;
    
    if (!petName || !petTypeBreed || !customerName || !customerEmail || !customerPhone || !date || !time) {
      setStatus(prev => ({ ...prev, error: 'Please fill in all required fields.' }));
      return;
    }

    setStatus(prev => ({ ...prev, loading: true, error: '' }));
    
    try {
      const appointmentDateTime = new Date(`${date}T${time}`);
      
      const docRef = await addDoc(collection(db, 'appointments'), {
        customerName,
        customerPhone,
        customerEmail: customerEmail.toLowerCase(),
        petName,
        petTypeBreed,
        serviceCategory: category,
        serviceName: service,
        dateTime: appointmentDateTime,
        notes,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      const calendarLink = generateCalendarUrl(formData);

      setStatus({
        loading: false,
        success: true,
        error: '',
        bookingId: docRef.id,
        calendarUrl: calendarLink
      });
    } catch (err) {
      console.error(err);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: `Failed to submit appointment: ${err.message}`
      }));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {status.success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="border-puppy-beige dark:border-puppy-emphasis/25 bg-white dark:bg-puppy-darkcard p-8 text-center space-y-6 max-w-xl mx-auto font-semibold">
            <div className="inline-flex p-4 rounded-full bg-puppy-peach/20 border border-puppy-peach/40 text-puppy-emphasis dark:text-puppy-peach">
              <CheckCircle className="h-12 w-12" />
            </div>
            
            <div className="space-y-2 text-left sm:text-center">
              <h3 className="font-display font-extrabold text-2xl text-puppy-emphasis dark:text-white">Booking Requested!</h3>
              <p className="text-puppy-brown dark:text-puppy-cream/80 text-xs sm:text-sm leading-relaxed">
                Your appointment request has been submitted successfully with status <span className="text-puppy-highlight dark:text-puppy-peach font-bold uppercase">Pending</span>.
              </p>
              <p className="text-xs text-puppy-brown/70 dark:text-puppy-cream/55 font-semibold">
                Appointment Reference ID: <span className="font-mono text-puppy-emphasis dark:text-puppy-cream/80">{status.bookingId}</span>
              </p>
            </div>

            <div className="border-t border-puppy-beige/50 dark:border-puppy-emphasis/20 pt-6 space-y-4">
              <p className="text-xs text-puppy-brown/70 dark:text-puppy-cream/60">
                Add this appointment to your calendar to keep track:
              </p>
              <motion.a
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                href={status.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-full bg-puppy-peach hover:bg-puppy-peachhover text-puppy-emphasis dark:bg-puppy-highlight dark:text-puppy-darkbg font-bold transition-all duration-300 shadow-puppy-sm hover:shadow-puppy-md cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Google Calendar
              </motion.a>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setFormData({
                    category: 'Spa',
                    service: servicesMap.Spa[0],
                    petName: '',
                    petTypeBreed: '',
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    date: '',
                    time: '',
                    notes: ''
                  });
                  setStatus({ loading: false, success: false, error: '', bookingId: '', calendarUrl: '' });
                }}
                className="text-xs text-puppy-highlight dark:text-puppy-peach hover:underline transition-colors"
              >
                Book another appointment
              </button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <GlassCard className="bg-white dark:bg-puppy-darkcard p-8 border-puppy-beige/50 dark:border-puppy-emphasis/25 shadow-puppy-sm">
          <form onSubmit={handleSubmit} className="space-y-6 font-semibold text-left">
            
            {/* 1. Category Switcher */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-puppy-brown/70 dark:text-puppy-cream/50 uppercase tracking-wider">
                Select Service Type *
              </label>
              
              <div className="grid grid-cols-2 gap-4 relative bg-puppy-cream/40 dark:bg-puppy-darkbg/40 p-1.5 rounded-2xl border border-puppy-beige dark:border-puppy-emphasis/15">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('Spa')}
                  className={`relative z-10 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-300 cursor-pointer w-full ${
                    formData.category === 'Spa'
                      ? 'text-puppy-emphasis font-extrabold'
                      : 'text-puppy-brown/60 dark:text-puppy-cream/60 hover:text-puppy-emphasis dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Spa & Relaxation</span>
                  {formData.category === 'Spa' && !shouldReduceMotion && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-puppy-peach/40 rounded-xl -z-10 shadow-xs border border-puppy-peach/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {formData.category === 'Spa' && shouldReduceMotion && (
                    <div className="absolute inset-0 bg-puppy-peach/40 rounded-xl -z-10 shadow-xs border border-puppy-peach/30" />
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleCategoryChange('Grooming')}
                  className={`relative z-10 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-300 cursor-pointer w-full ${
                    formData.category === 'Grooming'
                      ? 'text-puppy-emphasis font-extrabold'
                      : 'text-puppy-brown/60 dark:text-puppy-cream/60 hover:text-puppy-emphasis dark:hover:text-white'
                  }`}
                >
                  <Scissors className="h-4 w-4" />
                  <span>Grooming Services</span>
                  {formData.category === 'Grooming' && !shouldReduceMotion && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-puppy-sage/40 rounded-xl -z-10 shadow-xs border border-puppy-sage/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {formData.category === 'Grooming' && shouldReduceMotion && (
                    <div className="absolute inset-0 bg-puppy-sage/40 rounded-xl -z-10 shadow-xs border border-puppy-sage/30" />
                  )}
                </button>
              </div>
            </div>

            {/* 2. Specific Service Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="service" className="text-[10px] font-bold text-puppy-brown/70 dark:text-puppy-cream/50 uppercase tracking-wider">
                Select Specific Service *
              </label>
              <select
                id="service"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full text-xs px-4 py-3 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white transition-colors"
                required
              >
                {servicesMap[formData.category].map((srv) => (
                  <option key={srv} value={srv} className="bg-white dark:bg-puppy-darkcard text-puppy-emphasis dark:text-white font-semibold">
                    {srv}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Pet & Owner Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pet Name */}
              <div className="relative">
                <input
                  id="petName"
                  type="text"
                  placeholder=" "
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  className="peer w-full text-xs px-4 pt-5 pb-2 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white transition-all"
                  required
                />
                <label
                  htmlFor="petName"
                  className="absolute left-4 top-4 text-xs text-puppy-brown/50 dark:text-puppy-cream/50 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-puppy-emphasis dark:peer-focus:text-puppy-peach peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[9px]"
                >
                  Pet Name *
                </label>
              </div>

              {/* Pet Type / Breed Combobox */}
              <div className="relative" ref={comboboxRef}>
                <input
                  id="petTypeBreed"
                  type="text"
                  placeholder=" "
                  value={formData.petTypeBreed}
                  onChange={(e) => {
                    setFormData({ ...formData, petTypeBreed: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="peer w-full text-xs px-4 pt-5 pb-2 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white transition-all"
                  required
                />
                <label
                  htmlFor="petTypeBreed"
                  className="absolute left-4 top-4 text-xs text-puppy-brown/50 dark:text-puppy-cream/50 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-puppy-emphasis dark:peer-focus:text-puppy-peach peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[9px]"
                >
                  Pet Type / Breed *
                </label>

                {/* Suggestions List */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-puppy-darkcard border border-puppy-beige dark:border-puppy-emphasis/25 rounded-2xl shadow-lg z-30 divide-y divide-puppy-beige/35 dark:divide-puppy-emphasis/10"
                    >
                      {suggestions.map((breed) => (
                        <li
                          key={breed}
                          onClick={() => {
                            setFormData({ ...formData, petTypeBreed: breed });
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-2.5 hover:bg-puppy-peach/20 dark:hover:bg-puppy-highlight/10 text-xs text-puppy-emphasis dark:text-puppy-cream cursor-pointer transition-colors duration-150 font-bold text-left"
                        >
                          {breed}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Customer Name */}
              <div className="relative">
                <input
                  id="customerName"
                  type="text"
                  placeholder=" "
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="peer w-full text-xs px-4 pt-5 pb-2 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white transition-all"
                  required
                />
                <label
                  htmlFor="customerName"
                  className="absolute left-4 top-4 text-xs text-puppy-brown/50 dark:text-puppy-cream/50 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-puppy-emphasis dark:peer-focus:text-puppy-peach peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[9px] flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  <span>Your Name *</span>
                </label>
              </div>

              {/* Customer Email */}
              <div className="relative">
                <input
                  id="customerEmail"
                  type="email"
                  placeholder=" "
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="peer w-full text-xs px-4 pt-5 pb-2 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white transition-all"
                  required
                />
                <label
                  htmlFor="customerEmail"
                  className="absolute left-4 top-4 text-xs text-puppy-brown/50 dark:text-puppy-cream/50 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-puppy-emphasis dark:peer-focus:text-puppy-peach peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[9px] flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  <span>Email Address *</span>
                </label>
              </div>

              {/* Phone Number */}
              <div className="relative">
                <input
                  id="customerPhone"
                  type="tel"
                  placeholder=" "
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="peer w-full text-xs px-4 pt-5 pb-2 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white transition-all"
                  required
                />
                <label
                  htmlFor="customerPhone"
                  className="absolute left-4 top-4 text-xs text-puppy-brown/50 dark:text-puppy-cream/50 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-puppy-emphasis dark:peer-focus:text-puppy-peach peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[9px] flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  <span>Phone Number *</span>
                </label>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="date" className="text-[9px] text-puppy-brown/50 dark:text-puppy-cream/50 uppercase tracking-wider block font-bold">
                    Date *
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs px-4 py-2.5 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white transition-colors"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="time" className="text-[9px] text-puppy-brown/50 dark:text-puppy-cream/50 uppercase tracking-wider block font-bold">
                    Time *
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full text-xs px-4 py-2.5 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white transition-colors"
                    required
                  />
                </div>
              </div>

            </div>

            {/* 4. Notes */}
            <div className="relative">
              <textarea
                id="notes"
                rows="3"
                placeholder=" "
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="peer w-full text-xs px-4 pt-6 pb-2 bg-puppy-cream/30 dark:bg-puppy-darkbg/30 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-highlight dark:focus:border-puppy-peach focus:ring-2 focus:ring-puppy-highlight/20 text-puppy-emphasis dark:text-white resize-none transition-all"
              ></textarea>
              <label
                htmlFor="notes"
                className="absolute left-4 top-4 text-xs text-puppy-brown/50 dark:text-puppy-cream/50 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-puppy-emphasis dark:peer-focus:text-puppy-peach peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[9px]"
              >
                Additional Notes (Optional)
              </label>
            </div>

            {/* Status & Error Display */}
            {status.error && (
              <div className="flex items-center space-x-2 text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <Info className="h-4 w-4 shrink-0" />
                <span>{status.error}</span>
              </div>
            )}

            {/* Submit Button */}
            {status.loading ? (
              <div className="flex justify-center py-2">
                <BouncingPawLoader size="md" />
              </div>
            ) : (
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                type="submit"
                className="w-full py-4 rounded-full text-xs sm:text-sm font-bold tracking-wide bg-puppy-peach text-puppy-emphasis hover:bg-puppy-peachhover dark:bg-puppy-highlight dark:text-puppy-darkbg transition-all duration-300 flex items-center justify-center space-x-2 shadow-puppy-sm hover:shadow-puppy-md cursor-pointer border border-puppy-peach/40"
              >
                <Calendar className="h-4 w-4" />
                <span>Submit Appointment Request</span>
              </motion.button>
            )}

          </form>
        </GlassCard>
      )}
    </div>
  );
}
