import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Phone, MapPin, Camera, Save, BadgeCheck, X, Edit3, Building, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import NotificationCenter from './NotificationCenter';

const navTabs = [
  { label: 'Overview', path: '/dashboard/committee' },
  { label: 'Farmers', path: '/dashboard/committee/farmers' },
  { label: 'Traders', path: '/dashboard/committee/traders' },
  { label: 'Reports', path: '/dashboard/committee/billing' },
];

export default function CommitteeNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: 'Committee User',
    phone: user?.phone || '9876543210',
    email: 'committee@agronond.com',
    location: 'APMC Office',
    role: 'Market Committee',
    photo: '',
    committeeId: 'MCDB-2026-001',
    initials: 'CU'
  });

  const [editForm, setEditForm] = useState({ ...profile });

  useEffect(() => {
    const saved = localStorage.getItem('committee-profile');
    if (saved) {
      const p = JSON.parse(saved);
      p.initials = getInitials(p.name);
      setProfile(p);
      setEditForm(p);
    }
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { toast.error('Image size must be < 2MB'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setEditForm(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updated = { ...editForm, initials: getInitials(editForm.name) };
    setProfile(updated);
    localStorage.setItem('committee-profile', JSON.stringify(updated));
    setIsEditing(false);
    toast.success("Profile updated!");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--border)] shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard/committee" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" /></svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-[var(--text-primary)]">AgroNond</span>
                <span className="block text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Committee Panel</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-sm">
            {navTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link key={tab.path} to={tab.path} className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-500 hover:text-emerald-600'}`}>
                  {isActive && <motion.div layoutId="activeCommitteeNavTab" className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-md" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  <span className="relative z-10">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
            <NotificationCenter />

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--surface-muted)] transition-colors focus:outline-none">
                {profile.photo ? <img src={profile.photo} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-sm border border-emerald-100" /> : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-bold shadow-sm text-sm">{profile.initials}</div>}
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]">
                    <AnimatePresence mode="wait">
                      {!isEditing ? (
                        <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <div className="p-6 bg-slate-50 border-b border-slate-100 text-center">
                            <div className="relative inline-block mb-3">
                              {profile.photo ? <img src={profile.photo} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-md border-4 border-white" /> : <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-2xl font-bold text-white shadow-md border-4 border-white">{profile.initials}</div>}
                              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm"><BadgeCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" /></div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                            <p className="text-sm text-slate-500">{profile.role}</p>
                            <div className="flex items-center justify-center gap-1 mt-2 bg-emerald-50 py-1 px-3 rounded-full mx-auto w-fit border border-emerald-100">
                              <span className="text-xs font-bold text-emerald-700">{profile.committeeId}</span>
                              <BadgeCheck className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"><Phone className="w-4 h-4 text-emerald-600" /><div><p className="text-xs text-slate-500">Phone</p><p className="text-sm font-medium text-slate-900">{profile.phone}</p></div></div>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"><Mail className="w-4 h-4 text-emerald-600" /><div><p className="text-xs text-slate-500">Email</p><p className="text-sm font-medium text-slate-900">{profile.email}</p></div></div>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"><MapPin className="w-4 h-4 text-emerald-600" /><div><p className="text-xs text-slate-500">Location</p><p className="text-sm font-medium text-slate-900">{profile.location}</p></div></div>
                          </div>
                          <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                            <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"><Edit3 size={16} /> Edit Profile</button>
                            <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Sign Out</button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                          <div className="p-4 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-slate-900">Edit Profile</h3><button onClick={() => setIsEditing(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button></div>
                          <div className="p-6 space-y-5 overflow-y-auto max-h-[400px]">
                            <div className="flex justify-center"><div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}><div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200">{editForm.photo ? <img src={editForm.photo} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={32} /></div>}</div><div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={20} className="text-white" /></div><input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></div></div>
                            <div className="space-y-4">
                              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Location</label><input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Committee ID (Read Only)</label><div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-medium flex justify-between">{profile.committeeId}<BadgeCheck className="w-4 h-4 text-emerald-500" /></div></div>
                            </div>
                          </div>
                          <div className="p-4 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                            <button onClick={handleSave} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-2 shadow-sm"><Save size={16} /> Save Changes</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
