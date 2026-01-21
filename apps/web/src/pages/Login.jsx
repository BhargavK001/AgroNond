import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { PageLoading } from '../components/Loading';

// Icons
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

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithPhone, verifyOtp, user, profile, profileLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Handle Redirection based on Auth State
  useEffect(() => {
    // 1. If we are still loading the profile, do NOTHING (wait).
    if (profileLoading) return;

    // 2. If user is logged in and profile load is done:
    if (user) {
      if (profile?.role) {
        // Success: Redirect to specific dashboard
        if (profile.role === 'farmer') navigate('/dashboard/farmer');
        else if (profile.role === 'trader') navigate('/dashboard/trader');
        else if (profile.role === 'admin') navigate('/dashboard/admin');
        else if (profile.role === 'weight') navigate('/dashboard/weight');

        else navigate('/dashboard');
      } else if (profile) {
        // Success: Profile loaded but no role -> Role Selection
        navigate('/role-selection');
      } else {
        // FALLBACK: User exists but profile failed to load (is null)
        // Safety mechanism to prevent stuck loading screen
        console.error("Profile load failed for authenticated user. Signing out.");
        signOut();
      }
    }
  }, [user, profile, profileLoading, navigate, signOut]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const { error } = await signInWithPhone(formattedPhone);
      
      if (error) throw error;
      
      setStep('otp');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      const { error } = await verifyOtp(formattedPhone, otpValue);

      if (error) throw error;
      
      // No manual navigation here. 
      // The useEffect hooks listens to 'user' and 'profileLoading' state 
      // and will redirect automatically once the profile is ready.

    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  // Show loading screen while checking profile to prevent form flash
  if (user && profileLoading) {
    return <PageLoading />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center gradient-bg-subtle py-16 sm:py-24 px-4 relative overflow-hidden bg-pattern">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-5 sm:top-20 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-[var(--primary)]/15 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse-soft delay-500" />
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

        {/* Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-[var(--border)] animate-scale-in">
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {step === 'phone' ? (
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
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm sm:text-base">+91</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-base sm:text-lg"
                      placeholder="98765 43210"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" loading={loading} disabled={phoneNumber.length !== 10} className="w-full" size="lg">
                  Send OTP
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-5 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Verify OTP</h1>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  Enter the 6-digit code sent to +91 {phoneNumber}
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-6">
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-center text-lg sm:text-xl font-bold"
                    />
                  ))}
                </div>

                <Button type="submit" loading={loading} disabled={otp.join('').length !== 6} className="w-full" size="lg">
                  Verify & Continue
                </Button>
                
                <div className="flex justify-between items-center text-sm">
                  <button type="button" onClick={() => setStep('phone')} className="text-[var(--primary)] hover:underline">
                    Change Number
                  </button>
                  <button type="button" onClick={handlePhoneSubmit} className="text-[var(--text-secondary)] hover:text-[var(--primary)]">
                    Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}