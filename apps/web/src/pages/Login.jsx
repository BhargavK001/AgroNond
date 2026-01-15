import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const userRoles = [
  { id: 'farmer', label: 'Farmer', icon: <FarmerIcon /> },
  { id: 'trader', label: 'Trader', icon: <TraderIcon /> },
  { id: 'committee', label: 'Market Committee', icon: <CommitteeIcon /> },
  { id: 'admin', label: 'Admin', icon: <AdminIcon /> },
];

export default function Login() {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'role'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
      }, 1000);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.every((digit) => digit)) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('role');
      }, 1000);
    }
  };

  const handleRoleSubmit = () => {
    if (selectedRole) {
      setIsLoading(true);
      setTimeout(() => {
        // Would redirect to dashboard here
        alert(`Logging in as ${selectedRole}...`);
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center gradient-bg-subtle py-32 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse-soft delay-300" />
        <LeafDecoration className="absolute top-32 right-1/4 w-20 h-20 text-[var(--primary)]/15 animate-float" />
        <LeafDecoration className="absolute bottom-32 left-1/4 w-16 h-16 text-[var(--primary)]/10 animate-float delay-200" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold">AgroNond</span>
          </Link>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-[var(--border)] animate-scale-in">
            {/* Phone Step */}
            {step === 'phone' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                  <p className="text-[var(--text-secondary)]">
                    Enter your mobile number to continue
                  </p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-14 pr-4 py-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-lg"
                        placeholder="98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={phone.length !== 10}
                    className="w-full"
                    size="lg"
                  >
                    Send OTP
                  </Button>
                </form>
              </>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Verify OTP</h1>
                  <p className="text-[var(--text-secondary)]">
                    Enter the 6-digit code sent to +91 {phone}
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-center text-xl font-bold"
                        maxLength={1}
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={!otp.every((d) => d)}
                    className="w-full"
                    size="lg"
                  >
                    Verify & Continue
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Role Selection Step */}
            {step === 'role' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Select Your Role</h1>
                  <p className="text-[var(--text-secondary)]">
                    Choose how you want to access the platform
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {userRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 hover-scale ${
                        selectedRole === role.id
                          ? 'border-[var(--primary)] bg-[var(--primary-50)]'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedRole === role.id
                            ? 'gradient-bg text-white'
                            : 'bg-[var(--surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {role.icon}
                      </div>
                      <span
                        className={`font-medium text-sm ${
                          selectedRole === role.id
                            ? 'text-[var(--primary)]'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {role.label}
                      </span>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleRoleSubmit}
                  loading={isLoading}
                  disabled={!selectedRole}
                  className="w-full"
                  size="lg"
                >
                  Continue to Dashboard
                </Button>
              </>
            )}

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                By continuing, you agree to our{' '}
                <Link to="/privacy" className="text-[var(--primary)] hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// Icon Components
function FarmerIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function TraderIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function CommitteeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LeafDecoration({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.75 4.09L15.22 6.03L16.13 9.09L13.5 7.28L10.87 9.09L11.78 6.03L9.25 4.09L12.44 4L13.5 1L14.56 4L17.75 4.09M21.25 11L19.61 12.25L20.2 14.23L18.5 13.06L16.8 14.23L17.39 12.25L15.75 11L17.81 10.95L18.5 9L19.19 10.95L21.25 11M18.97 15.95C19.8 15.87 20.69 17.05 20.16 17.8C19.84 18.25 19.5 18.67 19.08 19.07C15.17 23 8.84 23 4.94 19.07C1.03 15.17 1.03 8.83 4.94 4.93C5.34 4.53 5.76 4.17 6.21 3.85C6.96 3.32 8.14 4.21 8.06 5.04C7.79 7.9 8.75 10.87 10.95 13.06C13.14 15.26 16.1 16.22 18.97 15.95Z" />
    </svg>
  );
}
