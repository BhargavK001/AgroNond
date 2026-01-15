import Button from '../components/Button';

const commissionModel = [
  {
    title: 'Farmer Commission',
    rate: '4%',
    description: 'Deducted from the farmer\'s total billing amount',
    icon: <FarmerIcon />,
    details: [
      'Calculated on total sale value',
      'Automatically computed in real-time',
      'Visible in invoice breakdown',
      'Contributes to market maintenance',
    ],
  },
  {
    title: 'Trader Commission',
    rate: '9%',
    description: 'Deducted from the trader\'s total purchase amount',
    icon: <TraderIcon />,
    details: [
      'Applied on all purchases',
      'Transparent billing statements',
      'Supports market operations',
      'Digital invoice generation',
    ],
  },
];

const dashboards = [
  {
    title: 'Farmer Dashboard',
    description: 'Complete control over vegetable sales and records',
    icon: <FarmerIcon />,
    features: [
      'Login via OTP',
      'Upload daily vegetable records',
      'View sales reports',
      'Download invoices',
      'Track payments',
    ],
  },
  {
    title: 'Trader Dashboard',
    description: 'Track purchases and payment status',
    icon: <TraderIcon />,
    features: [
      'View purchase history',
      'See item-wise billing',
      'Track 9% commission',
      'Download invoices',
      'Check payment status',
    ],
  },
  {
    title: 'Market Committee',
    description: 'Complete oversight of market operations',
    icon: <CommitteeIcon />,
    features: [
      'View all registered farmers',
      'Track incoming vegetables',
      'Auto commission calculation',
      'Generate final invoices',
      'Monitor cash flow',
    ],
  },
  {
    title: 'Weight Update Panel',
    description: 'Staff portal for weight management',
    icon: <WeightIcon />,
    features: [
      'Update vegetable weights',
      'Auto-sync to farmer records',
      'Weight history tracking',
      'Audit trail available',
    ],
  },
  {
    title: 'Accounting Dashboard',
    description: 'Comprehensive billing and reports',
    icon: <AccountingIcon />,
    features: [
      'Detailed billing info',
      'Payment tracking',
      'Commission deductions',
      'Generate reports',
      'Date-wise transactions',
    ],
  },
  {
    title: 'Admin Panel',
    description: 'Full system control and management',
    icon: <AdminIcon />,
    features: [
      'Manage all users',
      'Control billing records',
      'Set commission rules',
      'System configuration',
      'Report generation',
    ],
  },
];

export default function Services() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-32 gradient-bg-subtle overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-[var(--border)] text-sm font-semibold text-[var(--primary)] mb-6 animate-fade-in-down">
              Our Services
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
              Complete Market
              <span className="gradient-text"> Management</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] animate-fade-in-up delay-100">
              From farmer registration to final billing—we provide end-to-end digital solutions
              for agricultural market committees.
            </p>
          </div>
        </div>
      </section>

      {/* Commission Model Section */}
      <section className="section">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary-100)] text-[var(--primary)] text-sm font-semibold mb-4">
              Commission Structure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transparent Commission Model
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Clear and fair commission structure for all stakeholders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {commissionModel.map((item, index) => (
              <div
                key={index}
                className="relative p-8 rounded-2xl bg-white border border-[var(--border)] hover-lift animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Rate */}
                <div className="absolute top-4 right-4 text-8xl font-bold text-[var(--primary)]/5">
                  {item.rate}
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-lg">
                    <div className="text-white">{item.icon}</div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <div className="inline-block px-4 py-2 rounded-full bg-[var(--primary-50)] mb-4">
                    <span className="text-3xl font-bold gradient-text">{item.rate}</span>
                    <span className="text-[var(--text-secondary)] ml-2">Commission</span>
                  </div>
                  <p className="text-[var(--text-secondary)] mb-6">{item.description}</p>

                  <ul className="space-y-3">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3 text-[var(--text-secondary)]">
                        <svg className="w-5 h-5 text-[var(--primary)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transaction Flow Diagram */}
      <section className="section bg-[var(--surface)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary-100)] text-[var(--primary)] text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transaction Flow
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
              {/* Farmer */}
              <div className="flex flex-col items-center animate-fade-in-up">
                <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg mb-3">
                  <FarmerIcon />
                </div>
                <span className="font-semibold">Farmer</span>
                <span className="text-sm text-[var(--text-secondary)]">Sells Produce</span>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center px-4">
                <div className="w-16 h-0.5 bg-[var(--primary)]" />
                <svg className="w-4 h-4 text-[var(--primary)] -ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="md:hidden w-0.5 h-8 bg-[var(--primary)]" />

              {/* Market Committee */}
              <div className="flex flex-col items-center animate-fade-in-up delay-100">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-[var(--primary)] flex items-center justify-center shadow-lg mb-3">
                  <div className="text-center">
                    <CommitteeIcon />
                    <span className="text-xs text-[var(--primary)] font-semibold">4% + 9%</span>
                  </div>
                </div>
                <span className="font-semibold">Market Committee</span>
                <span className="text-sm text-[var(--text-secondary)]">Manages & Bills</span>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center px-4">
                <div className="w-16 h-0.5 bg-[var(--primary)]" />
                <svg className="w-4 h-4 text-[var(--primary)] -ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="md:hidden w-0.5 h-8 bg-[var(--primary)]" />

              {/* Trader */}
              <div className="flex flex-col items-center animate-fade-in-up delay-200">
                <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg mb-3">
                  <TraderIcon />
                </div>
                <span className="font-semibold">Trader</span>
                <span className="text-sm text-[var(--text-secondary)]">Buys Produce</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="section">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary-100)] text-[var(--primary)] text-sm font-semibold mb-4">
              Dashboards
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Role-Based Dashboards
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Specialized interfaces for every stakeholder in the market ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white border border-[var(--border)] hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-5 shadow-md">
                  <div className="text-white">{dashboard.icon}</div>
                </div>
                <h4 className="text-xl font-bold mb-2">{dashboard.title}</h4>
                <p className="text-[var(--text-secondary)] text-sm mb-4">{dashboard.description}</p>
                <ul className="space-y-2">
                  {dashboard.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                      {feature}
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
              Ready to Experience Our Services?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8">
              Get started today and transform your market operations.
            </p>
            <Button to="/login" size="lg">
              Access Your Dashboard
            </Button>
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

function WeightIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

function AccountingIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
