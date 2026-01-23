import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

// Mock Data for Purchases
const purchaseHistory = [
  { id: 1, date: '2026-01-20', lotId: 'LOT-2026-001', crop: 'Tomato (Hybrid)', quantity: 500, rate: 40, status: 'Paid' },
  { id: 2, date: '2026-01-18', lotId: 'LOT-2026-002', crop: 'Onion (Red)', quantity: 1200, rate: 15, status: 'Pending' },
  { id: 3, date: '2026-01-15', lotId: 'LOT-2026-003', crop: 'Potato', quantity: 800, rate: 22, status: 'Paid' },
  { id: 4, date: '2026-01-12', lotId: 'LOT-2026-004', crop: 'Okra', quantity: 300, rate: 35, status: 'Paid' },
  { id: 5, date: '2026-01-10', lotId: 'LOT-2026-005', crop: 'Cabbage', quantity: 600, rate: 12, status: 'Overdue' },
];

export default function TraderDashboard() {
  // Calculate Totals
  const totalQuantity = purchaseHistory.reduce((acc, item) => acc + item.quantity, 0);
  const totalBaseAmount = purchaseHistory.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const commissionRate = 0.09;
  const totalCommission = totalBaseAmount * commissionRate;
  const totalSpent = totalBaseAmount + totalCommission;

  const pendingPayments = purchaseHistory
    .filter(item => item.status === 'Pending' || item.status === 'Overdue')
    .reduce((acc, item) => acc + (item.quantity * item.rate * (1 + commissionRate)), 0);

  // Single Color Theme - Emerald / Slate Icons
  const stats = [
    { label: 'Total Purchased', value: totalQuantity, unit: 'kg', icon: '🥗' },
    { label: 'Total Spend', value: totalSpent, unit: '₹', icon: '💰', isCurrency: true },
    { label: 'Commission (9%)', value: totalCommission, unit: '₹', icon: '🧾', isCurrency: true },
    { label: 'Pending Payments', value: pendingPayments, unit: '₹', icon: '⏳', isCurrency: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Dashboard
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Trader Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your market activity and finances</p>
      </div>

      {/* Stats Grid - Professional Clean Look */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="text-2xl">{stat.icon}</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                {stat.isCurrency && <span className="text-lg font-bold text-slate-900">₹</span>}
                <span className="text-2xl font-bold text-slate-900">
                  <AnimatedCounter value={stat.value} duration={1500} />
                </span>
                {!stat.isCurrency && <span className="text-sm font-medium text-slate-400 ml-1">{stat.unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Purchases Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Purchases</h2>
            <p className="text-slate-500 text-sm">Track your orders and invoices</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm">
              Export Report
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Date</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Lot ID</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Crop</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600">Qty (kg)</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600">Rate/kg</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600">Total (inc. 9%)</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseHistory.map((item) => {
                const baseCost = item.quantity * item.rate;
                const tax = baseCost * 0.09;
                const total = baseCost + tax;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">{item.lotId}</td>
                    <td className="px-5 py-4 text-slate-600">{item.crop}</td>
                    <td className="px-5 py-4 text-right font-medium text-slate-700">{item.quantity.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-right text-slate-600">₹{item.rate}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-bold text-slate-900">₹{Math.round(total).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">Base + 9%</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium text-xs hover:underline">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3 p-3">
          {purchaseHistory.map((item) => {
            const baseCost = item.quantity * item.rate;
            const tax = baseCost * 0.09;
            const total = baseCost + tax;
            return (
              <div key={item.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{item.lotId}</h3>
                    <p className="text-xs text-slate-500">{item.crop}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2 mt-2">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-slate-900">₹{Math.round(total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
