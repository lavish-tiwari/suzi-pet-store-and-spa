import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, MapPin, Calendar, Phone } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi there! 🐾 I'm Suzi's Assistant. How can I help you and your pet today?",
      isGreeting: true,
    },
  ]);
  
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Hide on any admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickReplies = [
    { label: 'What are your hours?', key: 'hours' },
    { label: 'Where are you located?', key: 'location' },
    { label: 'What services do you offer?', key: 'services' },
    { label: 'How do I book an appointment?', key: 'booking' },
    { label: 'Contact details', key: 'contact' },
  ];

  const getResponseContent = (key) => {
    switch (key) {
      case 'hours':
        return {
          text: "We're open 10:00 AM – 9:00 PM, every day!",
          element: null,
        };
      case 'location':
        return {
          text: "We are located at: H.No. 1-107/53, V S Colony, Kapra, Secunderabad, Hyderabad, Telangana 500062.",
          element: (
            <a
              href="https://maps.google.com/?q=H.No.+1-107%2F53%2C+V+S+Colony%2C+Kapra%2C+Secunderabad%2C+Hyderabad%2C+Telangana+500062"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-2 px-3 py-1.5 bg-puppy-peach/40 dark:bg-puppy-highlight/10 border border-puppy-peach/50 dark:border-puppy-highlight/25 rounded-xl text-xs text-puppy-emphasis dark:text-puppy-peach hover:bg-puppy-peach dark:hover:bg-puppy-highlight dark:hover:text-puppy-darkbg hover:text-puppy-emphasis transition-all font-bold"
            >
              <MapPin className="h-3 w-3 mr-1.5" />
              View on Google Maps
            </a>
          ),
        };
      case 'services':
        return {
          text: "Suzi Pet Store and Spa offers premium Spa & Relaxation services, and Grooming services (hygiene cuts, nail trimming, and ear cleaning).",
          element: null,
        };
      case 'booking':
        return {
          text: "You can easily schedule a visit on our booking page!",
          element: (
            <Link
              to="/book"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center mt-2 px-4 py-2 bg-puppy-peach dark:bg-puppy-highlight text-puppy-emphasis dark:text-puppy-darkbg hover:bg-puppy-peachhover rounded-full text-xs font-bold transition-all shadow-puppy-sm"
            >
              <Calendar className="h-3 w-3 mr-1.5" />
              Book Now
            </Link>
          ),
        };
      case 'contact':
        return {
          text: "You can reach us at the following phone numbers:",
          element: (
            <div className="flex flex-col space-y-2 mt-2 font-bold text-xs">
              <a
                href="tel:09000097424"
                className="inline-flex items-center text-puppy-highlight dark:text-puppy-peach hover:underline"
              >
                <Phone className="h-3 w-3 mr-1.5" />
                090000 97424
              </a>
              <a
                href="tel:08401385510"
                className="inline-flex items-center text-puppy-highlight dark:text-puppy-peach hover:underline"
              >
                <Phone className="h-3 w-3 mr-1.5" />
                08401385510
              </a>
            </div>
          ),
        };
      default:
        return {
          text: "I'm not sure about that one — call us directly at 090000 97424 / 084013 85510, or book an appointment and we'll sort it out.",
          element: (
            <Link
              to="/book"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center mt-2 px-4 py-2 bg-puppy-peach dark:bg-puppy-highlight text-puppy-emphasis dark:text-puppy-darkbg hover:bg-puppy-peachhover rounded-full text-xs font-bold transition-all shadow-puppy-sm"
            >
              Book an Appointment
            </Link>
          ),
        };
    }
  };

  const handleQuickReply = (label, key) => {
    const userMsgId = Date.now();
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: label }]);

    setTimeout(() => {
      const response = getResponseContent(key);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.text,
          element: response.element,
        },
      ]);
    }, 450);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userInput = inputText.trim();
    setInputText('');

    const userMsgId = Date.now();
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: userInput }]);

    setTimeout(() => {
      const query = userInput.toLowerCase();
      let matchedKey = null;

      if (query.includes('hour') || query.includes('open') || query.includes('time') || query.includes('close')) {
        matchedKey = 'hours';
      } else if (query.includes('address') || query.includes('location') || query.includes('located') || query.includes('where') || query.includes('map') || query.includes('place')) {
        matchedKey = 'location';
      } else if (query.includes('service') || query.includes('groom') || query.includes('spa') || query.includes('cut') || query.includes('nail') || query.includes('ear') || query.includes('hygiene')) {
        matchedKey = 'services';
      } else if (query.includes('book') || query.includes('appointment') || query.includes('schedule') || query.includes('reserve')) {
        matchedKey = 'booking';
      } else if (query.includes('phone') || query.includes('contact') || query.includes('call') || query.includes('number') || query.includes('mobile')) {
        matchedKey = 'contact';
      }

      const response = getResponseContent(matchedKey);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.text,
          element: response.element,
        },
      ]);
    }, 450);
  };

  // Trigger bubble floating anim
  const bubbleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 260, damping: 15 }
    },
    pulse: {
      scale: [1, 1.06, 1],
      transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-[340px] sm:w-[370px] h-[480px] rounded-3xl overflow-hidden shadow-puppy-lg dark:shadow-puppy-glow flex flex-col mb-4 border border-puppy-beige dark:border-puppy-emphasis/25 bg-puppy-cream dark:bg-puppy-darkbg/95 transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-puppy-beige dark:bg-puppy-darkcard px-4 py-4 border-b border-puppy-beige dark:border-puppy-emphasis/20 flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-xl bg-white/70 dark:bg-puppy-darkbg border border-puppy-peach text-puppy-emphasis dark:text-puppy-peach">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-puppy-emphasis dark:text-white leading-none">Suzi's Assistant</h3>
                  <span className="text-[9px] text-puppy-brown dark:text-puppy-peach font-bold flex items-center mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-puppy-highlight dark:bg-puppy-peach mr-1 animate-ping inline-block" />
                    Online FAQ Bot
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-puppy-emphasis/10 dark:hover:bg-puppy-darkcard/55 text-puppy-brown/70 dark:text-puppy-cream/50 hover:text-puppy-emphasis transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-semibold">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-[20px] px-4 py-2.5 text-xs sm:text-sm ${
                      msg.sender === 'user'
                        ? 'bg-puppy-peach text-puppy-emphasis dark:bg-puppy-highlight dark:text-puppy-darkbg rounded-tr-none shadow-xs'
                        : 'bg-puppy-beige/50 dark:bg-puppy-darkcard/50 border border-puppy-beige dark:border-puppy-emphasis/15 text-puppy-brown dark:text-puppy-cream rounded-tl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.element && msg.element}

                    {/* Quick replies */}
                    {msg.isGreeting && (
                      <div className="mt-4 flex flex-col space-y-2">
                        <span className="text-[9px] text-puppy-brown/50 dark:text-puppy-cream/40 font-bold uppercase tracking-wider">
                          Suggested Topics:
                        </span>
                        {quickReplies.map((reply) => (
                          <button
                            key={reply.key}
                            onClick={() => handleQuickReply(reply.label, reply.key)}
                            className="w-full text-left text-xs px-3 py-2 bg-white dark:bg-puppy-darkcard hover:bg-puppy-peach/20 dark:hover:bg-puppy-highlight/10 border border-puppy-beige dark:border-puppy-emphasis/15 text-puppy-emphasis dark:text-puppy-peach transition-all duration-200 hover:translate-x-1 cursor-pointer font-bold rounded-lg"
                          >
                            {reply.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleTextSubmit}
              className="p-3 bg-puppy-cream dark:bg-puppy-darkcard/20 border-t border-puppy-beige dark:border-puppy-emphasis/15 flex space-x-2"
            >
              <input
                type="text"
                placeholder="Ask about hours, location, booking..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs px-4 py-2.5 bg-white dark:bg-puppy-darkbg border border-puppy-beige dark:border-puppy-emphasis/15 rounded-xl focus:outline-none focus:border-puppy-peach dark:focus:border-puppy-highlight text-puppy-emphasis dark:text-white placeholder-puppy-brown/50 dark:placeholder-puppy-cream/40 transition-colors font-medium"
              />
              <button
                type="submit"
                className="p-2.5 bg-puppy-peach text-puppy-emphasis dark:bg-puppy-highlight dark:text-puppy-darkbg rounded-xl transition-all shadow-puppy-sm cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        variants={bubbleVariants}
        initial="initial"
        animate={shouldReduceMotion ? "animate" : (isOpen ? "animate" : (hasEntered ? "pulse" : "animate"))}
        onAnimationComplete={() => {
          if (!hasEntered) setHasEntered(true);
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-puppy-peach text-puppy-emphasis dark:bg-puppy-highlight dark:text-puppy-darkbg flex items-center justify-center shadow-puppy-md dark:shadow-puppy-glow border border-white/20 dark:border-puppy-darkbg/25 focus:outline-none cursor-pointer relative"
        aria-label="Open Chatbot"
      >
        <MessageSquare className="h-6 w-6" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-puppy-alert opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-puppy-alert text-[9px] text-puppy-emphasis font-bold items-center justify-center border border-white dark:border-puppy-darkbg">
              !
            </span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
