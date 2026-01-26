import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    Users,
    Store,
    Check,
    X,
    Loader2,
    RefreshCw,
    CreditCard,
    Banknote,
    Building2,
    FileText,
    ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const PaymentModeSelector = ({ value, onChange }) => {
    const modes = [
        { value: 'cash', label: 'Cash', icon: Banknote },
        { value: 'cheque', label: 'Cheque', icon: FileText },
        { value: 'upi', label: 'UPI', icon: CreditCard },
        { value: 'bank', label: 'Bank Transfer', icon: Building2 },
    ];

    return (
        <div className="flex gap-2 flex-wrap">
            {modes.map((mode) => (
                <button
                    key={mode.value}
                    onClick={() => onChange(mode.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        value === mode.value
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <mode.icon className="w-4 h-4" />
                    {mode.label}
                </button>
            ))}
        </div>
    );
};

export default function PaymentManagement() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [processingId, setProcessingId] = useState(null);
    
    // Payment modal state
    const [paymentModal, setPaymentModal] = useState({
        open: false,
        transaction: null,
        type: null // 'farmer' or 'trader'
    });
    const [paymentForm, setPaymentForm] = useState({
        payment_mode: 'cash',
        payment_reference: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [txnData, statsData] = await Promise.all([
                api.transactions.pendingPayments(activeTab === 'all' ? '' : activeTab),
                api.transactions.stats()
            ]);
            setTransactions(txnData || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load payment data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPaymentModal = (transaction, type) => {
        setPaymentModal({ open: true, transaction, type });
        setPaymentForm({ payment_mode: 'cash', payment_reference: '' });
    };

    const handleConfirmPayment = async () => {
        const { transaction, type } = paymentModal;
        if (!transaction || !type) return;

        try {
            setProcessingId(`${transaction._id}-${type}`);

            if (type === 'farmer') {
                await api.transactions.updateFarmerPayment(transaction._id, {
                    payment_status: 'paid',
                    payment_mode: paymentForm.payment_mode,
                    payment_reference: paymentForm.payment_reference
                });
            } else {
                await api.transactions.updateTraderPayment(transaction._id, {
                    payment_status: 'paid',
                    payment_mode: paymentForm.payment_mode,
                    payment_reference: paymentForm.payment_reference
                });
            }

            toast.success(`${type === 'farmer' ? 'Farmer' : 'Trader'} payment marked as complete`);
            setPaymentModal({ open: false, transaction: null, type: null });
            fetchData();
        } catch (error) {
            console.error('Error updating payment:', error);
            toast.error('Failed to update payment status');
        } finally {
            setProcessingId(null);
        }
    };

    const tabs = [
        { id: 'all', label: 'All Pending', icon: Wallet },
        { id: 'farmer', label: 'Farmer Payments', icon: Users },
        { id: 'trader', label: 'Trader Payments', icon: Store },
    ];

    if (loading && !transactions.length) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Payment Management</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Payment Tracking</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage farmer & trader payments</p>
                </div>

                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-sm disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Farmer Pending</p>
                        <p className="text-2xl font-bold text-blue-600">₹{(stats.farmer_payments?.pending?.total || 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-1">{stats.farmer_payments?.pending?.count || 0} payments</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Farmer Paid</p>
                        <p className="text-2xl font-bold text-emerald-600">₹{(stats.farmer_payments?.paid?.total || 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-1">{stats.farmer_payments?.paid?.count || 0} payments</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Trader Pending</p>
                        <p className="text-2xl font-bold text-amber-600">₹{(stats.trader_payments?.pending?.total || 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-1">{stats.trader_payments?.pending?.count || 0} payments</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Trader Received</p>
                        <p className="text-2xl font-bold text-emerald-600">₹{(stats.trader_payments?.paid?.total || 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-1">{stats.trader_payments?.paid?.count || 0} payments</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-white shadow text-slate-900'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Transaction</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Farmer</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Trader</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Vegetable</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">Farmer Amount</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">Trader Amount</th>
                                <th className="px-4 py-3 text-center font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.length > 0 ? (
                                transactions.map((txn) => (
                                    <tr key={txn._id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{txn.transaction_number}</div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(txn.createdAt).toLocaleDateString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{txn.farmer_id?.full_name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-400">{txn.farmer_id?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{txn.trader_id?.business_name || txn.trader_id?.full_name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-400">{txn.trader_id?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-600">{txn.vegetable}</div>
                                            <div className="text-xs text-slate-400">{txn.quantity} kg</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-medium text-slate-900">₹{txn.farmer_payable?.toLocaleString()}</div>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                txn.farmer_payment_status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {txn.farmer_payment_status === 'paid' ? 'PAID' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-medium text-slate-900">₹{txn.trader_receivable?.toLocaleString()}</div>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                txn.trader_payment_status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {txn.trader_payment_status === 'paid' ? 'RECEIVED' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex gap-2 justify-center">
                                                {txn.farmer_payment_status === 'pending' && (
                                                    <button
                                                        onClick={() => handleOpenPaymentModal(txn, 'farmer')}
                                                        disabled={processingId === `${txn._id}-farmer`}
                                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        Pay Farmer
                                                    </button>
                                                )}
                                                {txn.trader_payment_status === 'pending' && (
                                                    <button
                                                        onClick={() => handleOpenPaymentModal(txn, 'trader')}
                                                        disabled={processingId === `${txn._id}-trader`}
                                                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        Mark Trader Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                        No pending payments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {paymentModal.open && paymentModal.transaction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                        onClick={() => setPaymentModal({ open: false, transaction: null, type: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {paymentModal.type === 'farmer' ? 'Pay Farmer' : 'Mark Trader Payment'}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {paymentModal.transaction.transaction_number}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPaymentModal({ open: false, transaction: null, type: null })}
                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-4">
                                {/* Amount Info */}
                                <div className={`p-4 rounded-xl border ${
                                    paymentModal.type === 'farmer'
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-amber-50 border-amber-200'
                                }`}>
                                    <p className="text-sm text-slate-600 mb-1">
                                        {paymentModal.type === 'farmer' 
                                            ? `Paying to ${paymentModal.transaction.farmer_id?.full_name}`
                                            : `Receiving from ${paymentModal.transaction.trader_id?.business_name || paymentModal.transaction.trader_id?.full_name}`
                                        }
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        ₹{(paymentModal.type === 'farmer' 
                                            ? paymentModal.transaction.farmer_payable 
                                            : paymentModal.transaction.trader_receivable
                                        )?.toLocaleString()}
                                    </p>
                                </div>

                                {/* Payment Mode */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Payment Mode
                                    </label>
                                    <PaymentModeSelector
                                        value={paymentForm.payment_mode}
                                        onChange={(mode) => setPaymentForm(prev => ({ ...prev, payment_mode: mode }))}
                                    />
                                </div>

                                {/* Reference Number */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Reference Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Cheque number, UPI ref, etc."
                                        value={paymentForm.payment_reference}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_reference: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => setPaymentModal({ open: false, transaction: null, type: null })}
                                    className="flex-1 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={!!processingId}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {processingId ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Confirm
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
