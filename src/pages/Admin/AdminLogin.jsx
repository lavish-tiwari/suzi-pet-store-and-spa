import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { KeyRound, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Sign in via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Query Firestore to verify if email exists in the admins collection
      const emailLower = user.email.toLowerCase();
      const adminDocRef = doc(db, 'admins', emailLower);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        // Access granted, redirect to Admin dashboard
        navigate('/admin');
      } else {
        // Not in admins collection
        setError('Access Denied: You do not have administrator permissions.');
        await signOut(auth); // Sign out unauthorized user
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email address or password.');
      } else {
        // Show the exact Firebase error message to remove debugging guesswork
        setError(`Login failed: ${err.message || err}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-8">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Suzi Pet Store and Spa</h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold tracking-wider uppercase">Admin Portal Control</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@suzi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 focus:bg-white text-slate-900 placeholder-slate-400 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center">
              <KeyRound className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <span>Password</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 focus:bg-white text-slate-900 placeholder-slate-400 transition-all"
              required
            />
          </div>

          {/* Error warning */}
          {error && (
            <div className="flex items-start space-x-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-xs text-slate-400 hover:text-slate-600 underline">
            Return to Public Website
          </a>
        </div>

      </div>
    </div>
  );
}
