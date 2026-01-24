import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MapPin, Store, TrendingUp, Package, Wheat, IndianRupee, FileText } from 'lucide-react';

// Mock trader data - same as TradersList
const tradersData = [
    { id: 1, businessName: 'Sharma Traders', ownerName: 'Rajesh Sharma', phone: '9876543220', licenseNo: 'TRD-2024-001', totalPurchases: 485000, lastActive: '2026-01-21', status: 'Active' },
    { id: 2, businessName: 'Gupta & Sons', ownerName: 'Manoj Gupta', phone: '9876543221', licenseNo: 'TRD-2024-002', totalPurchases: 312000, lastActive: '2026-01-20', status: 'Active' },
    { id: 3, businessName: 'Fresh Mart', ownerName: 'Vikram Singh', phone: '9876543222', licenseNo: 'TRD-2024-003', totalPurchases: 278000, lastActive: '2026-01-21', status: 'Active' },
    { id: 4, businessName: 'City Grocers', ownerName: 'Amit Patel', phone: '9876543223', licenseNo: 'TRD-2024-004', totalPurchases: 195000, lastActive: '2026-01-19', status: 'Active' },
    { id: 5, businessName: 'Veggie World', ownerName: 'Sunil Yadav', phone: '9876543224', licenseNo: 'TRD-2024-005', totalPurchases: 421000, lastActive: '2026-01-21', status: 'Active' },
    { id: 6, businessName: 'Green Valley', ownerName: 'Deepak Kumar', phone: '9876543225', licenseNo: 'TRD-2024-006', totalPurchases: 156000, lastActive: '2026-01-18', status: 'Inactive' },
];

// Mock purchase history for each trader
const purchaseHistoryData = {
    1: [
        { id: 101, date: '2026-01-21', vegetable: 'Tomato', variety: 'Hybrid', quantity: 500, rate: 40, amount: 20000, farmer: 'Ramesh Kumar', status: 'Paid' },
        { id: 102, date: '2026-01-20', vegetable: 'Cauliflower', variety: 'White', quantity: 400, rate: 35, amount: 14000, farmer: 'Mahesh Singh', status: 'Paid' },
        { id: 103, date: '2026-01-21', vegetable: 'Tomato', variety: 'Desi', quantity: 800, rate: 45, amount: 36000, farmer: 'Mahesh Singh', status: 'Pending' },
        { id: 104, date: '2026-01-20', vegetable: 'Tomato', variety: 'Hybrid', quantity: 400, rate: 42, amount: 16800, farmer: 'Dinesh Yadav', status: 'Paid' },
    ],
    2: [
        { id: 201, date: '2026-01-20', vegetable: 'Onion', variety: 'Red', quantity: 800, rate: 25, amount: 20000, farmer: 'Ramesh Kumar', status: 'Paid' },
        { id: 202, date: '2026-01-17', vegetable: 'Garlic', variety: 'Local', quantity: 200, rate: 120, amount: 24000, farmer: 'Suresh Patel', status: 'Pending' },
        { id: 203, date: '2026-01-14', vegetable: 'Onion', variety: 'Red', quantity: 500, rate: 28, amount: 14000, farmer: 'Dinesh Yadav', status: 'Pending' },
    ],
    3: [
        { id: 301, date: '2026-01-18', vegetable: 'Potato', variety: 'White', quantity: 1200, rate: 18, amount: 21600, farmer: 'Ramesh Kumar', status: 'Pending' },
        { id: 302, date: '2026-01-20', vegetable: 'Onion', variety: 'White', quantity: 1000, rate: 22, amount: 22000, farmer: 'Suresh Patel', status: 'Paid' },
        { id: 303, date: '2026-01-16', vegetable: 'Capsicum', variety: 'Yellow', quantity: 250, rate: 80, amount: 20000, farmer: 'Mahesh Singh', status: 'Paid' },
        { id: 304, date: '2026-01-17', vegetable: 'Potato', variety: 'Local', quantity: 600, rate: 20, amount: 12000, farmer: 'Dinesh Yadav', status: 'Paid' },
    ],
};

// Generate default purchases for traders without specific data
const getDefaultPurchases = (traderId) => [
    { id: traderId * 100 + 1, date: '2026-01-20', vegetable: 'Tomato', variety: 'Hybrid', quantity: 400, rate: 42, amount: 16800, farmer: 'Ramesh Kumar', status: 'Paid' },
    { id: traderId * 100 + 2, date: '2026-01-17', vegetable: 'Potato', variety: 'Local', quantity: 600, rate: 20, amount: 12000, farmer: 'Suresh Patel', status: 'Paid' },
    { id: traderId * 100 + 3, date: '2026-01-14', vegetable: 'Onion', variety: 'Red', quantity: 500, rate: 28, amount: 14000, farmer: 'Dinesh Yadav', status: 'Pending' },
];

// Vegetable color mapping
const vegetableColors = {
    'Tomato': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Onion': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Potato': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Cabbage': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Cauliflower': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'Green Chilli': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
    'Capsicum': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Garlic': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Ginger': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Brinjal': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
};

const getVegetableColor = (veg) => vegetableColors[veg] || { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };

export default function TraderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const trader = tradersData.find(t => t.id === parseInt(id));
    const purchaseHistory = purchaseHistoryData[id] || getDefaultPurchases(parseInt(id));

    if (!trader) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Trader Not Found</h2>
                <p className="text-slate-500 mb-4">The trader you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/dashboard/committee/traders')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                    Back to Traders List
                </button>
            </div>
        );
    }

    // Calculate vegetable summary
    const vegetableSummary = purchaseHistory.reduce((acc, purchase) => {
        if (!acc[purchase.vegetable]) {
            acc[purchase.vegetable] = { quantity: 0, amount: 0, count: 0 };
        }
        acc[purchase.vegetable].quantity += purchase.quantity;
        acc[purchase.vegetable].amount += purchase.amount;
        acc[purchase.vegetable].count += 1;
        return acc;
    }, {});

    const totalPurchasesAmount = purchaseHistory.reduce((acc, p) => acc + p.amount, 0);
    const totalQuantity = purchaseHistory.reduce((acc, p) => acc + p.quantity, 0);
    const pendingAmount = purchaseHistory.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);

    return (
        <div className="space-y-6">
            {/* Back Button + Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    onClick={() => navigate('/dashboard/committee/traders')}
                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Traders</span>
                </button>

                {/* Trader Profile Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/20">
                            {trader.businessName[0]}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{trader.businessName}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                    <Store className="w-4 h-4" />
                                    {trader.ownerName}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" />
                                    {trader.phone}
                                </span>
                                {trader.licenseNo && (
                                    <span className="flex items-center gap-1.5">
                                        <FileText className="w-4 h-4" />
                                        {trader.licenseNo}
                                    </span>
                                )}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${trader.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                    {trader.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <IndianRupee className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Total Purchases</p>
                            <p className="text-xl font-bold text-slate-800">₹{totalPurchasesAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Total Quantity</p>
                            <p className="text-xl font-bold text-slate-800">{totalQuantity.toLocaleString()} kg</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Wheat className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Total Varieties</p>
                            <p className="text-xl font-bold text-slate-800">{Object.keys(vegetableSummary).length} types</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Pending Due</p>
                            <p className="text-xl font-bold text-amber-600">₹{pendingAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Vegetable Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm"
            >
                <h2 className="text-lg font-bold text-slate-800 mb-4">Vegetables Purchased</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(vegetableSummary).map(([veg, data], index) => {
                        const colors = getVegetableColor(veg);
                        return (
                            <motion.div
                                key={veg}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35 + index * 0.05 }}
                                className={`${colors.bg} ${colors.border} border rounded-xl p-3`}
                            >
                                <p className={`text-xs font-bold ${colors.text} uppercase mb-1`}>{veg}</p>
                                <p className="text-lg font-bold text-slate-800">{data.quantity} kg</p>
                                <p className="text-xs text-slate-500">{data.count} purchases</p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Purchase History Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm"
            >
                <h2 className="text-lg font-bold text-slate-800 mb-4">Complete Purchase History</h2>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-slate-100">
                            <tr>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Date</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Vegetable</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Farmer</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Qty (kg)</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Rate (₹/kg)</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Amount</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {purchaseHistory.map((purchase, index) => {
                                const colors = getVegetableColor(purchase.vegetable);
                                return (
                                    <motion.tr
                                        key={purchase.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.45 + index * 0.03 }}
                                        className="hover:bg-slate-50/50"
                                    >
                                        <td className="py-3 text-sm text-slate-600">
                                            {new Date(purchase.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} text-xs font-medium`}>
                                                {purchase.vegetable} ({purchase.variety})
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm text-slate-600">{purchase.farmer}</td>
                                        <td className="py-3 text-right text-sm font-medium text-slate-700">{purchase.quantity}</td>
                                        <td className="py-3 text-right text-sm text-slate-600">₹{purchase.rate}</td>
                                        <td className="py-3 text-right font-bold text-emerald-600">₹{purchase.amount.toLocaleString()}</td>
                                        <td className="py-3 text-right">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${purchase.status === 'Paid'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {purchase.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {purchaseHistory.map((purchase, index) => {
                        const colors = getVegetableColor(purchase.vegetable);
                        return (
                            <motion.div
                                key={purchase.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {new Date(purchase.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <span className={`inline-flex px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} text-xs font-medium mt-1`}>
                                            {purchase.vegetable} ({purchase.variety})
                                        </span>
                                    </div>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${purchase.status === 'Paid'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {purchase.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">Farmer: {purchase.farmer}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">{purchase.quantity} kg @ ₹{purchase.rate}/kg</span>
                                    <span className="font-bold text-emerald-600">₹{purchase.amount.toLocaleString()}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
