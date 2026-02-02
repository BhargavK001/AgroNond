import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Clock,
    User,
    ChevronDown,
    Loader,
    Activity,
    FileText,
    CreditCard,
    Scale,
    Gavel,
    RefreshCw
} from 'lucide-react';
import api from '../../lib/api';

const entityTypeLabels = {
    payment: { label: 'Payment', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
    weight: { label: 'Weight', icon: Scale, color: 'text-blue-600 bg-blue-50' },
    lilav: { label: 'Lilav/Auction', icon: Gavel, color: 'text-purple-600 bg-purple-50' },
    farmer: { label: 'Farmer', icon: User, color: 'text-orange-600 bg-orange-50' },
    trader: { label: 'Trader', icon: User, color: 'text-indigo-600 bg-indigo-50' },
    record: { label: 'Record', icon: FileText, color: 'text-gray-600 bg-gray-50' },
    user: { label: 'User', icon: User, color: 'text-pink-600 bg-pink-50' },
    commission: { label: 'Commission', icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
    daily_rate: { label: 'Daily Rate', icon: Activity, color: 'text-cyan-600 bg-cyan-50' },
};

const actionLabels = {
    create: { label: 'Created', color: 'bg-green-100 text-green-700' },
    update: { label: 'Updated', color: 'bg-blue-100 text-blue-700' },
    delete: { label: 'Deleted', color: 'bg-red-100 text-red-700' },
};

export default function ActivityLog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [entityFilter, setEntityFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [page, setPage] = useState(1);

    // Fetch audit logs
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['admin-audit-logs', page, entityFilter, actionFilter, searchQuery],
        queryFn: () => api.admin.auditLogs.list({
            page,
            limit: 25,
            entity_type: entityFilter !== 'all' ? entityFilter : undefined,
            action: actionFilter !== 'all' ? actionFilter : undefined,
            search: searchQuery || undefined,
        }),
        keepPreviousData: true,
    });

    // Fetch summary stats
    const { data: summary } = useQuery({
        queryKey: ['admin-audit-summary'],
        queryFn: () => api.admin.auditLogs.summary(),
    });

    const logs = data?.logs || [];
    const totalPages = data?.totalPages || 1;
    const total = data?.total || 0;

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get relative time
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    if (isLoading && page === 1) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Failed to load audit logs: {error.message}</p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 text-emerald-600 font-medium hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
                    <p className="text-gray-500 mt-1">Track all user actions and changes</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                >
                    <RefreshCw size={18} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Summary Stats */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-500">Total Logs</p>
                        <p className="text-2xl font-bold text-gray-800">{summary.totalLogs?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-500">Today's Activity</p>
                        <p className="text-2xl font-bold text-emerald-600">{summary.todayLogs?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm col-span-2">
                        <p className="text-sm text-gray-500 mb-2">Active Users Today</p>
                        <div className="flex flex-wrap gap-2">
                            {summary.recentActiveUsers?.slice(0, 5).map((user, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                                        {(user.user_name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                    <span className="font-medium">{user.user_name}</span>
                                    <span className="text-gray-400">({user.count})</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by description or user..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                    </div>

                    {/* Entity Type Filter */}
                    <div className="relative">
                        <select
                            value={entityFilter}
                            onChange={(e) => {
                                setEntityFilter(e.target.value);
                                setPage(1);
                            }}
                            className="appearance-none w-full lg:w-44 px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white"
                        >
                            <option value="all">All Types</option>
                            {Object.keys(entityTypeLabels).map(key => (
                                <option key={key} value={key}>{entityTypeLabels[key].label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Action Filter */}
                    <div className="relative">
                        <select
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                setPage(1);
                            }}
                            className="appearance-none w-full lg:w-36 px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white"
                        >
                            <option value="all">All Actions</option>
                            <option value="create">Created</option>
                            <option value="update">Updated</option>
                            <option value="delete">Deleted</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Activity List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
                <div className="divide-y divide-gray-100">
                    {logs.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p>No activity logs found matching your filters.</p>
                        </div>
                    ) : (
                        logs.map((log) => {
                            const entityConfig = entityTypeLabels[log.entity_type] || { label: log.entity_type, icon: Activity, color: 'text-gray-600 bg-gray-50' };
                            const actionConfig = actionLabels[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700' };
                            const IconComponent = entityConfig.icon;

                            return (
                                <div key={log._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`p-2.5 rounded-xl ${entityConfig.color}`}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${actionConfig.color}`}>
                                                    {actionConfig.label}
                                                </span>
                                                <span className="text-xs text-gray-400">{entityConfig.label}</span>
                                            </div>
                                            <p className="text-sm text-gray-800 mt-1 font-medium">{log.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3.5 h-3.5" />
                                                    {log.user_name}
                                                    <span className="text-gray-400">({log.user_role})</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {getRelativeTime(log.timestamp)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-gray-400">{formatDate(log.timestamp)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {logs.length} of {total} logs
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-sm self-center">Page {page} of {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
