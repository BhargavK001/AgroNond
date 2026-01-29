import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { PageLoading } from '../../components/ui/Loading';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

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

// ... Icons from CompleteProfile ...
function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LocationIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CameraIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}



// Role based routes
const roleRoutes = {
  farmer: '/dashboard/farmer',
  trader: '/dashboard/trader',
  weight: '/dashboard/weight',
  committee: '/dashboard/committee',
  lilav: '/dashboard/lilav',
};

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('phone'); // phone, otp, profile-setup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const firstOtpInputRef = useRef(null);

  // Profile Form Data
  const [profileData, setProfileData] = useState({
    full_name: '',
    location: '',

    profile_picture: ''
  });

  const { signInWithPhone, verifyOtp, user, profile, profileLoading, signOut, refreshProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Helper to check if profile is incomplete
  const isProfileIncomplete = (p) => {
    // Logic for new farmers: must have full_name and location
    // If role is NOT set yet (new user default), we assume farmer flow or role selection later, 
    // but here we force profile completion first.
    // If role is set to something else (e.g. admin), we might skip this, but for now apply to all or check role
    if (!p) return true;
    if (p.role === 'farmer' || !p.role) {
      return !p.full_name || !p.location;
    }
    return false;
  };

  // Handle Redirection based on Auth State
  useEffect(() => {
    // 1. If we are still loading the profile, do NOTHING (wait).
    if (profileLoading) return;

    // 2. If user is logged in and profile load is done:
    if (user && profile) {
      if (isProfileIncomplete(profile)) {
        // If profile is incomplete, force profile setup step
        setStep('profile-setup');
        // Pre-fill data
        setProfileData(prev => ({
          ...prev,
          full_name: profile.full_name || '',
          location: profile.location || '',

          profile_picture: profile.profile_picture || ''
        }));
        return;
      }

      // 3. Fully authenticated and complete profile
      if (profile.role === 'admin') {
        signOut();
        setError('Access Denied. Admins must login via the Admin Portal.');
        navigate('/login');
        return;
      }

      // Redirect to appropriate dashboard
      const targetRoute = roleRoutes[profile.role] || '/dashboard/farmer';
      navigate(targetRoute, { replace: true });
    }
  }, [user, profile, profileLoading, navigate, signOut]);

  // Auto-focus first OTP input when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp' && firstOtpInputRef.current) {
      setTimeout(() => {
        firstOtpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

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

      // Note: useEffect will handle the redirection or step change based on profile completeness

    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.full_name.trim()) {
      toast.error('Full Name is required');
      return;
    }

    if (!profileData.location.trim()) {
      toast.error('Location is required');
      return;
    }

    try {
      setLoading(true);
      await api.users.updateProfile(profileData);

      // Refresh local profile state to trigger useEffect redirect
      await refreshProfile();

      toast.success('Profile completed!');
      // Navigation will happen automatically via useEffect
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };


  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (value && index === 5) {
      const completeOtp = newOtp.join('');
      if (completeOtp.length === 6) {
        setTimeout(() => {
          document.getElementById('otp-form')?.requestSubmit();
        }, 150);
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
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  // Show loading screen while checking auth state
  if ((user && profileLoading) || (user && authLoading)) {
    return <PageLoading />;
  }

  // If we are in profile-setup step, we are essentially duplicating CompleteProfile UI here
  // But wrapped in the login layout/modal feel

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
            {step === 'profile-setup' && <span className="text-xs text-[var(--primary)] font-medium block">Setup Profile</span>}
          </div>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-[var(--border)] animate-scale-in">

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
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
          )}

          {step === 'otp' && (
            <>
              <div className="text-center mb-5 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Verify OTP</h1>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  Enter the 6-digit code sent to +91 {phoneNumber}
                </p>
              </div>

              <form id="otp-form" onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-6">
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      ref={index === 0 ? firstOtpInputRef : null}
                      type="text"
                      inputMode="numeric"
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

          {step === 'profile-setup' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold mb-1">Finish Profile</h1>
                <p className="text-[var(--text-secondary)] text-sm">
                  Just a few more details
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* Picture */}
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--border)] bg-[var(--surface)] flex items-center justify-center">
                      {profileData.profile_picture ? (
                        <img src={profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-[var(--text-muted)]" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <CameraIcon className="w-6 h-6" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      <UserIcon className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      placeholder="Full Name *"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      <LocationIcon className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      placeholder="Village/City *"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Adhaar */}


                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Complete Setup
                </Button>
              </form>
            </>
          )}

        </div>
      </div>
    </main>
  );
}