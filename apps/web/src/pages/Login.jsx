import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const [fullPhone, setFullPhone] = useState(''); // Store with country code for OTP verification
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, profile, signInWithPhone, verifyOtp, updateRole, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in with role
  useEffect(() => {
    if (!loading && user && profile?.role) {
      navigate('/dashboard', { replace: true });
    } else if (!loading && user && !profile?.role) {
      // User is logged in but hasn't selected a role
      setStep('role');
    }
  }, [user, profile, loading, navigate]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return;

    setIsLoading(true);
    setError('');

    const phoneWithCode = `+91${phone}`;
    setFullPhone(phoneWithCode);

    const { error } = await signInWithPhone(phoneWithCode);

    if (error) {
      setError(error.message || 'Failed to send OTP. Please try again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setStep('otp');
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

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      document.getElementById('otp-5')?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setIsLoading(true);
    setError('');

    const { data, error } = await verifyOtp(fullPhone, otpString);

    if (error) {
      setError(error.message || 'Invalid OTP. Please try again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    
    // Check if user needs to select role
    // The useEffect will handle redirection based on profile
    setStep('role');
  };

  const handleRoleSubmit = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    setError('');

    const { error } = await updateRole(selectedRole);

    if (error) {
      setError(error.message || 'Failed to set role. Please try again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    navigate('/dashboard', { replace: true });
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');
    setOtp(['', '', '', '', '', '']);

    const { error } = await signInWithPhone(fullPhone);

    if (error) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center gradient-bg-subtle py-16 sm:py-24 px-4 relative overflow-hidden bg-pattern">
      {/* Farm-themed Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-5 sm:top-20 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-[var(--primary)]/15 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse-soft delay-500" />
        {/* Farm Elements - Hidden on very small screens */}
        <WheatIcon className="hidden sm:block absolute top-24 right-[15%] w-12 sm:w-16 h-12 sm:h-16 text-[var(--primary)]/20 animate-sway" />
        <LeafIcon className="hidden sm:block absolute top-40 left-[12%] w-10 sm:w-12 h-10 sm:h-12 text-[var(--primary)]/25 animate-float" />
        <LeafIcon className="hidden sm:block absolute bottom-32 right-[20%] w-8 sm:w-10 h-8 sm:h-10 text-[var(--primary)]/15 animate-float delay-300" />
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 group">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-bg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold block">AgroNond</span>
            <span className="text-xs text-[var(--text-muted)]">Digital Mandi Platform</span>
          </div>
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-[var(--border)] animate-scale-in">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 'phone' && (
            <>
              <div className="text-center mb-5 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome Back</h1>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  Enter your mobile number to continue
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm sm:text-base">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-base sm:text-lg"
                      placeholder="98765 43210"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    We'll send you a 6-digit OTP to verify your number
                  </p>
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
              <div className="text-center mb-5 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Verify OTP</h1>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  Enter the 6-digit code sent to {fullPhone}
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-6">
                <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-center text-lg sm:text-xl font-bold"
                      maxLength={1}
                      autoFocus={index === 0}
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

                <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="text-[var(--primary)] hover:underline"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-[var(--text-secondary)] hover:text-[var(--primary)] hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Role Selection Step */}
          {step === 'role' && (
            <>
              <div className="text-center mb-5 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Select Your Role</h1>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  Choose how you want to access the platform
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {userRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all flex flex-col items-center gap-1 sm:gap-2 hover-scale ${
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
