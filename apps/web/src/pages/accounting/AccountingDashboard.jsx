import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, FileText, Calendar, 
  CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown,
  Users, Store, ArrowRightLeft, ChevronRight, ChevronDown,
  Receipt, Wallet, PieChart, BarChart3, RefreshCw
} from 'lucide-react';

// Mock transaction data - Farmer to Committee to Trader flow
const transactionsData = [
  { 
    id: 1, 
    date: '2026-01-22', 
    farmer: { id: 1, name: 'Ramesh Kumar', phone: '9876543210' },
    trader: { id: 1, name: 'Sharma Traders', business: 'Sharma Traders' },
    crop: 'Tomato', 
    quantity: 500, 
    rate: 40, 
    baseAmount: 20000,
    farmerCommission: 800,  // 4%
    traderCommission: 1800, // 9%
    totalCommission: 2600,  // 13% total
    farmerPayable: 19200,
    traderReceivable: 21800,
    paymentStatus: 'Completed',
    farmerPaid: true,
    traderPaid: true
  },
  { 
    id: 2, 
    date: '2026-01-22', 
    farmer: { id: 2, name: 'Suresh Patel', phone: '9876543211' },
    trader: { id: 2, name: 'Gupta & Sons', business: 'Gupta & Sons' },
    crop: 'Onion', 
    quantity: 1200, 
    rate: 15, 
    baseAmount: 18000,
    farmerCommission: 720,
    traderCommission: 1620,
    totalCommission: 2340,
    farmerPayable: 17280,
    traderReceivable: 19620,
    paymentStatus: 'Pending',
    farmerPaid: false,
    traderPaid: false
  },
  { 
    id: 3, 
    date: '2026-01-21', 
    farmer: { id: 3, name: 'Mahesh Singh', phone: '9876543212' },
    trader: { id: 3, name: 'Fresh Mart', business: 'Fresh Mart' },
    crop: 'Potato', 
    quantity: 800, 
    rate: 22, 
    baseAmount: 17600,
    farmerCommission: 704,
    traderCommission: 1584,
    totalCommission: 2288,
    farmerPayable: 16896,
    traderReceivable: 19184,
    paymentStatus: 'Completed',
    farmerPaid: true,
    traderPaid: true
  },
  { 
    id: 4, 
    date: '2026-01-21', 
    farmer: { id: 4, name: 'Dinesh Yadav', phone: '9876543213' },
    trader: { id: 1, name: 'Sharma Traders', business: 'Sharma Traders' },
    crop: 'Cabbage', 
    quantity: 600, 
    rate: 12, 
    baseAmount: 7200,
    farmerCommission: 288,
    traderCommission: 648,
    totalCommission: 936,
    farmerPayable: 6912,
    traderReceivable: 7848,
    paymentStatus: 'Completed',
    farmerPaid: true,
    traderPaid: true
  },
  { 
    id: 5, 
    date: '2026-01-20', 
    farmer: { id: 5, name: 'Ganesh Thakur', phone: '9876543214' },
    trader: { id: 4, name: 'City Grocers', business: 'City Grocers' },
    crop: 'Cauliflower', 
    quantity: 400, 
    rate: 30, 
    baseAmount: 12000,
    farmerCommission: 480,
    traderCommission: 1080,
    totalCommission: 1560,
    farmerPayable: 11520,
    traderReceivable: 13080,
    paymentStatus: 'Partial',
    farmerPaid: true,
    traderPaid: false
  },
  { 
    id: 6, 
    date: '2026-01-20', 
    farmer: { id: 6, name: 'Rajesh Sharma', phone: '9876543215' },
    trader: { id: 5, name: 'Veggie World', business: 'Veggie World' },
    crop: 'Brinjal', 
    quantity: 350, 
    rate: 25, 
    baseAmount: 8750,
    farmerCommission: 350,
    traderCommission: 787.5,
    totalCommission: 1137.5,
    farmerPayable: 8400,
    traderReceivable: 9537.5,
    paymentStatus: 'Pending',
    farmerPaid: false,
    traderPaid: false
  },
  { 
    id: 7, 
    date: '2026-01-19', 
    farmer: { id: 7, name: 'Mukesh Verma', phone: '9876543216' },
    trader: { id: 2, name: 'Gupta & Sons', business: 'Gupta & Sons' },
    crop: 'Green Chilli', 
    quantity: 200, 
    rate: 80, 
    baseAmount: 16000,
    farmerCommission: 640,
    traderCommission: 1440,
    totalCommission: 2080,
    farmerPayable: 15360,
    traderReceivable: 17440,
    paymentStatus: 'Completed',
    farmerPaid: true,
    traderPaid: true
  },
  { 
    id: 8, 
    date: '2026-01-19', 
    farmer: { id: 8, name: 'Naresh Gupta', phone: '9876543217' },
    trader: { id: 3, name: 'Fresh Mart', business: 'Fresh Mart' },
    crop: 'Carrot', 
    quantity: 450, 
    rate: 35, 
    baseAmount: 15750,
    farmerCommission: 630,
    traderCommission: 1417.5,
    totalCommission: 2047.5,
    farmerPayable: 15120,
    traderReceivable: 17167.5,
    paymentStatus: 'Completed',
    farmerPaid: true,
    traderPaid: true
  }
];

// Calculate summary statistics
const calculateSummary = () => {
  const totalTransactions = transactionsData.length;
  const totalBaseAmount = transactionsData.reduce((acc, t) => acc + t.baseAmount, 0);
  const totalFarmerCommission = transactionsData.reduce((acc, t) => acc + t.farmerCommission, 0);
  const totalTraderCommission = transactionsData.reduce((acc, t) => acc + t.traderCommission, 0);
  const totalCommission = totalFarmerCommission + totalTraderCommission;
  
  const completedTransactions = transactionsData.filter(t => t.paymentStatus === 'Completed');
  const pendingTransactions = transactionsData.filter(t => t.paymentStatus === 'Pending');
  const partialTransactions = transactionsData.filter(t => t.paymentStatus === 'Partial');
  
  const receivedPayments = transactionsData.filter(t => t.traderPaid).reduce((acc, t) => acc + t.traderReceivable, 0);
  const pendingPayments = transactionsData.filter(t => !t.traderPaid).reduce((acc, t) => acc + t.traderReceivable, 0);
  
  const farmerPaymentsDue = transactionsData.filter(t => !t.farmerPaid).reduce((acc, t) => acc + t.farmerPayable, 0);
  const farmerPaymentsPaid = transactionsData.filter(t => t.farmerPaid).reduce((acc, t) => acc + t.farmerPayable, 0);
  
  return {
    totalTransactions,
    totalBaseAmount,
    totalFarmerCommission,
    totalTraderCommission,
    totalCommission,
    completedCount: completedTransactions.length,
    pendingCount: pendingTransactions.length,
    partialCount: partialTransactions.length,
    receivedPayments,
    pendingPayments,
    farmerPaymentsDue,
    farmerPaymentsPaid
  };
};

// Trader-wise summary
const getTraderWiseSummary = () => {
  const traderMap = {};
  transactionsData.forEach(t => {
    if (!traderMap[t.trader.name]) {
      traderMap[t.trader.name] = {
        name: t.trader.name,
        transactions: 0,
        totalAmount: 0,
        totalCommission: 0,
        paid: 0,
        pending: 0
      };
    }
    traderMap[t.trader.name].transactions++;
    traderMap[t.trader.name].totalAmount += t.traderReceivable;
    traderMap[t.trader.name].totalCommission += t.traderCommission;
    if (t.traderPaid) {
      traderMap[t.trader.name].paid += t.traderReceivable;
    } else {
      traderMap[t.trader.name].pending += t.traderReceivable;
    }
  });
  return Object.values(traderMap);
};

export default function AccountingDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeView, setActiveView] = useState('transactions'); // transactions, traders, reports
  const [expandedRow, setExpandedRow] = useState(null);
  
  const summary = calculateSummary();
  const traderSummary = getTraderWiseSummary();
  
  const filteredTransactions = transactionsData.filter(t => {
    const matchesSearch = 
      t.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.paymentStatus.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Accounting Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Complete billing, payments & commission tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Total Transactions</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-800">{summary.totalTransactions}</p>
          <p className="text-xs text-slate-400 mt-1">₹{(summary.totalBaseAmount / 100000).toFixed(2)}L value</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-purple-200 hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Commission Earned</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">₹{summary.totalCommission.toLocaleString()}</p>
          <p className="text-xs text-purple-500 mt-1">13% of ₹{(summary.totalBaseAmount / 1000).toFixed(0)}K</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-green-200 hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Received Payments</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">₹{(summary.receivedPayments / 1000).toFixed(1)}K</p>
          <p className="text-xs text-green-500 mt-1">{summary.completedCount} completed</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-200 hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Pending Payments</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">₹{(summary.pendingPayments / 1000).toFixed(1)}K</p>
          <p className="text-xs text-amber-500 mt-1">{summary.pendingCount + summary.partialCount} pending</p>
        </motion.div>
      </div>

      {/* Commission Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-600 font-medium uppercase">Farmer Comm (4%)</p>
          </div>
          <p className="text-xl font-bold text-blue-700">₹{summary.totalFarmerCommission.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-purple-600 font-medium uppercase">Trader Comm (9%)</p>
          </div>
          <p className="text-xl font-bold text-purple-700">₹{summary.totalTraderCommission.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <p className="text-xs text-emerald-600 font-medium uppercase">Farmers Paid</p>
          </div>
          <p className="text-xl font-bold text-emerald-700">₹{(summary.farmerPaymentsPaid / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <p className="text-xs text-rose-600 font-medium uppercase">Farmers Due</p>
          </div>
          <p className="text-xl font-bold text-rose-700">₹{(summary.farmerPaymentsDue / 1000).toFixed(1)}K</p>
        </div>
      </motion.div>

      {/* View Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex gap-2 p-1.5 bg-slate-100 rounded-xl w-fit"
      >
        <button
          onClick={() => setActiveView('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeView === 'transactions'
              ? 'bg-white shadow-sm text-emerald-700'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          All Transactions
        </button>
        <button
          onClick={() => setActiveView('traders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeView === 'traders'
              ? 'bg-white shadow-sm text-emerald-700'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          Trader-wise
        </button>
        <button
          onClick={() => setActiveView('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeView === 'reports'
              ? 'bg-white shadow-sm text-emerald-700'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Reports
        </button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by farmer, trader, or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </motion.div>

      {/* Transactions View */}
      <AnimatePresence mode="wait">
        {activeView === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
          >
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">Farmer</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">Trader</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">Produce</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">Base Amt</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">Commission</th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">Status</th>
                    <th className="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((txn, index) => (
                    <>
                      <motion.tr 
                        key={txn.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        onClick={() => setExpandedRow(expandedRow === txn.id ? null : txn.id)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                              {txn.farmer.name[0]}
                            </div>
                            <span className="font-medium text-slate-800 text-sm">{txn.farmer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white">
                              <Store className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-800 text-sm">{txn.trader.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                            {txn.crop} • {txn.quantity}kg @ ₹{txn.rate}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-slate-700">₹{txn.baseAmount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-bold text-purple-600">₹{txn.totalCommission.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                            txn.paymentStatus === 'Completed' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : txn.paymentStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {txn.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                            <ChevronDown className={`w-5 h-5 transition-transform ${expandedRow === txn.id ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </motion.tr>
                      {/* Expanded Details Row */}
                      <AnimatePresence>
                        {expandedRow === txn.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={8} className="bg-slate-50/50 px-4 py-4">
                              <div className="grid grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl p-3 border border-slate-100">
                                  <p className="text-xs text-slate-500 mb-1">Farmer Commission (4%)</p>
                                  <p className="font-bold text-blue-600">-₹{txn.farmerCommission.toLocaleString()}</p>
                                  <p className="text-xs text-slate-400 mt-1">Payable: ₹{txn.farmerPayable.toLocaleString()}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 border border-slate-100">
                                  <p className="text-xs text-slate-500 mb-1">Trader Commission (9%)</p>
                                  <p className="font-bold text-purple-600">+₹{txn.traderCommission.toLocaleString()}</p>
                                  <p className="text-xs text-slate-400 mt-1">Receivable: ₹{txn.traderReceivable.toLocaleString()}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 border border-slate-100">
                                  <p className="text-xs text-slate-500 mb-1">Farmer Payment</p>
                                  <div className="flex items-center gap-2">
                                    {txn.farmerPaid ? (
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <Clock className="w-4 h-4 text-amber-500" />
                                    )}
                                    <span className={`font-medium ${txn.farmerPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                      {txn.farmerPaid ? 'Paid' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-white rounded-xl p-3 border border-slate-100">
                                  <p className="text-xs text-slate-500 mb-1">Trader Payment</p>
                                  <div className="flex items-center gap-2">
                                    {txn.traderPaid ? (
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <Clock className="w-4 h-4 text-amber-500" />
                                    )}
                                    <span className={`font-medium ${txn.traderPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                      {txn.traderPaid ? 'Received' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filteredTransactions.map((txn, index) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium mb-1">
                        {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                        {txn.crop} • {txn.quantity}kg @ ₹{txn.rate}
                      </span>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      txn.paymentStatus === 'Completed' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : txn.paymentStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {txn.paymentStatus}
                    </span>
                  </div>

                  {/* Farmer & Trader */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                        {txn.farmer.name[0]}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Farmer</p>
                        <p className="text-sm font-medium text-slate-800">{txn.farmer.name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Trader</p>
                        <p className="text-sm font-medium text-slate-800">{txn.trader.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-400 uppercase">Base</p>
                      <p className="font-bold text-sm text-slate-700">₹{(txn.baseAmount / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-purple-600 uppercase">Comm</p>
                      <p className="font-bold text-sm text-purple-700">₹{txn.totalCommission.toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-emerald-600 uppercase">Total</p>
                      <p className="font-bold text-sm text-emerald-700">₹{(txn.traderReceivable / 1000).toFixed(1)}K</p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="flex gap-2 mt-3">
                    <div className={`flex-1 rounded-lg p-2 flex items-center justify-center gap-1 ${txn.farmerPaid ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                      {txn.farmerPaid ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-500" />
                      )}
                      <span className={`text-[10px] font-medium ${txn.farmerPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        Farmer {txn.farmerPaid ? 'Paid' : 'Due'}
                      </span>
                    </div>
                    <div className={`flex-1 rounded-lg p-2 flex items-center justify-center gap-1 ${txn.traderPaid ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                      {txn.traderPaid ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-500" />
                      )}
                      <span className={`text-[10px] font-medium ${txn.traderPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        Trader {txn.traderPaid ? 'Received' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trader-wise View */}
        {activeView === 'traders' && (
          <motion.div
            key="traders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {traderSummary.map((trader, index) => (
                <motion.div
                  key={trader.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{trader.name}</h3>
                      <p className="text-xs text-slate-500">{trader.transactions} transactions</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Total Billing</span>
                      <span className="font-bold text-slate-800">₹{trader.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Commission (9%)</span>
                      <span className="font-bold text-purple-600">₹{trader.totalCommission.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-slate-100"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-600">Paid</span>
                      <span className="font-bold text-emerald-600">₹{trader.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-600">Pending</span>
                      <span className="font-bold text-amber-600">₹{trader.pending.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Payment Progress</span>
                      <span>{((trader.paid / trader.totalAmount) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                        style={{ width: `${(trader.paid / trader.totalAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reports View */}
        {activeView === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Report Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-4">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Trader-wise Billing Report</h3>
                <p className="text-sm text-slate-500 mb-4">Complete billing summary for each trader with commission breakdown</p>
                <button className="flex items-center gap-2 text-emerald-600 font-medium text-sm hover:text-emerald-700">
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Payment Status Report</h3>
                <p className="text-sm text-slate-500 mb-4">Track all received, pending, and overdue payments</p>
                <button className="flex items-center gap-2 text-blue-600 font-medium text-sm hover:text-blue-700">
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-purple-200 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Date-wise Transaction Report</h3>
                <p className="text-sm text-slate-500 mb-4">Daily, weekly, or monthly transaction summary</p>
                <button className="flex items-center gap-2 text-purple-600 font-medium text-sm hover:text-purple-700">
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-200 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Farmer-wise Report</h3>
                <p className="text-sm text-slate-500 mb-4">Complete sales and payment history for each farmer</p>
                <button className="flex items-center gap-2 text-amber-600 font-medium text-sm hover:text-amber-700">
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-rose-200 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 mb-4">
                  <PieChart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Commission Report</h3>
                <p className="text-sm text-slate-500 mb-4">Detailed breakdown of all commission deductions</p>
                <button className="flex items-center gap-2 text-rose-600 font-medium text-sm hover:text-rose-700">
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-cyan-200 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Complete Ledger</h3>
                <p className="text-sm text-slate-500 mb-4">Full accounting ledger with all entries</p>
                <button className="flex items-center gap-2 text-cyan-600 font-medium text-sm hover:text-cyan-700">
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
