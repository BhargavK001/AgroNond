import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, CheckCircle, Clock, DollarSign, ArrowUpRight, ArrowDownLeft, X, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import CommitteeNavbar from '../../components/navigation/CommitteeNavbar';

const PaymentManagement = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, receivables, payables
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Modal
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [actionType, setActionType] = useState(null); // 'pay-farmer', 'receive-trader'
    const [paymentForm, setPaymentForm] = useState({ mode: 'Cash', ref: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const data = await api.finance.billingRecords.list({ limit: 100 }); // increased limit for demo
            if (data && data.records) {
                setRecords(data.records);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load records");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPaymentModal = (record, type) => {
        setSelectedRecord(record);
        setActionType(type);
        setPaymentForm({ mode: 'Cash', ref: '' });
    };

    const handleProcessPayment = async () => {
        if (!selectedRecord || !actionType) return;

        try {
            setIsProcessing(true);

            if (actionType === 'pay-farmer') {
                await api.finance.payments.payFarmer(selectedRecord._id, {
                    mode: paymentForm.mode,
                    ref: paymentForm.ref
                });
                toast.success(`Paid ₹${selectedRecord.net_payable_to_farmer} to Farmer`);
            } else {
                await api.finance.payments.receiveTrader(selectedRecord._id, {
                    mode: paymentForm.mode,
                    ref: paymentForm.ref
                });
                toast.success(`Received ₹${selectedRecord.net_receivable_from_trader} from Trader`);
            }

            // Close and Refresh
            setSelectedRecord(null);
            setActionType(null);
            fetchRecords();

        } catch (error) {
            console.error(error);
            toast.error("Transaction failed");
        } finally {
            setIsProcessing(false);
        }
    };

    // Derived State for Filtering
    const filteredRecords = records.filter(record => {
        // Text Search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            record.lot_id?.toLowerCase().includes(searchLower) ||
            record.farmer_id?.full_name?.toLowerCase().includes(searchLower) ||
            record.trader_id?.business_name?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;

        // Type Filter
        if (filter === 'receivables') { // Pending from Trader
            return record.trader_payment_status === 'Pending';
        }
        if (filter === 'payables') { // Pending to Farmer
            return record.farmer_payment_status === 'Pending';
        }
        return true;
    });

    const stats = {
        receivables: records.filter(r => r.trader_payment_status === 'Pending').reduce((acc, r) => acc + (r.net_receivable_from_trader || 0), 0),
        payables: records.filter(r => r.farmer_payment_status === 'Pending').reduce((acc, r) => acc + (r.net_payable_to_farmer || 0), 0)
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Payment Management</h1>
                        <p className="text-slate-500 mt-1">Track market cashflow and settle accounts</p>
                    </div>
                    <button
                        onClick={fetchRecords}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Receivables (Traders)</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{stats.receivables.toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <ArrowDownLeft size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Payables (Farmers)</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{stats.payables.toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-fit">
                            {['all', 'receivables', 'payables'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filter === f
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search Lot ID, Farmer, Trader..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Date / Lot ID</th>
                                    <th className="px-6 py-4">Parties</th>
                                    <th className="px-6 py-4 text-right">Amounts</th>
                                    <th className="px-6 py-4 text-center">Status (Farmer)</th>
                                    <th className="px-6 py-4 text-center">Status (Trader)</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading...</td></tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">No records found</td></tr>
                                ) : (
                                    filteredRecords.map(record => (
                                        <tr key={record._id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{record.lot_id}</div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(record.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
                                                        F: {record.farmer_id?.full_name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded w-fit">
                                                        T: {record.trader_id?.business_name || 'Unknown'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-slate-900">₹{record.net_receivable_from_trader} <span className="text-xs text-slate-400 font-normal">(In)</span></div>
                                                <div className="font-bold text-slate-500">₹{record.net_payable_to_farmer} <span className="text-xs text-slate-400 font-normal">(Out)</span></div>
                                            </td>

                                            {/* Farmer Status */}
                                            <td className="px-6 py-4 text-center">
                                                {record.farmer_payment_status === 'Paid' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                        <CheckCircle size={12} /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Trader Status */}
                                            <td className="px-6 py-4 text-center">
                                                {record.trader_payment_status === 'Paid' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                        <CheckCircle size={12} /> Received
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 text-xs font-bold">
                                                    {record.trader_payment_status !== 'Paid' && (
                                                        <button
                                                            onClick={() => handleOpenPaymentModal(record, 'receive-trader')}
                                                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition"
                                                        >
                                                            Receive
                                                        </button>
                                                    )}
                                                    {record.farmer_payment_status !== 'Paid' && (
                                                        <button
                                                            onClick={() => handleOpenPaymentModal(record, 'pay-farmer')}
                                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                                        >
                                                            Pay Farmer
                                                        </button>
                                                    )}
                                                    {record.trader_payment_status === 'Paid' && record.farmer_payment_status === 'Paid' && (
                                                        <span className="text-gray-400 px-2">Settled</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Payment Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">
                                {actionType === 'receive-trader' ? 'Receive Payment' : 'Process Payout'}
                            </h3>
                            <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">
                                    {actionType === 'receive-trader' ? 'Receiving from:' : 'Paying to:'}
                                </p>
                                <p className="font-bold text-lg text-slate-900">
                                    {actionType === 'receive-trader'
                                        ? selectedRecord.trader_id?.business_name
                                        : selectedRecord.farmer_id?.full_name}
                                </p>
                                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">Amount</span>
                                    <span className={`text-xl font-bold ${actionType === 'receive-trader' ? 'text-green-600' : 'text-blue-600'}`}>
                                        ₹{actionType === 'receive-trader'
                                            ? selectedRecord.net_receivable_from_trader
                                            : selectedRecord.net_payable_to_farmer}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Mode</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={paymentForm.mode}
                                    onChange={e => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                                >
                                    <option>Cash</option>
                                    <option>Bank Transfer</option>
                                    <option>UPI</option>
                                    <option>Cheque</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Reference / Note (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Transaction ID"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={paymentForm.ref}
                                    onChange={e => setPaymentForm({ ...paymentForm, ref: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleProcessPayment}
                                disabled={isProcessing}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 flex justify-center items-center gap-2 ${actionType === 'receive-trader'
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                    }`}
                            >
                                {isProcessing ? <RefreshCw className="animate-spin" /> : <CheckCircle />}
                                {actionType === 'receive-trader' ? 'Confirm Receipt' : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
