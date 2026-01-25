import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, Phone, Calendar, Store, Plus } from 'lucide-react';
import AddTraderModal from '../../components/committee/AddTraderModal';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function TradersList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [traders, setTraders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch traders from API
  const fetchTraders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/users?role=trader');
      setTraders(response || []);
    } catch (error) {
      console.error('Failed to fetch traders:', error);
      toast.error('Failed to load traders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders();
  }, []);

  const filteredTraders = traders.filter(trader => {
    const matchesSearch =
      (trader.business_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trader.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trader.phone || '').includes(searchTerm);
    return matchesSearch;
  });

  const handleAddTrader = (newTrader) => {
    setTraders(prev => [newTrader, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Unified Single Color */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Registered Traders</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">View all traders and their purchase records</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Trader
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by business, owner, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors ${statusFilter !== 'All'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>{statusFilter === 'All' ? 'Filters' : statusFilter}</span>
          </button>

          {isFilterOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden">
                <div className="p-1">
                  {['All', 'Active', 'Inactive'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Total Traders</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{traders.length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Registered</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{traders.length}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{traders.length}</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTraders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Traders Found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm ? 'No results match your search' : 'Add your first trader to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Trader
            </button>
          )}
        </motion.div>
      )}

      {/* Traders Table - Desktop */}
      {!isLoading && filteredTraders.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Business</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">ID</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Owner</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Contact</th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTraders.map((trader) => (
                <tr
                  key={trader._id || trader.id}
                  onClick={() => navigate(`/dashboard/committee/traders/${trader._id || trader.id}`)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {trader.initials || (trader.business_name ? trader.business_name[0] : 'T')}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">{trader.business_name || 'No Business Name'}</span>
                        {trader.license_number && (
                          <p className="text-xs text-slate-400">{trader.license_number}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {trader.customId || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{trader.full_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{trader.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {trader.createdAt ? new Date(trader.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Traders Cards - Mobile */}
      {!isLoading && filteredTraders.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredTraders.map((trader) => (
            <div
              key={trader._id || trader.id}
              onClick={() => navigate(`/dashboard/committee/traders/${trader._id || trader.id}`)}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {trader.initials || (trader.business_name ? trader.business_name[0] : 'T')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{trader.business_name || 'No Business Name'}</h3>
                    <p className="text-xs text-slate-500">{trader.customId || 'Pending ID'}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase">Owner</p>
                  <p className="font-bold text-sm text-slate-900 truncate">{trader.full_name}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase">Phone</p>
                  <p className="font-bold text-sm text-slate-700 truncate">{trader.phone?.slice(-4)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Trader Modal */}
      <AddTraderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTrader}
      />
    </div>
  );
}
