import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Wheat, Package, TrendingUp } from 'lucide-react';

// Mock market activity data
const marketActivityData = [
  { id: 1, date: '2026-01-21', farmer: 'Ramesh Kumar', crop: 'Tomato', variety: 'Hybrid', quantity: 500, rate: 40, status: 'Sold' },
  { id: 2, date: '2026-01-21', farmer: 'Suresh Patel', crop: 'Onion', variety: 'Red', quantity: 1200, rate: 15, status: 'Sold' },
  { id: 3, date: '2026-01-21', farmer: 'Mahesh Singh', crop: 'Potato', variety: 'Kufri', quantity: 800, rate: 22, status: 'Available' },
  { id: 4, date: '2026-01-20', farmer: 'Dinesh Yadav', crop: 'Cabbage', variety: 'Green', quantity: 600, rate: 12, status: 'Sold' },
  { id: 5, date: '2026-01-20', farmer: 'Ganesh Thakur', crop: 'Cauliflower', variety: 'Snowball', quantity: 400, rate: 30, status: 'Available' },
  { id: 6, date: '2026-01-20', farmer: 'Rajesh Sharma', crop: 'Tomato', variety: 'Desi', quantity: 350, rate: 35, status: 'Sold' },
  { id: 7, date: '2026-01-19', farmer: 'Mukesh Verma', crop: 'Green Chilli', variety: 'Hybrid', quantity: 200, rate: 45, status: 'Sold' },
  { id: 8, date: '2026-01-19', farmer: 'Naresh Gupta', crop: 'Capsicum', variety: 'Yellow', quantity: 150, rate: 80, status: 'Sold' },
];

const cropColors = {
  'Tomato': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Onion': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Potato': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Cabbage': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Cauliflower': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  'Green Chilli': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'Capsicum': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

export default function MarketActivity() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCrop, setFilterCrop] = useState('all');

  const uniqueCrops = [...new Set(marketActivityData.map(item => item.crop))];

  const filteredData = marketActivityData.filter(item => {
    const matchesSearch = item.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = filterCrop === 'all' || item.crop === filterCrop;
    return matchesSearch && matchesCrop;
  });

  const totalQuantity = filteredData.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = filteredData.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const soldItems = filteredData.filter(item => item.status === 'Sold').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Market Activity</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Track vegetables and quantities brought to market</p>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by farmer or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
          />
        </div>
        <select
          value={filterCrop}
          onChange={(e) => setFilterCrop(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
        >
          <option value="all">All Crops</option>
          {uniqueCrops.map(crop => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"
        >
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-emerald-600" />
            <p className="text-xs text-emerald-600 font-medium uppercase">Total Quantity</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{totalQuantity.toLocaleString()} kg</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-xl p-4 border border-blue-100"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-600 font-medium uppercase">Total Value</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">₹{totalValue.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-purple-50 rounded-xl p-4 border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wheat className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-purple-600 font-medium uppercase">Crop Types</p>
          </div>
          <p className="text-2xl font-bold text-purple-700">{uniqueCrops.length}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50 rounded-xl p-4 border border-amber-100"
        >
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-amber-600" />
            <p className="text-xs text-amber-600 font-medium uppercase">Sold Today</p>
          </div>
          <p className="text-2xl font-bold text-amber-700">{soldItems}</p>
        </motion.div>
      </div>

      {/* Activity Table - Desktop */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Date</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Farmer</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Crop</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Quantity</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Rate/kg</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Value</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((item, index) => {
              const colors = cropColors[item.crop] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
              return (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800">{item.farmer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border text-xs font-medium`}>
                      {item.crop} ({item.variety})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-slate-700">{item.quantity.toLocaleString()} kg</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">₹{item.rate}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-emerald-600">₹{(item.quantity * item.rate).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Sold' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Activity Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredData.map((item, index) => {
          const colors = cropColors[item.crop] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-slate-800">{item.farmer}</h3>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === 'Sold' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <span className={`inline-flex px-3 py-1 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border text-xs font-medium mb-3`}>
                {item.crop} ({item.variety})
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Qty</p>
                  <p className="font-bold text-sm text-slate-700">{item.quantity} kg</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Rate</p>
                  <p className="font-bold text-sm text-slate-700">₹{item.rate}/kg</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Value</p>
                  <p className="font-bold text-sm text-emerald-600">₹{(item.quantity * item.rate).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
