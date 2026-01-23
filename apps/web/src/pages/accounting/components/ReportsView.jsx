import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

export default function ReportsView() {
    const reports = [
        {
            title: 'Daily Transaction Report',
            description: 'Complete list of all transactions for the current day.',
            type: 'Daily'
        },
        {
            title: 'Trader Outstanding Summary',
            description: 'Consolidated view of all pending payments from traders.',
            type: 'Weekly'
        },
        {
            title: 'Commission Earnings',
            description: 'breakdown of committee earnings from farmers and traders.',
            type: 'Monthly'
        },
        {
            title: 'Farmer Payout Sheet',
            description: 'List of all farmers to be paid for the selected period.',
            type: 'Weekly'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            {report.type}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{report.description}</p>

                    <button className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            ))}
        </div>
    );
}
