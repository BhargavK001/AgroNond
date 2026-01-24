import React, { useState } from 'react';
import { Store, Phone, MapPin, Search } from 'lucide-react';

export default function TradersView({ transactions }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Aggregate data by trader
    const tradersMap = transactions.reduce((acc, curr) => {
        const name = curr.trader.name;
        if (!acc[name]) {
            acc[name] = {
                name,
                totalBought: 0,
                paid: 0,
                pending: 0,
                transactions: 0
            };
        }
        acc[name].transactions += 1;
        acc[name].totalBought += curr.traderReceivable;
        if (curr.traderPaid) {
            acc[name].paid += curr.traderReceivable;
        } else {
            acc[name].pending += curr.traderReceivable;
        }
        return acc;
    }, {});

    const traders = Object.values(tradersMap);

    const filteredTraders = traders.filter(trader =>
        trader.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search traders..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTraders.map((trader) => (
                    <div key={trader.name} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <Store className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{trader.name}</h3>
                                    <p className="text-xs text-slate-500">{trader.transactions} orders</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Volume</span>
                                <span className="font-medium text-slate-900">₹{trader.totalBought.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Paid</span>
                                <span className="font-medium text-emerald-600">₹{trader.paid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Pending</span>
                                <span className={`font-medium ${trader.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                    ₹{trader.pending.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Traffic Light Status Bar */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${trader.pending === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className="text-xs font-medium text-slate-600">
                                    {trader.pending === 0 ? 'All Clear' : 'Payment Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
