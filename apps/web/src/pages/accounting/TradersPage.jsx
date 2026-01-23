import React from 'react';
import { transactionsData } from './data';
import TradersView from './components/TradersView';

export default function TradersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Traders</h1>
                <p className="text-slate-500 mt-1">Monitor trader accounts and payment statuses.</p>
            </div>
            <TradersView transactions={transactionsData} />
        </div>
    );
}
