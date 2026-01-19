import { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import AnimatedCounter from '../components/AnimatedCounter';
import TraderNavbar from '../components/TraderNavbar';

// Mock Data for Purchases
const purchaseHistory = [
  { id: 1, date: '2026-01-20', farmer: 'Jay Kisan', crop: 'Tomato (Hybrid)', quantity: 500, rate: 40, status: 'Paid' },
  { id: 2, date: '2026-01-18', farmer: 'Ramesh Patil', crop: 'Onion (Red)', quantity: 1200, rate: 15, status: 'Pending' },
  { id: 3, date: '2026-01-15', farmer: 'Suresh Deshmukh', crop: 'Potato', quantity: 800, rate: 22, status: 'Paid' },
  { id: 4, date: '2026-01-12', farmer: 'Vijay Kumar', crop: 'Okra', quantity: 300, rate: 35, status: 'Paid' },
  { id: 5, date: '2026-01-10', farmer: 'Anil Jadhav', crop: 'Cabbage', quantity: 600, rate: 12, status: 'Overdue' },
];

export default function TraderDashboard() {
  // Calculate Totals
  const totalQuantity = purchaseHistory.reduce((acc, item) => acc + item.quantity, 0);
  const totalBaseAmount = purchaseHistory.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const commissionRate = 0.09; // 9%
  const totalCommission = totalBaseAmount * commissionRate;
  const totalSpent = totalBaseAmount + totalCommission;
  
  const pendingPayments = purchaseHistory
    .filter(item => item.status === 'Pending' || item.status === 'Overdue')
    .reduce((acc, item) => acc + (item.quantity * item.rate * (1 + commissionRate)), 0);

  const stats = [
    { label: 'Total Purchased', value: totalQuantity, unit: 'kg', icon: '🥗', color: 'from-green-500 to-emerald-600' },
    { label: 'Total Spend', value: totalSpent, unit: '₹', icon: '💰', color: 'from-blue-500 to-indigo-600', isCurrency: true },
    { label: 'Commission (9%)', value: totalCommission, unit: '₹', icon: '🧾', color: 'from-purple-500 to-violet-600', isCurrency: true },
    { label: 'Pending Payments', value: pendingPayments, unit: '₹', icon: '⏳', color: 'from-orange-500 to-red-600', isCurrency: true },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-50)] font-sans selection:bg-[var(--primary-200)] relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[var(--primary)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-[var(--accent)]/5 rounded-full blur-[100px]" />
      </div>

      <TraderNavbar />

      <main className="container pt-28 md:pt-32 pb-12 relative z-10">
        
        {/* Header Section */}
        <ScrollReveal variant="fadeDown">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
              Welcome back, <span className="gradient-text">Trader!</span> 👋
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">
              Here is an overview of your recent market activity and finances.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <motion.div 
                whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}
                className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm p-6 group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-[var(--surface)] text-2xl shadow-inner">
                      {stat.icon}
                    </div>
                    {stat.label === 'Commission (9%)' && (
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                        9% Applied
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-1 text-3xl font-bold text-[var(--text-primary)]">
                      {stat.isCurrency && <span className="text-xl">₹</span>}
                      <AnimatedCounter value={stat.value} duration={2000} />
                      {!stat.isCurrency && <span className="text-xl text-[var(--text-muted)] font-medium">{stat.unit}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Recent Purchases Section */}
        <ScrollReveal variant="fadeUp" delay={0.2}>
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg overflow-hidden">
            <div className="p-6 md:p-8 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Recent Purchases</h2>
                <p className="text-[var(--text-secondary)] text-sm">Track your orders, payments, and invoices.</p>
              </div>
              <div className="flex gap-3">
                 <button className="px-4 py-2 rounded-xl bg-white border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--surface-muted)] transition-colors shadow-sm">
                   Filter
                 </button>
                 <button className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-600)] transition-colors shadow-lg shadow-[var(--primary)]/20">
                   Export Report
                 </button>
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface)]/50 text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    <th className="p-5 font-semibold">Date</th>
                    <th className="p-5 font-semibold">Farmer</th>
                    <th className="p-5 font-semibold">Crop Detail</th>
                    <th className="p-5 font-semibold text-right">Qty (Kg)</th>
                    <th className="p-5 font-semibold text-right">Rate/Kg</th>
                    <th className="p-5 font-semibold text-right">Total (Inc. 9%)</th>
                    <th className="p-5 font-semibold text-center">Status</th>
                    <th className="p-5 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-sm">
                  {purchaseHistory.map((item, index) => {
                     const baseCost = item.quantity * item.rate;
                     const tax = baseCost * 0.09;
                     const total = baseCost + tax;
                     
                     return (
                      <tr key={item.id} className="hover:bg-[var(--surface)]/60 transition-colors group">
                        <td className="p-5 text-[var(--text-secondary)] font-medium">
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-5">
                          <div className="font-semibold text-[var(--text-primary)]">{item.farmer}</div>
                          <div className="text-xs text-[var(--text-muted)]">ID: FARM-{1000 + item.id}</div>
                        </td>
                        <td className="p-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-muted)] text-[var(--text-primary)] font-medium text-xs border border-[var(--border)]">
                            {item.crop}
                          </span>
                        </td>
                        <td className="p-5 text-right font-medium text-[var(--text-secondary)]">
                          {item.quantity}
                        </td>
                        <td className="p-5 text-right text-[var(--text-secondary)]">
                          ₹{item.rate}
                        </td>
                        <td className="p-5 text-right">
                          <div className="font-bold text-[var(--primary)]">₹{total.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">Base: ₹{baseCost.toLocaleString()} + 9%</div>
                        </td>
                        <td className="p-5 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                            item.status === 'Paid' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : item.status === 'Pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                               item.status === 'Paid' ? 'bg-green-500' : item.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            {item.status}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            className="p-2 text-[var(--primary)] hover:bg-[var(--primary-50)] rounded-xl transition-colors tooltip"
                            title="Download Invoice"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {purchaseHistory.map((item) => {
                 const baseCost = item.quantity * item.rate;
                 const tax = baseCost * 0.09;
                 const total = baseCost + tax;
                 return (
                  <div key={item.id} className="bg-[var(--surface)]/50 border border-[var(--border)] rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-[var(--text-muted)] font-medium mb-1">
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <h3 className="font-bold text-[var(--text-primary)]">{item.farmer}</h3>
                        <p className="text-sm text-[var(--primary)] font-medium">{item.crop}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                         item.status === 'Paid' 
                           ? 'bg-green-50 text-green-700 border-green-200' 
                           : item.status === 'Pending'
                             ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                             : 'bg-red-50 text-red-700 border-red-200'
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Paid' ? 'bg-green-500' : item.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                         }`} />
                         {item.status}
                       </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                       <div className="bg-white p-2 rounded-xl border border-[var(--border)]">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase">Qty</p>
                          <p className="font-bold text-sm">{item.quantity} <span className="text-[10px] font-normal">kg</span></p>
                       </div>
                       <div className="bg-white p-2 rounded-xl border border-[var(--border)]">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase">Rate</p>
                          <p className="font-bold text-sm">₹{item.rate}</p>
                       </div>
                       <div className="bg-white p-2 rounded-xl border border-[var(--border)]">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase">Total</p>
                          <p className="font-bold text-sm text-[var(--primary)]">₹{Math.round(total).toLocaleString('en-IN')}</p>
                       </div>
                    </div>

                    <button className="w-full py-2.5 rounded-xl border border-[var(--primary)] text-[var(--primary)] font-semibold text-sm hover:bg-[var(--primary-50)] transition-colors flex items-center justify-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                       </svg>
                       Download Invoice
                    </button>
                  </div>
                 );
              })}
            </div>
            
            <div className="p-4 bg-[var(--surface)]/30 text-center border-t border-[var(--border)]">
              <button className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-700)] transition-colors">
                View All Transactions &rarr;
              </button>
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
