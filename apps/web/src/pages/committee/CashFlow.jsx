import { useState } from 'react';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';

// Mock cash flow data
const receivedPayments = [
  { id: 1, date: '2026-01-21', from: 'Sharma Traders', type: 'trader', amount: 21800, reference: 'TXN-2026-001' },
  { id: 2, date: '2026-01-20', from: 'Fresh Mart', type: 'trader', amount: 19184, reference: 'TXN-2026-002' },
  { id: 3, date: '2026-01-19', from: 'Ramesh Kumar', type: 'farmer', amount: 800, reference: 'COM-2026-001' },
  { id: 4, date: '2026-01-18', from: 'Sharma Traders', type: 'trader', amount: 7848, reference: 'TXN-2026-003' },
  { id: 5, date: '2026-01-17', from: 'Mahesh Singh', type: 'farmer', amount: 704, reference: 'COM-2026-002' },
];

const pendingPayments = [
  { id: 1, dueDate: '2026-01-25', from: 'Gupta & Sons', type: 'trader', amount: 19620, daysOverdue: 0 },
  { id: 2, dueDate: '2026-01-23', from: 'City Grocers', type: 'trader', amount: 13080, daysOverdue: 0 },
  { id: 3, dueDate: '2026-01-22', from: 'Suresh Patel', type: 'farmer', amount: 720, daysOverdue: 0 },
  { id: 4, dueDate: '2026-01-22', from: 'Ganesh Thakur', type: 'farmer', amount: 480, daysOverdue: 0 },
];

const cashFlowSummary = {
  totalReceived: receivedPayments.reduce((acc, p) => acc + p.amount, 0),
  totalPending: pendingPayments.reduce((acc, p) => acc + p.amount, 0),
  get totalCashFlow() { return this.totalReceived + this.totalPending; },
  traderReceived: receivedPayments.filter(p => p.type === 'trader').reduce((acc, p) => acc + p.amount, 0),
  farmerReceived: receivedPayments.filter(p => p.type === 'farmer').reduce((acc, p) => acc + p.amount, 0),
};

export default function CashFlow() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Cash Flow</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Track received and pending payments</p>
      </div>

      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Received</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">₹{cashFlowSummary.totalReceived.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium">{receivedPayments.length} transactions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-200 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">₹{cashFlowSummary.totalPending.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-amber-600 font-medium">{pendingPayments.length} awaiting</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-sky-200 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Cash Flow</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">₹{cashFlowSummary.totalCashFlow.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-sky-600 font-medium">All time</p>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">From Traders</p>
          <p className="text-xl font-bold text-purple-600">₹{cashFlowSummary.traderReceived.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">From Farmers</p>
          <p className="text-xl font-bold text-blue-600">₹{cashFlowSummary.farmerReceived.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Trader Pending</p>
          <p className="text-xl font-bold text-amber-600">
            ₹{pendingPayments.filter(p => p.type === 'trader').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Farmer Pending</p>
          <p className="text-xl font-bold text-amber-600">
            ₹{pendingPayments.filter(p => p.type === 'farmer').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received Payments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-800">Received Payments</h3>
            </div>
            <span className="text-sm text-emerald-600 font-bold">₹{cashFlowSummary.totalReceived.toLocaleString()}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {receivedPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-800">{payment.from}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        payment.type === 'trader' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {payment.type === 'trader' ? 'Trader' : 'Farmer'}
                      </span>
                      <span className="text-xs text-slate-400">{payment.reference}</span>
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-slate-800">Pending Payments</h3>
            </div>
            <span className="text-sm text-amber-600 font-bold">₹{cashFlowSummary.totalPending.toLocaleString()}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-800">{payment.from}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        payment.type === 'trader' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {payment.type === 'trader' ? 'Trader' : 'Farmer'}
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
