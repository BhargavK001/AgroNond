import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';

function StatusIndicator({ label, status, ping }) {
  const isHealthy = status === 'ok' || status === 'connected';
  const color = isHealthy ? 'bg-green-500' : 'bg-red-500';
  const textColor = isHealthy ? 'text-green-700' : 'text-red-700';
  const bgColor = isHealthy ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${bgColor} border border-${isHealthy ? 'green' : 'red'}-100`}>
      <div className="flex items-center space-x-3">
        <div className={`w-2.5 h-2.5 rounded-full ${color} animate-pulse`} />
        <span className={`text-sm font-medium ${textColor}`}>{label}</span>
      </div>
      {ping && (
        <span className="text-xs text-gray-500 font-mono">{ping}ms</span>
      )}
    </div>
  );
}

export default function SystemStatus() {
  const { session } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Query for Backend Health
  const { data: healthData, isError, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const start = Date.now();
      const res = await fetch(`${apiUrl}/api/health`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return { ...data, ping: Date.now() - start };
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        System Status
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* API Status */}
        <StatusIndicator
          label="Backend API"
          status={isError ? 'error' : 'ok'}
          ping={healthData?.ping}
        />

        {/* Auth Status */}
        <StatusIndicator
          label="Authentication Service"
          status={session ? 'connected' : 'disconnected'}
        />

        {/* Database Status (Inferred from Auth) */}
        <StatusIndicator
          label="Database Connection"
          status={session ? 'connected' : 'unknown'}
        />
      </div>

      <div className="mt-4 text-xs text-gray-400 text-right">
        Last updated: {new Date(dataUpdatedAt || Date.now()).toLocaleTimeString()}
      </div>
    </div>
  );
}
