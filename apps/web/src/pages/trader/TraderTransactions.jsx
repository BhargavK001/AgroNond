import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Download, 
  Filter,
  Package,
  ChevronDown,
  ChevronLeft,
  ArrowUpDown,
  X
} from 'lucide-react';

// Mock Transaction Data for Trader (no farmer names visible)
const mockTraderTransactions = [
  {
    id: 'TXN001',
    lotId: 'LOT-2026-001',
    date: '2026-01-20',
    crop: 'Tomatoes',
    quantity: 500,
    rate: 45,
    grossAmount: 22500,
    commission: 2025, // 9%
    totalCost: 24525,
    status: 'completed',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN002',
    lotId: 'LOT-2026-002',
    date: '2026-01-20',
    crop: 'Onions',
    quantity: 800,
    rate: 28,
    grossAmount: 22400,
    commission: 2016,
    totalCost: 24416,
    status: 'completed',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN003',
    lotId: 'LOT-2026-003',
    date: '2026-01-19',
    crop: 'Potatoes',
    quantity: 1200,
    rate: 22,
    grossAmount: 26400,
    commission: 2376,
    totalCost: 28776,
    status: 'completed',
    paymentStatus: 'pending'
  },
  {
    id: 'TXN004',
    lotId: 'LOT-2026-004',
    date: '2026-01-19',
    crop: 'Cabbage',
    quantity: 600,
    rate: 15,
    grossAmount: 9000,
    commission: 810,
    totalCost: 9810,
    status: 'completed',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN005',
    lotId: 'LOT-2026-005',
    date: '2026-01-18',
    crop: 'Brinjal',
    quantity: 400,
    rate: 35,
    grossAmount: 14000,
    commission: 1260,
    totalCost: 15260,
    status: 'completed',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN006',
    lotId: 'LOT-2026-006',
    date: '2026-01-18',
    crop: 'Cauliflower',
    quantity: 300,
    rate: 40,
    grossAmount: 12000,
    commission: 1080,
    totalCost: 13080,
    status: 'completed',
    paymentStatus: 'pending'
  },
  {
    id: 'TXN007',
    lotId: 'LOT-2026-007',
    date: '2026-01-17',
    crop: 'Green Chillies',
    quantity: 150,
    rate: 80,
    grossAmount: 12000,
    commission: 1080,
    totalCost: 13080,
    status: 'completed',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN008',
    lotId: 'LOT-2026-008',
    date: '2026-01-16',
    crop: 'Carrots',
    quantity: 450,
    rate: 30,
    grossAmount: 13500,
    commission: 1215,
    totalCost: 14715,
    status: 'completed',
    paymentStatus: 'paid'
  }
];

const cropsList = ['All Crops', 'Tomatoes', 'Onions', 'Potatoes', 'Cabbage', 'Brinjal', 'Cauliflower', 'Green Chillies', 'Carrots'];
const paymentStatuses = ['All Status', 'paid', 'pending'];

export default function TraderTransactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All Status');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...mockTraderTransactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.lotId.toLowerCase().includes(query) ||
        t.crop.toLowerCase().includes(query)
      );
    }

    // Crop filter
    if (selectedCrop !== 'All Crops') {
      result = result.filter(t => t.crop === selectedCrop);
    }

    // Payment status filter
    if (selectedPaymentStatus !== 'All Status') {
      result = result.filter(t => t.paymentStatus === selectedPaymentStatus);
    }

    // Date range filter
    if (dateRange.start) {
      result = result.filter(t => t.date >= dateRange.start);
    }
    if (dateRange.end) {
      result = result.filter(t => t.date <= dateRange.end);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [searchQuery, selectedCrop, selectedPaymentStatus, dateRange, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCrop('All Crops');
    setSelectedPaymentStatus('All Status');
    setDateRange({ start: '', end: '' });
  };

  const handleExport = () => {
    const headers = ['Lot ID', 'Date', 'Crop', 'Qty (kg)', 'Rate/kg', 'Gross Amount', 'Commission (9%)', 'Total Cost', 'Payment Status'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        [t.lotId, t.date, t.crop, t.quantity, t.rate, t.grossAmount, t.commission, t.totalCost, t.paymentStatus].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trader-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totals = useMemo(() => ({
    count: filteredTransactions.length,
    quantity: filteredTransactions.reduce((sum, t) => sum + t.quantity, 0),
    grossAmount: filteredTransactions.reduce((sum, t) => sum + t.grossAmount, 0),
    commission: filteredTransactions.reduce((sum, t) => sum + t.commission, 0),
    totalCost: filteredTransactions.reduce((sum, t) => sum + t.totalCost, 0)
  }), [filteredTransactions]);

  const hasActiveFilters = searchQuery || selectedCrop !== 'All Crops' || selectedPaymentStatus !== 'All Status' || dateRange.start || dateRange.end;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <Link 
            to="/dashboard/trader" 
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Transaction History</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">View and manage all your purchase transactions</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transactions</p>
          <p className="text-2xl font-bold text-slate-800">{totals.count}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Quantity</p>
          <p className="text-2xl font-bold text-slate-800">{totals.quantity.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-400">kg</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gross Amount</p>
          <p className="text-2xl font-bold text-slate-800">₹{totals.grossAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Cost (inc. 9%)</p>
          <p className="text-2xl font-bold text-emerald-600">₹{totals.totalCost.toLocaleString('en-IN')}</p>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Lot ID or crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Crop Filter */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Crop</label>
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        {cropsList.map(crop => (
                          <option key={crop} value={crop}>{crop}</option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Payment Status</label>
                      <select
                        value={selectedPaymentStatus}
                        onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        {paymentStatuses.map(status => (
                          <option key={status} value={status}>{status === 'All Status' ? status : status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">From Date</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">To Date</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('lotId')} className="inline-flex items-center gap-1 hover:text-emerald-600">
                    Lot ID
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('date')} className="inline-flex items-center gap-1 hover:text-emerald-600">
                    Date
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('crop')} className="inline-flex items-center gap-1 hover:text-emerald-600">
                    Crop
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate/kg</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((txn, index) => (
                <motion.tr 
                  key={txn.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">{txn.lotId}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                      <Package className="w-3 h-3" />
                      {txn.crop}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">{txn.quantity.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">₹{txn.rate}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">₹{txn.grossAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right text-sm text-violet-600">₹{txn.commission.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">₹{txn.totalCost.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      txn.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        txn.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      {txn.paymentStatus.charAt(0).toUpperCase() + txn.paymentStatus.slice(1)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No transactions found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {filteredTransactions.map((txn, index) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-50 rounded-xl p-4 border border-slate-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-slate-800">{txn.lotId}</h3>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  txn.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    txn.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  {txn.paymentStatus.charAt(0).toUpperCase() + txn.paymentStatus.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                  <Package className="w-3 h-3" />
                  {txn.crop}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase">Qty</p>
                  <p className="font-bold text-xs">{txn.quantity} <span className="text-[9px] font-normal">kg</span></p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase">Rate</p>
                  <p className="font-bold text-xs">₹{txn.rate}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase">Gross</p>
                  <p className="font-bold text-xs">₹{txn.grossAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <div>
                  <p className="text-[9px] text-violet-500 uppercase">Commission (9%)</p>
                  <p className="font-medium text-xs text-violet-600">₹{txn.commission.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase">Total Cost</p>
                  <p className="font-bold text-sm text-emerald-600">₹{txn.totalCost.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No transactions found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
          Showing {filteredTransactions.length} of {mockTraderTransactions.length} transactions
        </div>
      </motion.div>
    </div>
  );
}
