import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Phone, MapPin, Clock, Send, Sparkles, Facebook, Instagram, Twitter } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Footer() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ loading: false, success: false, error: 'Please fill in all fields.' });
      return;
    }

    setStatus({ loading: true, success: false, error: '' });
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        createdAt: serverTimestamp(),
      });
      setFormData({ name: '', email: '', message: '' });
      setStatus({ loading: false, success: true, error: '' });
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, success: false, error: 'Could not send message. Please try again.' });
    }
  };

  // Bounce variants for footer icons
  const iconBounce = shouldReduceMotion ? {} : {
    hover: {
      y: [0, -6, 0],
      transition: { duration: 0.4, ease: "easeInOut" }
    }
  };

  return (
    <footer className="relative bg-puppy-beige/10 dark:bg-puppy-darkcard/25 border-t border-puppy-beige dark:border-puppy-emphasis/15 pt-16 pb-8 text-puppy-emphasis dark:text-puppy-cream/80 transition-colors duration-300">
      
      {/* Decorative paw print */}
      <div className="absolute bottom-8 right-8 text-puppy-peach/10 dark:text-puppy-highlight/5 w-10 h-10 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="6" r="3"/><circle cx="16" cy="6" r="3"/>
          <circle cx="4" cy="11" r="3.5"/><circle cx="20" cy="11" r="3.5"/>
          <path d="M12,12 C9.5,12 8,14.5 8,17 C8,19.5 10,21 12,21 C14,21 16,19.5 16,17 C16,14.5 14.5,12 12,12 Z"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-puppy-beige/40 dark:border-puppy-emphasis/15">
          
          {/* Info Block (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="p-2 rounded-xl bg-puppy-peach/20 dark:bg-puppy-highlight/15 border border-puppy-beige dark:border-puppy-darkcard">
                  <Sparkles className="h-5 w-5 text-puppy-highlight" />
                </span>
                <span className="font-display font-bold text-xl tracking-tight text-puppy-emphasis dark:text-white">
                  Suzi <span className="text-puppy-highlight dark:text-puppy-highlight font-light">Pet Store & Spa</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-md text-puppy-brown dark:text-puppy-cream/70 font-semibold">
                Suzi Pet Store and Spa is your go-to place in Kapra, Hyderabad for professional pet grooming and relaxing spa services. We treat your pets with love, care, and attention — because they deserve the best.
              </p>

              {/* Social Icons */}
              <div className="flex items-center space-x-4 mb-8">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white dark:bg-puppy-darkcard border border-puppy-beige/85 dark:border-puppy-emphasis/20 text-puppy-brown/70 hover:text-puppy-highlight dark:text-puppy-cream/75 dark:hover:text-puppy-peach hover:border-puppy-highlight transition-all shadow-xs"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4.5 w-4.5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white dark:bg-puppy-darkcard border border-puppy-beige/85 dark:border-puppy-emphasis/20 text-puppy-brown/70 hover:text-puppy-highlight dark:text-puppy-cream/75 dark:hover:text-puppy-peach hover:border-puppy-highlight transition-all shadow-xs"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white dark:bg-puppy-darkcard border border-puppy-beige/85 dark:border-puppy-emphasis/20 text-puppy-brown/70 hover:text-puppy-highlight dark:text-puppy-cream/75 dark:hover:text-puppy-peach hover:border-puppy-highlight transition-all shadow-xs"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>

            <div className="space-y-5">
              {/* Address */}
              <div className="flex items-start space-x-3">
                <motion.div whileHover="hover" variants={iconBounce} className="shrink-0 mt-0.5 cursor-pointer">
                  <MapPin className="h-5 w-5 text-puppy-sage" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-sm text-puppy-emphasis dark:text-white mb-0.5">Address</h4>
                  <p className="text-xs leading-relaxed text-puppy-brown dark:text-puppy-cream/60 font-semibold">
                    H.No. 1-107/53, V S Colony, Kapra,<br />
                    Secunderabad, Hyderabad, Telangana 500062
                  </p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start space-x-3">
                <motion.div whileHover="hover" variants={iconBounce} className="shrink-0 mt-0.5 cursor-pointer">
                  <Phone className="h-5 w-5 text-puppy-highlight" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-sm text-puppy-emphasis dark:text-white mb-0.5">Phone Numbers</h4>
                  <div className="text-xs text-puppy-brown dark:text-puppy-cream/60 space-y-1 font-semibold">
                    <p><a href="tel:09000097424" className="hover:text-puppy-highlight transition-colors">090000 97424</a></p>
                    <p><a href="tel:08401385510" className="hover:text-puppy-highlight transition-colors">084013 85510</a></p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start space-x-3">
                <motion.div whileHover="hover" variants={iconBounce} className="shrink-0 mt-0.5 cursor-pointer">
                  <Clock className="h-5 w-5 text-puppy-highlight dark:text-puppy-peach" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-sm text-puppy-emphasis dark:text-white mb-0.5">Business Hours</h4>
                  <p className="text-xs text-puppy-brown dark:text-puppy-cream/60 font-semibold">
                    Open 10:00 AM – 9:00 PM daily
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-display font-bold text-puppy-emphasis dark:text-white tracking-wide text-xs uppercase mb-6">Explore</h3>
            <ul className="space-y-3 text-sm font-semibold">
              <li><a href="/#home" className="text-puppy-brown hover:text-puppy-emphasis dark:text-puppy-cream/70 dark:hover:text-puppy-highlight transition-colors">Home</a></li>
              <li><a href="/#spa-services" className="text-puppy-brown hover:text-puppy-emphasis dark:text-puppy-cream/70 dark:hover:text-puppy-highlight transition-colors">Spa Services</a></li>
              <li><a href="/#grooming-services" className="text-puppy-brown hover:text-puppy-emphasis dark:text-puppy-cream/70 dark:hover:text-puppy-highlight transition-colors">Grooming Services</a></li>
              <li><a href="/#gallery" className="text-puppy-brown hover:text-puppy-emphasis dark:text-puppy-cream/70 dark:hover:text-puppy-highlight transition-colors">Gallery</a></li>
              <li><a href="/#reviews" className="text-puppy-brown hover:text-puppy-emphasis dark:text-puppy-cream/70 dark:hover:text-puppy-highlight transition-colors">Reviews</a></li>
              <li><a href="/#book-appointment" className="text-puppy-highlight dark:text-puppy-peach font-bold hover:underline transition-all">Book Appointment</a></li>
            </ul>
          </div>

          {/* Contact Form Block */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-puppy-darkcard border border-puppy-beige dark:border-puppy-emphasis/25 rounded-3xl p-6 shadow-puppy-md dark:shadow-puppy-glow">
              <h3 className="font-display font-bold text-puppy-emphasis dark:text-white tracking-wide text-base mb-2">Send Us a Message</h3>
              <p className="text-xs text-puppy-brown/85 dark:text-puppy-cream/60 mb-4 font-semibold">Have questions? Drop us a line and we'll get back to you shortly.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-4 py-3 bg-puppy-cream/35 dark:bg-puppy-darkbg/40 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-peach dark:focus:border-puppy-highlight text-puppy-emphasis dark:text-white placeholder-puppy-brown/50 dark:placeholder-puppy-cream/40 transition-colors font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-4 py-3 bg-puppy-cream/35 dark:bg-puppy-darkbg/40 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-peach dark:focus:border-puppy-highlight text-puppy-emphasis dark:text-white placeholder-puppy-brown/50 dark:placeholder-puppy-cream/40 transition-colors font-semibold"
                  />
                </div>
                <div>
                  <textarea
                    rows="3"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs px-4 py-3 bg-puppy-cream/35 dark:bg-puppy-darkbg/40 border border-puppy-beige dark:border-puppy-emphasis/15 rounded-2xl focus:outline-none focus:border-puppy-peach dark:focus:border-puppy-highlight text-puppy-emphasis dark:text-white placeholder-puppy-brown/50 dark:placeholder-puppy-cream/40 resize-none transition-colors font-semibold"
                  ></textarea>
                </div>
                
                {status.error && (
                  <p className="text-xs text-rose-500 font-semibold">{status.error}</p>
                )}
                {status.success && (
                  <p className="text-xs text-puppy-sage font-bold">Message sent! We'll reply soon.</p>
                )}

                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  type="submit"
                  disabled={status.loading}
                  className="w-full py-3 px-4 rounded-2xl text-xs font-extrabold bg-puppy-peach text-puppy-emphasis hover:bg-puppy-peachhover dark:bg-puppy-highlight dark:text-puppy-darkbg transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-puppy-sm hover:shadow-puppy-md border border-puppy-peach/40"
                >
                  {status.loading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-puppy-brown/70 dark:text-puppy-cream/50 font-semibold">
          <p>&copy; {new Date().getFullYear()} Suzi Pet Store and Spa. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Kapra, Secunderabad, Hyderabad</span>
            <span>&bull;</span>
            <span>5.0 Star Rated (28 Reviews)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
