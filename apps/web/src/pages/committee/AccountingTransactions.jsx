import React, { useState, useEffect } from 'react';
import TransactionsView from './components/TransactionsView';
import api from '../../lib/api';

export default function AccountingTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                // Fetch billing records (using a higher limit for the full list view)
                const response = await api.finance.billingRecords.list({ limit: 100 });

                if (response && response.records) {
                    const formattedDetails = response.records.map(t => ({
                        id: t._id,
                        date: new Date(t.sold_at || t.createdAt).toISOString().split('T')[0],
                        farmer: { name: t.farmer_id?.full_name || 'Unknown' },
                        trader: { name: t.trader_id?.business_name || t.trader_id?.full_name || 'Unknown' },
                        crop: t.vegetable,
                        quantity: t.qtySold || t.quantity,
                        rate: t.sale_rate || t.rate,
                        baseAmount: t.sale_amount,
                        paymentStatus: t.payment_status === 'paid' ? 'Completed' :
                            t.payment_status === 'pending' ? 'Pending' :
                                t.payment_status === 'partial' ? 'Partial' : t.payment_status
                    }));
                    setTransactions(formattedDetails);
                }
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
                <p className="text-slate-500 mt-1">View and manage all transaction records.</p>
            </div>
            {loading ? (
                <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <TransactionsView transactions={transactions} />
            )}
        </div>
    );
}
