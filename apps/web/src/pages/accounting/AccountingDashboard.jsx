import React from 'react';

export default function AccountingDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Accounting Department</h1>
        <p className="text-slate-500 mt-2">
          This is the new dedicated section for the Accounting department.
          Previous accounting features have been moved to the Market Committee dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholders for new features */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center justify-center h-40">
          <p className="text-slate-400 font-medium">New Feature Placeholder</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center justify-center h-40">
          <p className="text-slate-400 font-medium">New Feature Placeholder</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center justify-center h-40">
          <p className="text-slate-400 font-medium">New Feature Placeholder</p>
        </div>
      </div>
    </div>
  );
}
