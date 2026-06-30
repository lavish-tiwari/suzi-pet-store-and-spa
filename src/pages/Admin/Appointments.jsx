import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Filter, Check, X, ClipboardCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import BouncingPawLoader from '../../components/BouncingPawLoader';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Expanded notes state (key is appointment id)
  const [expandedNotes, setExpandedNotes] = useState({});

  // 1. Fetch appointments in real-time
  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('dateTime', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setAppointments(docs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch customers in real-time to match profiles
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const custMap = {};
      snapshot.forEach((doc) => {
        custMap[doc.id] = doc.data(); // Key is phone number
      });
      setCustomers(custMap);
    }, (error) => {
      console.error("Error loading customers in admin:", error);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update status. Check console logs.');
    }
  };

  const toggleNotes = (id) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.serviceCategory === typeFilter;
    return matchesStatus && matchesType;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-700" />
            <span>Customer Bookings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review and manage spa and grooming requests</p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold uppercase">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Service Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 font-semibold"
          >
            <option value="all">All Service Categories</option>
            <option value="Spa">Spa</option>
            <option value="Grooming">Grooming</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col justify-center items-center text-slate-500 gap-2">
          <BouncingPawLoader size="md" />
          <span className="text-sm font-semibold">Loading bookings...</span>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm font-medium">
          No appointments matches the selected filters.
        </div>
      ) : (
        /* Table responsive wrapper */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-4 py-3">Pet Details</th>
                <th className="px-4 py-3">Owner Contact</th>
                <th className="px-4 py-3">Requested Service</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* Pet Info */}
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{app.petName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{app.petTypeBreed}</div>
                  </td>
                  
                  {/* Owner Contact */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{app.customerName}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{app.customerPhone}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{app.customerEmail}</div>
                    
                    {/* Customer ID & Sequence Badges */}
                    {(() => {
                      const customer = customers[app.customerPhone];
                      if (customer) {
                        return (
                          <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                              ID: {customer.friendlyId || 'SP-NEW'}
                            </span>
                            {customer.visitCount > 1 ? (
                              <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                Returning (visit #{customer.visitCount})
                              </span>
                            ) : (
                              <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                New Customer
                              </span>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="mt-1.5">
                          <span className="bg-slate-50 border border-slate-200 text-slate-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-semibold italic">
                            ID: SP-NEW
                          </span>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Service Requested */}
                  <td className="px-4 py-3.5">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 ${
                        app.serviceCategory === 'Spa' 
                          ? 'bg-teal-50 border border-teal-200 text-teal-700' 
                          : 'bg-amber-50 border border-amber-200 text-amber-700'
                      }`}>
                        {app.serviceCategory}
                      </span>
                      <span className="text-slate-800 font-semibold">{app.serviceName}</span>
                    </div>
                    {app.notes && (
                      <div className="mt-1.5">
                        {app.notes.length <= 60 ? (
                          <div className="text-[10px] text-slate-500 italic font-medium leading-relaxed">
                            Note: "{app.notes}"
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <motion.div
                              initial={false}
                              animate={{ height: expandedNotes[app.id] ? 'auto' : '15px' }}
                              className="overflow-hidden text-[10px] text-slate-500 italic font-medium leading-relaxed"
                            >
                              Note: "{app.notes}"
                            </motion.div>
                            <button
                              onClick={() => toggleNotes(app.id)}
                              className="text-[9px] text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer block"
                            >
                              {expandedNotes[app.id] ? 'Collapse note ▲' : 'Expand note ▼'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Appointment Time */}
                  <td className="px-4 py-3.5 text-slate-800 whitespace-nowrap">
                    {formatDate(app.dateTime)}
                  </td>

                  {/* Status Indicator */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      app.status === 'pending'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : app.status === 'confirmed'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : app.status === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {app.status === 'pending' && <Clock className="h-3 w-3" />}
                      {app.status === 'confirmed' && <Check className="h-3 w-3" />}
                      {app.status === 'completed' && <ClipboardCheck className="h-3 w-3" />}
                      <span>{app.status}</span>
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(app.id, 'confirmed')}
                            className="p-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
                            title="Confirm Appointment"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'cancelled')}
                            className="p-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {app.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateStatus(app.id, 'completed')}
                            className="p-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'cancelled')}
                            className="p-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {(app.status === 'completed' || app.status === 'cancelled') && (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Archived</span>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
