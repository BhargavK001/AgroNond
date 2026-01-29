import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Phone, Plus, Scale } from 'lucide-react';
import AddWeightModal from '../../components/committee/AddWeightModal';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function WeightList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [weightUsers, setWeightUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    // Fetch weight users from API
    const fetchWeightUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/users?role=weight');
            setWeightUsers(response || []);
        } catch (error) {
            console.error('Failed to fetch weight users:', error);
            toast.error('Failed to load weight users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWeightUsers();
    }, []);

    const filteredUsers = weightUsers.filter(user => {
        const matchesSearch =
            (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone || '').includes(searchTerm);
        return matchesSearch;
    });

    const handleAddUser = (newUser) => {
        setWeightUsers(prev => [newUser, ...prev]);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Weight Operators</h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">Manage weight machine operators</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Weight Operator
                </motion.button>
            </motion.div>

            {/* Search & Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, location, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                    />
                </div>
            </motion.div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"
                >
                    <p className="text-xs text-emerald-600 font-medium uppercase">Total Operators</p>
                    <p className="text-2xl font-bold text-emerald-700">{weightUsers.length}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-teal-50 rounded-xl p-4 border border-teal-100"
                >
                    <p className="text-xs text-teal-600 font-medium uppercase">Active Today</p>
                    <p className="text-2xl font-bold text-teal-700">{weightUsers.length}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="bg-purple-50 rounded-xl p-4 border border-purple-100"
                >
                    <p className="text-xs text-purple-600 font-medium uppercase">Registered</p>
                    <p className="text-2xl font-bold text-purple-700">{weightUsers.length}</p>
                </motion.div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredUsers.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Weight Operators Found</h3>
                    <p className="text-slate-500 mb-4">
                        {searchTerm ? 'No results match your search' : 'Add your first weight operator to get started'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Add Weight Operator
                        </button>
                    )}
                </motion.div>
            )}

            {/* Weight Users Table - Desktop */}
            {!isLoading && filteredUsers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Operator</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">ID</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Contact</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Location</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user, index) => (
                                <motion.tr
                                    key={user._id || user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.03 }}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold">
                                                {user.initials || (user.full_name ? user.full_name[0] : 'W')}
                                            </div>
                                            <span className="font-semibold text-slate-800">{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            {user.customId || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm">{user.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{user.location || '-'}</td>
                                    <td className="px-6 py-4 text-right text-sm text-slate-500">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Weight Users Cards - Mobile */}
            {!isLoading && filteredUsers.length > 0 && (
                <div className="md:hidden space-y-3">
                    {filteredUsers.map((user, index) => (
                        <motion.div
                            key={user._id || user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold">
                                        {user.initials || (user.full_name ? user.full_name[0] : 'W')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{user.full_name}</h3>
                                        <p className="text-xs text-slate-500">{user.customId || 'Pending ID'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <p className="text-[10px] text-slate-400 uppercase">Phone</p>
                                    <p className="font-bold text-sm text-slate-700">{user.phone?.slice(-4)}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <p className="text-[10px] text-slate-400 uppercase">Location</p>
                                    <p className="font-bold text-sm text-slate-700 truncate">{user.location || '-'}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Weight Modal */}
            <AddWeightModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddUser}
            />
        </div>
    );
}
