import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Building2, Phone, FileCheck, Filter, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function TraderManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrader, setSelectedTrader] = useState(null);

    const { data: traders, isLoading } = useQuery({
        queryKey: ['admin-traders'],
        queryFn: () => api.admin.traders()
    });

    const filteredTraders = traders?.filter(trader =>
        trader.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trader.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trader.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Trader Management</h1>
                    <p className="text-gray-500 mt-1">View and manage registered traders and licenses</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                        <input
                            type="text"
                            placeholder="Search traders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                    </div>
                    <button className="p-2 bg-white border border-blue-100 rounded-xl text-blue-600 hover:bg-blue-50 shadow-sm transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-blue-50/50 border-b border-blue-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Trader Profile</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Business Info</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">License Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-blue-800 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {isLoading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading traders...</td></tr>
                            ) : filteredTraders?.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No traders found</td></tr>
                            ) : (
                                filteredTraders?.map((trader) => (
                                    <tr key={trader._id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-sm ring-2 ring-white">
                                                    {trader.business_name?.[0] || trader.full_name?.[0] || 'T'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{trader.full_name}</p>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {trader.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-800 flex items-center gap-2">
                                                    <Building2 className="w-3 h-3 text-slate-400" />
                                                    {trader.business_name || 'No Business Name'}
                                                </p>
                                                {trader.address && (
                                                    <p className="text-xs text-slate-500 mt-0.5">{trader.address}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {trader.license_number ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <FileCheck className="w-3 h-3" />
                                                        {trader.license_number}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                                        Pending License
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedTrader(trader)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Trader Details Modal */}
            <AnimatePresence>
                {selectedTrader && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTrader(null)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-800">Trader Profile</h2>
                                <button
                                    onClick={() => setSelectedTrader(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col items-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                    <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-2xl shadow-sm mb-3">
                                        {selectedTrader.business_name?.[0] || 'T'}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">{selectedTrader.business_name}</h3>
                                    <p className="text-slate-500 text-sm font-medium">
                                        {selectedTrader.full_name}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Business & License</h4>
                                    <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-slate-500">License Status</span>
                                            {selectedTrader.license_number ? (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                                            ) : (
                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Under Review</span>
                                            )}
                                        </div>
                                        {selectedTrader.license_number ? (
                                            <p className="font-mono text-slate-800 tracking-wider">
                                                {selectedTrader.license_number}
                                            </p>
                                        ) : (
                                            <div className="flex flex-col gap-2 mt-2">
                                                <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                                                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                                    License verification is pending.
                                                </div>
                                                <button
                                                    onClick={() => toast.success('License approved successfully!')}
                                                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
                                                >
                                                    Approve License
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Contact Details</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <Phone className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Mobile</p>
                                                <p className="font-medium text-slate-800">{selectedTrader.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
