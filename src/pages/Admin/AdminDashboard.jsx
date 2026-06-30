import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { Calendar, Package, Users, LogOut, Sparkles, UserCheck, Image, Star } from 'lucide-react';
import Appointments from './Appointments';
import Inventory from './Inventory';
import StaffManager from './StaffManager';
import AdminGallery from './AdminGallery';
import AdminReviews from './AdminReviews';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [adminEmail, setAdminEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      setAdminEmail(auth.currentUser.email);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navItems = [
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'inventory', label: 'Inventory Management', icon: Package },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'gallery', label: 'Gallery Management', icon: Image },
    { id: 'reviews', label: 'Reviews & Testimonials', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-900">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-none">Suzi Pet Store & Spa</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">Management Console</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <UserCheck className="h-4 w-4 text-slate-500" />
            <span>{adminEmail || 'Admin'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-2 md:space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
            Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Workspace content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'appointments' && <Appointments />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'staff' && <StaffManager />}
          {activeTab === 'gallery' && <AdminGallery />}
          {activeTab === 'reviews' && <AdminReviews />}
        </main>

      </div>
    </div>
  );
}
