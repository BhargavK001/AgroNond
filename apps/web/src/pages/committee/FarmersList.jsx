import { useState, useEffect, useCallback } from 'react';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { motion } from 'framer-motion';
import { Search, Phone, Plus, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';
import AddFarmerModal from '../../components/committee/AddFarmerModal';
import FarmerDetailsModal from '../../components/committee/FarmerDetailsModal';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function FarmersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  // Details Modal state
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch farmers from API with pagination
  const fetchFarmers = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const params = {
        role: 'farmer',
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await api.get('/api/users?' + new URLSearchParams(params).toString());

      // Handle paginated response
      let filteredFarmers = [];
      if (response.data) {
        filteredFarmers = (response.data || []).filter(u => {
          const name = u.full_name?.toLowerCase() || '';
          const isSystem = name.includes('admin') || name.includes('committee') || name.includes('test') || name.includes('system');
          // Strict Role Check AND Name Check
          return (u.role === 'farmer') && !isSystem;
        });
      } else {
        // Fallback for non-paginated response
        const list = response || [];
        filteredFarmers = list.filter(u => {
          const name = u.full_name?.toLowerCase() || '';
          const isSystem = name.includes('admin') || name.includes('committee') || name.includes('test') || name.includes('system');
          // Strict Role Check AND Name Check
          return (u.role === 'farmer') && !isSystem;
        });
      }

      // Apply date filter if selected
      if (selectedDate) {
        filteredFarmers = filteredFarmers.filter(u => {
          if (!u.createdAt) return false;
          const farmerDate = new Date(u.createdAt).toISOString().split('T')[0];
          return farmerDate === selectedDate;
        });
      }

      setFarmers(filteredFarmers);
      setTotalCount(filteredFarmers.length);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch farmers:', error);
      if (showLoading) toast.error('Failed to load farmers');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedDate]);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  // Auto-refresh farmers every 30 seconds
  useAutoRefresh(() => fetchFarmers(false), { interval: 30000 });

  const handleAddFarmer = (newFarmer) => {
    setFarmers(prev => [newFarmer, ...prev]);
    setTotalCount(prev => prev + 1);
  };

  const handleFarmerClick = (farmer) => {
    setSelectedFarmer(farmer);
    setIsDetailsModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all"
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
        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
          />
          {selectedDate && (
            <button
              onClick={() => {
                setSelectedDate('');
                setCurrentPage(1);
              }}
              className="absolute -right-2 -top-2 bg-slate-200 hover:bg-slate-300 rounded-full p-0.5"
              title="Clear Date"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"
        >
          <p className="text-xs text-emerald-600 font-medium uppercase">Total Farmers</p>
          <p className="text-2xl font-bold text-emerald-700">{totalCount}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-xl p-4 border border-blue-100"
        >
          <p className="text-xs text-blue-600 font-medium uppercase">On This Page</p>
          <p className="text-2xl font-bold text-blue-700">{farmers.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-purple-50 rounded-xl p-4 border border-purple-100"
        >
          <p className="text-xs text-purple-600 font-medium uppercase">Page</p>
          <p className="text-2xl font-bold text-purple-700">{currentPage} / {totalPages}</p>
        </motion.div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && farmers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Farmers Found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm ? 'No results match your search' : 'Add your first farmer to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Farmer
            </button>
          )}
        </motion.div>
      )}

      {/* Farmers Table - Desktop */}
      {!isLoading && farmers.length > 0 && (
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
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">ID</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Contact</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Location</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {farmers.map((farmer) => (
                <tr
                  key={farmer._id || farmer.id}
                  onClick={() => handleFarmerClick(farmer)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                        {farmer.initials || (farmer.full_name ? farmer.full_name[0] : 'F')}
                      </div>
                      <span className="font-semibold text-slate-800">{farmer.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {farmer.farmerId || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{farmer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{farmer.location || '-'}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages} ({totalCount} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                        ? 'bg-emerald-600 text-white'
                        : 'hover:bg-slate-100 text-slate-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Farmers Cards - Mobile */}
      {!isLoading && farmers.length > 0 && (
        <div className="md:hidden space-y-3">
          {farmers.map((farmer) => (
            <motion.div
              key={farmer._id || farmer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => handleFarmerClick(farmer)}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {farmer.initials || (farmer.full_name ? farmer.full_name[0] : 'F')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{farmer.full_name}</h3>
                    <p className="text-xs text-slate-500">{farmer.farmerId || 'Pending ID'}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Phone</p>
                  <p className="font-bold text-sm text-slate-700">{farmer.phone?.slice(-4)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Location</p>
                  <p className="font-bold text-sm text-slate-700 truncate">{farmer.location || '-'}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Mobile Pagination */}
          <div className="flex items-center justify-between px-2 py-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Farmer Modal */}
      <AddFarmerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddFarmer}
      />

      {/* Details Modal */}
      <FarmerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        farmer={selectedFarmer}
      />
    </div>
  );
}
