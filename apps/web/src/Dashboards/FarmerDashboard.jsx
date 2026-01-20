import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Bell, TrendingUp, Clock, Package, X, Download, Eye, 
  Trash2, Edit2, User, Phone, MapPin, Calendar, CheckCircle, Zap, LogOut
} from 'lucide-react';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

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

  const [profileForm, setProfileForm] = useState({ ... profile });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

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

  useEffect(() => {
    localStorage.setItem('farmer-records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('farmer-profile', JSON. stringify(profile));
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
    if (! formData.market || !formData. vegetable || !formData.quantity) {
      alert('Please fill all fields');
      return;
    }

    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      market: formData. market,
      vegetable: formData.vegetable,
      quantity: parseFloat(formData.quantity),
      status: 'Pending',
      rate: 0,
      totalAmount: 0,
      trader: '-'
    };

    setRecords([newRecord, ...records]);
    setFormData({ market: '', vegetable: '', quantity:  '' });
    setModals({ ... modals, addRecord: false });
  };

  const openSaleModal = (record) => {
    setSelectedRecord(record);
    setSaleData({ rate: '', trader:  '' });
    setModals({ ...modals, markSold: true });
  };

  const handleConfirmSale = () => {
    if (!saleData.rate || !saleData.trader) {
      alert('Please enter all details');
      return;
    }

    const rate = parseFloat(saleData. rate);
    const totalAmount = selectedRecord.quantity * rate;

    setRecords(records.map(r => 
      r.id === selectedRecord. id 
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
  };

  const generateInvoice = (record) => {
    const comm = record.totalAmount * COMMISSION_RATE;
    const net = record.totalAmount - comm;

    const invoice = `
╔════════════════════════════════════════════════════════════╗
║                    AGRONOND - OFFICIAL INVOICE              ║
╚════════════════════════════════════════════════════════════��

FARMER DETAILS:
  Name: ${profile.name}
  Farmer ID: ${profile.farmerId}
  Phone: ${profile.phone}
  Location: ${profile.location}

TRANSACTION DETAILS:
  Date: ${record.date}
  Market: ${record.market}
  Vegetable: ${record.vegetable}

QUANTITY & RATE:
  Quantity: ${record.quantity} kg
  Rate: ₹${record.rate}/kg
  Trader: ${record.trader}

FINANCIAL SUMMARY:
  Gross Amount: ₹${record.totalAmount.toLocaleString('en-IN')}
  Commission (4%): -₹${comm.toLocaleString('en-IN')}
  ────────────────────────────────────
  Net Payable: ₹${net. toLocaleString('en-IN')}

────────────────────────────────────────────────────────────
Support: +91 94205 30466 | Email: bhargavk056@gmail.com
Generated on: ${new Date().toLocaleString('en-IN')}
    `;

    alert(invoice);
  };

  const handleDelete = (id) => {
    if (window.confirm('Permanently delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const saveProfile = () => {
    const initials = profileForm.name.slice(0, 2).toUpperCase();
    setProfile({ ...profileForm, initials });
    setModals({ ...modals, editProfile: false });
    alert('Profile updated successfully! ');
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // --- MODAL COMPONENT ---
  const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} border border-gray-200`}>
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          <div className="px-8 py-6">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">AgroNond</p>
              <p className="text-xs text-gray-500 font-medium">Digital Mandi Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
              <Bell size={22} />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-full transition border border-red-200"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button 
              onClick={() => setModals({ ...modals, editProfile: true })}
              className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition border border-gray-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                {profile.initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{profile.name || 'Farmer'}</p>
                <p className="text-xs text-gray-500">{profile.farmerId || 'AGR-XXXX'}</p>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">Sales Dashboard</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            <button 
              onClick={() => setModals({ ...modals, addRecord: true })}
              className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-lg shadow-green-200 transition hover:shadow-xl hover:-translate-y-1"
            >
              <Plus size={22} />
              New Record
            </button>
          </div>
        </div>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Net Income */}
          <div className="group bg-white p-8 rounded-3xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-green-100 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <TrendingUp size={28} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Net Income</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{netIncome. toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500">After 4% commission</p>
          </div>

          {/* Gross Sales */}
          <div className="group bg-white p-8 rounded-3xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover: text-white transition-colors">
                <Package size={28} />
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{soldRecords.length} sales</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Gross Sales</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{totalGross.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500">All transactions</p>
          </div>

          {/* Pending Lots */}
          <div className="group bg-white p-8 rounded-3xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover: text-white transition-colors">
                <Clock size={28} />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Active</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Pending Lots</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{pendingRecords.length}</h3>
            <p className="text-xs text-gray-500">Awaiting sale</p>
          </div>

          {/* Total Volume */}
          <div className="group bg-white p-8 rounded-3xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-purple-100 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover: text-white transition-colors">
                <Package size={28} />
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{records.length} items</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Total Volume</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalQuantity} kg</h3>
            <p className="text-xs text-gray-500">Lifetime quantity</p>
          </div>
        </div>

        {/* --- RECORDS TABLE --- */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Table Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sales Records</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track all transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm font-medium"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Sold</option>
              </select>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm font-medium"
              >
                <option value="recent">Recent</option>
                <option value="amount">Highest Amount</option>
              </select>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
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
                      <td className="px-8 py-4 font-bold text-green-600">{record.status === 'Sold' ? `₹${record.totalAmount. toLocaleString('en-IN')}` : '-'}</td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {record.status === 'Pending' ?  (
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
        <div className="mt-8 p-8 bg-gradient-to-r from-blue-50 to-green-50 border border-green-200 rounded-3xl">
          <div className="flex items-start gap-4">
            <Zap size={28} className="text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">Platform Commission</h3>
              <p className="text-gray-700 text-sm mb-4">We charge a 4% commission on all sales to maintain our platform and provide continuous support.</p>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-600 font-medium mb-1">Gross Sales</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalGross.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Commission (4%)</p>
                  <p className="text-2xl font-bold text-orange-600">₹{totalCommission.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Net Income</p>
                  <p className="text-2xl font-bold text-gray-900">₹{netIncome.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Add Record Modal */}
      <Modal 
        isOpen={modals. addRecord}
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
              onChange={(e) => setFormData({ ...formData, vegetable: e.target. value })}
              placeholder="e.g., Tomato, Spinach, Okra"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity (Kg) *</label>
            <input 
              type="number"
              value={formData. quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0. 00"
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
                  <p className="font-semibold text-gray-900">{selectedRecord. quantity} kg</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Rate per Kg (₹) *</label>
              <input 
                type="number"
                value={saleData.rate}
                onChange={(e) => setSaleData({ ... saleData, rate: e. target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus: border-green-500 focus: ring-2 focus:ring-green-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Trader Name *</label>
              <input 
                type="text"
                value={saleData. trader}
                onChange={(e) => setSaleData({ ...saleData, trader: e.target. value })}
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

      {/* Profile Modal */}
      <Modal 
        isOpen={modals. editProfile}
        onClose={() => setModals({ ...modals, editProfile: false })}
        title="Edit Profile"
        size="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {profile.initials}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
            <input 
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target. value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
            <input 
              type="tel"
              value={profileForm. phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Farmer ID</label>
            <input 
              type="text"
              value={profileForm.farmerId}
              onChange={(e) => setProfileForm({ ...profileForm, farmerId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
            <input 
              type="text"
              value={profileForm.location}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
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

      {/* Details Modal */}
      <Modal 
        isOpen={modals. details}
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
    </div>
  );
};

export default FarmerDashboard;