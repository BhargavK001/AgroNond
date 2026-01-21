import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from './NotificationCenter';

// Navigation Tabs for Trader Pages
const navTabs = [
  { label: 'Dashboard', path: '/dashboard/trader' },
  { label: 'Inventory', path: '/dashboard/trader/inventory' },
];

export default function TraderNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--border)] shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo + Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/dashboard/trader" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-[var(--text-primary)]">AgroNond</span>
                <span className="block text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider">Trader Panel</span>
              </div>
            </Link>

          </div>

          {/* Centered Desktop Navigation Tabs */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-sm">
            {navTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-emerald-500 rounded-full shadow-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            <NotificationCenter />
              
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[var(--surface-muted)] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center font-bold shadow-sm">
                  T
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-none text-[var(--text-primary)]">Trader</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{user?.phone || '91xxxxxxxxx'}</p>
                </div>
                <svg className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-[var(--border)] bg-[var(--surface)]">
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-[var(--text-primary)]">{user?.phone || 'Trader'}</p>
                    </div>
                    
                    <div className="p-1">
                      <Link to="/dashboard/trader/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--primary-50)] hover:text-[var(--primary)] rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                    </div>

                    <div className="p-1 border-t border-[var(--border)]">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-[var(--border)]"
            >
              <div className="py-2 space-y-1">
                {navTabs.map((tab) => {
                  const isActive = location.pathname === tab.path;
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive 
                          ? 'gradient-bg text-white shadow-md mx-2' 
                          : 'text-[var(--text-secondary)] hover:bg-[var(--primary-50)]'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
