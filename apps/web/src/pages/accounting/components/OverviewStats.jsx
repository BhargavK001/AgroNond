import React from 'react';
import { Wallet, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function OverviewStats({ summary }) {
    const stats = [
        {
            label: 'Total Volume',
            value: `₹${(summary.totalBaseAmount / 100000).toFixed(2)}L`,
            subtext: `${summary.totalTransactions} transactions`,
            icon: Wallet,
            trend: 'neutral'
        },
        {
            label: 'Total Commission',
            value: `₹${(summary.totalCommission / 1000).toFixed(1)}K`,
            subtext: `13% blended avg`,
            icon: PieChart,
            trend: 'positive'
        },
        {
            label: 'Received (Traders)',
            value: `₹${(summary.receivedPayments / 100000).toFixed(2)}L`,
            subtext: `${summary.pendingCount} pending`,
            icon: ArrowDownRight,
            trend: 'neutral'
        },
        {
            label: 'Paid (Farmers)',
            value: `₹${(summary.farmerPaymentsPaid / 100000).toFixed(2)}L`,
            subtext: `₹${(summary.farmerPaymentsDue / 1000).toFixed(1)}K due`,
            icon: ArrowUpRight,
            trend: 'neutral'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 bg-emerald-50 rounded-lg">
                            <stat.icon className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                    <p className="text-xs text-slate-400 mt-2">{stat.subtext}</p>
                </div>
            ))}
        </div>
    );
}
