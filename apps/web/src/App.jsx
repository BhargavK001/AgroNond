import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';

// Auth Provider
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading, { PageLoading } from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Layout wrapper for pages with Navbar and Footer
function Layout({ children, hideNav = false, hideFooter = false }) {
  return (
    <>
      {!hideNav && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}

// Initial loading screen
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
      retry: 1,
    },
  },
});

function InitialLoading() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading for minimum 2 seconds for smooth experience
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!showLoading) return null;

  return <Loading text="Growing your experience" />;
}

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Hide initial loading after animation completes
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            {isInitialLoad && <Loading text="Growing your experience" />}
            <ScrollToTop />
            <Suspense fallback={<PageLoading />}>
              <Routes>
                {/* Login page without navbar/footer */}
                <Route
                  path="/login"
                  element={
                    <Layout hideNav hideFooter>
                      <Login />
                    </Layout>
                  }
                />

                {/* Protected Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Pages with navbar and footer */}
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Home />
                    </Layout>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <Layout>
                      <About />
                    </Layout>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <Layout>
                      <Services />
                    </Layout>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <Layout>
                      <Contact />
                    </Layout>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <Layout>
                      <Privacy />
                    </Layout>
                  }
                />
                
                {/* 404 Catch-all */}
                <Route
                  path="*"
                  element={<NotFound />}
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
