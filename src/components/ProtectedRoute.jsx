import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import BouncingPawLoader from './BouncingPawLoader';

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Check if this user's email is registered in the "admins" collection
          const emailLower = currentUser.email.toLowerCase();
          const adminDocRef = doc(db, 'admins', emailLower);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists()) {
            setIsAdminUser(true);
          } else {
            console.warn(`User ${currentUser.email} is authenticated but not in the admins collection. Gating access.`);
            setIsAdminUser(false);
            // Sign out the unauthorized user so they don't stay logged in
            await signOut(auth);
          }
        } catch (error) {
          console.error('Error checking admin status in Firestore:', error);
          setIsAdminUser(false);
        }
      } else {
        setUser(null);
        setIsAdminUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <BouncingPawLoader size="lg" className="mb-4" />
        <span className="text-sm font-medium tracking-wider">Verifying Admin Access...</span>
      </div>
    );
  }

  if (!user || !isAdminUser) {
    // If not logged in or not an admin, redirect to public homepage (or login page)
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
