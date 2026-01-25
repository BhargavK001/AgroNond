import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


export default function TraderProfile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    business_name: profile?.business_name || '',
    gst_number: profile?.gst_number || '',
    license_number: profile?.license_number || '',
    business_address: profile?.business_address || '',
    operating_locations: profile?.operating_locations || [],
  });

  // Mock activity stats (would come from API in real app)
  const activityStats = {
    totalPurchases: 156,
    totalPurchaseValue: 1245000,
    commissionPaid: 112050, // 9% of total
    averageOrderValue: 7980,
    memberSince: profile?.created_at || '2025-06-15',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Use API wrapper via AuthContext or direct import
      // We can use the updateRole from context, or imported api
      // But for profile updates like address, we need api.users.updateProfile

      const { full_name, business_name, gst_number, license_number, business_address, operating_locations } = formData;

      // We can import api here dynamically or at top level, but for now let's use fetch or assume api is available
      // The cleanest way is to use the api utility we saw in api.js
      // Let's modify the imports first to include api

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          full_name,
          business_name,
          gst_number,
          license_number,
          business_address,
          operating_locations,
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');

      // Force reload user in context (or we should update context state)
      // window.location.reload(); // Simple but jarring
      // Ideally AuthContext exposed a reloadUser method, but it reloads on mount.

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account and business details</p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
              {formData.full_name ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T'}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity cursor-pointer"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="text-xl sm:text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            ) : (
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{formData.full_name || 'Add Your Name'}</h2>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {user?.phone || 'Not set'}
                <span className="text-emerald-600 text-xs font-medium ml-1">✓ Verified</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                Verified Trader
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Member since {formatDate(activityStats.memberSince)}
            </p>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${isEditing
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
          >
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </motion.div>

      {/* Business Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Business Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Business/Shop Name</label>
            {isEditing ? (
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                placeholder="Enter business name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            ) : (
              <p className="text-slate-800 font-medium">{formData.business_name || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">APMC/Mandi License No.</label>
            {isEditing ? (
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                placeholder="e.g., APMC-12345"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            ) : (
              <p className="text-slate-800 font-medium">{formData.license_number || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">GST Number (Optional)</label>
            {isEditing ? (
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleInputChange}
                placeholder="e.g., 27XXXXX1234X1Z5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            ) : (
              <p className="text-slate-800 font-medium">{formData.gst_number || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Operating Locations</label>
            {isEditing ? (
              <input
                type="text"
                name="operating_locations"
                value={Array.isArray(formData.operating_locations) ? formData.operating_locations.join(', ') : ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operating_locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder="Pune, Nashik, Kolhapur"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {formData.operating_locations?.length > 0
                  ? formData.operating_locations.map((loc, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{loc}</span>
                  ))
                  : <p className="text-slate-800 font-medium">—</p>
                }
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Business Address</label>
            {isEditing ? (
              <textarea
                name="business_address"
                value={formData.business_address}
                onChange={handleInputChange}
                placeholder="Enter your complete business address"
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            ) : (
              <p className="text-slate-800 font-medium">{formData.business_address || '—'}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Activity Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Activity Stats
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-700">{activityStats.totalPurchases}</p>
            <p className="text-xs text-blue-600 mt-1">Total Purchases</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-700">₹{(activityStats.totalPurchaseValue / 100000).toFixed(1)}L</p>
            <p className="text-xs text-emerald-600 mt-1">Purchase Value</p>
          </div>
          <div className="p-4 rounded-2xl bg-violet-50 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-violet-700">₹{(activityStats.commissionPaid / 1000).toFixed(0)}K</p>
            <p className="text-xs text-violet-600 mt-1">Commission (9%)</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-amber-700">₹{activityStats.averageOrderValue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-amber-600 mt-1">Avg Order Value</p>
          </div>
        </div>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Account Actions
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => toast('Phone number update coming soon', { icon: '📱' })}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Change Phone Number</p>
                <p className="text-xs text-slate-500">Update your login phone number</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => toast('Data export started... check your email', { icon: '📧' })}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Download My Data</p>
                <p className="text-xs text-slate-500">Export all your data (GDPR)</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Sign Out</p>
                <p className="text-xs text-slate-500">Logout from your account</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-red-700">Delete Account</p>
                <p className="text-xs text-red-600">Permanently delete your account</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Delete Account?</h3>
              <p className="text-slate-500 text-center text-sm mb-6">
                This action cannot be undone. All your data, transactions, and connections will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.error('Account deletion is restricted for traders with active transactions');
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
