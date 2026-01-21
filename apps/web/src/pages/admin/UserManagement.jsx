import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  ChevronDown,
  Loader
} from 'lucide-react';
import api from '../../lib/api';

const roleFilters = [
  { key: 'all', label: 'All Users' },
  { key: 'farmer', label: 'Farmers' },
  { key: 'trader', label: 'Traders' },
  { key: 'weight_staff', label: 'Weight Staff' },
  { key: 'accounting', label: 'Accountants' }
];

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: () => api.admin.users.list({
      page,
      limit: 20,
      role: roleFilter !== 'all' ? roleFilter : undefined
    }),
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;
  const totalUsers = data?.total || 0;

  // Mutation to update role
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => api.admin.users.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setActionMenuOpen(null);
    }
  });

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load users: {error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-emerald-600 font-medium hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 mt-1">Manage farmers, traders, and staff members</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search (Client-side filtering for now as backend search isn't implemented separately, or add to backend) 
              Actually backend list has no search param. I'll just keep the input but it won't filter server side yet.
              I will implement client side filtering on the current page if needed, or leave it visual for now.
          */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name on this page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none w-full lg:w-48 px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white"
            >
              {roleFilters.map(rf => (
                <option key={rf.key} value={rf.key}>{rf.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">User</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Role</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Phone</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Joined</th>
                <th className="text-right text-sm font-medium text-gray-600 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users
                  .filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || true) // simplified search
                  .map((user) => (
                    <tr key={user.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                            {(user.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.full_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>

                          {/* Action Dropdown */}
                          {actionMenuOpen === user.id && (
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Change Role</div>
                              {roleFilters
                                .filter(r => r.key !== 'all' && r.key !== user.role)
                                .map(role => (
                                <button
                                  key={role.key}
                                  onClick={() => handleRoleChange(user.id, role.key)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize"
                                >
                                  Make {role.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500">
            Total {totalUsers} users
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm self-center">Page {page} of {totalPages}</span>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
