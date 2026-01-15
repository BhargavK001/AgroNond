import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'information-collection',
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including:

**Personal Information:**
- Mobile phone number (for OTP authentication)
- Name and identity details
- Bank account information (for payment processing)
- Market registration details

**Transaction Data:**
- Vegetable types and quantities
- Sale and purchase records
- Pricing information
- Invoice and billing history

**Usage Information:**
- Login timestamps
- Dashboard activity
- Device and browser information`,
  },
  {
    id: 'data-usage',
    title: '2. How We Use Your Information',
    content: `Your information is used for the following purposes:

- **Authentication:** Verifying your identity through OTP-based login
- **Transaction Processing:** Recording sales, purchases, and commission calculations
- **Invoice Generation:** Creating official billing documents
- **Commission Calculation:** Computing the 4% farmer and 9% trader commissions
- **Reporting:** Generating market reports and analytics
- **Communication:** Sending important updates and notifications
- **System Improvement:** Enhancing platform functionality and user experience`,
  },
  {
    id: 'data-sharing',
    title: '3. Information Sharing',
    content: `We share your information only in the following circumstances:

- **Market Committee:** Transaction data is visible to the Market Committee for administrative purposes
- **Trading Partners:** Farmers and traders can see relevant transaction details of their trades
- **Legal Requirements:** When required by law or government authorities
- **Service Providers:** With trusted partners who help us operate the platform (under strict confidentiality)

We do NOT sell your personal information to third parties.`,
  },
  {
    id: 'security',
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your data:

- **Encryption:** All data is encrypted in transit and at rest
- **Secure Authentication:** OTP-based two-factor authentication
- **Access Controls:** Role-based access to sensitive information
- **Regular Audits:** Security audits and vulnerability assessments
- **Backup Systems:** Regular data backups for disaster recovery

While we strive to protect your information, no method of electronic transmission is 100% secure.`,
  },
  {
    id: 'user-rights',
    title: '5. Your Rights',
    content: `You have the following rights regarding your data:

- **Access:** Request access to your personal information
- **Correction:** Request correction of inaccurate data
- **Deletion:** Request deletion of your data (subject to legal requirements)
- **Portability:** Receive your data in a portable format
- **Objection:** Object to certain processing of your data

To exercise these rights, contact us using the information provided below.`,
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    content: `We retain your information for the following periods:

- **Account Data:** As long as your account is active
- **Transaction Records:** 7 years (as per financial regulations)
- **Invoices:** 7 years minimum
- **Login Logs:** 90 days

After these periods, data is securely deleted or anonymized.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies and Tracking',
    content: `We use minimal cookies for:

- **Session Management:** Keeping you logged in
- **Security:** Preventing fraudulent access
- **Preferences:** Remembering your language and settings

We do not use advertising or third-party tracking cookies.`,
  },
  {
    id: 'changes',
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Changes will be:

- Posted on this page with an updated date
- Communicated via SMS for significant changes
- Effective immediately upon posting

Your continued use of the platform constitutes acceptance of any changes.`,
  },
  {
    id: 'contact',
    title: '9. Contact Us',
    content: `For privacy-related questions or concerns:

**Email:** privacy@agronond.gov.in
**Phone:** +91 98765 43210
**Address:** Market Committee Office, Agricultural Market Yard

**Data Protection Officer:**
Name: [DPO Name]
Email: dpo@agronond.gov.in`,
  },
];

export default function Privacy() {
  const lastUpdated = 'January 14, 2026';

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-32 gradient-bg-subtle overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-[var(--border)] text-sm font-semibold text-[var(--primary)] mb-6 animate-fade-in-down">
              Legal
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-[var(--text-secondary)] animate-fade-in-up delay-100">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="p-6 rounded-2xl bg-[var(--primary-50)] border border-[var(--primary)]/20 mb-12">
              <p className="text-[var(--text-secondary)]">
                AgroNond ("we," "our," or "us") is committed to protecting the privacy of our users.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our agricultural market management platform.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="mb-12 p-6 rounded-2xl bg-white border border-[var(--border)]">
              <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
              <nav className="grid md:grid-cols-2 gap-2">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="text-[var(--primary)] hover:underline text-sm py-1"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Sections */}
            <div className="space-y-12">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
                    <div className="prose prose-sm max-w-none text-[var(--text-secondary)] whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-12 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center">
              <p className="text-[var(--text-secondary)] mb-4">
                Have questions about our privacy practices?
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-[var(--primary)] font-medium hover:underline"
              >
                Contact Us
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
