import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Phone, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCallDropdown, setShowCallDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdown on route change or scroll
  useEffect(() => {
    setIsOpen(false);
    setShowCallDropdown(false);
  }, [location]);

  // Handle click outside for Call Now dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCallDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', hash: '#home' },
    { name: 'Spa Services', hash: '#spa-services' },
    { name: 'Grooming Services', hash: '#grooming-services' },
    { name: 'Gallery', hash: '#gallery' },
    { name: 'Reviews', hash: '#reviews' },
    { name: 'Book Appointment', hash: '#book-appointment' },
    { name: 'Contact', hash: '#contact' },
  ];

  const handleLinkClick = (hash) => {
    setIsOpen(false);
    // If on the home page, scroll directly
    if (location.pathname === '/') {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-puppy-cream/90 dark:bg-puppy-darkbg/90 backdrop-blur-md border-b border-puppy-beige/40 dark:border-puppy-darkcard/20 py-4 shadow-puppy-sm'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" onClick={() => handleLinkClick('#home')} className="flex items-center space-x-2 group">
            <span className="p-2 rounded-xl bg-puppy-peach/20 dark:bg-puppy-highlight/15 border border-puppy-beige dark:border-puppy-darkcard group-hover:border-puppy-highlight transition-colors">
              <Sparkles className="h-5 w-5 text-puppy-highlight" />
            </span>
            <span className="font-display font-bold text-xl tracking-tight text-puppy-emphasis dark:text-white">
              Suzi <span className="text-puppy-emphasis/80 dark:text-puppy-highlight font-light">Pet Store & Spa</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={`/${link.hash}`}
                onClick={() => handleLinkClick(link.hash)}
                className={`font-semibold transition-colors text-xs xl:text-sm tracking-wide nav-underline ${
                  location.hash === link.hash
                    ? 'text-puppy-emphasis dark:text-puppy-highlight font-extrabold'
                    : 'text-puppy-brown hover:text-puppy-emphasis dark:text-puppy-cream/85 dark:hover:text-puppy-highlight'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Theme Toggle Switch */}
            <div className="pl-2 border-l border-puppy-beige dark:border-puppy-darkcard flex items-center">
              <ThemeToggle />
            </div>

            {/* "Call Now" Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setShowCallDropdown(true)}
              onMouseLeave={() => setShowCallDropdown(false)}
            >
              <button
                onClick={() => setShowCallDropdown(!showCallDropdown)}
                className="flex items-center space-x-1.5 px-2.5 xl:px-4 py-2.5 rounded-full text-xs font-bold bg-puppy-peach hover:bg-puppy-peachhover text-puppy-darkbg transition-all duration-300 shadow-puppy-sm hover:shadow-puppy-md cursor-pointer border border-puppy-peach/30 whitespace-nowrap"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Call Now</span>
                <span className="inline xl:hidden">Call</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCallDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Numbers Dropdown Panel */}
              {showCallDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-puppy-cream dark:bg-puppy-darkcard border border-puppy-beige dark:border-puppy-highlight/15 rounded-2xl p-3 shadow-puppy-md dark:shadow-puppy-glow z-50">
                  <div className="text-[9px] font-bold text-puppy-brown/50 dark:text-puppy-cream/40 uppercase tracking-wider mb-2 px-2">
                    Our Contact Lines
                  </div>
                  <div className="space-y-1">
                    <a
                      href="tel:09000097424"
                      className="block px-2 py-2 rounded-xl text-xs font-bold text-puppy-emphasis dark:text-puppy-cream hover:bg-puppy-peach/20 dark:hover:bg-puppy-highlight/10 transition-colors"
                    >
                      <div className="text-[9px] font-light text-puppy-highlight uppercase">Primary</div>
                      090000 97424
                    </a>
                    <a
                      href="tel:08401385510"
                      className="block px-2 py-2 rounded-xl text-xs font-bold text-puppy-emphasis dark:text-puppy-cream hover:bg-puppy-peach/20 dark:hover:bg-puppy-highlight/10 transition-colors"
                    >
                      <div className="text-[9px] font-light text-puppy-highlight uppercase">Secondary</div>
                      084013 85510
                    </a>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/#book-appointment"
              onClick={() => handleLinkClick('#book-appointment')}
              className="px-3 xl:px-4 py-2.5 rounded-full text-xs font-bold tracking-wide bg-puppy-highlight hover:bg-puppy-peach text-puppy-darkbg transition-all duration-300 shadow-puppy-sm hover:shadow-puppy-md transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <span className="hidden xl:inline">Book Spa & Grooming</span>
              <span className="inline xl:hidden">Book Now</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-puppy-cream dark:bg-puppy-darkcard/40 border border-puppy-beige dark:border-puppy-darkcard text-puppy-emphasis dark:text-puppy-cream"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-puppy-cream dark:bg-puppy-darkbg border border-puppy-beige dark:border-puppy-darkcard/30 shadow-puppy-md dark:shadow-puppy-glow p-4 mt-2 mx-4 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 text-left">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={`/${link.hash}`}
                onClick={() => handleLinkClick(link.hash)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                  location.hash === link.hash
                    ? 'bg-puppy-peach/30 dark:bg-puppy-highlight/10 text-puppy-emphasis dark:text-puppy-highlight border-l-4 border-puppy-highlight'
                    : 'text-puppy-brown hover:bg-puppy-peach/10 dark:text-puppy-cream/80 dark:hover:bg-puppy-highlight/5'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Contact Numbers */}
            <div className="border-t border-puppy-beige dark:border-puppy-darkcard pt-3">
              <div className="text-[9px] font-bold text-puppy-brown/40 dark:text-puppy-cream/40 uppercase tracking-wider mb-1 px-4">
                Call Us Directly
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:09000097424"
                  className="flex flex-col items-center justify-center py-2 px-3 bg-white dark:bg-puppy-darkcard border border-puppy-beige dark:border-puppy-darkcard/35 rounded-xl text-center"
                >
                  <span className="text-[8px] text-puppy-highlight uppercase font-extrabold">Primary</span>
                  <span className="text-xs font-bold text-puppy-emphasis dark:text-white mt-0.5">090000 97424</span>
                </a>
                <a
                  href="tel:08401385510"
                  className="flex flex-col items-center justify-center py-2 px-3 bg-white dark:bg-puppy-darkcard border border-puppy-beige dark:border-puppy-darkcard/35 rounded-xl text-center"
                >
                  <span className="text-[8px] text-puppy-highlight uppercase font-extrabold">Secondary</span>
                  <span className="text-xs font-bold text-puppy-emphasis dark:text-white mt-0.5">084013 85510</span>
                </a>
              </div>
            </div>

            <Link
              to="/#book-appointment"
              onClick={() => handleLinkClick('#book-appointment')}
              className="w-full text-center px-4 py-3 rounded-xl font-bold bg-puppy-highlight text-puppy-darkbg block hover:bg-puppy-peach transition-all duration-300 cursor-pointer shadow-sm"
            >
              Book Spa & Grooming
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
