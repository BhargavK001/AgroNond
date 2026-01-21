import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

// --- ICON COMPONENTS ---
// Consistent stroke-width and style for all icons

function FarmerIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function TraderIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v9m0-9l-9 9m6-9H7.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5H13" />
    </svg>
  );
}

function CommitteeIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function ScaleIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

// Background Icons
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

// Updated Roles Configuration
const roles = [
  { 
    id: 'farmer', 
    label: 'Farmer', 
    description: 'Sell your produce & track payments', 
    icon: FarmerIcon 
  },
  { 
    id: 'trader', 
    label: 'Trader', 
    description: 'Buy produce & manage inventory', 
    icon: TraderIcon 
  },
  { 
    id: 'weight', 
    label: 'Weighing Staff', 
    description: 'Update official weights for lots', 
    icon: ScaleIcon 
  },
  { 
    id: 'committee', 
    label: 'Market Committee', 
    description: 'Admin, Accounting & Oversight', 
    icon: CommitteeIcon 
  },
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateRole, profile } = useAuth(); // Removed 'user' as it wasn't used directly
  const navigate = useNavigate();

  // If user already has a role, redirect them
  useEffect(() => {
    if (profile?.role) {
       switch (profile.role) {
         case 'farmer': navigate('/dashboard/farmer'); break;
         case 'trader': navigate('/dashboard/trader'); break;
         case 'weight': navigate('/dashboard/committee'); break; 
         case 'committee': navigate('/dashboard/admin'); break;
         default: navigate('/dashboard');
       }
    }
  }, [profile, navigate]);

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    setError('');
    setLoading(true);

    try {
      const { error } = await updateRole(selectedRole);
      
      if (error) {
        throw error;
      }

      // Redirect based on role (Match logic in App.js)
      switch (selectedRole) {
        case 'farmer':
          navigate('/dashboard/farmer');
          break;
        case 'trader':
          navigate('/dashboard/trader');
          break;
        case 'weight':
          navigate('/dashboard/committee');
          break;        
        case 'committee':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      console.error('Role update failed:', err);
      setError('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          
          <div className="text-center mb-5 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Select Your Role</h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Choose how you want to use AgroNond
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    relative rounded-xl border p-3 sm:p-4 cursor-pointer flex items-center space-x-3 sm:space-x-4 transition-all duration-200
                    ${isSelected 
                      ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] bg-[var(--primary)]/5' 
                      : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/50 hover:bg-[var(--surface)]'
                    }
                  `}
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${isSelected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'}`}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-semibold ${isSelected ? 'text-[var(--primary)]' : 'text-gray-900'}`}>
                      {role.label}
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate">
                      {role.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-4 text-sm text-center text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            loading={loading}
            className="w-full text-base sm:text-lg py-3 sm:py-4"
          >
            {loading ? 'Setting up profile...' : 'Continue'}
          </Button>
        </div>
      </div>
    </main>
  );
}