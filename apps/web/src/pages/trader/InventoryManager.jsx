import { useState } from 'react';
import { motion } from 'framer-motion';

const inventoryData = [
  { id: 1, crop: 'Tomato (Hybrid)', batchId: 'TOM-2601', quantity: 850, maxQuantity: 1000, unit: 'kg', location: 'Warehouse A', daysInStorage: 3, status: 'good', price: 42 },
  { id: 2, crop: 'Onion (Red)', batchId: 'ONI-2602', quantity: 2200, maxQuantity: 2500, unit: 'kg', location: 'Warehouse B', daysInStorage: 7, status: 'good', price: 18 },
  { id: 3, crop: 'Potato', batchId: 'POT-2603', quantity: 150, maxQuantity: 800, unit: 'kg', location: 'Warehouse A', daysInStorage: 12, status: 'low', price: 25 },
  { id: 4, crop: 'Cabbage', batchId: 'CAB-2604', quantity: 400, maxQuantity: 600, unit: 'kg', location: 'Cold Storage', daysInStorage: 5, status: 'good', price: 15 },
  { id: 5, crop: 'Okra', batchId: 'OKR-2605', quantity: 50, maxQuantity: 200, unit: 'kg', location: 'Warehouse A', daysInStorage: 2, status: 'critical', price: 35 },
];

const totalStock = inventoryData.reduce((acc, item) => acc + item.quantity, 0);
const totalValue = inventoryData.reduce((acc, item) => acc + (item.quantity * item.price), 0);
const lowStockItems = inventoryData.filter(item => item.status === 'low' || item.status === 'critical').length;

export default function InventoryManager() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredInventory = inventoryData.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'low') return item.status === 'low' || item.status === 'critical';
    return item.status === selectedFilter;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Responsive */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 sm:space-y-4"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-sm font-medium mb-1.5 sm:mb-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Stock Management
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">Inventory</h1>
        </div>
        
        {/* Stats - Responsive Scroll */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible">
          <div className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-slate-100 shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] sm:text-xs text-slate-500">Stock</p>
              <p className="text-xs sm:text-base font-bold text-slate-800">{totalStock.toLocaleString()} kg</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-slate-100 shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] sm:text-xs text-slate-500">Value</p>
              <p className="text-xs sm:text-base font-bold text-emerald-600">₹{totalValue.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          {lowStockItems > 0 && (
            <div className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-red-50 rounded-lg sm:rounded-2xl border border-red-100 shrink-0">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] sm:text-xs text-red-600">Low Stock</p>
                <p className="text-xs sm:text-base font-bold text-red-700">{lowStockItems} items</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stock Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-3 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h2 className="text-sm sm:text-lg font-bold text-slate-800">Stock Overview</h2>
          <div className="flex gap-2">
            <div className="flex p-0.5 sm:p-1 bg-slate-100 rounded-lg sm:rounded-2xl flex-1 sm:flex-none">
              {['all', 'good', 'low'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`relative flex-1 sm:flex-none px-2.5 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm font-medium rounded-md sm:rounded-xl transition-all ${
                    selectedFilter === filter ? 'text-white' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {selectedFilter === filter && (
                    <motion.div
                      layoutId="inventoryFilter"
                      className="absolute inset-0 bg-emerald-600 rounded-md sm:rounded-xl shadow-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{filter === 'all' ? 'All' : filter === 'good' ? 'OK' : 'Low'}</span>
                </button>
              ))}
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors">
              + Add
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {filteredInventory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -2 }}
                className="group"
              >
                <div className="p-2.5 sm:p-5 bg-slate-50 hover:bg-white rounded-lg sm:rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all h-full">
                  <div className="flex items-start justify-between mb-2 sm:mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs sm:text-base text-slate-800 truncate group-hover:text-emerald-700 transition-colors">{item.crop}</h3>
                      <p className="text-[8px] sm:text-xs text-slate-400 font-mono mt-0.5">{item.batchId}</p>
                    </div>
                    <span className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium shrink-0 ml-1 ${
                      item.status === 'good' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : item.status === 'low' 
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'good' ? '✓' : '⚠'}
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <div className="flex justify-between text-[9px] sm:text-sm mb-1 sm:mb-2">
                        <span className="text-slate-500">Stock</span>
                        <span className="font-medium text-slate-700">{item.quantity}/{item.maxQuantity}</span>
                      </div>
                      <div className="h-1.5 sm:h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.quantity / item.maxQuantity) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
                          className={`h-full rounded-full ${
                            item.status === 'good' 
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                              : item.status === 'low'
                                ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                                : 'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] sm:text-sm pt-1.5 sm:pt-3 border-t border-slate-100">
                      <span className="text-slate-400 truncate">{item.location}</span>
                      <span className="font-bold text-emerald-600 shrink-0">₹{item.price}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
