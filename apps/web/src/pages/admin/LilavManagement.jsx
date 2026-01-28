import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Gavel, User, Coins, TrendingUp, Filter } from 'lucide-react';
import api from '../../lib/api';

export default function LilavManagement() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: bids, isLoading } = useQuery({
        queryKey: ['admin-lilav'],
        queryFn: () => api.admin.lilavBids()
    });

    const filteredBids = bids?.filter(bid =>
        bid.farmer_id?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.trader_id?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.vegetable?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Lilav (Auction) Management</h1>
                    <p className="text-gray-500 mt-1">Real-time auction records and sales history</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                        <input
                            type="text"
                            placeholder="Search crop, farmer, trader..."
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Buyer (Trader)</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-emerald-800 uppercase tracking-wider">Rate (₹/kg)</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider pl-8">Auctioneer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading auction records...</td></tr>
                            ) : filteredBids?.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No auction records found</td></tr>
                            ) : (
                                filteredBids?.map((bid) => (
                                    <tr key={bid._id} className="hover:bg-emerald-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-700">{new Date(bid.sold_at).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-400">{new Date(bid.sold_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{bid.vegetable}</div>
                                            <div className="text-sm text-slate-500">
                                                {bid.official_qty} kg • {bid.farmer_id?.full_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                                    {bid.trader_id?.business_name?.[0] || 'T'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{bid.trader_id?.business_name || bid.trader_id?.full_name}</div>
                                                    <div className="text-xs text-slate-500">{bid.trader_id?.customId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">₹{bid.sale_rate}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-emerald-600 text-lg">₹{bid.sale_amount?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 pl-8">
                                            <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                                                {bid.sold_by?.full_name || 'System'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
