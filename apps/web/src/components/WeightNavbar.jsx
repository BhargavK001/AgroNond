import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WeightNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Weight officer notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Weight Updated',
      message: 'Tomato lot #1234 - 485kg recorded',
      time: '5 mins ago',
      unread: true
    },
    {
      id: 2,
      type: 'info',
      title: 'New Farmer Arrived',
      message: 'Jay Kisan (AGR-101) checked in',
      time: '15 mins ago',
      unread: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'System Alert',
      message: 'Calibrate scale before next session',
      time: '1 hr ago',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    toast.success('Logged out successfully');
    await signOut();
    navigate('/login');
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
            <Link to="/dashboard/weight" className="flex items-center gap-2 group shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 leading-none">AgroNond</h1>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Market Committee</span>
              </div>
            </Link>
          </div>

          {/* Right Side - Notifications & Profile */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
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
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-sm font-semibold text-blue-600">{unreadCount} New</span>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            notification.unread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'info' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`} />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
                              <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                              <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <button 
                          onClick={markAllAsRead}
                          className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
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
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                  WO
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-none text-gray-900">Weight Officer</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Committee Panel</p>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    {/* Profile Header */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                          WO
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Weight Officer</p>
                          <p className="text-xs text-gray-600">Market Committee</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-gray-500 text-[10px]">Today</p>
                          <p className="font-bold text-blue-600">12 Lots</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-gray-500 text-[10px]">Pending</p>
                          <p className="font-bold text-orange-600">3 Lots</p>
                        </div>
                      </div>
                    </div>

                    {/* Sign Out */}
                    <div className="p-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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