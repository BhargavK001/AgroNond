import { useState, useEffect } from 'react';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import api from '../../lib/api';

export default function CashFlow() {
  const [receivedPayments, setReceivedPayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        const response = await api.finance.cashflow();
        setReceivedPayments(response.received);
        setPendingPayments(response.pending);
      } catch (error) {
        console.error("Failed to fetch cash flow:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCashFlow();
  }, []);

  const cashFlowSummary = {
    totalReceived: receivedPayments.reduce((acc, p) => acc + p.amount, 0),
    totalPending: pendingPayments.reduce((acc, p) => acc + p.amount, 0),
    get totalCashFlow() { return this.totalReceived + this.totalPending; },
    traderReceived: receivedPayments.filter(p => p.type === 'trader').reduce((acc, p) => acc + p.amount, 0),
    farmerReceived: receivedPayments.filter(p => p.type === 'farmer').reduce((acc, p) => acc + p.amount, 0),
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Cash Flow</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Track received and pending payments</p>
      </div>

      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Received</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">₹{cashFlowSummary.totalReceived.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">{receivedPayments.length} transactions settled</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">₹{cashFlowSummary.totalPending.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">{pendingPayments.length} payments processing</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Cash Flow</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">₹{cashFlowSummary.totalCashFlow.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">All time volume</p>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">From Traders</p>
          <p className="text-xl font-bold text-slate-900">₹{cashFlowSummary.traderReceived.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">From Farmers</p>
          <p className="text-xl font-bold text-slate-900">₹{cashFlowSummary.farmerReceived.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Trader Pending</p>
          <p className="text-xl font-bold text-amber-600">
            ₹{pendingPayments.filter(p => p.type === 'trader').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Farmer Pending</p>
          <p className="text-xl font-bold text-amber-600">
            ₹{pendingPayments.filter(p => p.type === 'farmer').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received Payments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-800">Received Payments</h3>
            </div>
            <span className="text-sm text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-100">
              ₹{cashFlowSummary.totalReceived.toLocaleString()}
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {receivedPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">{payment.from}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200 uppercase tracking-wide">
                        {payment.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{payment.reference}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">+₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-slate-800">Pending Payments</h3>
            </div>
            <span className="text-sm text-amber-700 font-bold px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-100">
              ₹{cashFlowSummary.totalPending.toLocaleString()}
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">{payment.from}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200 uppercase tracking-wide">
                        {payment.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        Due: {new Date(payment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">₹{payment.amount.toLocaleString()}</p>
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1">
                      Send Reminder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
