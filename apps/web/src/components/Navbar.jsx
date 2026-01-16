import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass shadow-lg py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              {/* Leaf Icon */}
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
              </svg>
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pulse-soft" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors tracking-tight">
                AgroNond
              </span>
              <span className="hidden sm:block text-xs text-[var(--text-muted)] font-medium">
                Digital Mandi Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-[var(--primary)] bg-[var(--primary-50)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-50)]'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="group relative px-6 py-3 rounded-full font-semibold overflow-hidden"
            >
              <span className="absolute inset-0 gradient-bg transition-transform duration-300 group-hover:scale-105" />
              <span className="relative flex items-center gap-2 text-white">
                Get Started
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden relative w-12 h-12 rounded-xl bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--primary-50)] transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 scale-0' : ''}`} />
              <span className={`block h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                  </svg>
                </div>
                <span className="text-lg font-bold">AgroNond</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--primary-50)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-[var(--primary-50)] text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={`w-2 h-2 rounded-full ${location.pathname === link.path ? 'bg-[var(--primary)]' : 'bg-[var(--text-muted)]'}`} />
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Quick Info */}
            <div className="mt-8 p-5 rounded-2xl bg-[var(--primary-50)] border border-[var(--primary-100)]">
              <h4 className="font-semibold text-[var(--primary)] mb-2">Need Help?</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Contact our support team for any queries.
              </p>
              <a href="tel:+919420530466" className="text-sm font-medium text-[var(--primary)]">
                📞 +91 94205 30466
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--border)]">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-bg text-white font-semibold magnetic-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login / Register
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
