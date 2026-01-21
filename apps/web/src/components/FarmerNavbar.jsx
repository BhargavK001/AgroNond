import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Phone, MapPin, BadgeCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FarmerNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Get farmer profile from localStorage
  const [farmerProfile, setFarmerProfile] = useState({
    name: 'Farmer',
    farmerId: 'AGR-XXXX',
    phone: '',
    location: '',
    initials: 'FK'
  });

  // Farmer notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Sale Confirmed',
      message: '500kg Tomato sold successfully',
      time: '2 mins ago',
      unread: true
    },
    {
      id: 2,
      type: 'info',
      title: 'Market Update',
      message: 'Onion prices increased by 8%',
      time: '1 hr ago',
      unread: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'Payment Reminder',
      message: 'Commission payment due tomorrow',
      time: '3 hrs ago',
      unread: true
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const savedProfile = localStorage.getItem('farmer-profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setFarmerProfile(profile);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem('farmer-profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setFarmerProfile(profile);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('farmerProfileUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('farmerProfileUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('farmer-profile'); 
      localStorage.removeItem('farmer-records');
      toast.success('Logged out successfully');
      navigate('/login',{ replace: true });
    } catch (error) {
      console.error("Logout failed", error);
      toast.error('Failed to log out');
      
      window.location.href = '/login';
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, notificationRef]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/dashboard/farmer" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                </svg>
              </div>
              {/* ✅ UPDATED: Responsive Text (Visible on mobile now) */}
              <div className="block">
                <span className="text-base sm:text-lg font-bold text-gray-900 leading-tight block">AgroNond</span>
                <span className="block text-[9px] sm:text-[10px] text-green-600 font-bold uppercase tracking-wider">Farmer Panel</span>
              </div>
            </Link>
          </div>

          {/* Right Side - Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Bell size={22} className="sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    // ✅ UPDATED: Fixed on mobile, Absolute on desktop
                    className="fixed left-4 right-4 top-20 sm:absolute sm:right-0 sm:top-full sm:left-auto sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs sm:text-sm font-semibold text-green-600">{unreadCount} New</span>
                      )}
                    </div>
                    
                    <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            notification.unread ? 'bg-green-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                              notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'info' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{notification.title}</p>
                              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 line-clamp-2">{notification.message}</p>
                              <p className="text-gray-400 text-[10px] sm:text-xs mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <button 
                          onClick={markAllAsRead}
                          className="w-full text-center text-sm font-semibold text-green-600 hover:text-green-700"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
              
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {farmerProfile.initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-none text-gray-900">{farmerProfile.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{farmerProfile.farmerId}</p>
                </div>
                {/* Hidden arrow on mobile to save space */}
                <svg className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    // ✅ UPDATED: Fixed on mobile, Absolute on desktop
                    className="fixed left-4 right-4 top-20 sm:absolute sm:right-0 sm:top-full sm:left-auto sm:w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    {/* Profile Header */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-green-50 to-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                          {farmerProfile.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{farmerProfile.name}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <BadgeCheck size={12} className="text-green-600 shrink-0" />
                            {farmerProfile.farmerId}
                          </p>
                        </div>
                      </div>
                      
                      {/* Profile Details */}
                      <div className="space-y-2">
                        {farmerProfile.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone size={14} className="text-green-600 shrink-0" />
                            <span className="truncate">{farmerProfile.phone}</span>
                          </div>
                        )}
                        {farmerProfile.location && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin size={14} className="text-green-600 shrink-0" />
                            <span className="truncate">{farmerProfile.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Links */}
                    <div className="p-1">
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          window.dispatchEvent(new CustomEvent('openEditProfile'));
                        }}
                        className="w-full flex items-center gap-2 px-3 py-3 sm:py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                      >
                        <User size={16} />
                        My Profile
                      </button>
                    </div>

                    <div className="p-1 border-t border-gray-100">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-3 sm:py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>
    </nav>
  );
}