import { useState } from 'react';
import { motion } from 'framer-motion';

const farmers = [
  { id: 1, name: 'Suresh Deshmukh', location: 'Nashik', crop: 'Tomato', rating: 4.8, transactions: 24, totalValue: '₹4.5L' },
  { id: 2, name: 'Ramesh Patil', location: 'Pune', crop: 'Onion', rating: 4.5, transactions: 18, totalValue: '₹3.2L' },
  { id: 3, name: 'Vijay Kumar', location: 'Satara', crop: 'Ginger', rating: 4.2, transactions: 12, totalValue: '₹2.1L' },
  { id: 4, name: 'Anil Jadhav', location: 'Kolhapur', crop: 'Sugarcane', rating: 4.9, transactions: 32, totalValue: '₹6.8L' },
  { id: 5, name: 'Sunita Devi', location: 'Solapur', crop: 'Pomegranate', rating: 4.7, transactions: 15, totalValue: '₹5.2L' },
  { id: 6, name: 'Rajesh Singh', location: 'Mumbai', crop: 'Exotic Veg', rating: 4.1, transactions: 8, totalValue: '₹1.8L' },
];

export default function FarmerDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {farmers.length} Active Farmers
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Farmer Network</h1>
          </div>
          
          {/* Add Farmer Button - Desktop */}
          <button className="hidden sm:flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-2xl transition-colors shadow-lg shadow-emerald-600/20 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Farmer
          </button>
        </div>
        
        {/* Search + Mobile Add Button Row */}
        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <svg className="w-5 h-5 text-slate-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search farmers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          {/* Mobile Add Button */}
          <button className="sm:hidden flex items-center justify-center w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Farmers Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredFarmers.map((farmer, index) => (
          <motion.div 
            key={farmer.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-emerald-200 transition-all duration-300">
              {/* Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-lg">
                    {farmer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate group-hover:text-emerald-700 transition-colors">{farmer.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm mt-0.5">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{farmer.location}</span>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-100 shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs font-bold text-amber-700">{farmer.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crop Tag */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-medium">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                  {farmer.crop}
                </span>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">{farmer.transactions}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">Transactions</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600">{farmer.totalValue}</p>
                  <p className="text-[10px] sm:text-xs text-emerald-600/70">Total Value</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl sm:rounded-2xl transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl sm:rounded-2xl transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
