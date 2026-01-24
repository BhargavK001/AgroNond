import React from 'react';
import ReportsView from './components/ReportsView';

export default function AccountingReports() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
                <p className="text-slate-500 mt-1">Generate and download financial summaries.</p>
            </div>
            <ReportsView />
        </div>
    );
}
