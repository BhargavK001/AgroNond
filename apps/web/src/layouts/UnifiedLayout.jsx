import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TraderNavbar from '../components/TraderNavbar';
import CommitteeNavbar from '../components/CommitteeNavbar';
import AccountingNavbar from '../components/AccountingNavbar';
import AdminNavbar from '../components/AdminNavbar';

// Slide animation - smoother feel
const pageVariants = {
    initial: {
        opacity: 0,
        x: 30,
    },
    animate: {
        opacity: 1,
        x: 0,
    },
    exit: {
        opacity: 0,
        x: -30,
    }
};

const pageTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
};

export default function UnifiedLayout({ role }) {
    const location = useLocation();

    const getNavbar = () => {
        switch (role) {
            case 'trader':
                return <TraderNavbar />;
            case 'committee':
                return <CommitteeNavbar />;
            case 'accounting':
                return <AccountingNavbar />;
            case 'admin':
                return <AdminNavbar />;
            default:
                return null;
        }
    };

    const getGradient = () => {
        switch (role) {
            case 'trader':
                return 'from-slate-50 via-white to-emerald-50/40';
            case 'committee':
                return 'from-slate-50 via-white to-emerald-50/40';
            case 'accounting':
                return 'from-slate-50 via-white to-emerald-50/40';
            case 'admin':
                return 'from-slate-50 via-white to-emerald-50/40';
            default:
                return 'bg-white';
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${getGradient()}`}>
            {getNavbar()}

            {/* Main Content with Slide Transitions */}
            <main className="pt-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                </div>
            </main>
        </div>
    );
}
