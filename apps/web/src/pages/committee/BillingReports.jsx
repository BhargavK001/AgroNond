import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Filter, Calendar, Users, ShoppingBag, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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

// Main Component
export default function BillingReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('farmers');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Payment Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [activeTab, dateFilter, page]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Fetch billing records
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
      setLoading(false);
    }
  };

  const processRecord = (record) => {
    // Backend now provides explicit fields, logic simplified but kept robust
    // Fallback to calculation if fields missing (backward compatibility)

    // Check if new API fields exist
    const hasNewFields = record.net_payable_to_farmer !== undefined;

    const baseAmount = record.sale_amount || 0;

    let farmerComm, traderComm, netFarmer, netTrader, paymentStatus;

    if (hasNewFields) {
      farmerComm = record.farmer_commission;
      traderComm = record.trader_commission;
      netFarmer = record.net_payable_to_farmer;
      netTrader = record.net_receivable_from_trader;
    } else {
      // Fallback Calc
      const totalCommission = record.commission || 0;
      farmerComm = Math.round(totalCommission * (4 / 13));
      traderComm = Math.round(totalCommission * (9 / 13));
      netFarmer = baseAmount - farmerComm;
      netTrader = baseAmount + traderComm;
    }

    if (activeTab === 'farmers') {
      return {
        id: record._id,
        date: record.sold_at || record.createdAt,
        name: record.farmer_id?.full_name || 'Unknown Farmer',
        crop: record.vegetable,
        qty: record.qtySold || record.quantity,
        baseAmount: baseAmount,
        commission: farmerComm, // Deducted
        finalAmount: netFarmer, // Net Payable
        status: record.farmer_payment_status || (record.payment_status === 'paid' ? 'Paid' : 'Pending'), // Use specific status
        type: 'pay'
      };
    } else {
      return {
        id: record._id,
        date: record.sold_at || record.createdAt,
        name: record.trader_id?.business_name || record.trader_id?.full_name || 'Unknown Trader',
        crop: record.vegetable,
        qty: record.qtySold || record.quantity,
        baseAmount: baseAmount,
        commission: traderComm, // Added
        finalAmount: netTrader, // Total Receivable
        status: record.trader_payment_status || (record.payment_status === 'paid' ? 'Paid' : 'Pending'),
        type: 'receive'
      };
    }
  };

  const handlePayment = (record) => {
    if (record.status === 'Paid') return;
    setSelectedRecord(record);
    setShowPaymentModal(true);
  };

  const confirmPayment = async ({ mode, ref }) => {
    if (!selectedRecord) return;

    try {
      if (selectedRecord.type === 'pay') {
        // Pay Farmer
        await api.post(`/api/finance/pay-farmer/${selectedRecord.id}`, { mode, ref });
        toast.success(`Paid ₹${selectedRecord.finalAmount} to ${selectedRecord.name}`);
      } else {
        // Receive from Trader
        await api.post(`/api/finance/receive-trader/${selectedRecord.id}`, { mode, ref });
        toast.success(`Received ₹${selectedRecord.finalAmount} from ${selectedRecord.name}`);
      }
      setShowPaymentModal(false);
      setSelectedRecord(null);
      fetchRecords(); // Refresh data
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed");
    }
  };

  const currentData = data.map(processRecord);
  const commissionLabel = activeTab === 'farmers' ? '4%' : '9%';
  const commissionColor = activeTab === 'farmers' ? 'blue' : 'purple';

  const totalBase = currentData.reduce((acc, item) => acc + item.baseAmount, 0);
  const totalCommission = currentData.reduce((acc, item) => acc + item.commission, 0);
  const totalFinal = currentData.reduce((acc, item) => acc + item.finalAmount, 0);

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

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Billing Management</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Manage payments for farmers and traders</p>
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
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
        >
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Base Sales Amount</p>
          <p className="text-2xl font-bold text-slate-800">₹{totalBase.toLocaleString()}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`bg-${commissionColor}-50 rounded-xl p-4 border border-${commissionColor}-100`}
        >
          <p className={`text-xs text-${commissionColor}-600 font-medium uppercase mb-1`}>Market Commission ({commissionLabel})</p>
          <p className={`text-2xl font-bold text-${commissionColor}-700`}>₹{totalCommission.toLocaleString()}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"
        >
          <p className="text-xs text-emerald-600 font-medium uppercase mb-1">
            {activeTab === 'farmers' ? 'Total Payable to Farmers' : 'Total Receivable from Traders'}
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
              <th className="px-6 py-4 text-center">Action</th>
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
                onClick={() => handlePayment(item)}
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
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                    }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {item.status !== 'Paid' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePayment(item); }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                    >
                      {activeTab === 'farmers' ? 'Pay' : 'Receive'}
                    </button>
                  )}
                  {item.status === 'Paid' && <CheckCircle size={18} className="text-emerald-500 mx-auto" />}
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
            onClick={() => handlePayment(item)}
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
              <button
                onClick={(e) => { e.stopPropagation(); handlePayment(item); }}
                className="w-full mt-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg"
              >
                {activeTab === 'farmers' ? 'Pay Now' : 'Mark Received'}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
