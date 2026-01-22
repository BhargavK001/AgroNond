import { useState } from 'react';
import { Download, FileText, Users, ShoppingBag } from 'lucide-react';

// Mock commission data
const commissionData = [
  { id: 1, date: '2026-01-21', farmer: 'Ramesh Kumar', trader: 'Sharma Traders', baseAmount: 20000, farmerComm: 800, traderComm: 1800, netFarmer: 19200, netTrader: 21800 },
  { id: 2, date: '2026-01-20', farmer: 'Suresh Patel', trader: 'Gupta & Sons', baseAmount: 18000, farmerComm: 720, traderComm: 1620, netFarmer: 17280, netTrader: 19620 },
  { id: 3, date: '2026-01-19', farmer: 'Mahesh Singh', trader: 'Fresh Mart', baseAmount: 17600, farmerComm: 704, traderComm: 1584, netFarmer: 16896, netTrader: 19184 },
  { id: 4, date: '2026-01-18', farmer: 'Dinesh Yadav', trader: 'Sharma Traders', baseAmount: 7200, farmerComm: 288, traderComm: 648, netFarmer: 6912, netTrader: 7848 },
  { id: 5, date: '2026-01-17', farmer: 'Ganesh Thakur', trader: 'City Grocers', baseAmount: 12000, farmerComm: 480, traderComm: 1080, netFarmer: 11520, netTrader: 13080 },
];

const commissionSummary = {
  totalBase: commissionData.reduce((acc, item) => acc + item.baseAmount, 0),
  totalFarmerComm: commissionData.reduce((acc, item) => acc + item.farmerComm, 0),
  totalTraderComm: commissionData.reduce((acc, item) => acc + item.traderComm, 0),
  get totalCommission() { return this.totalFarmerComm + this.totalTraderComm; }
};

export default function CommissionCalculator() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Commission Calculator</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Automatic commission calculation for all transactions</p>
      </div>

      {/* Commission Rules Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-sky-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 text-sm">Farmer Commission</h3>
              <p className="text-4xl font-bold text-slate-800">4%</p>
              <p className="text-slate-500 text-xs">Deducted from farmer's billing amount</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 text-sm">Trader Commission</h3>
              <p className="text-4xl font-bold text-slate-800">9%</p>
              <p className="text-slate-500 text-xs">Added to trader's billing amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Base Volume</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-800">₹{commissionSummary.totalBase.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all">
          <p className="text-xs text-blue-600 font-medium uppercase mb-1">Farmer Comm. (4%)</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-700">₹{commissionSummary.totalFarmerComm.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all">
          <p className="text-xs text-purple-600 font-medium uppercase mb-1">Trader Comm. (9%)</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-700">₹{commissionSummary.totalTraderComm.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 hover:shadow-md transition-all">
          <p className="text-xs text-emerald-600 font-medium uppercase mb-1">Total Commission</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700">₹{commissionSummary.totalCommission.toLocaleString()}</p>
        </div>
      </div>

      {/* Commission Table - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Commission Breakdown</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Date</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Farmer</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Trader</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Base Amt</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Farmer (4%)</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Trader (9%)</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {commissionData.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="font-medium text-slate-800">{item.farmer}</span>
                    <p className="text-xs text-emerald-600">Net: ₹{item.netFarmer.toLocaleString()}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="font-medium text-slate-800">{item.trader}</span>
                    <p className="text-xs text-purple-600">Total: ₹{item.netTrader.toLocaleString()}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">₹{item.baseAmount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                    -₹{item.farmerComm.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium">
                    +₹{item.traderComm.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                    <FileText className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commission Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {commissionData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                  {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <h3 className="font-bold text-slate-800">{item.farmer}</h3>
                <p className="text-xs text-slate-500">→ {item.trader}</p>
              </div>
              <button className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                <FileText className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-slate-500 mb-1">Base Amount</p>
              <p className="font-bold text-lg text-slate-800">₹{item.baseAmount.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                <p className="text-[10px] text-blue-600 uppercase">Farmer (4%)</p>
                <p className="font-bold text-sm text-blue-700">-₹{item.farmerComm}</p>
                <p className="text-[10px] text-blue-500">Net: ₹{item.netFarmer.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-100">
                <p className="text-[10px] text-purple-600 uppercase">Trader (9%)</p>
                <p className="font-bold text-sm text-purple-700">+₹{item.traderComm}</p>
                <p className="text-[10px] text-purple-500">Total: ₹{item.netTrader.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
