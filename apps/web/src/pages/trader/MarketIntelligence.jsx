import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Mock Price Data
const priceData = [
  { day: 'Mon', tomato: 38, onion: 15, potato: 22 },
  { day: 'Tue', tomato: 42, onion: 18, potato: 24 },
  { day: 'Wed', tomato: 40, onion: 16, potato: 23 },
  { day: 'Thu', tomato: 45, onion: 20, potato: 26 },
  { day: 'Fri', tomato: 48, onion: 22, potato: 28 },
  { day: 'Sat', tomato: 44, onion: 19, potato: 25 },
  { day: 'Sun', tomato: 46, onion: 21, potato: 27 },
];

// Mandi Data
const mandiData = [
  { name: 'Pune APMC', tomato: 42, onion: 18, potato: 25, trend: 'up', change: '+3%' },
  { name: 'Nashik Mandi', tomato: 38, onion: 22, potato: 23, trend: 'down', change: '-2%' },
  { name: 'Solapur Market', tomato: 45, onion: 16, potato: 28, trend: 'up', change: '+5%' },
  { name: 'Kolhapur APMC', tomato: 40, onion: 20, potato: 26, trend: 'neutral', change: '0%' },
];

const newsFeed = [
  { id: 1, title: 'Onion prices surge 15% in Nashik APMC', time: '2h ago', category: 'Alert', trend: 'up' },
  { id: 2, title: 'New cold storage facility opens in Pune', time: '5h ago', category: 'News', trend: 'neutral' },
  { id: 3, title: 'Government announces new MSP for tomatoes', time: '1d ago', category: 'Policy', trend: 'up' },
];

const topCrops = [
  { name: 'Tomato', price: 45, change: '+12%', trend: 'up' },
  { name: 'Onion', price: 20, change: '+8%', trend: 'up' },
  { name: 'Potato', price: 26, change: '-3%', trend: 'down' },
  { name: 'Cabbage', price: 15, change: '+5%', trend: 'up' },
];

export default function MarketIntelligence() {
  const [selectedCrop, setSelectedCrop] = useState('tomato');

  const cropColors = {
    tomato: { stroke: '#10b981', fill: '#d1fae5' },
    onion: { stroke: '#8b5cf6', fill: '#ede9fe' },
    potato: { stroke: '#f59e0b', fill: '#fef3c7' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Market Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Price Analytics</h1>
      </motion.div>

      {/* Quick Stats - Horizontal Scroll on Mobile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4"
      >
        {topCrops.map((crop, index) => (
          <motion.div
            key={crop.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all cursor-pointer shrink-0 w-36 sm:w-auto"
          >
            <p className="text-xs sm:text-sm text-slate-500">{crop.name}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">₹{crop.price}<span className="text-xs sm:text-sm font-normal text-slate-400">/kg</span></p>
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${crop.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              <svg className={`w-3 h-3 ${crop.trend === 'up' ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {crop.change}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Price Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Price Trends</h2>
              <p className="text-xs sm:text-sm text-slate-500">Weekly movement</p>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-xl sm:rounded-2xl">
              {['tomato', 'onion', 'potato'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium rounded-lg sm:rounded-xl transition-all capitalize ${
                    selectedCrop === crop ? 'text-white' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {selectedCrop === crop && (
                    <motion.div
                      layoutId="cropSelector"
                      className="absolute inset-0 bg-emerald-600 rounded-lg sm:rounded-xl shadow-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{crop}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={cropColors[selectedCrop].stroke} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={cropColors[selectedCrop].stroke} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v}`} width={35} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    fontSize: '12px'
                  }} 
                  formatter={(value) => [`₹${value}/kg`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedCrop} 
                  stroke={cropColors[selectedCrop].stroke}
                  strokeWidth={2}
                  fill="url(#colorGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Mandi Comparison Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Mandi Prices</h2>
            <p className="text-xs sm:text-sm text-slate-500">Compare nearby markets</p>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {mandiData.map((mandi, index) => (
              <motion.div
                key={mandi.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md shrink-0">
                    {mandi.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-slate-800 truncate">{mandi.name}</p>
                    <div className="flex gap-1 sm:gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">🍅₹{mandi.tomato}</span>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">🧅₹{mandi.onion}</span>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">🥔₹{mandi.potato}</span>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shrink-0 ${
                  mandi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' 
                  : mandi.trend === 'down' ? 'bg-red-100 text-red-700'
                  : 'bg-slate-200 text-slate-600'
                }`}>
                  {mandi.trend !== 'neutral' && (
                    <svg className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${mandi.trend === 'down' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-[10px] sm:text-xs font-bold">{mandi.change}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* News Feed - Compact for Mobile */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">Market News</h2>
          <button className="text-xs sm:text-sm font-medium text-emerald-600">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {newsFeed.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 ${
                  news.category === 'Alert' ? 'bg-red-500 animate-pulse' 
                  : news.category === 'Policy' ? 'bg-purple-500'
                  : 'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-slate-800 group-hover:text-emerald-700 transition-colors">{news.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs text-slate-400">{news.time}</span>
                    <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{news.category}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
