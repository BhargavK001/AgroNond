import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth Provider
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Services = lazy(() => import('./pages/public/Services'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const Privacy = lazy(() => import('./pages/public/Privacy'));

const StatusPage = lazy(() => import('./pages/public/StatusPage'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const ComingSoon = lazy(() => import('./pages/public/ComingSoon'));

const UnifiedLayout = lazy(() => import('./layouts/UnifiedLayout'));

const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const WeightDashboard = lazy(() => import('./pages/weight/WeightDashboard'));

const TraderDashboardContent = lazy(() => import('./pages/trader/TraderDashboard'));
const InventoryManager = lazy(() => import('./pages/trader/InventoryManager'));
const TraderTransactions = lazy(() => import('./pages/trader/TraderTransactions'));

const TraderProfile = lazy(() => import('./pages/trader/TraderProfile'));

// Admin Dashboard
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CommissionRules = lazy(() => import('./pages/admin/CommissionRules'));
const TransactionHistory = lazy(() => import('./pages/admin/TransactionHistory'));

// Committee Dashboard
const CommitteeDashboard = lazy(() => import('./pages/committee/CommitteeDashboard'));
const FarmersList = lazy(() => import('./pages/committee/FarmersList'));
const MarketActivity = lazy(() => import('./pages/committee/MarketActivity'));
const CommissionCalculator = lazy(() => import('./pages/committee/CommissionCalculator'));
const BillingReports = lazy(() => import('./pages/committee/BillingReports'));
const CashFlow = lazy(() => import('./pages/committee/CashFlow'));
const TradersList = lazy(() => import('./pages/committee/TradersList'));
const FarmerDetail = lazy(() => import('./pages/committee/FarmerDetail'));

const AccountingDashboard = lazy(() => import('./pages/accounting/AccountingDashboard'));
const AccountingTransactions = lazy(() => import('./pages/accounting/TransactionsPage'));
const AccountingTraders = lazy(() => import('./pages/accounting/TradersPage'));
const AccountingFarmers = lazy(() => import('./pages/accounting/FarmersPage'));
const AccountingReports = lazy(() => import('./pages/accounting/ReportsPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ children, hideNav = false, hideFooter = false }) {
  return (
    <>
      {!hideNav && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <ScrollToTop />
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Login & Public Routes */}
                <Route path="/login" element={
                  <Layout hideNav hideFooter>
                    <Login />
                  </Layout>
                }
                />

                {/* Admin Login */}
                <Route path="/admin/login" element={
                  <Layout hideNav hideFooter>
                    <AdminLogin />
                  </Layout>
                }
                />

                {/* Role Selection */}
                {/* Role Selection Removed */}

                {/* --- DASHBOARDS --- */}

                {/* Farmer Dashboard */}
                <Route path="/dashboard/farmer" element={
                  <ProtectedRoute requireRole="farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
                />

                <Route path="/dashboard/weight" element={
                  <ProtectedRoute requireRole="weight">
                    <WeightDashboard />
                  </ProtectedRoute>
                }
                />

                {/* Trader Dashboard */}
                <Route path="/dashboard/trader" element={
                  <ProtectedRoute requireRole="trader">
                    <UnifiedLayout role="trader" />
                  </ProtectedRoute>
                }
                >
                  <Route index element={<TraderDashboardContent />} />
                  <Route path="transactions" element={<TraderTransactions />} />
                  <Route path="inventory" element={<InventoryManager />} />
                  <Route path="profile" element={<TraderProfile />} />
                </Route>

                {/* Committee Dashboard - Sidebar Layout */}
                <Route path="/dashboard/committee" element={
                  <ProtectedRoute requireRole="committee">
                    <UnifiedLayout role="committee" />
                  </ProtectedRoute>
                }
                >
                  <Route index element={<CommitteeDashboard />} />
                  <Route path="farmers" element={<FarmersList />} />
                  <Route path="farmers/:id" element={<FarmerDetail />} />
                  <Route path="traders" element={<TradersList />} />
                  <Route path="activity" element={<MarketActivity />} />
                  <Route path="commission" element={<CommissionCalculator />} />
                  <Route path="billing" element={<BillingReports />} />
                  <Route path="cashflow" element={<CashFlow />} />
                  <Route path="accounting" element={<AccountingDashboard />} />
                </Route>

                Accounting Dashboard - Separate Role
                <Route path="/dashboard/accounting" element={
                  <ProtectedRoute requireRole="accounting">
                    <UnifiedLayout role="accounting" />
                  </ProtectedRoute>
                }
                >
                  <Route index element={<AccountingDashboard />} />
                  <Route path="transactions" element={<AccountingTransactions />} />
                  <Route path="traders" element={<AccountingTraders />} />
                  <Route path="farmers" element={<AccountingFarmers />} />
                  <Route path="reports" element={<AccountingReports />} />
                </Route>

                {/* Admin Dashboard - Sidebar Layout */}
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute requireRole="admin">
                    <UnifiedLayout role="admin" />
                  </ProtectedRoute>
                }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="commission" element={<CommissionRules />} />
                  <Route path="transactions" element={<TransactionHistory />} />
                </Route>



                {/* Public Pages */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/services" element={<Layout><Services /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                <Route path="/status" element={<Layout><StatusPage /></Layout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;