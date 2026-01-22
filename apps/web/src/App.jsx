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
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const RoleSelection = lazy(() => import('./pages/RoleSelection'));

const FarmerDashboard = lazy(() => import('./Dashboards/FarmerDashboard'));
const WeightUpdatePanel = lazy(() => import('./Dashboards/WeightUpdatePanel'));

const TraderLayout = lazy(() => import('./layouts/TraderLayout'));
const TraderDashboardContent = lazy(() => import('./Dashboards/TraderDashboard'));
const InventoryManager = lazy(() => import('./pages/trader/InventoryManager'));
const TraderTransactions = lazy(() => import('./pages/trader/TraderTransactions'));

const TraderProfile = lazy(() => import('./pages/trader/TraderProfile'));

// Admin Dashboard
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CommissionRules = lazy(() => import('./pages/admin/CommissionRules'));
const TransactionHistory = lazy(() => import('./pages/admin/TransactionHistory'));

// Committee Dashboard
const CommitteeLayout = lazy(() => import('./layouts/CommitteeLayout'));
const CommitteeDashboard = lazy(() => import('./Dashboards/CommitteeDashboard'));
const FarmersList = lazy(() => import('./pages/committee/FarmersList'));
const MarketActivity = lazy(() => import('./pages/committee/MarketActivity'));
const CommissionCalculator = lazy(() => import('./pages/committee/CommissionCalculator'));
const BillingReports = lazy(() => import('./pages/committee/BillingReports'));
const CashFlow = lazy(() => import('./pages/committee/CashFlow'));
const TradersList = lazy(() => import('./pages/committee/TradersList'));
const FarmerDetail = lazy(() => import('./pages/committee/FarmerDetail'));

// Accounting Dashboard (separate role)
const AccountingLayout = lazy(() => import('./layouts/AccountingLayout'));
const AccountingDashboard = lazy(() => import('./pages/committee/AccountingDashboard'));

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
                <Route path="/role-selection" element={
                    <ProtectedRoute>
                      <Layout hideNav hideFooter>
                        <RoleSelection />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />

                {/* --- DASHBOARDS --- */}
                
                {/* Farmer Dashboard */}
                <Route path="/dashboard/farmer" element={
                    <ProtectedRoute requireRole="farmer">
                      <FarmerDashboard />
                    </ProtectedRoute>
                  } 
                />

                <Route path="/dashboard/weight" element={
                    <ProtectedRoute> 
                      <WeightUpdatePanel />
                    </ProtectedRoute>
                  } 
                />

                {/* Trader Dashboard */}
                <Route path="/dashboard/trader" element={
                    <ProtectedRoute requireRole="trader">
                      <TraderLayout />
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
                      <CommitteeLayout />
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
                      <AccountingLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AccountingDashboard />} />
                </Route>

                {/* Admin Dashboard - Sidebar Layout */}
                <Route path="/dashboard/admin" element={
                    <ProtectedRoute requireRole="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="commission" element={<CommissionRules />} />
                  <Route path="transactions" element={<TransactionHistory />} />
                </Route>
                  
                {/* Generic Dashboard (Fallback) */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />

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