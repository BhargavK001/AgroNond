import { motion } from 'framer-motion';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../../components/ui/ScrollReveal';
import Hero from '../../components/ui/Hero';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { FeatureGlowCard } from '../../components/ui/GlowCard';
import { FloatingElement } from '../../components/ui/ParallaxImage';
import ShimmerButton from '../../components/ui/ShimmerButton';

// CTA Background Image
import ctaBackground from '../../assets/hero-farmer.jpg';

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
  { value: '5000+', label: 'Registered Farmers' },
  { value: '₹50L+', label: 'Daily Transactions' },
  { value: '100+', label: 'Market Committees' },
  { value: '99.9%', label: 'System Uptime' },
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
      {/* Hero Section - Enhanced */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="mesh-gradient-bg" />

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern opacity-50" />

        {/* Floating Decorative Elements */}
        <FloatingElement className="top-32 right-[15%]" speed={0.2} delay={0.2}>
          <WheatIcon className="w-16 h-16 text-[var(--primary)]/20" />
        </FloatingElement>
        <FloatingElement className="top-48 left-[10%]" speed={0.15} delay={0.4}>
          <LeafIcon className="w-12 h-12 text-[var(--primary)]/25" />
        </FloatingElement>
        <FloatingElement className="bottom-32 left-[8%]" speed={0.25} delay={0.6}>
          <TractorIcon className="w-20 h-20 text-[var(--primary)]/15" />
        </FloatingElement>
        <FloatingElement className="bottom-48 right-[12%]" speed={0.18} delay={0.3}>
          <VegetableIcon className="w-14 h-14 text-[var(--primary)]/20" />
        </FloatingElement>

        <div className="container relative z-10 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <ScrollReveal variant="fadeDown" delay={0}>
              <motion.div
                className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/90 border border-[var(--primary-200)] shadow-lg mb-6 sm:mb-8 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                  🌾 India's Digital Mandi Platform
                </span>
              </motion.div>
            </ScrollReveal>

            {/* Main Heading with stagger animation */}
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight">
                <span className="text-[var(--text-primary)]">Transforming </span>
                <span className="gradient-text">Agricultural</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                <span className="text-[var(--text-primary)]">Markets </span>
                <span className="gradient-text">Digitally</span>
              </h1>
            </ScrollReveal>

            {/* Subheading */}
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed px-2">
                Empowering <strong className="text-[var(--primary)]">5000+ farmers</strong> with
                transparent billing, real-time tracking, and secure digital invoicing.
              </p>
            </ScrollReveal>

            {/* CTA Buttons with shimmer effect */}
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <ShimmerButton to="/login" size="lg" variant="primary">
                  <span className="flex items-center gap-2">
                    Start Trading Now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </ShimmerButton>
                <ShimmerButton to="/about" variant="outline" size="lg">
                  Learn How It Works
                </ShimmerButton>
              </div>
            </ScrollReveal>

            {/* Trust Badges */}
            <ScrollReveal variant="fadeUp" delay={0.4}>
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {[
                  { icon: '✓', text: 'Free Registration' },
                  { icon: '✓', text: 'OTP Based Login' },
                  { icon: '✓', text: 'Govt Approved' },
                ].map((badge, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]"
                    whileHover={{ scale: 1.05, color: 'var(--primary)' }}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{badge.text}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Scroll to explore</span>
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Features Section - Enhanced with Glow Cards */}
      <section className="section bg-[var(--surface)]">
        <div className="container">
          <ScrollReveal variant="fadeUp">
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
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <FeatureGlowCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Stats Section - Enhanced with Animated Counters */}
      <section className="section">
        <div className="container">
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <motion.div
                  className="stat-card-enhanced text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="stat-value">
                    <AnimatedCounter value={stat.value} duration={2000} />
                  </div>
                  <p className="stat-label">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works Section - Enhanced with step cards */}
      <section className="section bg-[var(--surface)]">
        <div className="container">
          <ScrollReveal variant="fadeUp">
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
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((item, index) => (
              <ScrollReveal key={index} variant="fadeUp" delay={index * 0.15}>
                <motion.div
                  className="step-card-enhanced relative"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Big step number background */}
                  <div className="absolute top-4 right-4 sm:right-6 text-4xl sm:text-6xl font-bold text-[var(--primary)]/10">
                    {item.step}
                  </div>

                  <div className="relative z-10">
                    <div className="step-number-badge mb-4 sm:mb-6">
                      {index + 1}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h4>
                    <p className="text-[var(--text-secondary)] text-sm sm:text-base">{item.description}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced with Image Background */}
      <section className="section">
        <div className="container">
          <ScrollReveal variant="scale">
            <div className="cta-section-image text-center" style={{ backgroundImage: `url(${ctaBackground})` }}>
              {/* Dark overlay for text readability */}
              <div className="cta-overlay" />
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Market?
                </h2>
                <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of farmers and traders already benefiting from digital market management.
                </p>
                <ShimmerButton to="/login" variant="secondary" size="lg">
                  Start Now — It's Free
                </ShimmerButton>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}

// Icon Components
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
