import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, ShoppingBag, Scale, Gavel, Building2,
  TrendingUp, AlertCircle, ArrowRight, Loader
} from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard';
import api from '../../lib/api';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // 1. Fetch System Metrics (Unified Admin API)
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.admin.metrics()
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Dashboard Modules Configuration
  const modules = [
    {
      title: 'Farmer Management',
      icon: Users,
      stats: `${metrics?.totalFarmers || 0} Registered`,
      link: '/dashboard/admin/farmers',
      color: 'bg-emerald-50 text-emerald-600',
      desc: 'View profiles, IDs, and crop history'
    },
    {
      title: 'Trader Management',
      icon: ShoppingBag,
      stats: `${metrics?.totalTraders || 0} Licensed`,
      link: '/dashboard/admin/traders',
      color: 'bg-blue-50 text-blue-600',
      desc: 'Manage licenses, volumes, and payments'
    },
    {
      title: 'Weight Station',
      icon: Scale,
      stats: `${metrics?.pendingWeights || 0} Pending`,
      link: '/dashboard/admin/weight',
      color: 'bg-orange-50 text-orange-600',
      desc: 'Monitor live weighing activity'
    },
    {
      title: 'Lilav (Auction)',
      icon: Gavel,
      stats: `${metrics?.activeAuctions || 0} Ready`,
      link: '/dashboard/admin/lilav',
      color: 'bg-purple-50 text-purple-600',
      desc: 'Track bids, rates, and sales'
    },
    {
      title: 'Committee',
      icon: Building2,
      stats: `₹${(metrics?.totalCommission || 0).toLocaleString()}`,
      link: '/dashboard/admin/committee',
      color: 'bg-indigo-50 text-indigo-600',
      desc: 'Market fees, commissions, and reports'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
        <p className="text-gray-500 mt-1">System-wide monitoring and management</p>
      </div>

      {/* High-Level Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          title="Total Users"
          value={metrics?.totalUsers || 0}
          subtitle="Across all roles"
        />
        <StatsCard
          icon={TrendingUp}
          title="Total Volume"
          value={`₹${(metrics?.totalVolume || 0).toLocaleString()}`}
          subtitle="Lifetime value"
        />
        <StatsCard
          icon={Building2}
          title="Commission"
          value={`₹${(metrics?.totalCommission || 0).toLocaleString()}`}
          subtitle="Total collected"
        />
        <StatsCard
          icon={AlertCircle}
          title="Pending Weights"
          value={metrics?.pendingWeights || 0}
          subtitle="Needs attention"
        />
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.title}
              onClick={() => navigate(module.link)}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${module.color}`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 text-lg">{module.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{module.desc}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</span>
                  <span className="text-sm font-bold text-slate-700">{module.stats}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
