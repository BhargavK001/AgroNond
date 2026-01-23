import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, Wifi, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Zap, ShieldCheck, Globe, Clock, Cpu } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StatusPage = () => {
  const [realData, setRealData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setRealData(data);
      if (!isSimulating) setDisplayData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (!isSimulating) fetchStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handle Simulation Toggle
  useEffect(() => {
    if (isSimulating) {
      const fakeData = {
        system: {
          uptime: 12345,
          timestamp: new Date().toISOString(),
          nodeVersion: 'v20.0.0 (Simulated)',
          memory: { rss: 1024 * 1024 * 128 }
        },
        services: {
          database: { status: 'healthy', latency: 45 },
          server: { status: 'healthy', latency: 20 }
        },
        environment: {
          SUPABASE_URL: true,
          BREVO_API_KEY: false,
          FRONTEND_URL: true,
          NODE_ENV: 'simulation'
        },
        apiRoutes: [
          { name: 'Authentication', path: '/api/users', status: 'healthy' },
          { name: 'Contact Form', path: '/api/contact', status: 'offline' },
          { name: 'Admin Operations', path: '/api/admin', status: 'degraded' },
          { name: 'Health Check', path: '/api/health', status: 'healthy' }
        ]
      };
      setDisplayData(fakeData);
    } else {
      setDisplayData(realData);
    }
  }, [isSimulating, realData]);

  const StatusBadge = ({ status }) => {
    const config = {
      healthy: { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: CheckCircle2, text: 'Operational' },
      degraded: { color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200', icon: Activity, text: 'Degraded' },
      offline: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', icon: XCircle, text: 'Outage' },
      unknown: { color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', icon: Activity, text: 'Unknown' },
      error: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', icon: AlertTriangle, text: 'Error' },
    };
    const style = config[status] || config.unknown;
    const Icon = style.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${style.bg} ${style.border} ${style.color}`}>
        <Icon size={14} className={status !== 'healthy' ? 'animate-pulse' : ''} />
        <span className="text-xs font-bold uppercase tracking-wider">{style.text}</span>
      </div>
    );
  };

  const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );

  if (loading && !displayData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-green-600" size={32} />
          <p className="text-gray-600 font-medium">Checking system status...</p>
        </div>
      </div>
    );
  }

  // Fallback if data is totally missing/failed
  if (!displayData) {
     return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-6 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="text-red-600" size={32} />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">System Unreachable</h2>
             <p className="text-gray-600 mb-8 max-w-md">Could not connect to the backend health service. The server might be down or unreachable.</p>
             <button onClick={fetchStatus} className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">Retry Connection</button>
        </div>
     )
  }

  const isAllHealthy = Object.values(displayData.services).every(s => s.status === 'healthy');

  return (
    // Added pt-28 to clear fixed navbar
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pt-20 sm:pt-28 pb-12 sm:pb-20 px-3 sm:px-4 md:px-8">
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAllHealthy ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${isAllHealthy ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-500 tracking-widest uppercase">System Status</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1 sm:mb-2">
              Platform Health
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl">
              Live monitoring of AgroNond's services, API availability, and system performance.
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 bg-white p-1 sm:p-1.5 rounded-lg border border-gray-200 shadow-sm self-start">
             <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isSimulating 
                    ? 'bg-indigo-50 text-indigo-700 bg-opacity-100' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
             >
                <Zap size={14} className={`sm:w-4 sm:h-4 ${isSimulating ? 'fill-current' : ''}`} />
                <span className="hidden xs:inline">{isSimulating ? 'Demo Mode (Active)' : 'Demo Mode'}</span>
                <span className="xs:hidden">{isSimulating ? 'Demo' : 'Demo'}</span>
             </button>
             <div className="h-4 w-px bg-gray-200"></div>
             <button 
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                title="Refresh Status"
             >
                <RefreshCw size={14} className={`sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>
        </div>

        {/* Global Status Banner */}
        <div className={`mb-6 sm:mb-10 p-4 sm:p-6 rounded-xl border flex items-start sm:items-center gap-3 sm:gap-4 shadow-sm ${
            isAllHealthy
            ? 'bg-white border-green-200 border-l-4 border-l-green-500'
            : 'bg-white border-yellow-200 border-l-4 border-l-yellow-500'
        }`}>
           <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
               isAllHealthy ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
           }`}>
               {isAllHealthy ? <CheckCircle2 size={20} className="sm:w-7 sm:h-7" /> : <AlertTriangle size={20} className="sm:w-7 sm:h-7" />}
           </div>
           <div>
               <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                   {isAllHealthy ? 'All Systems Operational' : 'Performance Issues Detected'}
               </h3>
               <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">
                   {isAllHealthy
                   ? 'All services are running smoothly. No incidents reported.' 
                   : 'Some systems are experiencing degraded performance. Our team is investigating.'}
               </p>
           </div>
        </div>

        {/* Core Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            
            {/* Database Card */}
            <Card className="flex flex-col h-full border-t-4 border-t-blue-500">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Database size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Database</h3>
                    </div>
                    <StatusBadge status={displayData.services.database.status} />
                </div>
                
                <div className="mt-auto space-y-4">
                    {/* Error Message Display */}
                    {displayData.services.database.error && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100 mb-2">
                           <p className="text-xs text-red-600 font-mono break-words">
                              {displayData.services.database.error}
                           </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                             <Clock size={14} /> Latency
                        </span>
                        <span className={`font-mono font-bold ${
                            displayData.services.database.latency > 200 ? 'text-yellow-600' : 'text-gray-900'
                        }`}>
                            {displayData.services.database.latency}ms
                        </span>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                            <span>Connection Pool</span>
                            <span className="text-green-600">Healthy</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Server Card */}
            <Card className="flex flex-col h-full border-t-4 border-t-purple-500">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Server size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">API Server</h3>
                    </div>
                    <StatusBadge status={displayData.services.server.status} />
                </div>

                <div className="mt-auto space-y-4">
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                             <Clock size={14} /> Uptime
                        </span>
                        <span className="font-mono font-bold text-gray-900">
                            {Math.floor(displayData.system.uptime / 60)}m
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                             <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Cpu size={12}/> Memory</p>
                             <p className="text-sm font-bold text-gray-900">{Math.round(displayData.system.memory.rss / 1024 / 1024)} MB</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                             <p className="text-xs text-gray-500 mb-1">Node</p>
                             <p className="text-sm font-bold text-gray-900">{displayData.system.nodeVersion}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Environment Card */}
            <Card className="flex flex-col h-full border-t-4 border-t-orange-500">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Environment</h3>
                    </div>
                    {Object.values(displayData.environment).every(x => x) ? (
                        <div className="bg-green-100 text-green-700 p-1.5 rounded-full"><CheckCircle2 size={20}/></div>
                    ) : (
                         <div className="bg-red-100 text-red-700 p-1.5 rounded-full"><AlertTriangle size={20}/></div>
                    )}
                </div>

                <div className="mt-auto space-y-2">
                   {Object.entries(displayData.environment).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                         <span className="text-sm text-gray-600 font-mono tracking-tight">{key.split('_').slice(0,2).join('_')}</span>
                         {value ? (
                             <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                OK
                             </span>
                         ) : (
                             <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                MISSING
                             </span>
                         )}
                      </div>
                   ))}
                </div>
            </Card>
        </div>

        </div>

      </div>
    
  );
};

export default StatusPage;
