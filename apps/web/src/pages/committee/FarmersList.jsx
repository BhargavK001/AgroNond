import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, Phone, Plus } from 'lucide-react';
import AddFarmerModal from '../../components/committee/AddFarmerModal';

// Mock farmer data
const initialFarmersData = [
  { id: 1, name: 'Ramesh Kumar', phone: '9876543210', village: 'Khajuri', totalSales: 285000, lastActive: '2026-01-21', totalQuantity: 12500 },
  { id: 2, name: 'Suresh Patel', phone: '9876543211', village: 'Mandla', totalSales: 198000, lastActive: '2026-01-20', totalQuantity: 8900 },
  { id: 3, name: 'Mahesh Singh', phone: '9876543212', village: 'Pipariya', totalSales: 342000, lastActive: '2026-01-21', totalQuantity: 15200 },
  { id: 4, name: 'Dinesh Yadav', phone: '9876543213', village: 'Barela', totalSales: 156000, lastActive: '2026-01-19', totalQuantity: 7200 },
  { id: 5, name: 'Ganesh Thakur', phone: '9876543214', village: 'Sihora', totalSales: 421000, lastActive: '2026-01-21', totalQuantity: 18900 },
  { id: 6, name: 'Rajesh Sharma', phone: '9876543215', village: 'Katni', totalSales: 178000, lastActive: '2026-01-18', totalQuantity: 8100 },
  { id: 7, name: 'Mukesh Verma', phone: '9876543216', village: 'Damoh', totalSales: 265000, lastActive: '2026-01-20', totalQuantity: 11800 },
  { id: 8, name: 'Naresh Gupta', phone: '9876543217', village: 'Panna', totalSales: 312000, lastActive: '2026-01-21', totalQuantity: 14200 },
];

export default function FarmersList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [farmers, setFarmers] = useState(initialFarmersData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.phone.includes(searchTerm)
  );

  const handleAddFarmer = (newFarmer) => {
    setFarmers(prev => [newFarmer, ...prev]);
  };

  const handleFarmerClick = (farmerId) => {
    navigate(`/dashboard/committee/farmers/${farmerId}`);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Registered Farmers</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">View all farmers and their sales records</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Farmer
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
            placeholder="Search by name, village, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
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
          className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"
        >
          <p className="text-xs text-emerald-600 font-medium uppercase">Total Farmers</p>
          <p className="text-2xl font-bold text-emerald-700">{farmers.length}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-xl p-4 border border-blue-100"
        >
          <p className="text-xs text-blue-600 font-medium uppercase">Total Sales</p>
          <p className="text-2xl font-bold text-blue-700">₹{(farmers.reduce((acc, f) => acc + f.totalSales, 0) / 100000).toFixed(1)}L</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-purple-50 rounded-xl p-4 border border-purple-100"
        >
          <p className="text-xs text-purple-600 font-medium uppercase">Total Qty</p>
          <p className="text-2xl font-bold text-purple-700">{(farmers.reduce((acc, f) => acc + f.totalQuantity, 0) / 1000).toFixed(1)}T</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50 rounded-xl p-4 border border-amber-100"
        >
          <p className="text-xs text-amber-600 font-medium uppercase">Active Today</p>
          <p className="text-2xl font-bold text-amber-700">{farmers.filter(f => f.lastActive === '2026-01-21').length}</p>
        </motion.div>
      </div>

      {/* Farmers Table - Desktop */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Farmer</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Contact</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Village</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Total Sales</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Quantity</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Last Active</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFarmers.map((farmer, index) => (
              <motion.tr 
                key={farmer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.03 }}
                onClick={() => handleFarmerClick(farmer.id)}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {farmer.name[0]}
                    </div>
                    <span className="font-semibold text-slate-800">{farmer.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{farmer.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{farmer.village}</td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-emerald-600">₹{farmer.totalSales.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-medium text-slate-700">{farmer.totalQuantity.toLocaleString()} kg</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-slate-500">
                    {new Date(farmer.lastActive).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Farmers Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredFarmers.map((farmer, index) => (
          <motion.div
            key={farmer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={() => handleFarmerClick(farmer.id)}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                  {farmer.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{farmer.name}</h3>
                  <p className="text-xs text-slate-500">{farmer.village}</p>
                </div>
              </div>
              <div className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Sales</p>
                <p className="font-bold text-sm text-emerald-600">₹{(farmer.totalSales / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Qty</p>
                <p className="font-bold text-sm text-slate-700">{(farmer.totalQuantity / 1000).toFixed(1)}T</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Last</p>
                <p className="font-bold text-sm text-slate-700">
                  {new Date(farmer.lastActive).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Farmer Modal */}
      <AddFarmerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddFarmer}
      />
    </div>
  );
}
