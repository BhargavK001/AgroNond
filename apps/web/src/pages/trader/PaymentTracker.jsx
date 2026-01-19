import { useState } from 'react';
import { motion } from 'framer-motion';

const payments = [
  { id: 1, farmer: 'Ramesh Patil', amount: 45000, date: '20-Jan-2026', status: 'Paid', crop: 'Tomato' },
  { id: 2, farmer: 'Suresh Deshmukh', amount: 12500, date: '18-Jan-2026', status: 'Pending', crop: 'Onion' },
  { id: 3, farmer: 'Vijay Kumar', amount: 8200, date: '15-Jan-2026', status: 'Overdue', crop: 'Potato' },
  { id: 4, farmer: 'Anil Jadhav', amount: 32000, date: '10-Jan-2026', status: 'Paid', crop: 'Cabbage' },
  { id: 5, farmer: 'Jay Kisan', amount: 15000, date: '05-Jan-2026', status: 'Pending', crop: 'Okra' },
];

const tabs = ['All', 'Pending', 'Completed'];

export default function PaymentTracker() {
  const [activeTab, setActiveTab] = useState('All');
  
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pending' || p.status === 'Overdue').reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = payments.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return p.status === 'Pending' || p.status === 'Overdue';
    if (activeTab === 'Completed') return p.status === 'Paid';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Payment Tracker
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Transactions</h1>
        </div>
        
        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-emerald-600 font-medium">Paid</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-700 truncate">₹{totalPaid.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-amber-600 font-medium">Pending</p>
              <p className="text-lg sm:text-xl font-bold text-amber-700 truncate">₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Tabs Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">Recent Transactions</h2>
          
          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl sm:rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all ${
                  activeTab === tab ? 'text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activePaymentTab"
                    className="absolute inset-0 bg-emerald-600 rounded-lg sm:rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="divide-y divide-slate-100">
          {filteredPayments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 sm:p-5 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md shrink-0">
                    {payment.farmer.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-slate-800 truncate group-hover:text-emerald-700 transition-colors">{payment.farmer}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] sm:text-xs text-slate-400">{payment.date}</span>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">{payment.crop}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-slate-800">₹{payment.amount.toLocaleString('en-IN')}</p>
                  </div>
                  
                  <span className={`hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-medium ${
                    payment.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : payment.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {payment.status}
                  </span>
                  
                  {/* Mobile Status Dot */}
                  <span className={`sm:hidden w-3 h-3 rounded-full ${
                    payment.status === 'Paid' ? 'bg-emerald-500' 
                    : payment.status === 'Pending' ? 'bg-amber-500'
                    : 'bg-red-500'
                  }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
