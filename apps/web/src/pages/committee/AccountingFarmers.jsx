import React from 'react';
import { transactionsData } from './accountingData';
import FarmersView from './components/FarmersView';

export default function AccountingFarmers() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Farmers</h1>
                <p className="text-slate-500 mt-1">Track farmer payouts and commission earnings.</p>
            </div>
            <FarmersView transactions={transactionsData} />
        </div>
    );
}
