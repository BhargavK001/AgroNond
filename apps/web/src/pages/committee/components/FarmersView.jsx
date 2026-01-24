import React, { useState } from 'react';
import { User, Phone, Search, ChevronRight, X, Calendar, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FarmersView({ transactions }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState(null);

    // Aggregate data by farmer
    const farmersMap = transactions.reduce((acc, curr) => {
        const id = curr.farmer.id;
        if (!acc[id]) {
            acc[id] = {
                id: curr.farmer.id,
                name: curr.farmer.name,
                phone: curr.farmer.phone,
                totalSold: 0,
                received: 0,
                due: 0,
                transactions: [],
                transactionCount: 0
            };
        }
        acc[id].transactions.push(curr);
        acc[id].transactionCount += 1;
        acc[id].totalSold += curr.farmerPayable;
        if (curr.farmerPaid) {
            acc[id].received += curr.farmerPayable;
        } else {
            acc[id].due += curr.farmerPayable;
        }
        return acc;
    }, {});

    const farmers = Object.values(farmersMap).filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 relative min-h-[500px]">
            {/* Search Bar */}
            <div className="relative z-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search farmers by name or phone..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {farmers.map((farmer) => {
                    const isFullyPaid = farmer.due === 0;
                    return (
                        <div
                            key={farmer.id}
                            onClick={() => setSelectedFarmer(farmer)}
                            className="group cursor-pointer bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 transition-all duration-300 overflow-hidden"
                        >
                            {/* Header Section */}
                            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/30 group-hover:bg-emerald-50/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${isFullyPaid ? 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-200' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200'}`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-tight">{farmer.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                            <Phone className="w-3 h-3" />
                                            <span>{farmer.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isFullyPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                    {isFullyPaid ? 'Settled' : 'Pending'}
                                </span>
                            </div>

                            {/* Stats Grid */}
                            <div className="p-5 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Earned</p>
                                    <p className="text-lg font-bold text-slate-900 mt-0.5">₹{farmer.totalSold.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Lots Sold</p>
                                    <p className="text-lg font-bold text-slate-900 mt-0.5">{farmer.transactionCount}</p>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className={`px-5 py-4 ${isFullyPaid ? 'bg-slate-50/50' : 'bg-amber-50/30'} flex items-center justify-between`}>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-500">Payment Status</span>
                                    <span className={`text-sm font-bold ${isFullyPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {isFullyPaid ? 'All payments received' : `₹${farmer.due.toLocaleString()} Due`}
                                    </span>
                                </div>
                                {/* View Details Button */}
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Farmer Details Overlay (Slide-over) */}
            <AnimatePresence>
                {selectedFarmer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFarmer(null)}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
                        />

                        {/* Slide-over Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-slate-200"
                        >
                            {/* Panel Header */}
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex items-center justify-between z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedFarmer.name}</h2>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                        <Phone className="w-3 h-3" />
                                        <span>{selectedFarmer.phone}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFarmer(null)}
                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                        <p className="text-xs text-emerald-600 font-medium uppercase mb-1">Total Paid</p>
                                        <p className="text-xl font-bold text-emerald-700">₹{selectedFarmer.received.toLocaleString()}</p>
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-2" />
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                        <p className="text-xs text-amber-600 font-medium uppercase mb-1">Pending Due</p>
                                        <p className="text-xl font-bold text-amber-700">₹{selectedFarmer.due.toLocaleString()}</p>
                                        <Clock className="w-4 h-4 text-amber-500 mt-2" />
                                    </div>
                                </div>

                                {/* Transaction History */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        Recent Transactions
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedFarmer.transactions.map((txn, idx) => (
                                            <div key={idx} className="group bg-slate-50 rounded-xl p-4 border border-slate-100 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">{new Date(txn.date).toLocaleDateString('en-IN')}</p>
                                                        <p className="font-bold text-slate-800 text-sm mt-0.5">{txn.crop}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${txn.farmerPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {txn.farmerPaid ? 'PAID' : 'PENDING'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end border-t border-slate-200/50 pt-2 mt-2">
                                                    <div className="text-xs text-slate-500">
                                                        {txn.quantity}kg x ₹{txn.rate}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-400 uppercase">Payable Amount</p>
                                                        <p className="font-bold text-slate-900">₹{txn.farmerPayable.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
                                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    <ArrowUpRight className="w-4 h-4" />
                                    Download Statement
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
