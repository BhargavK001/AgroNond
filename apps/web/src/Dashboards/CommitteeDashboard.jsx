import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, TrendingUp, AlertCircle, ArrowRight, Wallet, IndianRupee } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';

// Mock data for the committee dashboard
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

const stats = [
  { label: 'Total Farmers', value: mockMetrics.totalFarmers, icon: Users, color: 'emerald', bgLight: 'bg-emerald-50' },
  { label: 'Total Traders', value: mockMetrics.totalTraders, icon: ShoppingBag, color: 'blue', bgLight: 'bg-blue-50' },
  { label: 'Total Volume', value: mockMetrics.totalVolume, icon: TrendingUp, color: 'purple', bgLight: 'bg-purple-50', isCurrency: true },
  { label: 'Pending Payments', value: mockMetrics.pendingPayments, icon: AlertCircle, color: 'amber', bgLight: 'bg-amber-50', isCurrency: true },
];

export default function CommitteeDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Dashboard
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Committee Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-0.5 sm:mt-1">Overview of market activity and financial metrics</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 200 }}
            whileHover={{ y: -4 }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all h-full">
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.bgLight} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1 line-clamp-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-0.5 sm:gap-1 text-lg sm:text-2xl font-bold text-slate-800">
                {stat.isCurrency && <span className="text-sm sm:text-lg">₹</span>}
                <AnimatedCounter value={stat.value} duration={2000} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions - Spans 2 columns */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
            <a 
              href="/dashboard/committee/billing"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 pb-3 uppercase">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 pb-3 uppercase">Farmer</th>
                  <th className="text-left text-xs font-semibold text-slate-500 pb-3 uppercase">Trader</th>
                  <th className="text-left text-xs font-semibold text-slate-500 pb-3 uppercase">Crop</th>
                  <th className="text-right text-xs font-semibold text-slate-500 pb-3 uppercase">Amount</th>
                  <th className="text-right text-xs font-semibold text-slate-500 pb-3 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 text-sm text-slate-600">
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 text-sm font-medium text-slate-800">{txn.farmer}</td>
                    <td className="py-3 text-sm text-slate-600">{txn.trader}</td>
                    <td className="py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                        {txn.crop}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-slate-800">₹{txn.amount.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        txn.status === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {recentTransactions.slice(0, 4).map((txn, index) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                    <h3 className="font-bold text-sm text-slate-800">{txn.farmer}</h3>
                    <p className="text-xs text-slate-500">{txn.trader}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    txn.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {txn.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                    {txn.crop} • {txn.qty}kg
                  </span>
                  <span className="font-bold text-emerald-600">₹{txn.amount.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cash Flow Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Cash Flow</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium">Received</span>
                  <p className="text-xl font-bold text-slate-800">₹{mockMetrics.receivedPayments.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium">Pending</span>
                  <p className="text-xl font-bold text-slate-800">₹{mockMetrics.pendingPayments.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Commission Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Commission</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">₹{mockMetrics.totalCommission.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Collected this period</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-sky-200 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-500">Farmer Commission</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">₹{mockMetrics.farmerCommission.toLocaleString()}</p>
          <p className="text-xs text-sky-600 font-medium mt-1">@ 4% rate</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-500">Trader Commission</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">₹{mockMetrics.traderCommission.toLocaleString()}</p>
          <p className="text-xs text-violet-600 font-medium mt-1">@ 9% rate</p>
        </motion.div>
      </div>
    </div>
  );
}
