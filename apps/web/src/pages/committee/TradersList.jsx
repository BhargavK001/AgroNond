import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, Phone, Calendar, Store, Plus } from 'lucide-react';
import AddTraderModal from '../../components/committee/AddTraderModal';

// Mock trader data
const initialTradersData = [
  { id: 1, businessName: 'Sharma Traders', ownerName: 'Rajesh Sharma', phone: '9876543220', licenseNo: 'TRD-2024-001', totalPurchases: 485000, lastActive: '2026-01-21', status: 'Active' },
  { id: 2, businessName: 'Gupta & Sons', ownerName: 'Manoj Gupta', phone: '9876543221', licenseNo: 'TRD-2024-002', totalPurchases: 312000, lastActive: '2026-01-20', status: 'Active' },
  { id: 3, businessName: 'Fresh Mart', ownerName: 'Vikram Singh', phone: '9876543222', licenseNo: 'TRD-2024-003', totalPurchases: 278000, lastActive: '2026-01-21', status: 'Active' },
  { id: 4, businessName: 'City Grocers', ownerName: 'Amit Patel', phone: '9876543223', licenseNo: 'TRD-2024-004', totalPurchases: 195000, lastActive: '2026-01-19', status: 'Active' },
  { id: 5, businessName: 'Veggie World', ownerName: 'Sunil Yadav', phone: '9876543224', licenseNo: 'TRD-2024-005', totalPurchases: 421000, lastActive: '2026-01-21', status: 'Active' },
  { id: 6, businessName: 'Green Valley', ownerName: 'Deepak Kumar', phone: '9876543225', licenseNo: 'TRD-2024-006', totalPurchases: 156000, lastActive: '2026-01-18', status: 'Inactive' },
];

export default function TradersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [traders, setTraders] = useState(initialTradersData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTraders = traders.filter(trader =>
    trader.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trader.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trader.phone.includes(searchTerm)
  );

  const handleAddTrader = (newTrader) => {
    setTraders(prev => [newTrader, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Registered Traders</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">View all traders and their purchase records</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Trader
        </motion.button>
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
            placeholder="Search by business, owner, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-blue-50 rounded-xl p-4 border border-blue-100"
        >
          <p className="text-xs text-blue-600 font-medium uppercase">Total Traders</p>
          <p className="text-2xl font-bold text-blue-700">{traders.length}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"
        >
          <p className="text-xs text-emerald-600 font-medium uppercase">Total Purchases</p>
          <p className="text-2xl font-bold text-emerald-700">₹{(traders.reduce((acc, t) => acc + t.totalPurchases, 0) / 100000).toFixed(1)}L</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-purple-50 rounded-xl p-4 border border-purple-100"
        >
          <p className="text-xs text-purple-600 font-medium uppercase">Active</p>
          <p className="text-2xl font-bold text-purple-700">{traders.filter(t => t.status === 'Active').length}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50 rounded-xl p-4 border border-amber-100"
        >
          <p className="text-xs text-amber-600 font-medium uppercase">Active Today</p>
          <p className="text-2xl font-bold text-amber-700">{traders.filter(t => t.lastActive === '2026-01-21').length}</p>
        </motion.div>
      </div>

      {/* Traders Table - Desktop */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Business</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Owner</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Contact</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Total Purchases</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Last Active</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTraders.map((trader, index) => (
              <motion.tr 
                key={trader.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.03 }}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">{trader.businessName}</span>
                      {trader.licenseNo && (
                        <p className="text-xs text-slate-400">{trader.licenseNo}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{trader.ownerName}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{trader.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-blue-600">₹{trader.totalPurchases.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                    trader.status === 'Active' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {trader.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-slate-500">
                    {new Date(trader.lastActive).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Traders Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredTraders.map((trader, index) => (
          <motion.div
            key={trader.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{trader.businessName}</h3>
                  <p className="text-xs text-slate-500">{trader.ownerName}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                trader.status === 'Active' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {trader.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Purchases</p>
                <p className="font-bold text-sm text-blue-600">₹{(trader.totalPurchases / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Phone</p>
                <p className="font-bold text-sm text-slate-700 truncate">{trader.phone.slice(-4)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Last</p>
                <p className="font-bold text-sm text-slate-700">
                  {new Date(trader.lastActive).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Trader Modal */}
      <AddTraderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTrader}
      />
    </div>
  );
}
