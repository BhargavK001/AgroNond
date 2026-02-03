import React, { useState } from 'react';
import { FileText, Download, Calendar as CalendarIcon, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { exportToCSV } from '../../lib/csvExport';

export default function ReportsView() {
    const [loading, setLoading] = useState(false);
    // Default to today
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const reports = [
        {
            title: 'Daily Transaction Report',
            description: 'Complete list of all transactions for the selected period.',
            type: 'Transaction'
        },
        {
            title: 'Commission Earnings',
            description: 'Breakdown of committee earnings from farmers and traders.',
            type: 'Commission'
        }
    ];

    const handleDownload = async (reportTitle, period = 'Custom Range') => {
        try {
            setLoading(true);
            const rangeText = period === 'Today'
                ? 'Today'
                : `${dateRange.start} to ${dateRange.end}`;

            toast.loading(`Fetching ${reportTitle}...`, { id: 'export-toast' });

            // Fetch data
            const params = {
                startDate: period === 'Today' ? new Date().toISOString().split('T')[0] : dateRange.start,
                endDate: period === 'Today' ? new Date().toISOString().split('T')[0] : dateRange.end,
                limit: 5000 // Ensure we get all records
            };

            // Use purchases.list (records/completed) as source of truth
            const response = await api.purchases.list(params);
            const data = Array.isArray(response) ? response : (response.data || []);

            if (!data || data.length === 0) {
                toast.error('No records found for this period', { id: 'export-toast' });
                return;
            }

            let headers = [];
            let csvData = [];
            let filename = '';

            if (reportTitle.includes('Commission')) {
                headers = ['Date', 'Lot ID', 'Farmer', 'Trader', 'Crop', 'Qty (kg)', 'Sale Amount', 'Farmer Commission', 'Trader Commission', 'Total Commission'];
                csvData = data.map(t => [
                    new Date(t.sold_at || t.date || t.createdAt).toLocaleDateString('en-IN'),
                    t.lot_id,
                    t.farmer_id?.full_name || 'Unknown',
                    t.trader_id?.business_name || t.trader_id?.full_name || 'Unknown',
                    t.vegetable,
                    t.official_qty || t.quantity,
                    t.sale_amount,
                    t.farmer_commission || 0,
                    t.trader_commission || 0,
                    (t.farmer_commission || 0) + (t.trader_commission || 0)
                ]);
                filename = `commission-report-${params.startDate}.csv`;
            } else {
                // Transaction Report
                headers = ['Date', 'Lot ID', 'Farmer', 'Trader', 'Crop', 'Qty (kg)', 'Rate', 'Amount', 'Status'];
                csvData = data.map(t => [
                    new Date(t.sold_at || t.date || t.createdAt).toLocaleDateString('en-IN'),
                    t.lot_id,
                    t.farmer_id?.full_name || 'Unknown',
                    t.trader_id?.business_name || t.trader_id?.full_name || 'Unknown',
                    t.vegetable,
                    t.official_qty || t.quantity,
                    t.sale_rate,
                    t.sale_amount,
                    t.payment_status || 'Pending'
                ]);
                filename = `transaction-report-${params.startDate}.csv`;
            }

            exportToCSV(csvData, headers, filename);
            toast.success(`${reportTitle} Downloaded!`, { id: 'export-toast' });

        } catch (error) {
            console.error(error);
            toast.error('Failed to export report', { id: 'export-toast' });
        } finally {
            setLoading(false);
        }
    };

    const todayReports = [
        {
            title: 'Daily Transaction Report',
            description: "Complete list of today's transactions.",
            type: 'Daily',
            action: () => handleDownload('Daily Transaction Report', 'Today')
        },
        {
            title: 'Commission Earnings',
            description: "Breakdown of today's committee earnings.",
            type: 'Daily',
            action: () => handleDownload('Commission Earnings', 'Today')
        }
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Reports Section (Left) */}
            <div className="flex-1 space-y-4">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Today's Reports</h2>
                    <p className="text-sm text-slate-500">Quick access to daily summaries</p>
                </div>
                {todayReports.map((report, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText className="w-24 h-24 text-emerald-600 transform rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                    <FileText className="w-6 h-6 text-emerald-600" />
                                </div>
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    {report.type}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{report.title}</h3>
                            <p className="text-slate-500 mb-6 max-w-lg">{report.description}</p>

                            <button
                                onClick={report.action}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                            >
                                <Download className="w-4 h-2" />
                                Download CSV
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendar Section (Right) */}
            <div className="w-full lg:w-80 shrink-0 lg:mt-20">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <CalendarIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-slate-900">Select Date Range</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">From Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>

                        <div className="flex justify-center text-slate-400">
                            <ArrowRight className="w-5 h-5 rotate-90" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">To Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Download for Range</p>

                            <button
                                onClick={() => handleDownload('Daily Transaction Report')}
                                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all text-sm group"
                            >
                                <span>Transaction Report</span>
                                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                            </button>

                            <button
                                onClick={() => handleDownload('Commission Earnings')}
                                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all text-sm group"
                            >
                                <span>Commission Report</span>
                                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
