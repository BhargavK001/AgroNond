import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Navigation Tabs for Admin Pages
const navTabs = [
  { label: 'Overview', path: '/dashboard/admin' },
  { label: 'Users', path: '/dashboard/admin/users' },
  { label: 'Commission', path: '/dashboard/admin/commission' },
  { label: 'Transactions', path: '/dashboard/admin/transactions' },
];

export default function AdminNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
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
            <Link to="/dashboard/admin" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-[var(--text-primary)]">AgroNond</span>
                <span className="block text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider">Admin Panel</span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl">
              {navTabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 gradient-bg rounded-lg shadow-md"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
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
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[var(--surface-muted)] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center font-bold shadow-sm">
                  A
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-none text-[var(--text-primary)]">Admin</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{user?.phone || 'Administrator'}</p>
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
                      <p className="text-sm font-bold text-[var(--text-primary)]">{user?.phone || 'Admin'}</p>
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
