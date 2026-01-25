import Button from '../../components/ui/Button';

const userTypes = [
  {
    title: 'Farmers',
    icon: <FarmerIcon />,
    benefits: [
      'Digital record of all vegetable sales',
      'Real-time price visibility',
      'Download invoices instantly',
      'Track payments and dues',
    ],
  },
  {
    title: 'Traders (Vyapari)',
    icon: <TraderIcon />,
    benefits: [
      'View purchase history',
      'Track billing and payments',
      'See commission deductions',
      'Manage transactions easily',
    ],
  },
  {
    title: 'Market Committee',
    icon: <CommitteeIcon />,
    benefits: [
      'Complete oversight of all trades',
      'Automatic commission calculation',
      'Generate reports and invoices',
      'Track cash flow in real-time',
    ],
  },
];

const timeline = [
  {
    year: 'Problem',
    title: 'Traditional Challenges',
    description: 'Paper-based records, manual calculations, lack of transparency, and delayed payments were affecting farmers and traders.',
  },
  {
    year: 'Solution',
    title: 'Digital Transformation',
    description: 'A comprehensive digital platform to modernize market committee operations with real-time tracking and automated billing.',
  },
  {
    year: 'Impact',
    title: 'Better Outcomes',
    description: 'Faster transactions, transparent pricing, reduced errors, and empowered farmers with complete control over their sales data.',
  },
];

export default function About() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-32 gradient-bg-subtle overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-[var(--border)] text-sm font-semibold text-[var(--primary)] mb-6 animate-fade-in-down">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
              Transforming Agricultural
              <span className="gradient-text"> Markets Digitally</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] animate-fade-in-up delay-100">
              Empowering farmers, traders, and market committees with modern technology
              for transparent and efficient agricultural trading.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-[var(--border)] hover-lift animate-fade-in-up">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                To digitize and streamline agricultural market operations, ensuring transparency
                in pricing, fairness in billing, and empowerment for every stakeholder in the
                agricultural value chain.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[var(--border)] hover-lift animate-fade-in-up delay-100">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                A future where every farmer has access to real-time market data, fair pricing,
                and instant digital records—transforming agricultural markets into modern,
                efficient, and farmer-friendly ecosystems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section bg-[var(--surface)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary-100)] text-[var(--primary)] text-sm font-semibold mb-4">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Digital Transformation Story
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-[var(--primary)]/20 -translate-x-1/2" />

            {timeline.map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center gap-8 mb-12 last:mb-0 animate-fade-in-up ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full gradient-bg -translate-x-1/2 z-10 shadow-md" />

                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary-100)] text-[var(--primary)] text-sm font-bold mb-2">
                    {item.year}
                  </span>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-[var(--text-secondary)]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits by User Type */}
      <section className="section">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary-100)] text-[var(--primary)] text-sm font-semibold mb-4">
              Benefits
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Benefits for Everyone
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Our platform is designed to serve all stakeholders in the agricultural market ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((user, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white border border-[var(--border)] hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-lg">
                  <div className="text-white">{user.icon}</div>
                </div>
                <h4 className="text-xl font-bold mb-4">{user.title}</h4>
                <ul className="space-y-3">
                  {user.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)]">
                      <svg className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-[var(--surface)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8">
              Join thousands of farmers and traders who have already embraced digital market management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button to="/login" size="lg">
                Login to Dashboard
              </Button>
              <Button to="/contact" variant="outline" size="lg">
                Contact Us
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
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function TraderIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function CommitteeIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
