import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, ShoppingBag, TrendingUp, AlertCircle, ArrowRight, Package, Loader } from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard';

import { marketActivityData, topCommodities } from '../../data/mockData';
import api from '../../lib/api';
import { useRealtimeSubscription } from '../../hooks/useRealtime';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  // 1. Fetch System Metrics (Users)
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.admin.metrics()
  });

  // ✅ REALTIME: Listen for changes in 'profiles' table
  useRealtimeSubscription('dashboard-profiles', { table: 'profiles' }, (payload) => {
    console.log('Realtime update received:', payload);
    
    // Refresh metrics when a user is added, updated, or deleted
    queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    
    // Optional: Show a toast notification
    if (payload.eventType === 'INSERT') {
      toast.success('New user registered!');
    }
  });

  // 2. Fetch Financial Stats (Volume, Revenue)
  const { data: financeStats, isLoading: financeLoading } = useQuery({
    queryKey: ['finance-stats'],
    queryFn: () => api.finance.stats()
  });

  // 3. Fetch Recent Transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => api.finance.billingRecords.list({ limit: 5 })
  });

  const recentTransactions = transactionsData?.records || [];

  const isLoading = metricsLoading || financeLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          title="Total Farmers"
          value={metrics?.totalFarmers || 0}
          subtitle={`${metrics?.totalUsers || 0} total users`}
          color="emerald"
        />
        <StatsCard
          icon={ShoppingBag}
          title="Total Traders"
          value={metrics?.totalTraders || 0}
          subtitle="Registered traders"
          color="blue"
        />
        <StatsCard
          icon={TrendingUp}
          title="Total Volume"
          value={`₹${(financeStats?.totalVolume || 0).toLocaleString()}`}
          subtitle={`${financeStats?.transactionCount || 0} transactions`}
          trend="up"
          trendValue="Live"
          color="purple"
        />
        <StatsCard
          icon={AlertCircle}
          title="Pending Payments"
          value={`₹${(financeStats?.pendingAmount || 0).toLocaleString()}`}
          subtitle="Needs attention"
          color="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Market Activity Chart */}


        {/* Top Commodities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Commodities</h3>
          <div className="space-y-4">
            {topCommodities.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                    ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                      index === 1 ? 'bg-gray-100 text-gray-600' : 
                      index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.volume.toLocaleString()} kg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₹{item.avgPrice}/kg</p>
                  <p className={`text-sm ${
                    item.trend === 'up' ? 'text-emerald-600' : 
                    item.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} 
                    {item.trend === 'up' ? 'Rising' : item.trend === 'down' ? 'Falling' : 'Stable'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
          <a 
            href="/dashboard/admin/transactions"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-sm font-medium text-gray-500 pb-3">Date</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">Trader</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">Farmer</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">Crop</th>
                <th className="text-right text-sm font-medium text-gray-500 pb-3">Amount</th>
                <th className="text-right text-sm font-medium text-gray-500 pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">No recent transactions</td>
                </tr>
              ) : (
                recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 text-gray-600">
                      {new Date(txn.purchase_date || txn.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-600 font-medium">{txn.trader?.full_name || 'Unknown'}</td>
                    <td className="py-3 text-gray-600">{txn.farmer_name}</td>
                    <td className="py-3 text-gray-600">{txn.crop}</td>
                    <td className="py-3 text-right font-medium text-gray-800">
                      ₹{(txn.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                        ${txn.status === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'}`}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <p className="text-emerald-100 text-sm">Total Commission Collected</p>
          <p className="text-3xl font-bold mt-1">₹{(financeStats?.totalCommissionCollected || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">Today's Revenue</p>
          {/* Mocked for now since not in API yet */}
          <p className="text-3xl font-bold mt-1">₹0</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
          <p className="text-amber-100 text-sm">Pending Verifications</p>
           {/* Mocked for now */}
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
      </div>
    </div>
  );
}
