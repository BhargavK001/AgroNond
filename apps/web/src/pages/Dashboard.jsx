import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import SystemStatus from '../components/SystemStatus';

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // No automatic redirect to prevent loops
  // If role is missing, we show a blocking UI instead
  if (!loading && user && profile && !profile.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Incomplete</h2>
          <p className="text-gray-600 mb-6">
            Please select a role to continue accessing the dashboard.
          </p>
          <Button 
            onClick={() => navigate('/login', { state: { step: 'role' } })}
            className="w-full"
          >
            Complete Setup
          </Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleInfo = (role) => {
    const roles = {
      farmer: {
        title: 'Farmer',
        description: 'Manage your crops, view market prices, and connect with traders.',
        icon: '🌾',
        color: 'bg-green-100 text-green-800',
      },
      trader: {
        title: 'Trader',
        description: 'Browse crops, place bids, and manage your purchases.',
        icon: '🏪',
        color: 'bg-blue-100 text-blue-800',
      },
      committee: {
        title: 'Market Committee',
        description: 'Oversee market operations, verify transactions, and manage disputes.',
        icon: '🏛️',
        color: 'bg-purple-100 text-purple-800',
      },
      admin: {
        title: 'Administrator',
        description: 'Full system access, user management, and platform configuration.',
        icon: '⚙️',
        color: 'bg-orange-100 text-orange-800',
      },
    };
    return roles[role] || { title: 'User', description: 'Welcome to AgroNond!', icon: '👤', color: 'bg-gray-100 text-gray-800' };
  };

  const roleInfo = getRoleInfo(profile?.role);

  return (
    <main className="min-h-screen gradient-bg-subtle py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold block">AgroNond</span>
              <span className="text-xs text-[var(--text-muted)]">Digital Mandi Platform</span>
            </div>
          </Link>
          
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-[var(--border)]">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${roleInfo.color}`}>
              {roleInfo.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back!</h1>
              <p className="text-[var(--text-secondary)]">
                Logged in as <span className="font-medium text-[var(--primary)]">{roleInfo.title}</span>
              </p>
            </div>
          </div>

          <p className="text-[var(--text-secondary)] mb-6">
            {roleInfo.description}
          </p>

          {/* User Info */}
          <div className="bg-[var(--surface)] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Phone</span>
              <span className="font-medium">{user?.phone || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Role</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                {roleInfo.title}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">User ID</span>
              <span className="font-mono text-sm text-[var(--text-muted)]">
                {user?.id?.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* System Health Check */}
        <SystemStatus />

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-[var(--border)]">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              icon="📊"
              title="Market Prices"
              description="View today's commodity prices"
              href="/market"
            />
            <QuickActionCard
              icon="📦"
              title="My Listings"
              description="Manage your crop listings"
              href="/listings"
            />
            <QuickActionCard
              icon="💬"
              title="Messages"
              description="Chat with buyers & sellers"
              href="/messages"
            />
            <QuickActionCard
              icon="📝"
              title="Transactions"
              description="View transaction history"
              href="/transactions"
            />
            <QuickActionCard
              icon="⚙️"
              title="Settings"
              description="Account preferences"
              href="/settings"
            />
            <QuickActionCard
              icon="❓"
              title="Help & Support"
              description="Get assistance"
              href="/support"
            />
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 text-center text-[var(--text-muted)] text-sm">
          <p>🚧 Dashboard features coming soon! This is a preview of the authenticated area.</p>
        </div>
      </div>
    </main>
  );
}

function QuickActionCard({ icon, title, description, href }) {
  return (
    <Link
      to={href}
      className="p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold group-hover:text-[var(--primary)] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
    </Link>
  );
}
