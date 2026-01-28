import React, { useState, useEffect } from 'react';
import WeightNavbar from '../../components/navigation/WeightNavbar';
import { Toaster, toast } from 'react-hot-toast';
import {
  Plus, CheckCircle, Clock, X, Eye, Edit2,
  Trash2, Calendar, Package, Scale, MapPin, User, Phone, ChevronDown
} from 'lucide-react';
import { api } from '../../lib/api';

// --- MODAL COMPONENT ---
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} border border-gray-200 max-h-[90vh] overflow-y-auto transform transition-all`}>
        <div className="flex justify-between items-center px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
};

const WeightDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [records, setRecords] = useState([]); // Weight records
  const [marketData, setMarketData] = useState([]); // Raw market data for auto-fetch

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    weightId: '',
    location: '',
    initials: 'WO'
  });

  const [modals, setModals] = useState({
    addWeight: false,
    editWeight: false,
    editProfile: false,
    details: false,
    delete: false
  });
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    recordRefId: '', // ID from the original records table
    farmerId: '',
    item: '',
    estWeight: '',
    estCarat: '', // ✅ NEW
    updatedWeight: '',
    updatedCarat: '' // ✅ NEW
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [profileForm, setProfileForm] = useState({ ...profile });

  // --- FETCH RECORDS ---
  useEffect(() => {
    fetchWeightRecords();
    fetchMarketData();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.weight.getProfile();
      if (data) {
        setProfile({
          name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          initials: data.initials || 'WO',
          weightId: data.customId || ''
        });
        setProfileForm({
          name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          initials: data.initials || 'WO'
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  // 1. Fetch Weight Records (Combined Pending + Done)
  const fetchWeightRecords = async () => {
    try {
      const [done, pending] = await Promise.all([
        api.weight.records(),
        api.weight.pendingRecords() // "Pending" records are also needed for "Remaining Weight" KPI
      ]);

      const mapRecord = (r) => ({
        id: r._id,
        date: r.createdAt,
        farmer_id: r.farmer_id?.farmerId || r.farmer_id || 'Unknown',
        item: r.vegetable,
        est_weight: r.quantity,
        est_carat: r.carat, // ✅ NEW
        updated_weight: r.official_qty,
        updated_carat: r.official_carat, // ✅ NEW
        status: r.status,
        record_ref_id: r._id
      });

      const allRecords = [...done, ...pending].map(mapRecord);

      setRecords(allRecords);
    } catch (err) {
      console.error('Error fetching weight records:', err);
      toast.error('Failed to fetch records');
    }
  };

  // 2. Fetch Market Data (Source for Auto-Fill) - Now fetches "RateAssigned" records
  const fetchMarketData = async () => {
    try {
      const data = await api.weight.pendingRecords();
      // Map to format expected by dropdown
      const mapped = data.map(r => ({
        id: r._id,
        farmer_id: r.farmer_id?.farmerId || 'Unknown',
        item: r.vegetable,
        est_qty: r.quantity,
        est_carat: r.carat,
        date: r.createdAt,
        status: r.status // Capture status
      }));
      setMarketData(mapped);
    } catch (err) {
      console.error('Error fetching market data:', err);
    }
  };

  // --- AUTO FILL HANDLER ---
  const handleSelectMarketRecord = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    // Find the record in the fetched market data
    const selectedItem = marketData.find(item => item.id === selectedId);

    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        recordRefId: selectedItem.id,
        farmerId: selectedItem.farmer_id,
        item: selectedItem.item,
        estWeight: selectedItem.est_qty || 0,
        estCarat: selectedItem.est_carat || 0 // ✅ NEW
      }));
      toast.success("Auto-fetched details!");
    }
  };

  // Listen for navbar profile edit events
  useEffect(() => {
    const handleOpenEditProfile = () => {
      setModals(prev => ({ ...prev, editProfile: true }));
    };
    window.addEventListener('openEditProfile', handleOpenEditProfile);
    return () => window.removeEventListener('openEditProfile', handleOpenEditProfile);
  }, []);

  // --- CALCULATIONS ---
  const completedRecords = records.filter(r => r.status === 'Done' || r.status === 'Sold' || r.status === 'Weighed'); // Include Sold/Weighed in "Done" bucket for KPI
  const pendingRecords = records.filter(r => r.status === 'Pending' || r.status === 'RateAssigned');
  const todayRecords = records.filter(r => {
    const recordDate = new Date(r.date).toLocaleDateString('en-GB');
    const today = new Date().toLocaleDateString('en-GB');
    return recordDate === today;
  });

  // --- FILTER & SORT ---
  const filteredRecords = filterStatus === 'All'
    ? records
    : records.filter(r => r.status === filterStatus);

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'weight') return (b.updated_weight || 0) - (a.updated_weight || 0);
    return 0;
  });

  // --- HANDLERS ---
  const handleAddWeight = async () => {
    // If auto-filled, we have farmerId. If manual... 
    // The simplified logic requires at least item and farmerId (or a dropdown selection).
    if (!formData.farmerId || !formData.item) {
      toast.error('Please select a pending lot or enter details');
      return;
    }

    try {
      await api.weight.createRecord({
        date: formData.date,
        farmerId: formData.farmerId,
        item: formData.item,
        estWeight: parseFloat(formData.estWeight || 0),
        // ✅ NEW: Carat
        estCarat: parseFloat(formData.estCarat || 0),
        updatedWeight: formData.updatedWeight ? parseFloat(formData.updatedWeight) : null,
        updatedCarat: formData.updatedCarat ? parseFloat(formData.updatedCarat) : null,
        recordRefId: formData.recordRefId // Important for linking to existing pending record
      });

      toast.success('Weight record saved successfully!');

      setFormData({
        date: new Date().toISOString().split('T')[0],
        recordRefId: '',
        farmerId: '',
        item: '',
        estWeight: '',
        estCarat: '',
        updatedWeight: '',
        updatedCarat: ''
      });
      setModals(prev => ({ ...prev, addWeight: false }));

      // Refresh both lists
      fetchWeightRecords();
      fetchMarketData();

    } catch (err) {
      toast.error(err.message || 'Failed to add record');
      console.error(err);
    }
  };

  const handleUpdateWeight = async () => {
    if (!selectedRecord) return;

    try {
      await api.weight.updateRecord(selectedRecord.id, {
        updatedWeight: formData.updatedWeight ? parseFloat(formData.updatedWeight) : 0,
        official_carat: formData.updatedCarat ? parseFloat(formData.updatedCarat) : 0, // ✅ Send official_carat
        date: formData.date
      });

      toast.success('Weight updated successfully!');
      setModals(prev => ({ ...prev, editWeight: false }));
      setSelectedRecord(null);
      fetchWeightRecords();

    } catch (err) {
      toast.error('Update failed');
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setModals(prev => ({ ...prev, delete: true }));
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.weight.deleteRecord(deleteId);
      toast.success('Record deleted successfully');
      fetchWeightRecords();
      fetchMarketData();
      setModals((prev) => ({ ...prev, delete: false }));
    } catch (err) {
      toast.error('Delete failed');
      console.error(err);
    }
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      date: record.date,
      farmerId: record.farmer_id,
      item: record.item,
      estWeight: record.est_weight.toString(),
      estCarat: record.est_carat ? record.est_carat.toString() : '',
      updatedWeight: record.updated_weight ? record.updated_weight.toString() : '',
      updatedCarat: record.updated_carat ? record.updated_carat.toString() : ''
    });
    setModals(prev => ({ ...prev, editWeight: true }));
  };

  const saveProfile = async () => {
    try {
      const data = await api.weight.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        location: profileForm.location
      });

      setProfile({
        ...profile,
        name: data.full_name,
        phone: data.phone,
        location: data.location
      });
      setModals(prev => ({ ...prev, editProfile: false }));
      window.dispatchEvent(new CustomEvent('weightProfileUpdated'));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Toaster position="top-center" reverseOrder={false} />

      <WeightNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-16">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Weight Dashboard</h1>
              <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm sm:text-base font-medium">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <button
              onClick={() => setModals(prev => ({ ...prev, addWeight: true }))}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 sm:px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl shadow-lg shadow-green-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add Weight Record
            </button>
          </div>
        </div>

        {/* --- KPI CARDS (3 Boxes) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Completed Weighing */}
          <div className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <CheckCircle size={24} />
              </div>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">Done</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Completed Weighing</p>
            <h3 className="text-3xl font-bold text-gray-900">{completedRecords.length}</h3>
          </div>

          {/* Remaining Weight */}
          {/* Remaining Weight */}
          <div className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Clock size={24} />
              </div>
              <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">{pendingRecords.length} Pending</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Remaining Weight</p>
            <h3 className="text-3xl font-bold text-gray-900">{pendingRecords.length}</h3>
          </div>

          {/* Today's Records */}
          <div className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Package size={24} />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Today</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Today's Records</p>
            <h3 className="text-3xl font-bold text-gray-900">{todayRecords.length}</h3>
          </div>
        </div>

        {/* --- RECORDS SECTION --- */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

          <div className="p-5 sm:px-8 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Weighing Records</h2>
            </div>

            <div className="flex w-full sm:w-auto gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm transition-all cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Done">Completed</option>
                <option value="Sold">Sold</option>
                <option value="RateAssigned">Ready to Weight</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm transition-all cursor-pointer"
              >
                <option value="recent">Recent First</option>
                <option value="weight">Highest Weight</option>
              </select>
            </div>
          </div>

          {/* 📱 MOBILE VIEW: CARDS */}
          <div className="block sm:hidden">
            {sortedRecords.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-900 font-semibold">No records found</p>
                <p className="text-gray-500 text-sm mt-1">Add a new record to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                          {record.farmer_id.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 font-medium">
                            {new Date(record.date).toLocaleDateString('en-GB')}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{record.farmer_id}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${['Done', 'Sold', 'Weighed'].includes(record.status)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                        }`}>
                        {['Done', 'Sold', 'Weighed'].includes(record.status) ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {record.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-4 pl-10">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Item</p>
                        <p className="text-base font-bold text-gray-900">{record.item}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Official Qty</p>
                        <p className={`text-lg font-bold ${record.updated_weight ? 'text-green-600' : 'text-gray-400'}`}>
                          {record.updated_weight ? `${record.updated_weight} kg` : (record.updated_carat ? `${record.updated_carat} Crt` : '---')}
                        </p>
                        {/* ✅ NEW: Show Carat */}
                        <p className={`text-sm font-bold ${record.updated_carat ? 'text-purple-600' : 'text-gray-400'}`}>
                          {record.updated_carat ? `${record.updated_carat} Crt` : ''}
                        </p>
                        <p className="text-[10px] text-gray-400">Est: {record.est_weight} kg | {record.est_carat} Crt</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                      <button
                        onClick={() => { setSelectedRecord(record); setModals(prev => ({ ...prev, details: true })); }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg active:scale-95 transition"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(record)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg active:scale-95 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg active:scale-95 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 💻 DESKTOP VIEW: TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-xs">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Farmer ID</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Est. Weight</th>
                  <th className="px-6 py-4">Official Qty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Scale size={40} className="text-gray-300" />
                      </div>
                      <p className="text-gray-900 font-semibold text-lg">No records found</p>
                      <p className="text-gray-500 mt-1">Click "Add Weight Record" to begin</p>
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {new Date(record.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{record.farmer_id}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700 font-medium text-xs border border-gray-200">
                          {record.item}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{record.est_weight} kg</td>
                      <td className="px-6 py-4">
                        <span className={`text-base font-bold ${record.updated_weight ? 'text-green-600' : 'text-gray-400'}`}>
                          {record.updated_weight ? `${record.updated_weight} kg` : (record.updated_carat ? `${record.updated_carat} Crt` : '-')}
                        </span>
                        {/* ✅ NEW: Show Carat */}
                        <div className={`text-xs font-bold ${record.updated_carat ? 'text-purple-600' : 'text-gray-400'}`}>
                          {record.updated_carat ? `${record.updated_carat} Crt` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${['Done', 'Sold', 'Weighed'].includes(record.status)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                          }`}>
                          {['Done', 'Sold', 'Weighed'].includes(record.status) ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedRecord(record); setModals(prev => ({ ...prev, details: true })); }}
                            className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition"
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
      </main >

      {/* --- MODALS --- */}

      <Modal
        isOpen={modals.delete}
        onClose={() => setModals(prev => ({ ...prev, delete: false }))}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center p-4 bg-red-50 rounded-2xl border border-red-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-red-900">Delete Record?</h3>
            <p className="text-sm text-red-600/80 mt-1 max-w-[200px]">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setModals(prev => ({ ...prev, delete: false }))}
              className="px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Weight Record Modal - UPDATED FOR AUTO FETCH */}
      <Modal
        isOpen={modals.addWeight}
        onClose={() => setModals(prev => ({ ...prev, addWeight: false }))}
        title="Add New Weight"
      >
        <div className="space-y-5">

          {/* 1. Date */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none bg-gray-50 text-gray-900 font-medium transition-all"
            />
          </div>

          {/* 2. AUTO-FETCH SELECTION */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-xs font-bold text-blue-700 uppercase mb-2 tracking-wide flex items-center gap-2">
              <Package size={14} /> Select Pending Lot
            </label>
            <div className="relative">
              <select
                onChange={handleSelectMarketRecord}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 appearance-none cursor-pointer font-medium"
                defaultValue=""
              >
                <option value="" disabled>-- Select a Farmer/Lot --</option>
                {marketData.length > 0 ? (
                  marketData.map((mItem) => (
                    <option key={mItem.id} value={mItem.id}>
                      {mItem.farmer_id} - {mItem.item} ({mItem.est_qty}kg) {mItem.status === 'RateAssigned' ? '✅ Ready' : ''}
                    </option>
                  ))
                ) : (
                  <option disabled>No pending lots found</option>
                )}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            <p className="text-xs text-blue-600 mt-2">Selecting this will auto-fill Farmer ID, Item & Est. Weight.</p>
          </div>

          {/* 3. Read-Only Fields (Auto-filled) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Farmer ID</label>
              <input
                type="text"
                value={formData.farmerId}
                readOnly
                placeholder="Auto-filled"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Item</label>
              <input
                type="text"
                value={formData.item}
                readOnly
                placeholder="Auto-filled"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Est. Weight</label>
              <input
                type="number"
                value={formData.estWeight}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
            {/* ✅ NEW: Carat Display */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Est. Carat</label>
              <input
                type="number"
                value={formData.estCarat}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-green-700 uppercase mb-2 tracking-wide">Official Qty (Kg)</label>
              <input
                type="number"
                value={formData.updatedWeight}
                onChange={(e) => setFormData({ ...formData, updatedWeight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-green-100 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none bg-green-50/30 text-green-800 font-bold transition-all"
              />
            </div>
            {/* ✅ NEW: Official Carat Input */}
            <div>
              <label className="block text-xs font-bold text-green-700 uppercase mb-2 tracking-wide">Official Carat</label>
              <input
                type="number"
                value={formData.updatedCarat}
                onChange={(e) => setFormData({ ...formData, updatedCarat: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border-2 border-green-100 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none bg-green-50/30 text-green-800 font-bold transition-all"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
            * Enter "Official Qty" to mark status as "Done". Leaving empty keeps it "Pending".
          </p>

          <button
            onClick={handleAddWeight}
            className="w-full mt-4 px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Save & Finalize Sale
          </button>
        </div>
      </Modal>

      {/* Edit Weight Modal */}
      <Modal
        isOpen={modals.editWeight}
        onClose={() => setModals(prev => ({ ...prev, editWeight: false }))}
        title="Edit Record"
      >
        <div className="space-y-5">
          {/* Read Only Info */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Farmer</p>
              <p className="font-bold text-gray-900">{formData.farmerId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Item</p>
              <p className="font-bold text-gray-900">{formData.item}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
              <p className="font-bold text-gray-900">{new Date(formData.date).toLocaleDateString('en-GB')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Est. Weight</p>
              <p className="font-bold text-gray-900">{formData.estWeight} kg | {formData.estCarat} Crt</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Updated Official Weight (Kg)</label>
              <input
                type="number"
                value={formData.updatedWeight}
                onChange={(e) => setFormData({ ...formData, updatedWeight: e.target.value })}
                placeholder="0.00"
                autoFocus
                className="w-full px-4 py-4 rounded-xl border-2 border-green-500 focus:ring-4 focus:ring-green-100 outline-none bg-white text-green-700 text-3xl font-bold text-center"
              />
            </div>
            {/* ✅ NEW: Edit Official Carat */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Updated Official Carat</label>
              <input
                type="number"
                value={formData.updatedCarat}
                onChange={(e) => setFormData({ ...formData, updatedCarat: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-4 rounded-xl border-2 border-green-500 focus:ring-4 focus:ring-green-100 outline-none bg-white text-green-700 text-3xl font-bold text-center"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleUpdateWeight}
              className="w-full px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              Update Record
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={modals.details}
        onClose={() => setModals(prev => ({ ...prev, details: false }))}
        title="Weight Details"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-bold inline-flex items-center gap-2 ${selectedRecord.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {selectedRecord.status === 'Done' ? <CheckCircle size={16} /> : <Clock size={16} />}
                  {selectedRecord.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Date</p>
                <p className="font-bold text-gray-900">{new Date(selectedRecord.date).toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Est. Weight</p>
                <p className="text-2xl font-bold text-gray-400">{selectedRecord.est_weight} <span className="text-sm">kg</span></p>
              </div>
              <div className="p-4 rounded-2xl border border-green-100 bg-green-50 shadow-sm">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">Official Weight</p>
                <p className="text-2xl font-bold text-green-700">
                  {selectedRecord.updated_weight ? selectedRecord.updated_weight : '--'} <span className="text-sm">kg</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Farmer ID</span>
                <span className="text-gray-900 font-bold">{selectedRecord.farmer_id}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Vegetable</span>
                <span className="text-gray-900 font-bold">{selectedRecord.item}</span>
              </div>
              {selectedRecord.updated_weight && (
                <div className="flex justify-between py-3">
                  <span className="text-gray-500 font-medium">Difference</span>
                  <span className={`font-bold ${selectedRecord.updated_weight >= selectedRecord.est_weight ? 'text-green-600' : 'text-red-500'
                    }`}>
                    {(selectedRecord.updated_weight - selectedRecord.est_weight).toFixed(2)} kg
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={modals.editProfile}
        onClose={() => setModals(prev => ({ ...prev, editProfile: false }))}
        title="Station Profile"
      >
        <div className="space-y-5">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-green-50">
              {profileForm.name ? profileForm.name.slice(0, 2).toUpperCase() : 'WO'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Operator Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Station Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                placeholder="e.g. Pune Market Yard"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Station ID</label>
            <input
              type="text"
              value={profileForm.weightId}
              onChange={(e) => setProfileForm({ ...profileForm, weightId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-mono text-gray-600 focus:outline-none"
              placeholder="Auto-generated ID"
            />
          </div>

          <button
            onClick={saveProfile}
            className="w-full mt-4 px-4 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            Save Profile Changes
          </button>
        </div>
      </Modal>
    </div >
  );
};

export default WeightDashboard;