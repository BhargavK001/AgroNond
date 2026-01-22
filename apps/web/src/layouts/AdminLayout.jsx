import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Receipt, 
  Menu, 
  X,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { path: '/dashboard/admin/users', icon: Users, label: 'User Management' },
  { path: '/dashboard/admin/commission', icon: Settings, label: 'Commission Rules' },
  { path: '/dashboard/admin/transactions', icon: Receipt, label: 'Transactions' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 font-sans text-slate-900">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 280 : 88,
          x: mobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 z-50 h-[96vh] m-[2vh] rounded-3xl bg-white/95 border border-white/40 shadow-xl shadow-emerald-900/5 backdrop-blur-sm flex flex-col overflow-hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        {/* Logo Section */}
        <div 
          className={`h-24 flex items-center relative shrink-0 transition-all duration-300 ${!sidebarOpen ? 'cursor-pointer' : ''}`}
          onClick={() => !sidebarOpen && setSidebarOpen(true)}
        >
           {/* Logo Icon - Always Visible & Centered in its column */}
           <div className={`flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'w-24 pl-6 justify-start' : 'w-full'}`}>
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0 z-20 relative">
                <span className="text-white font-bold text-xl">A</span>
              </div>
           </div>

           {/* Brand Text - Absolute to prevent layout shift */}
           <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-[72px] flex flex-col whitespace-nowrap z-10"
                >
                  <span className="font-bold text-lg text-slate-800 tracking-tight">AgroNond</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Admin Portal</span>
                </motion.div>
              )}
           </AnimatePresence>
           
           {/* Collapse Button - Visible ONLY when Open */}
           <AnimatePresence>
             {sidebarOpen && (
               <motion.button 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 onClick={(e) => {
                   e.stopPropagation();
                   setSidebarOpen(false);
                 }}
                 className="hidden lg:flex absolute right-4 w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg shadow-sm items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md transition-all z-30"
               >
                  <ChevronLeft size={16} />
               </motion.button>
             )}
           </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative group block"
              >
                <div className={`
                  relative flex items-center transition-all duration-300
                  ${sidebarOpen ? 'px-4 py-3.5 gap-3.5' : 'justify-center py-3.5 px-0'}
                  rounded-2xl
                  ${isActive 
                    ? 'text-white shadow-emerald-500/25 shadow-lg' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}>
                  {/* Active Background Gradient */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarBg"
                      className="absolute inset-0 gradient-bg rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-200 flex-shrink-0 ${!isActive && 'group-hover:scale-110'}`} />
                  
                  {/* Label - Absolute to prevent jitter */}
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm relative z-10 whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Profile / Logout Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center p-0.5 shadow-sm shrink-0 z-20 relative">
               <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                 {user?.name?.[0] || 'A'}
               </div>
            </div>
            
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0 overflow-hidden absolute left-[76px]"
                >
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
                  <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 font-medium mt-0.5">
                     <LogOut size={10} /> Logout
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <motion.div 
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[88px]'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-20 px-4 sm:px-8 lg:px-10 flex items-center justify-between">
          
           {/* Mobile Menu Toggle */}
           <div className="flex items-center gap-4 lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-transform"
              >
                <Menu size={20} />
              </button>
              <span className="font-bold text-slate-800">AgroNond</span>
           </div>

           {/* Breadcrumbs or Page Title (Dynamic left side) */}
           <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <span className="text-slate-400">Admin</span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-emerald-600 line-clamp-1">
                 {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
              </span>
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-4 ml-auto">
              <div className="relative hidden sm:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="pl-10 pr-4 py-2 rounded-full bg-white border-none shadow-sm shadow-slate-200 focus:ring-2 focus:ring-emerald-500/20 text-sm w-48 transition-all focus:w-64"
                 />
              </div>

              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

              <button className="relative p-2.5 bg-white rounded-full shadow-sm text-slate-400 hover:text-emerald-600 transition-colors hover:shadow-md">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
           </div>
        </header>

        {/* Page Content Container */}
        <main className="px-4 sm:px-8 lg:px-10 pb-10">
           <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               <Outlet />
             </motion.div>
           </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}
