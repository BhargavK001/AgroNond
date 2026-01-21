import React, { useState, useEffect } from 'react';
import FarmerNavbar from '../components/FarmerNavbar';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Plus, TrendingUp, Clock, Package, X, Download, Eye, 
  Trash2, CheckCircle, Zap, Calendar, MapPin
} from 'lucide-react';

// --- MODAL COMPONENT (Unchanged) ---
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} border border-gray-200 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
};

const FarmerDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [records, setRecords] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    farmerId: '',
    location: '',
    initials: 'FK'
  });

  const [modals, setModals] = useState({
    addRecord: false,
    editProfile: false,
    markSold: false,
    details: false
  });

  const [formData, setFormData] = useState({ 
    market: '', 
    vegetable: '', 
    quantity: '' 
  });

  const [saleData, setSaleData] = useState({ 
    rate: '', 
    trader: ''
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [profileForm, setProfileForm] = useState({ ...profile });

  const COMMISSION_RATE = 0.04;

  // --- LOCAL STORAGE ---
  useEffect(() => {
    const saved = localStorage.getItem('farmer-records');
    const prof = localStorage.getItem('farmer-profile');
    if (saved) setRecords(JSON.parse(saved));
    if (prof) {
      const p = JSON.parse(prof);
      setProfile(p);
      setProfileForm(p);
    }
  }, []);

  // Listen for profile edit event from navbar
  useEffect(() => {
    const handleOpenEditProfile = () => {
      setModals({ ...modals, editProfile: true });
    };

    window.addEventListener('openEditProfile', handleOpenEditProfile);
    return () => window.removeEventListener('openEditProfile', handleOpenEditProfile);
  }, [modals]);

  useEffect(() => {
    localStorage.setItem('farmer-records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('farmer-profile', JSON.stringify(profile));
  }, [profile]);

  // --- CALCULATIONS ---
  const soldRecords = records.filter(r => r.status === 'Sold');
  const pendingRecords = records.filter(r => r.status === 'Pending');
  
  const totalGross = soldRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalCommission = totalGross * COMMISSION_RATE;
  const netIncome = totalGross - totalCommission;
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

  // --- FILTERED & SORTED RECORDS ---
  const filteredRecords = filterStatus === 'All' 
    ? records 
    : records.filter(r => r.status === filterStatus);

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'amount') return (b.totalAmount || 0) - (a.totalAmount || 0);
    return 0;
  });

  // --- HANDLERS ---
  const handleAddRecord = () => {
    if (!formData.market || !formData.vegetable || !formData.quantity) {
      toast.error('Please fill all fields');
      return;
    }

    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      market: formData.market,
      vegetable: formData.vegetable,
      quantity: parseFloat(formData.quantity),
      status: 'Pending',
      rate: 0,
      totalAmount: 0,
      trader: '-'
    };

    setRecords([newRecord, ...records]);
    setFormData({ market: '', vegetable: '', quantity: '' });
    setModals({ ...modals, addRecord: false });
    toast.success('New record added successfully!');
  };

  const openSaleModal = (record) => {
    setSelectedRecord(record);
    setSaleData({ rate: '', trader: '' });
    setModals({ ...modals, markSold: true });
  };

  const handleConfirmSale = () => {
    if (!saleData.rate || !saleData.trader) {
      toast.error('Please enter all details');
      return;
    }

    const rate = parseFloat(saleData.rate);
    const totalAmount = selectedRecord.quantity * rate;

    setRecords(records.map(r => 
      r.id === selectedRecord.id 
        ? {
            ...r,
            status: 'Sold',
            rate,
            trader: saleData.trader,
            totalAmount
          }
        : r
    ));

    setModals({ ...modals, markSold: false });
    setSelectedRecord(null);
    toast.success('Sale confirmed!');
  };

  const generateInvoice = (record) => {
    const comm = record.totalAmount * COMMISSION_RATE;
    const net = record.totalAmount - comm;

    const invoice = `
FARMER DETAILS:
  Name: ${profile.name}
  Farmer ID: ${profile.farmerId}

TRANSACTION DETAILS:
  Item: ${record.vegetable} (${record.quantity}kg)
  Net Payable: ₹${net.toLocaleString('en-IN')}
    `;

    alert(invoice);
  };

  const handleDelete = (id) => {
    if (window.confirm('Permanently delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
      toast.success('Record deleted');
    }
  };

  const saveProfile = () => {
    const initials = profileForm.name.slice(0, 2).toUpperCase() || 'FK';
    const updatedProfile = { ...profileForm, initials };
    setProfile(updatedProfile);
    localStorage.setItem('farmer-profile', JSON.stringify(updatedProfile));
    setModals({ ...modals, editProfile: false });
    
    // Trigger custom event to update navbar
    window.dispatchEvent(new CustomEvent('farmerProfileUpdated'));
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* --- NAVBAR --- */}
      <FarmerNavbar />

      {/* --- MAIN CONTENT --- */}
      {/* 📱 Mobile: Padding reduced (px-4) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-16">
        
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          {/* 📱 Mobile: Flex column for stacking, Row on desktop */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              {/* 📱 Mobile: Smaller text */}
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Farmer Dashboard</h1>
              <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            
            {/* 📱 Mobile: Full width button */}
            <button 
              onClick={() => setModals({ ...modals, addRecord: true })}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl sm:rounded-full shadow-lg shadow-green-200 transition hover:shadow-xl hover:-translate-y-1"
            >
              <Plus size={20} />
              New Record
            </button>
          </div>
        </div>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          
          {/* Net Income */}
          <div className="group bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-green-100 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <TrendingUp size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1 sm:mb-2">Net Income</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">₹{netIncome.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500">After commission</p>
          </div>

          {/* Gross Sales */}
          <div className="group bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-blue-100 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Package size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">{soldRecords.length} sales</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1 sm:mb-2">Gross Sales</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">₹{totalGross.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500">All transactions</p>
          </div>

          {/* Pending Lots */}
          <div className="group bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-orange-100 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Clock size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 rounded-full">Active</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1 sm:mb-2">Pending Lots</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{pendingRecords.length}</h3>
            <p className="text-xs text-gray-500">Awaiting sale</p>
          </div>

          {/* Total Volume */}
          <div className="group bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-purple-100 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Package size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">{records.length} items</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1 sm:mb-2">Total Volume</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totalQuantity} kg</h3>
            <p className="text-xs text-gray-500">Lifetime quantity</p>
          </div>
        </div>

        {/* --- RECORDS SECTION --- */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          
          {/* Header Controls */}
          {/* 📱 Mobile: Flex col for full width filters */}
          <div className="p-4 sm:px-8 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Records</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track all transactions</p>
            </div>
            
            <div className="flex w-full sm:w-auto gap-3">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-green-500 text-sm"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Sold</option>
              </select>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-green-500 text-sm"
              >
                <option value="recent">Recent</option>
                <option value="amount">Highest Amount</option>
              </select>
            </div>
          </div>

          {/* 📱 MOBILE VIEW: CARDS (Visible only on small screens) */}
          <div className="block sm:hidden">
            {sortedRecords.length === 0 ? (
               <div className="p-8 text-center">
                 <p className="text-gray-500">No records found</p>
               </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Top Row: Date & Status */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-gray-500">{record.date}</span>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          record.status === 'Sold'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {record.status === 'Sold' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {record.status}
                      </span>
                    </div>

                    {/* Middle Row: Details */}
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{record.vegetable}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                          <MapPin size={12} />
                          {record.market}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{record.quantity} kg</p>
                        {record.status === 'Sold' ? (
                          <p className="text-sm font-bold text-green-600">₹{record.totalAmount.toLocaleString('en-IN')}</p>
                        ) : (
                          <p className="text-xs text-gray-400">---</p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-gray-50">
                      {record.status === 'Pending' ? (
                          <button 
                            onClick={() => openSaleModal(record)}
                            className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={14} /> Sell
                          </button>
                        ) : (
                          <button 
                            onClick={() => generateInvoice(record)}
                            className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <Download size={14} /> Invoice
                          </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedRecord(record);
                          setModals({ ...modals, details: true });
                        }}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 💻 DESKTOP VIEW: TABLE (Hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Date</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Market</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Item</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Qty</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Rate</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Amount</th>
                  <th className="px-8 py-4 text-right font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-16 text-center">
                      <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-600 font-medium">No records found</p>
                      <p className="text-gray-500 text-sm mt-1">Click "New Record" to add your first entry</p>
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-4 text-gray-700">{record.date}</td>
                      <td className="px-8 py-4 text-gray-900 font-medium">{record.market}</td>
                      <td className="px-8 py-4 text-gray-900 font-semibold">{record.vegetable}</td>
                      <td className="px-8 py-4 text-gray-700">{record.quantity} kg</td>
                      <td className="px-8 py-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2 ${
                          record.status === 'Sold'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {record.status === 'Sold' ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-gray-700">{record.status === 'Sold' ? `₹${record.rate}` : '-'}</td>
                      <td className="px-8 py-4 font-bold text-green-600">{record.status === 'Sold' ? `₹${record.totalAmount.toLocaleString('en-IN')}` : '-'}</td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {record.status === 'Pending' ? (
                            <button 
                              onClick={() => openSaleModal(record)}
                              className="p-2.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition border border-green-200"
                              title="Mark as Sold"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => generateInvoice(record)}
                              className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition border border-blue-200"
                              title="Download Invoice"
                            >
                              <Download size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedRecord(record);
                              setModals({ ...modals, details: true });
                            }}
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition border border-red-200"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Info Card */}
        <div className="mt-8 p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-green-50 border border-green-200 rounded-3xl">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Zap size={28} className="text-green-600 mt-1 shrink-0" />
            <div className="flex-1 w-full">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">Platform Commission</h3>
              <p className="text-gray-700 text-sm mb-4">We charge a 4% commission on all sales to maintain our platform and provide continuous support.</p>
              
              {/* 📱 Mobile: Stacked grid for stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
                <div className="bg-white/50 p-3 rounded-xl sm:bg-transparent sm:p-0">
                  <p className="text-gray-600 font-medium mb-1">Gross Sales</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">₹{totalGross.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white/50 p-3 rounded-xl sm:bg-transparent sm:p-0">
                  <p className="text-gray-600 font-medium mb-1">Commission (4%)</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">₹{totalCommission.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white/50 p-3 rounded-xl sm:bg-transparent sm:p-0">
                  <p className="text-gray-600 font-medium mb-1">Net Income</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{netIncome.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS (Code remains mostly the same, just verified responsive classes) --- */}

      {/* Add Record Modal */}
      <Modal 
        isOpen={modals.addRecord}
        onClose={() => setModals({ ...modals, addRecord: false })}
        title="Add New Record"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Market Location *</label>
            <select 
              value={formData.market}
              onChange={(e) => setFormData({ ...formData, market: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
            >
              <option value="">Select Market</option>
              <option>Pune APMC</option>
              <option>Mumbai Market</option>
              <option>Nashik Mandi</option>
              <option>Nagpur Market</option>
              <option>Aurangabad Market</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Vegetable Name *</label>
            <input 
              type="text"
              value={formData.vegetable}
              onChange={(e) => setFormData({ ...formData, vegetable: e.target.value })}
              placeholder="e.g., Tomato, Spinach, Okra"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity (Kg) *</label>
            <input 
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p><strong>Note:</strong> Your record will be marked as "Pending" until you mark it as sold.</p>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleAddRecord}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
            >
              Save Record
            </button>
          </div>
        </div>
      </Modal>

      {/* Mark as Sold Modal */}
      <Modal 
        isOpen={modals.markSold}
        onClose={() => setModals({ ...modals, markSold: false })}
        title="Mark Record as Sold"
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-5">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 font-semibold mb-3">Item Details</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Vegetable</p>
                  <p className="font-semibold text-gray-900">{selectedRecord.vegetable}</p>
                </div>
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">{selectedRecord.quantity} kg</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Rate per Kg (₹) *</label>
              <input 
                type="number"
                value={saleData.rate}
                onChange={(e) => setSaleData({ ...saleData, rate: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Trader Name *</label>
              <input 
                type="text"
                value={saleData.trader}
                onChange={(e) => setSaleData({ ...saleData, trader: e.target.value })}
                placeholder="Enter trader name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>

            {saleData.rate && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Total Amount:</span> ₹{(parseFloat(saleData.rate) * selectedRecord.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            )}

            <button 
              onClick={handleConfirmSale}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
            >
              Confirm Sale
            </button>
          </div>
        )}
      </Modal>

      {/* Details Modal */}
      <Modal 
        isOpen={modals.details}
        onClose={() => setModals({ ...modals, details: false })}
        title="Record Details"
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">DATE</p>
                <p className="font-bold text-gray-900">{selectedRecord.date}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">MARKET</p>
                <p className="font-bold text-gray-900">{selectedRecord.market}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-1">VEGETABLE</p>
              <p className="font-bold text-gray-900">{selectedRecord.vegetable}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">QUANTITY</p>
                <p className="font-bold text-gray-900">{selectedRecord.quantity} kg</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">STATUS</p>
                <p className={`font-bold ${selectedRecord.status === 'Sold' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedRecord.status}
                </p>
              </div>
            </div>

            {selectedRecord.status === 'Sold' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">RATE</p>
                    <p className="font-bold text-gray-900">₹{selectedRecord.rate}/kg</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">TOTAL AMOUNT</p>
                    <p className="font-bold text-green-600">₹{selectedRecord.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">TRADER</p>
                  <p className="font-bold text-gray-900">{selectedRecord.trader}</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <button 
                    onClick={() => generateInvoice(selectedRecord)}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download Invoice
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Profile Edit Modal */}
      <Modal 
        isOpen={modals.editProfile}
        onClose={() => setModals({ ...modals, editProfile: false })}
        title="Edit Profile"
        size="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {profileForm.name ? profileForm.name.slice(0, 2).toUpperCase() : 'FK'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
            <input 
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
            <input 
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Farmer ID</label>
            <input 
              type="text"
              value={profileForm.farmerId}
              onChange={(e) => setProfileForm({ ...profileForm, farmerId: e.target.value })}
              placeholder="e.g., AGR-1234"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
            <input 
              type="text"
              value={profileForm.location}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              placeholder="Enter your location"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <button 
            onClick={saveProfile}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FarmerDashboard;