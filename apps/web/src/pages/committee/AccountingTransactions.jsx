import React from 'react';
import { transactionsData } from './accountingData';
import TransactionsView from './components/TransactionsView';

export default function AccountingTransactions() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
                <p className="text-slate-500 mt-1">View and manage all transaction records.</p>
            </div>
            <TransactionsView transactions={transactionsData} />
        </div>
    );
}
