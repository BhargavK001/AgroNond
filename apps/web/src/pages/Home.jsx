import Button from '../components/Button';
import { FeatureCard, StatCard } from '../components/Card';

// Feature icons
const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Digital Record Keeping',
    description: 'Upload and manage all vegetable records digitally. Track market names, types, quantities with ease.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Transparent Billing',
    description: 'View real-time pricing, trader purchases, and total billing. No hidden charges, complete transparency.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Real-time Updates',
    description: 'Instant weight updates reflect in your sales records. Stay informed with live market data.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure Invoicing',
    description: 'Download official invoices directly from the dashboard. All financial data handled securely.',
  },
];

const stats = [
  { value: '5000+', label: 'Registered Farmers', icon: <FarmerIcon /> },
  { value: '₹50L+', label: 'Daily Transactions', icon: <TransactionIcon /> },
  { value: '100+', label: 'Market Committees', icon: <MarketIcon /> },
  { value: '99.9%', label: 'System Uptime', icon: <UptimeIcon /> },
];

const steps = [
  {
    step: '01',
    title: 'Register',
    description: 'Sign up with your mobile number and verify via OTP. Choose your role - Farmer, Trader, or Committee.',
  },
  {
    step: '02',
    title: 'Upload Records',
    description: 'Farmers upload daily vegetable records. Market staff updates weights. Everything syncs in real-time.',
  },
  {
    step: '03',
    title: 'Trade & Track',
    description: 'View sales, track payments, download invoices. Complete transparency at every step of the process.',
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center gradient-bg-subtle bg-pattern overflow-hidden">
        {/* Animated Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)]/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse-soft delay-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-3xl" />
          
          {/* Floating Farm Elements */}
          <WheatIcon className="absolute top-32 right-[15%] w-16 h-16 text-[var(--primary)]/20 animate-sway" />
          <LeafIcon className="absolute top-48 left-[10%] w-12 h-12 text-[var(--primary)]/25 animate-float delay-200" />
          <TractorIcon className="absolute bottom-32 left-[8%] w-20 h-20 text-[var(--primary)]/15 animate-float-slow" />
          <VegetableIcon className="absolute bottom-48 right-[12%] w-14 h-14 text-[var(--primary)]/20 animate-float delay-300" />
        </div>

        <div className="container relative z-10 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/90 border border-[var(--primary-200)] shadow-lg mb-6 sm:mb-8 animate-fade-in-down backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                🌾 India's Digital Mandi Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 animate-fade-in-up tracking-tight">
              <span className="text-[var(--text-primary)]">Transforming </span>
              <span className="gradient-text">Agricultural</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-[var(--text-primary)]">Markets </span>
              <span className="gradient-text">Digitally</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-6 sm:mb-8 max-w-xl mx-auto animate-fade-in-up delay-100 leading-relaxed px-2">
              Empowering <strong className="text-[var(--primary)]">5000+ farmers</strong> with 
              transparent billing, real-time tracking, and secure digital invoicing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up delay-200 px-4">
              <Button to="/login" size="lg" className="magnetic-btn group w-full sm:w-auto">
                <span className="flex items-center justify-center gap-2">
                  Start Trading Now
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
              <Button to="/about" variant="outline" size="lg" className="magnetic-btn w-full sm:w-auto">
                Learn How It Works
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free Registration</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>OTP Based Login</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Govt Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Scroll to explore</span>
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-[var(--surface)]">
        <div className="container">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary-100)] text-[var(--primary)] text-xs sm:text-sm font-semibold mb-3">
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Everything You Need
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              A comprehensive platform for farmers, traders, and market committees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section bg-[var(--surface)]">
        <div className="container">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary-100)] text-[var(--primary)] text-xs sm:text-sm font-semibold mb-3">
              Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              How It Works
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Simple three-step process to get started with digital trading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((item, index) => (
              <div
                key={index}
                className="relative p-5 sm:p-8 rounded-2xl bg-white border border-[var(--border)] hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-4xl sm:text-6xl font-bold text-[var(--primary)]/10 absolute top-4 right-4 sm:right-6">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h4>
                  <p className="text-[var(--text-secondary)] text-sm sm:text-base">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="relative rounded-3xl gradient-bg p-12 md:p-16 text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Market?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of farmers and traders already benefiting from digital market management.
              </p>
              <Button to="/login" variant="secondary" size="lg">
                Start Now — It's Free
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Icon Components
function FarmerIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function TransactionIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function UptimeIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WheatIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L9.5 8.5L3 6L7 12L3 18L9.5 15.5L12 22L14.5 15.5L21 18L17 12L21 6L14.5 8.5L12 2Z" />
    </svg>
  );
}

function LeafIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
    </svg>
  );
}

function TractorIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M5,4V11.26C3.2,11.9 2,13.6 2,15.5C2,18 4,20 6.5,20C8.79,20 10.71,18.28 10.97,16H15.17C15.06,16.32 15,16.66 15,17A3,3 0 0,0 18,20A3,3 0 0,0 21,17C21,15.77 20.19,14.71 19.07,14.29C18.86,13.16 18.03,12.24 17,11.83V8H22V6H17V4M7,6H15V11H13V9H7M6.5,13.5A2,2 0 0,1 8.5,15.5A2,2 0 0,1 6.5,17.5A2,2 0 0,1 4.5,15.5A2,2 0 0,1 6.5,13.5M18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5Z" />
    </svg>
  );
}

function VegetableIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,6C10.89,6 10,5.1 10,4C10,3.62 10.1,3.26 10.29,2.95L12,0L13.71,2.95C13.9,3.26 14,3.62 14,4C14,5.1 13.1,6 12,6M16.56,12.17C14.28,11.04 12.5,9.54 11.5,7.7C10.5,9.54 8.72,11.04 6.44,12.17C5.16,12.78 4.25,14.07 4,15.5C3.88,16.28 4.03,17.04 4.39,17.7C4.97,18.88 6.12,19.7 7.5,19.91C7.67,19.97 7.83,20 8,20C10.21,20 12,18.21 12,16C12,18.21 13.79,20 16,20C16.17,20 16.33,19.97 16.5,19.91C17.88,19.7 19.03,18.88 19.61,17.7C19.97,17.04 20.12,16.28 20,15.5C19.75,14.07 18.84,12.78 17.56,12.17H16.56Z" />
    </svg>
  );
}

