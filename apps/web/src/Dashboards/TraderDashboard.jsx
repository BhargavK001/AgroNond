import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import { Card, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

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
  const commissionRate = 0.09;
  const totalCommission = totalBaseAmount * commissionRate;
  const totalSpent = totalBaseAmount + totalCommission;
  
  const pendingPayments = purchaseHistory
    .filter(item => item.status === 'Pending' || item.status === 'Overdue')
    .reduce((acc, item) => acc + (item.quantity * item.rate * (1 + commissionRate)), 0);

  const stats = [
    { label: 'Total Purchased', value: totalQuantity, unit: 'kg', icon: '🥗', color: 'from-emerald-400 to-emerald-600', bgLight: 'bg-emerald-50' },
    { label: 'Total Spend', value: totalSpent, unit: '₹', icon: '💰', color: 'from-blue-400 to-blue-600', bgLight: 'bg-blue-50', isCurrency: true },
    { label: 'Commission (9%)', value: totalCommission, unit: '₹', icon: '🧾', color: 'from-violet-400 to-violet-600', bgLight: 'bg-violet-50', isCurrency: true },
    { label: 'Pending Payments', value: pendingPayments, unit: '₹', icon: '⏳', color: 'from-amber-400 to-amber-600', bgLight: 'bg-amber-50', isCurrency: true },
  ];

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Dashboard
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Trader Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-0.5 sm:mt-1">Overview of your market activity and finances</p>
      </motion.div>



      {/* Stats Grid - 2 columns on mobile for better visibility */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.08, type: 'spring', stiffness: 200 }}
            whileHover={{ y: -4 }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all h-full">
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.bgLight} flex items-center justify-center text-lg sm:text-2xl`}>
                  {stat.icon}
                </div>
                {stat.label === 'Commission (9%)' && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] sm:text-xs font-bold">
                    9%
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1 line-clamp-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-0.5 sm:gap-1 text-lg sm:text-2xl font-bold text-slate-800">
                {stat.isCurrency && <span className="text-sm sm:text-lg">₹</span>}
                <AnimatedCounter value={stat.value} duration={2000} />
                {!stat.isCurrency && <span className="text-xs sm:text-lg text-slate-400 font-medium">{stat.unit}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Purchases Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Recent Purchases</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Track your orders, payments, and invoices</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors">
                Filter
              </button>
              <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg sm:rounded-xl transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto p-4">
          <Table aria-label="Recent purchases table" removeWrapper>
            <TableHeader>
              <TableColumn>DATE</TableColumn>
              <TableColumn>FARMER</TableColumn>
              <TableColumn>CROP DETAIL</TableColumn>
              <TableColumn align="end">QTY (KG)</TableColumn>
              <TableColumn align="end">RATE/KG</TableColumn>
              <TableColumn align="end">TOTAL (INC. 9%)</TableColumn>
              <TableColumn align="center">STATUS</TableColumn>
              <TableColumn align="center">ACTION</TableColumn>
            </TableHeader>
            <TableBody>
              {purchaseHistory.map((item, index) => {
                const baseCost = item.quantity * item.rate;
                const tax = baseCost * 0.09;
                const total = baseCost + tax;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-slate-600 font-medium">
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{item.farmer}</div>
                      <div className="text-xs text-slate-400">ID: FARM-{1000 + item.id}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-xs">
                        {item.crop}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-600">{item.quantity}</TableCell>
                    <TableCell className="text-right text-slate-600">₹{item.rate}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-bold text-emerald-600">₹{Math.round(total).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">Base: ₹{baseCost.toLocaleString()} + 9%</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                        item.status === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : item.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Paid' ? 'bg-emerald-500' : item.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-3">
          {purchaseHistory.map((item, index) => {
            const baseCost = item.quantity * item.rate;
            const tax = baseCost * 0.09;
            const total = baseCost + tax;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <h3 className="font-bold text-sm text-slate-800">{item.farmer}</h3>
                    <p className="text-xs text-emerald-600 font-medium">{item.crop}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : item.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'Paid' ? 'bg-emerald-500' : item.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase">Qty</p>
                    <p className="font-bold text-xs">{item.quantity} <span className="text-[9px] font-normal">kg</span></p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase">Rate</p>
                    <p className="font-bold text-xs">₹{item.rate}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase">Total</p>
                    <p className="font-bold text-xs text-emerald-600">₹{Math.round(total).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Invoice
                </button>
              </motion.div>
            );
          })}
        </div>
        
        <div className="p-3 sm:p-4 bg-slate-50 text-center border-t border-slate-100">
          <button className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700">
            View All Transactions →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
