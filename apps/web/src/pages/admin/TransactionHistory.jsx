import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Download,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { mockTransactions } from '../../data/mockData';

export default function TransactionHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const filteredTransactions = useMemo(() => {
    let result = [...mockTransactions];

    // Search filter (removed lotId, searching by names and crop only)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(txn =>
        txn.farmerName.toLowerCase().includes(query) ||
        txn.traderName.toLowerCase().includes(query) ||
        txn.crop.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter(txn => txn.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(txn => txn.date <= dateTo);
    }

    // Payment status filter
    if (paymentFilter !== 'all') {
      result = result.filter(txn => txn.paymentStatus === paymentFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case 'amount':
          aVal = a.grossAmount;
          bVal = b.grossAmount;
          break;
        case 'quantity':
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        default:
          aVal = a[sortField];
          bVal = b[sortField];
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [searchQuery, dateFrom, dateTo, paymentFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const stats = useMemo(() => {
    return {
      totalTransactions: filteredTransactions.length,
      totalVolume: filteredTransactions.reduce((sum, t) => sum + t.quantity, 0),
      totalAmount: filteredTransactions.reduce((sum, t) => sum + t.grossAmount, 0),
      totalCommission: filteredTransactions.reduce((sum, t) => sum + t.farmerCommission + t.traderCommission, 0)
    };
  }, [filteredTransactions]);

  const handleExport = () => {
    // CSV export without Lot ID
    const headers = ['Date', 'Farmer', 'Trader', 'Crop', 'Qty (kg)', 'Rate', 'Amount', 'Commission', 'Status'];
    const rows = filteredTransactions.map(txn => [
      txn.date,
      txn.farmerName,
      txn.traderName,
      txn.crop,
      txn.quantity,
      txn.rate,
      txn.grossAmount,
      txn.farmerCommission + txn.traderCommission,
      txn.paymentStatus
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
          <p className="text-gray-500 mt-1">View and search all entries</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalTransactions}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Total Volume</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.totalVolume.toLocaleString()} kg</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Total Amount</p>
          <p className="text-2xl font-bold text-slate-800">₹{stats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Commission Earned</p>
          <p className="text-2xl font-bold text-emerald-700">₹{stats.totalCommission.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by farmer, trader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
          </div>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
          </div>

          {/* Payment Status */}
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="appearance-none w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th
                  className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4 cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">Farmer</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">Trader</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">Crop</th>
                <th
                  className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4 cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Qty (kg)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">Rate</th>
                <th
                  className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4 cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">Commission</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(txn.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{txn.farmerName}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{txn.traderName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        {txn.crop}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-800 font-medium text-sm">
                      {txn.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 text-sm">
                      ₹{txn.rate}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800 text-sm">
                      ₹{txn.grossAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-medium text-sm">
                      ₹{(txn.farmerCommission + txn.traderCommission).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border
                        ${txn.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {txn.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Showing {filteredTransactions.length} of {mockTransactions.length} transactions
          </p>
        </div>
      </motion.div>
    </div>
  );
}