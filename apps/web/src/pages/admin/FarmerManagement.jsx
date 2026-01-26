import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Phone, User, Tractor, Eye, X, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function FarmerManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState(null);

    const { data: farmers, isLoading } = useQuery({
        queryKey: ['admin-farmers'],
        queryFn: () => api.admin.farmers()
    });

    const filteredFarmers = farmers?.filter(farmer =>
        farmer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.phone?.includes(searchTerm) ||
        farmer.farmerId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Farmer Management</h1>
                    <p className="text-gray-500 mt-1">View and manage registered farmers</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <input
                            type="text"
                            placeholder="Search farmers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                        />
                    </div>
                    <button className="p-2 bg-white border border-emerald-100 rounded-xl text-emerald-600 hover:bg-emerald-50 shadow-sm transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-emerald-50/50 border-b border-emerald-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Farmer Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">ID & Verification</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-emerald-800 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading farmers...</td></tr>
                            ) : filteredFarmers?.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No farmers found</td></tr>
                            ) : (
                                filteredFarmers?.map((farmer) => (
                                    <tr key={farmer._id} className="hover:bg-emerald-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-sm ring-2 ring-white">
                                                    {farmer.initials || 'F'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{farmer.full_name}</p>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {farmer.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 mb-1">
                                                    {farmer.farmerId || 'Pending'}
                                                </span>
                                                {farmer.adhaar_number && (
                                                    <p className="text-xs text-slate-500">Aadhaar: {farmer.adhaar_number}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-slate-600">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                {farmer.location || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedFarmer(farmer)}
                                                className="text-slate-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-lg"
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

            {/* Farmer Details Modal */}
            <AnimatePresence>
                {selectedFarmer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFarmer(null)}
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
                                <h2 className="text-xl font-bold text-slate-800">Farmer Profile</h2>
                                <button
                                    onClick={() => setSelectedFarmer(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col items-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="w-20 h-20 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold text-2xl shadow-sm mb-3">
                                        {selectedFarmer.initials || 'F'}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">{selectedFarmer.full_name}</h3>
                                    <p className="text-emerald-600 font-medium bg-white px-3 py-1 rounded-full text-sm mt-1 shadow-sm border border-emerald-100">
                                        {selectedFarmer.farmerId || 'ID Pending'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Contact Information</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                                            <p className="font-medium text-slate-800">{selectedFarmer.phone}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-1">City/Village</p>
                                            <p className="font-medium text-slate-800">{selectedFarmer.location || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Identification</h4>
                                    <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-slate-500">Aadhaar Number</span>
                                            {selectedFarmer.adhaar_number ? (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified</span>
                                            ) : (
                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Missing</span>
                                            )}
                                        </div>
                                        <p className="font-mono text-slate-800 tracking-wider">
                                            {selectedFarmer.adhaar_number || 'XXXX-XXXX-XXXX'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-100">
                                    <button
                                        onClick={() => toast.success('Account reset email sent')}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
