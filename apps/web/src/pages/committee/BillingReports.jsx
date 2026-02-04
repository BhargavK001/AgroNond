import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import api from '../../lib/api';
import { exportToCSV } from '../../lib/csvExport';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Users, ShoppingBag, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import InvoiceDownloadModal from '../../components/committee/InvoiceDownloadModal';

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, onSubmit, type, amount, name }) => {
  const [mode, setMode] = useState('Cash');
  const [ref, setRef] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {type === 'pay' ? 'Pay Farmer' : 'Receive Payment'}
          </h3>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">{name}</p>
          <p className="text-2xl font-bold text-slate-900">₹{amount.toLocaleString()}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>Cash</option>
              <option>Cheque</option>
              <option>Online / UPI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference / Cheque No.</label>
            <input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => onSubmit({ mode, ref })}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg mt-2"
          >
            Confirm {type === 'pay' ? 'Payment' : 'Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to format quantity display - CLEAN LOGIC
const formatQtyDisplay = (qty, carat) => {
  const hasQty = qty && qty > 0;
  const hasCarat = carat && carat > 0;

  if (hasQty && hasCarat) {
    return <>{qty}kg <span className="text-purple-600 font-medium">| {carat}Crt</span></>;
  } else if (hasCarat) {
    return <span className="text-purple-600 font-medium">{carat}Crt</span>;
  } else {
    return <>{qty || 0}kg</>;
  }
};

// Skeleton Loading Row for better perceived performance
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div></td>
  </tr>
);

// Main Component
export default function BillingReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('farmers');
  const [dateFilter, setDateFilter] = useState('all');
  const [specificDate, setSpecificDate] = useState('');  // New: Specific date filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Payment Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [commissionRates, setCommissionRates] = useState({ farmer: 4, trader: 9 });

  // Invoice Modal State - PERFORMANCE: Lazy loaded PDF
  const [invoiceRecord, setInvoiceRecord] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchCommissionRates = useCallback(async () => {
    try {
      const rules = await api.finance.commissionRates.list();
      if (rules && rules.length > 0) {
        const farmerRule = rules.find(r => r.role_type === 'farmer' && r.crop_type === 'All');
        const traderRule = rules.find(r => r.role_type === 'trader' && r.crop_type === 'All');

        setCommissionRates({
          farmer: farmerRule ? parseFloat(farmerRule.rate) * 100 : 4,
          trader: traderRule ? parseFloat(traderRule.rate) * 100 : 9
        });
      }
    } catch (error) {
      console.error("Failed to fetch commission rates:", error);
    }
  }, []);

  const fetchRecords = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.finance.billingRecords.list({
        limit: 20,
        page,
        period: dateFilter
      });

      if (response && response.records) {
        setData(response.records);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch billing records:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [page, dateFilter]);

  // FIXED: Single useEffect instead of duplicate calls
  useEffect(() => {
    fetchRecords();
    fetchCommissionRates();
  }, [fetchRecords, fetchCommissionRates]);

  // Auto-refresh records every 60 seconds (increased from 30s for better performance)
  useAutoRefresh(() => fetchRecords(false), { interval: 60000 });

  // PERFORMANCE: Memoize processRecord function
  const processRecord = useCallback((record) => {
    const hasNewFields = record.net_payable_to_farmer !== undefined;
    const baseAmount = record.sale_amount || 0;

    let farmerComm, traderComm, netFarmer, netTrader;

    if (hasNewFields) {
      farmerComm = record.farmer_commission;
      traderComm = record.trader_commission;
      netFarmer = record.net_payable_to_farmer;
      netTrader = record.net_receivable_from_trader;
    } else {
      const totalCommission = record.commission || 0;
      farmerComm = Math.round(totalCommission * (4 / 13));
      traderComm = Math.round(totalCommission * (9 / 13));
      netFarmer = baseAmount - farmerComm;
      netTrader = baseAmount + traderComm;
    }

    const caratValue = (record.official_carat && record.official_carat > 0)
      ? record.official_carat
      : (record.carat || 0);
    const qtyValue = record.qtySold || record.official_qty || record.quantity || 0;

    if (activeTab === 'farmers') {
      return {
        id: record._id,
        date: record.sold_at || record.createdAt,
        name: record.farmer_id?.full_name || 'Unknown Farmer',
        crop: record.vegetable,
        qty: qtyValue,
        carat: caratValue,
        baseAmount: baseAmount,
        commission: farmerComm,
        finalAmount: netFarmer,
        status: record.farmer_payment_status || (record.payment_status === 'paid' ? 'Paid' : 'Pending'),
        type: 'pay'
      };
    } else {
      return {
        id: record._id,
        date: record.sold_at || record.createdAt,
        name: record.trader_id?.business_name || record.trader_id?.full_name || 'Unknown Trader',
        crop: record.vegetable,
        qty: qtyValue,
        carat: caratValue,
        baseAmount: baseAmount,
        commission: traderComm,
        finalAmount: netTrader,
        status: record.trader_payment_status || (record.payment_status === 'paid' ? 'Paid' : 'Pending'),
        type: 'receive'
      };
    }
  }, [activeTab]);

  // PERFORMANCE: Memoize processed data with specific date filtering
  const currentData = useMemo(() => {
    let processed = data.map(processRecord);

    // Apply specific date filter if set
    if (specificDate) {
      processed = processed.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === specificDate;
      });
    }

    return processed;
  }, [data, processRecord, specificDate]);

  // PERFORMANCE: Memoize totals calculation
  const { totalBase, totalCommission, totalFinal } = useMemo(() => ({
    totalBase: currentData.reduce((acc, item) => acc + item.baseAmount, 0),
    totalCommission: currentData.reduce((acc, item) => acc + item.commission, 0),
    totalFinal: currentData.reduce((acc, item) => acc + item.finalAmount, 0)
  }), [currentData]);

  const commissionLabel = activeTab === 'farmers' ? `${commissionRates.farmer}%` : `${commissionRates.trader}%`;
  const commissionColor = activeTab === 'farmers' ? 'blue' : 'purple';

  const handlePayment = (record) => {
    if (record.status === 'Paid') return;
    setSelectedRecord(record);
    setShowPaymentModal(true);
  };

  const handleDownloadInvoice = (record, e) => {
    e?.stopPropagation();
    setInvoiceRecord(record);
    setShowInvoiceModal(true);
  };

  const confirmPayment = async ({ mode, ref }) => {
    if (!selectedRecord) return;

    try {
      if (selectedRecord.type === 'pay') {
        await api.post(`/api/finance/pay-farmer/${selectedRecord.id}`, { mode, ref });
        toast.success(`Paid ₹${selectedRecord.finalAmount} to ${selectedRecord.name}`);
      } else {
        await api.post(`/api/finance/receive-trader/${selectedRecord.id}`, { mode, ref });
        toast.success(`Received ₹${selectedRecord.finalAmount} from ${selectedRecord.name}`);
      }
      setShowPaymentModal(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed");
    }
  };

  const handleExport = () => {
    const headers = ['Date', activeTab === 'farmers' ? 'Farmer' : 'Trader', 'Crop', 'Qty (kg)', 'Carat', 'Base Amt', 'Commission', 'Final Amt', 'Status'];

    const csvData = currentData.map(item => [
      new Date(item.date).toLocaleDateString('en-IN'),
      item.name,
      item.crop,
      item.qty,
      item.carat,
      item.baseAmount,
      item.commission,
      item.finalAmount,
      item.status
    ]);

    exportToCSV(csvData, headers, `billing-report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        type={selectedRecord?.type}
        amount={selectedRecord?.finalAmount || 0}
        name={selectedRecord?.name}
        onSubmit={confirmPayment}
      />

      {/* PERFORMANCE: Lazy-loaded Invoice Modal */}
      <InvoiceDownloadModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        data={invoiceRecord}
        type={activeTab === 'farmers' ? 'farmer' : 'trader'}
      />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Billing Management</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Manage payments for farmers and traders</p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('farmers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'farmers'
            ? 'bg-white shadow-sm text-emerald-700'
            : 'text-slate-600 hover:text-slate-800'
            }`}
        >
          <Users className="w-4 h-4" />
          Pay Farmers
        </button>
        <button
          onClick={() => setActiveTab('traders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'traders'
            ? 'bg-white shadow-sm text-emerald-700'
            : 'text-slate-600 hover:text-slate-800'
            }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Receive from Traders
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Base Sales Amount</p>
          <p className="text-2xl font-bold text-slate-800">₹{totalBase.toLocaleString()}</p>
        </div>
        <div className={`bg-${commissionColor}-50 rounded-xl p-4 border border-${commissionColor}-100`}>
          <p className={`text-xs text-${commissionColor}-600 font-medium uppercase mb-1`}>Market Commission ({commissionLabel})</p>
          <p className={`text-2xl font-bold text-${commissionColor}-700`}>₹{totalCommission.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-medium uppercase mb-1">
            {activeTab === 'farmers' ? 'Total Payable to Farmers' : 'Total Receivable from Traders'}
          </p>
          <p className="text-2xl font-bold text-emerald-700">₹{totalFinal.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter & Export */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
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

          {/* Specific Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            />
            {specificDate && (
              <button
                onClick={() => setSpecificDate('')}
                className="absolute -right-2 -top-2 bg-slate-200 hover:bg-slate-300 rounded-full p-0.5"
                title="Clear Date"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Billing Table - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Skeleton loading for better perceived performance
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  No billing records found
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => handlePayment(item)}
                >
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                      {item.crop} • {formatQtyDisplay(item.qty, item.carat)}
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
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {item.status !== 'Paid' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePayment(item); }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                        >
                          {activeTab === 'farmers' ? 'Pay' : 'Receive'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          <CheckCircle size={14} />
                          <span className="text-xs font-bold">Paid</span>
                        </div>
                      )}

                      {/* PERFORMANCE: Lightweight button instead of inline PDFDownloadLink */}
                      <button
                        onClick={(e) => handleDownloadInvoice(item, e)}
                        className="p-2 rounded-lg transition-all duration-200 border bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 border-slate-200 shadow-sm"
                        title="Download Invoice"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Billing Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          // Mobile skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 bg-slate-100 rounded-lg"></div>
                <div className="h-12 bg-slate-100 rounded-lg"></div>
                <div className="h-12 bg-slate-100 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          currentData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
              onClick={() => handlePayment(item)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-slate-800">{item.name}</h3>
                  <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium mt-1">
                    {item.crop} • {formatQtyDisplay(item.qty, item.carat)}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Paid'
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
              {item.status !== 'Paid' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePayment(item); }}
                    className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                  >
                    {activeTab === 'farmers' ? 'Pay Now' : 'Mark Received'}
                  </button>
                  <button
                    onClick={(e) => handleDownloadInvoice(item, e)}
                    className="flex items-center justify-center w-10 bg-slate-100 text-emerald-600 rounded-lg"
                  >
                    <FileText size={18} />
                  </button>
                </div>
              )}
              {item.status === 'Paid' && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => handleDownloadInvoice(item, e)}
                    className="flex items-center justify-center px-4 py-2 bg-slate-100 text-emerald-600 text-xs font-bold rounded-lg gap-2"
                  >
                    <FileText size={16} />
                    <span>Download Invoice</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}