import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth Provider
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { PageLoading } from './components/Loading';
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
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const RoleSelection = lazy(() => import('./pages/RoleSelection'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

// --- FARMER DASHBOARD IMPORT ---
// --- FARMER DASHBOARD IMPORT ---
// Ensure your folder is named 'Dashboards' with a capital 'D'
const FarmerDashboard = lazy(() => import('./Dashboards/FarmerDashboard'));

// Trader Dashboard (Sidebar Layout + Pages)
const TraderLayout = lazy(() => import('./layouts/TraderLayout'));
const TraderDashboardContent = lazy(() => import('./Dashboards/TraderDashboard'));
const PaymentTracker = lazy(() => import('./pages/trader/PaymentTracker'));
const FarmerDirectory = lazy(() => import('./pages/trader/FarmerDirectory'));
const InventoryManager = lazy(() => import('./pages/trader/InventoryManager'));
const MarketIntelligence = lazy(() => import('./pages/trader/MarketIntelligence'));
const TraderProfile = lazy(() => import('./pages/trader/TraderProfile'));

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
            <Suspense fallback={<PageLoading />}>
              <Routes>
                {/* Login & Public Routes */}
                <Route path="/login" element={
                    <Layout hideNav hideFooter>
                      <Login />
                    </Layout>
                  } 
                />
                
                {/* Admin Login (Hidden from navigation) */}
                <Route path="/admin/login" element={
                    <Layout hideNav hideFooter>
                      <AdminLogin />
                    </Layout>
                  } 
                />

                {/* Role Selection (New Users) */}
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

                {/* Trader Dashboard - Sidebar Layout */}
                <Route path="/dashboard/trader" element={
                    <ProtectedRoute requireRole="trader">
                      <TraderLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<TraderDashboardContent />} />
                  <Route path="payments" element={<PaymentTracker />} />
                  <Route path="farmers" element={<FarmerDirectory />} />
                  <Route path="inventory" element={<InventoryManager />} />
                  <Route path="market" element={<MarketIntelligence />} />
                  <Route path="profile" element={<TraderProfile />} />
                </Route>

                {/* Committee Dashboard (Coming Soon) */}
                <Route path="/dashboard/committee" element={
                    <ProtectedRoute requireRole="committee">
                      <ComingSoon />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Dashboard (Using Generic for now, or Coming Soon if not built) */}
                {/* Since User said admin goes to main dashboard, I will point it there or create placeholder */}
                <Route path="/dashboard/admin" element={
                    <ProtectedRoute requireRole="admin">
                       <Dashboard /> 
                    </ProtectedRoute>
                  } 
                />

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