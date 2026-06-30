import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Users, UserPlus, Trash2, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import BouncingPawLoader from '../../components/BouncingPawLoader';

export default function StaffManager() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentAdminEmail(auth.currentUser.email.toLowerCase());
    }

    const q = query(collection(db, 'admins'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ email: doc.id, ...doc.data() });
      });
      setAdmins(list);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching admins:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newEmail) {
      setError('Please enter an email address.');
      return;
    }

    const formattedEmail = newEmail.trim().toLowerCase();

    // Basic regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formattedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      // Create admin document with email as document ID
      const adminDocRef = doc(db, 'admins', formattedEmail);
      await setDoc(adminDocRef, {
        addedAt: serverTimestamp(),
        addedBy: auth.currentUser?.email || 'Owner'
      });

      setNewEmail('');
      setSuccess(`Successfully added ${formattedEmail} to administrators.`);
    } catch (err) {
      console.error('Error adding admin document:', err);
      setError('Failed to add administrator. Ensure you have permissions.');
    }
  };

  const handleRemoveAdmin = async (emailToRemove) => {
    setError('');
    setSuccess('');

    const targetEmail = emailToRemove.toLowerCase();

    // Prevent self deletion
    if (targetEmail === currentAdminEmail) {
      setError('Safety Check: You cannot remove your own email address.');
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke admin permissions for ${targetEmail}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'admins', targetEmail));
      setSuccess(`Successfully removed ${targetEmail} from administrators.`);
    } catch (err) {
      console.error('Error deleting admin document:', err);
      setError('Failed to remove administrator.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* 1. Add Administrator Form (5 Columns) */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-slate-700" />
            <span>Add Staff Member</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Register new emails to allow access to the admin panel</p>
        </div>

        <form onSubmit={handleAddAdmin} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label htmlFor="staffEmail" className="text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Staff Email Address *</span>
            </label>
            <input
              id="staffEmail"
              type="email"
              placeholder="staff@suzipetstore.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900 placeholder-slate-400"
              required
            />
          </div>

          {error && (
            <div className="flex items-start space-x-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start space-x-2 text-emerald-600 bg-emerald-50 border border-emerald-250 rounded-lg p-3 text-xs font-medium">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register Staff Email</span>
          </button>
        </form>
      </div>

      {/* 2. List of current Administrators (7 Columns) */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            <span>Authorized Administrators</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">List of registered emails allowed to manage shop operations</p>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col justify-center items-center text-slate-500 gap-1.5">
            <BouncingPawLoader size="sm" />
            <span className="text-xs font-semibold">Loading administrators...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">No admin emails registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-4 py-2.5">Email Address</th>
                  <th className="px-4 py-2.5">Added By</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {admins.map((admin) => (
                  <tr key={admin.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <span>{admin.email}</span>
                      {admin.email === currentAdminEmail && (
                        <span className="bg-slate-900 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wide scale-90">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{admin.addedBy || 'System'}</td>
                    <td className="px-4 py-3 text-right">
                      {admin.email !== currentAdminEmail ? (
                        <button
                          onClick={() => handleRemoveAdmin(admin.email)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors inline-flex justify-center cursor-pointer"
                          title="Revoke Admin Access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Self</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
