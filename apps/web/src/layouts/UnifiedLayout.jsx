import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TraderNavbar from '../components/TraderNavbar';
import CommitteeNavbar from '../components/CommitteeNavbar';
import AccountingNavbar from '../components/AccountingNavbar';
import AdminNavbar from '../components/AdminNavbar';
import Sidebar from '../components/Sidebar';

// Slide animation - smoother feel
const pageVariants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -10,
    }
};

const pageTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
};

export default function UnifiedLayout({ role }) {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        // Load collapsed state from localStorage
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });

    // Save collapsed state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isSidebarCollapsed);
    }, [isSidebarCollapsed]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const getNavbar = () => {
        const props = {
            onMenuClick: toggleSidebar,
            isCollapsed: isSidebarCollapsed,
            onToggleCollapse: toggleCollapse
        };
        switch (role) {
            case 'trader':
                return <TraderNavbar {...props} />;
            case 'committee':
                return <CommitteeNavbar {...props} />;
            case 'accounting':
                return <AccountingNavbar {...props} />;
            case 'admin':
                return <AdminNavbar {...props} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <Sidebar
                role={role}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={toggleCollapse}
            />

            {/* Main Content Wrapper */}
            <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>

                {/* Navbar (now Header) */}
                <div className="sticky top-0 z-40">
                    {getNavbar()}
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={pageVariants}
                            transition={pageTransition}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
