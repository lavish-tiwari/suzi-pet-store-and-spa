import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import CursorPaw from './components/CursorPaw';
import Home from './pages/Home';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Public Layout containing the customer navbar, footer, chatbot widget, and page animations
function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      
      // Wait a brief moment to ensure DOM elements have fully mounted and rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.pathname]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <CursorPaw />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-grow"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <ChatbotWidget />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Customer Facing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            
            {/* Redirect old routes to the single page hash targets */}
            <Route path="/services" element={<Navigate to="/#spa-services" replace />} />
            <Route path="/about" element={<Navigate to="/#contact" replace />} />
            <Route path="/book" element={<Navigate to="/#book-appointment" replace />} />
            <Route path="/testimonials" element={<Navigate to="/#reviews" replace />} />
          </Route>

          {/* Operations Management Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
