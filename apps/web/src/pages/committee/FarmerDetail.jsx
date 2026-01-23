import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MapPin, Calendar, TrendingUp, Package, Wheat, IndianRupee } from 'lucide-react';

// Mock farmer data - same as FarmersList
const farmersData = [
  { id: 1, name: 'Ramesh Kumar', phone: '9876543210', village: 'Khajuri', totalSales: 285000, lastActive: '2026-01-21', totalQuantity: 12500 },
  { id: 2, name: 'Suresh Patel', phone: '9876543211', village: 'Mandla', totalSales: 198000, lastActive: '2026-01-20', totalQuantity: 8900 },
  { id: 3, name: 'Mahesh Singh', phone: '9876543212', village: 'Pipariya', totalSales: 342000, lastActive: '2026-01-21', totalQuantity: 15200 },
  { id: 4, name: 'Dinesh Yadav', phone: '9876543213', village: 'Barela', totalSales: 156000, lastActive: '2026-01-19', totalQuantity: 7200 },
  { id: 5, name: 'Ganesh Thakur', phone: '9876543214', village: 'Sihora', totalSales: 421000, lastActive: '2026-01-21', totalQuantity: 18900 },
  { id: 6, name: 'Rajesh Sharma', phone: '9876543215', village: 'Katni', totalSales: 178000, lastActive: '2026-01-18', totalQuantity: 8100 },
  { id: 7, name: 'Mukesh Verma', phone: '9876543216', village: 'Damoh', totalSales: 265000, lastActive: '2026-01-20', totalQuantity: 11800 },
  { id: 8, name: 'Naresh Gupta', phone: '9876543217', village: 'Panna', totalSales: 312000, lastActive: '2026-01-21', totalQuantity: 14200 },
];

// Mock sales history for each farmer
const salesHistoryData = {
  1: [
    { id: 101, date: '2026-01-21', vegetable: 'Tomato', variety: 'Hybrid', quantity: 500, rate: 40, amount: 20000, trader: 'Sharma Traders', status: 'Paid' },
    { id: 102, date: '2026-01-20', vegetable: 'Onion', variety: 'Red', quantity: 800, rate: 25, amount: 20000, trader: 'Gupta & Sons', status: 'Paid' },
    { id: 103, date: '2026-01-18', vegetable: 'Potato', variety: 'White', quantity: 1200, rate: 18, amount: 21600, trader: 'Fresh Mart', status: 'Pending' },
    { id: 104, date: '2026-01-15', vegetable: 'Cabbage', variety: 'Green', quantity: 600, rate: 15, amount: 9000, trader: 'City Grocers', status: 'Paid' },
    { id: 105, date: '2026-01-12', vegetable: 'Cauliflower', variety: 'White', quantity: 400, rate: 35, amount: 14000, trader: 'Sharma Traders', status: 'Paid' },
  ],
  2: [
    { id: 201, date: '2026-01-20', vegetable: 'Onion', variety: 'White', quantity: 1000, rate: 22, amount: 22000, trader: 'Fresh Mart', status: 'Paid' },
    { id: 202, date: '2026-01-17', vegetable: 'Garlic', variety: 'Local', quantity: 200, rate: 120, amount: 24000, trader: 'Gupta & Sons', status: 'Pending' },
    { id: 203, date: '2026-01-14', vegetable: 'Ginger', variety: 'Fresh', quantity: 150, rate: 80, amount: 12000, trader: 'City Grocers', status: 'Paid' },
  ],
  3: [
    { id: 301, date: '2026-01-21', vegetable: 'Tomato', variety: 'Desi', quantity: 800, rate: 45, amount: 36000, trader: 'Sharma Traders', status: 'Pending' },
    { id: 302, date: '2026-01-19', vegetable: 'Green Chilli', variety: 'Long', quantity: 300, rate: 60, amount: 18000, trader: 'Veggie World', status: 'Paid' },
    { id: 303, date: '2026-01-16', vegetable: 'Capsicum', variety: 'Yellow', quantity: 250, rate: 80, amount: 20000, trader: 'Fresh Mart', status: 'Paid' },
    { id: 304, date: '2026-01-13', vegetable: 'Brinjal', variety: 'Purple', quantity: 500, rate: 30, amount: 15000, trader: 'City Grocers', status: 'Paid' },
  ],
};

// Generate default sales for farmers without specific data
const getDefaultSales = (farmerId) => [
  { id: farmerId * 100 + 1, date: '2026-01-20', vegetable: 'Tomato', variety: 'Hybrid', quantity: 400, rate: 42, amount: 16800, trader: 'Sharma Traders', status: 'Paid' },
  { id: farmerId * 100 + 2, date: '2026-01-17', vegetable: 'Potato', variety: 'Local', quantity: 600, rate: 20, amount: 12000, trader: 'Fresh Mart', status: 'Paid' },
  { id: farmerId * 100 + 3, date: '2026-01-14', vegetable: 'Onion', variety: 'Red', quantity: 500, rate: 28, amount: 14000, trader: 'Gupta & Sons', status: 'Pending' },
];

// Vegetable color mapping
const vegetableColors = {
  'Tomato': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Onion': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Potato': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Cabbage': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Cauliflower': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  'Green Chilli': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'Capsicum': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Garlic': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Ginger': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Brinjal': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
};

const getVegetableColor = (veg) => vegetableColors[veg] || { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };

export default function FarmerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const farmer = farmersData.find(f => f.id === parseInt(id));
  const salesHistory = salesHistoryData[id] || getDefaultSales(parseInt(id));

  if (!farmer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Farmer Not Found</h2>
        <p className="text-slate-500 mb-4">The farmer you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/dashboard/committee/farmers')}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Back to Farmers List
        </button>
      </div>
    );
  }

  // Calculate vegetable summary
  const vegetableSummary = salesHistory.reduce((acc, sale) => {
    if (!acc[sale.vegetable]) {
      acc[sale.vegetable] = { quantity: 0, amount: 0, count: 0 };
    }
    acc[sale.vegetable].quantity += sale.quantity;
    acc[sale.vegetable].amount += sale.amount;
    acc[sale.vegetable].count += 1;
    return acc;
  }, {});

  const totalSalesAmount = salesHistory.reduce((acc, s) => acc + s.amount, 0);
  const totalQuantity = salesHistory.reduce((acc, s) => acc + s.quantity, 0);
  const pendingAmount = salesHistory.filter(s => s.status === 'Pending').reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/dashboard/committee/farmers')}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Farmers</span>
        </button>

        {/* Farmer Profile Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/20">
              {farmer.name[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{farmer.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {farmer.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {farmer.village}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Last active: {new Date(farmer.lastActive).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Total Sales</p>
              <p className="text-xl font-bold text-slate-800">₹{totalSalesAmount.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Total Quantity</p>
              <p className="text-xl font-bold text-slate-800">{totalQuantity.toLocaleString()} kg</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Wheat className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Vegetables</p>
              <p className="text-xl font-bold text-slate-800">{Object.keys(vegetableSummary).length} types</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Pending</p>
              <p className="text-xl font-bold text-amber-600">₹{pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Vegetable Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-800 mb-4">Vegetables Brought</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(vegetableSummary).map(([veg, data], index) => {
            const colors = getVegetableColor(veg);
            return (
              <motion.div
                key={veg}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className={`${colors.bg} ${colors.border} border rounded-xl p-3`}
              >
                <p className={`text-xs font-bold ${colors.text} uppercase mb-1`}>{veg}</p>
                <p className="text-lg font-bold text-slate-800">{data.quantity} kg</p>
                <p className="text-xs text-slate-500">{data.count} transactions</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Sales History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-800 mb-4">Complete Sales History</h2>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Vegetable</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Trader</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Qty (kg)</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Rate (₹/kg)</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Amount</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {salesHistory.map((sale, index) => {
                const colors = getVegetableColor(sale.vegetable);
                return (
                  <motion.tr 
                    key={sale.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.03 }}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="py-3 text-sm text-slate-600">
                      {new Date(sale.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} text-xs font-medium`}>
                        {sale.vegetable} ({sale.variety})
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-600">{sale.trader}</td>
                    <td className="py-3 text-right text-sm font-medium text-slate-700">{sale.quantity}</td>
                    <td className="py-3 text-right text-sm text-slate-600">₹{sale.rate}</td>
                    <td className="py-3 text-right font-bold text-emerald-600">₹{sale.amount.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        sale.status === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {salesHistory.map((sale, index) => {
            const colors = getVegetableColor(sale.vegetable);
            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(sale.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <span className={`inline-flex px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} text-xs font-medium mt-1`}>
                      {sale.vegetable} ({sale.variety})
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    sale.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {sale.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">Sold to: {sale.trader}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{sale.quantity} kg @ ₹{sale.rate}/kg</span>
                  <span className="font-bold text-emerald-600">₹{sale.amount.toLocaleString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
