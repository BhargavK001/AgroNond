import React, { useState } from 'react';
import { FileText, Download, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { DatePicker } from "@heroui/react";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";

export default function ReportsView() {
    // Default to today
    const [dateRange, setDateRange] = useState({
        start: today(getLocalTimeZone()),
        end: today(getLocalTimeZone())
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

    const handleDownload = (reportTitle, period = 'Custom Range') => {
        const rangeText = period === 'Today'
            ? 'Today'
            : `${dateRange.start.toString()} to ${dateRange.end.toString()}`;

        toast.success(`Downloading ${reportTitle} for ${rangeText}`);

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
                                Download PDF
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
                        <DatePicker
                            label="From Date"
                            className="w-full"
                            value={dateRange.start}
                            onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                            popoverProps={{
                                className: "bg-white shadow-xl border border-slate-200"
                            }}
                        />

                        <div className="flex justify-center text-slate-400">
                            <ArrowRight className="w-7 h-4 rotate-90" />
                        </div>

                        <DatePicker
                            label="To Date"
                            className="w-full"
                            value={dateRange.end}
                            onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                            popoverProps={{
                                className: "bg-white shadow-xl border border-slate-200"
                            }}
                        />

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
