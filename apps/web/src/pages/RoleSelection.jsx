import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

// Icons
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

const roles = [
  { id: 'farmer', label: 'Farmer', description: 'Sell your produce directly', icon: FarmerIcon },
  { id: 'trader', label: 'Trader', description: 'Buy quality produce', icon: TraderIcon },
  { id: 'committee', label: 'Market Committee', description: 'Manage APMC operations', icon: CommitteeIcon },
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateRole, user } = useAuth();
  const useNavigate_ = useNavigate();

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    setError('');
    setLoading(true);

    try {
      const { error } = await updateRole(selectedRole);
      
      if (error) {
        throw error;
      }

      // Redirect based on role
      switch (selectedRole) {
        case 'farmer':
          useNavigate_('/dashboard/farmer');
          break;
        case 'trader':
          useNavigate_('/dashboard/trader');
          break;
        case 'committee':
          useNavigate_('/dashboard/committee');
          break;
        default:
          useNavigate_('/dashboard');
      }
    } catch (err) {
      console.error('Role update failed:', err);
      setError('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Select Your Role
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose how you want to use AgroNond
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="grid grid-cols-1 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative rounded-lg border p-4 cursor-pointer flex items-center space-x-3 hover:border-emerald-500 transition-all duration-200 ${
                  isSelected 
                    ? 'border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50' 
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className={`flex-shrink-0 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className={`text-sm font-medium ${isSelected ? 'text-emerald-900' : 'text-gray-900'}`}>
                    {role.label}
                  </p>
                  <p className={`text-sm ${isSelected ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {role.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 text-sm text-center text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            className="w-full flex justify-center py-3"
          >
            {loading ? 'Setting up profile...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
