import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, Calendar, Users, ShoppingBag } from 'lucide-react';

// Mock billing data
const farmerBillingData = [
  { id: 1, date: '2026-01-21', name: 'Ramesh Kumar', crop: 'Tomato', qty: 500, baseAmount: 20000, commission: 800, finalAmount: 19200, status: 'Paid' },
  { id: 2, date: '2026-01-20', name: 'Suresh Patel', crop: 'Onion', qty: 1200, baseAmount: 18000, commission: 720, finalAmount: 17280, status: 'Pending' },
  { id: 3, date: '2026-01-19', name: 'Mahesh Singh', crop: 'Potato', qty: 800, baseAmount: 17600, commission: 704, finalAmount: 16896, status: 'Paid' },
  { id: 4, date: '2026-01-18', name: 'Dinesh Yadav', crop: 'Cabbage', qty: 600, baseAmount: 7200, commission: 288, finalAmount: 6912, status: 'Paid' },
  { id: 5, date: '2026-01-17', name: 'Ganesh Thakur', crop: 'Cauliflower', qty: 400, baseAmount: 12000, commission: 480, finalAmount: 11520, status: 'Pending' },
];

const traderBillingData = [
  { id: 1, date: '2026-01-21', name: 'Sharma Traders', crop: 'Tomato', qty: 500, baseAmount: 20000, commission: 1800, finalAmount: 21800, status: 'Paid' },
  { id: 2, date: '2026-01-20', name: 'Gupta & Sons', crop: 'Onion', qty: 1200, baseAmount: 18000, commission: 1620, finalAmount: 19620, status: 'Pending' },
  { id: 3, date: '2026-01-19', name: 'Fresh Mart', crop: 'Potato', qty: 800, baseAmount: 17600, commission: 1584, finalAmount: 19184, status: 'Paid' },
  { id: 4, date: '2026-01-18', name: 'Sharma Traders', crop: 'Cabbage', qty: 600, baseAmount: 7200, commission: 648, finalAmount: 7848, status: 'Paid' },
  { id: 5, date: '2026-01-17', name: 'City Grocers', crop: 'Cauliflower', qty: 400, baseAmount: 12000, commission: 1080, finalAmount: 13080, status: 'Pending' },
];

export default function BillingReports() {
  const [activeTab, setActiveTab] = useState('farmers');
  const [dateFilter, setDateFilter] = useState('all');

  const currentData = activeTab === 'farmers' ? farmerBillingData : traderBillingData;
  const commissionLabel = activeTab === 'farmers' ? '4%' : '9%';
  const commissionColor = activeTab === 'farmers' ? 'blue' : 'purple';

  const totalBase = currentData.reduce((acc, item) => acc + item.baseAmount, 0);
  const totalCommission = currentData.reduce((acc, item) => acc + item.commission, 0);
  const totalFinal = currentData.reduce((acc, item) => acc + item.finalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Billing Reports</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">View billing reports for farmers and traders</p>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit"
      >
        <button
          onClick={() => setActiveTab('farmers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'farmers'
              ? 'bg-white shadow-sm text-emerald-700'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Farmer Reports
        </button>
        <button
          onClick={() => setActiveTab('traders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'traders'
              ? 'bg-white shadow-sm text-emerald-700'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Trader Reports
        </button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
        >
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Base Amount</p>
          <p className="text-2xl font-bold text-slate-800">₹{totalBase.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`bg-${commissionColor}-50 rounded-xl p-4 border border-${commissionColor}-100`}
        >
          <p className={`text-xs text-${commissionColor}-600 font-medium uppercase mb-1`}>Commission ({commissionLabel})</p>
          <p className={`text-2xl font-bold text-${commissionColor}-700`}>₹{totalCommission.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"
        >
          <p className="text-xs text-emerald-600 font-medium uppercase mb-1">
            {activeTab === 'farmers' ? 'Net Payable' : 'Total Receivable'}
          </p>
          <p className="text-2xl font-bold text-emerald-700">₹{totalFinal.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Filter & Export */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3 justify-between"
      >
        <div className="flex gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </motion.div>

      {/* Billing Table - Desktop */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Date</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                {activeTab === 'farmers' ? 'Farmer' : 'Trader'}
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Crop</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Base Amt</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Comm ({commissionLabel})</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Final Amt</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.map((item, index) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.03 }}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                    {item.crop} • {item.qty}kg
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">₹{item.baseAmount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-medium ${activeTab === 'farmers' ? 'text-red-600' : 'text-purple-600'}`}>
                    {activeTab === 'farmers' ? '-' : '+'}₹{item.commission.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{item.finalAmount.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                    <FileText className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Billing Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {currentData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                  {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <h3 className="font-bold text-slate-800">{item.name}</h3>
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium mt-1">
                  {item.crop} • {item.qty}kg
                </span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.status === 'Paid' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Base</p>
                <p className="font-bold text-sm text-slate-700">₹{(item.baseAmount / 1000).toFixed(1)}K</p>
              </div>
              <div className={`${activeTab === 'farmers' ? 'bg-blue-50' : 'bg-purple-50'} rounded-lg p-2 text-center`}>
                <p className={`text-[10px] ${activeTab === 'farmers' ? 'text-blue-600' : 'text-purple-600'} uppercase`}>
                  Comm
                </p>
                <p className={`font-bold text-sm ${activeTab === 'farmers' ? 'text-blue-700' : 'text-purple-700'}`}>
                  {activeTab === 'farmers' ? '-' : '+'}₹{item.commission}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-emerald-600 uppercase">Final</p>
                <p className="font-bold text-sm text-emerald-700">₹{(item.finalAmount / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
