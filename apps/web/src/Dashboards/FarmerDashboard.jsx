import React, { useState } from 'react';
import { 
  Plus, 
  Bell, 
  TrendingUp, 
  Clock, 
  Package, 
  X, 
  ChevronRight 
} from 'lucide-react';

const FarmerDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data for Frontend Visualization
  const records = [
    { id: 1, date: '20-Jan-2026', type: 'Tomato (Hybrid)', quantity: '500 kg', status: 'Pending', price: '-' },
    { id: 2, date: '18-Jan-2026', type: 'Onion (Red)', quantity: '1200 kg', status: 'Sold', price: '₹18,000' },
    { id: 3, date: '15-Jan-2026', type: 'Potato', quantity: '800 kg', status: 'Sold', price: '₹12,400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold text-gray-800">AgroNond <span className="text-sm font-normal text-gray-500">| Farmer Panel</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition">
              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                JD
              </div>
              <div className="hidden md:block text-sm text-left">
                <p className="font-medium text-gray-700">Jay Kisan</p>
                <p className="text-xs text-gray-500">ID: AGR-2024</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* --- WELCOME & ACTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Jay! 👋</h1>
            <p className="text-gray-500">Here's what's happening with your crops today.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-green-200 transition-all active:scale-95"
          >
            <Plus size={20} />
            Add New Record
          </button>
        </div>

        {/* --- QUICK STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sales (Jan)</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹ 30,400</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">₹ 0</h3>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Lots</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">1 Lot</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Package size={24} />
            </div>
          </div>
        </div>

        {/* --- RECENT ACTIVITY TABLE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Recent Records</h2>
            <button className="text-sm text-green-600 font-medium hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Vegetable</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Est. Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600">{record.date}</td>
                    <td className="p-4 font-medium text-gray-900">{record.type}</td>
                    <td className="p-4 text-gray-600">{record.quantity}</td>
                    <td className="p-4 font-medium text-gray-900">{record.price}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Sold' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- ADD RECORD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Add New Record</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Market</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition">
                  <option>Pune APMC Market</option>
                  <option>Nashik APMC Market</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vegetable Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition">
                  <option value="">Select vegetable...</option>
                  <option>Tomato</option>
                  <option>Onion</option>
                  <option>Potato</option>
                  <option>Okra (Bhindi)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Quantity (Kg)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 500" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 shadow-md shadow-green-200 transition">
                Submit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;