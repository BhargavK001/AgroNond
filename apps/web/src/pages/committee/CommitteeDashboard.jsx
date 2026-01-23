import { useState } from 'react';
import { motion } from 'framer-motion'; // Kept for simple fade-in only
import { Users, ShoppingBag, TrendingUp, AlertCircle, ArrowRight, Wallet, IndianRupee } from 'lucide-react';
import AnimatedCounter from '../../components/AnimatedCounter';

// Mock data
const mockMetrics = {
  totalFarmers: 156,
  totalTraders: 42,
  totalVolume: 2850000,
  pendingPayments: 125000,
  receivedPayments: 2725000,
  farmerCommission: 114000, // 4%
  traderCommission: 256500, // 9%
  totalCommission: 370500,
};

const recentTransactions = [
  { id: 1, date: '2026-01-21', farmer: 'Ramesh Kumar', trader: 'Sharma Traders', crop: 'Tomato', qty: 500, amount: 20000, status: 'Paid' },
  { id: 2, date: '2026-01-20', farmer: 'Suresh Patel', trader: 'Gupta & Sons', crop: 'Onion', qty: 1200, amount: 18000, status: 'Pending' },
  { id: 3, date: '2026-01-19', farmer: 'Mahesh Singh', trader: 'Fresh Mart', crop: 'Potato', qty: 800, amount: 17600, status: 'Paid' },
  { id: 4, date: '2026-01-18', farmer: 'Dinesh Yadav', trader: 'Sharma Traders', crop: 'Cabbage', qty: 600, amount: 7200, status: 'Paid' },
  { id: 5, date: '2026-01-17', farmer: 'Ganesh Thakur', trader: 'City Grocers', crop: 'Cauliflower', qty: 400, amount: 12000, status: 'Pending' },
];

// Unified Theme - All Stats use consistent Emerald/Slate styling
const stats = [
  { label: 'Total Farmers', value: mockMetrics.totalFarmers, icon: Users, isCurrency: false },
  { label: 'Total Traders', value: mockMetrics.totalTraders, icon: ShoppingBag, isCurrency: false },
  { label: 'Total Volume (Kg)', value: mockMetrics.totalVolume, icon: TrendingUp, isCurrency: false },
  { label: 'Pending Payments', value: mockMetrics.pendingPayments, icon: AlertCircle, isCurrency: true },
];

export default function CommitteeDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header - Clean & Simple */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Live Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Committee Dashboard</h1>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Grid - Professional Monotone */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                {stat.isCurrency && <span className="text-lg font-bold text-slate-900">₹</span>}
                <span className="text-2xl font-bold text-slate-900">
                  <AnimatedCounter value={stat.value} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Recent Transactions</h3>
            <a href="/dashboard/committee/billing" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Date</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Farmer</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Trader</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Details</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Amount</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-600">{new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{txn.farmer}</td>
                    <td className="px-5 py-3.5 text-slate-600">{txn.trader}</td>
                    <td className="px-5 py-3.5 text-slate-500">{txn.crop} ({txn.qty}kg)</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">₹{txn.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${txn.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary Column */}
        <div className="space-y-6">
          {/* Cash Flow */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Cash Flow Overview</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 uppercase">Received Payments</p>
                    <p className="text-lg font-bold text-emerald-900">₹{mockMetrics.receivedPayments.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Pending Due</p>
                    <p className="text-lg font-bold text-slate-900">₹{mockMetrics.pendingPayments.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Commission Revenue</h3>
            <div className="mb-5 text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm font-medium text-emerald-600 mb-1">Total Collected</p>
              <p className="text-3xl font-bold text-emerald-700">₹{mockMetrics.totalCommission.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">From Farmers (4%)</p>
                <p className="font-bold text-slate-900">₹{mockMetrics.farmerCommission.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">From Traders (9%)</p>
                <p className="font-bold text-slate-900">₹{mockMetrics.traderCommission.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
