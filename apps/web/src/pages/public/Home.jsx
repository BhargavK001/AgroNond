import { motion } from 'framer-motion';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../../components/ui/ScrollReveal';
import Hero from '../../components/ui/Hero';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import ShimmerButton from '../../components/ui/ShimmerButton';
import Card from '../../components/ui/Card';

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
      {/* Hero Section - Simplified */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white to-[var(--primary-50)]">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern opacity-30" />

        <div className="container relative z-10 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <ScrollReveal variant="fadeDown" delay={0}>
              <motion.div
                className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white border border-[var(--primary-200)] shadow-sm mb-6 sm:mb-8"
                whileHover={{ scale: 1.02 }}
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
                <span className="text-[var(--primary)]">Agricultural</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                <span className="text-[var(--text-primary)]">Markets </span>
                <span className="text-[var(--primary)]">Digitally</span>
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
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{badge.text}</span>
                  </div>
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

      {/* Features Section - Standard Grid */}
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
                <Card className="h-full p-6 hover:shadow-md transition-shadow">
                  <div className="text-[var(--primary)] mb-4 bg-[var(--primary-50)] w-12 h-12 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{feature.description}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section">
        <div className="container">
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <div
                  className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm text-center"
                >
                  <div className="text-3xl font-bold text-[var(--primary)] mb-2">
                    <AnimatedCounter value={stat.value} duration={2000} />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] font-medium">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works Section */}
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
                <div className="bg-white rounded-xl p-6 border border-[var(--border)] relative overflow-hidden h-full">
                  {/* Big step number background */}
                  <div className="absolute top-4 right-4 sm:right-6 text-4xl sm:text-6xl font-bold text-[var(--primary)]/5 select-none">
                    {item.step}
                  </div>

                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold mb-4">
                      {index + 1}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h4>
                    <p className="text-[var(--text-secondary)] text-sm sm:text-base">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <ScrollReveal variant="scale">
            <div className="rounded-2xl overflow-hidden relative text-center py-20 px-6" style={{ backgroundImage: `url(${ctaBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/60" />
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
