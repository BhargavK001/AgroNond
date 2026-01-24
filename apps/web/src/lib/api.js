

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get current access token
async function getAccessToken() {
  return localStorage.getItem('auth_token');
}

// Authenticated API request wrapper
async function apiRequest(endpoint, options = {}) {
  const token = await getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      console.warn('Unauthorized - token may be expired');
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Health
  health: () => apiRequest('/api/health', { method: 'GET' }),

  // Purchases
  purchases: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/purchases${query ? '?' + query : ''}`, { method: 'GET' });
    },
    get: (id) => apiRequest(`/api/purchases/${id}`, { method: 'GET' }),
    stats: () => apiRequest('/api/purchases/stats', { method: 'GET' }),
    create: (data) => apiRequest('/api/purchases', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/api/purchases/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/api/purchases/${id}`, { method: 'DELETE' }),
  },

  // Farmer Contacts
  farmerContacts: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/farmer-contacts${query ? '?' + query : ''}`, { method: 'GET' });
    },
    get: (id) => apiRequest(`/api/farmer-contacts/${id}`, { method: 'GET' }),
    create: (data) => apiRequest('/api/farmer-contacts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/api/farmer-contacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStats: (id, transactionValue) => apiRequest(`/api/farmer-contacts/${id}/stats`, {
      method: 'PATCH',
      body: JSON.stringify({ transaction_value: transactionValue })
    }),
    delete: (id) => apiRequest(`/api/farmer-contacts/${id}`, { method: 'DELETE' }),
  },

  // Records (Weighing)
  records: {
    searchFarmer: (phone) => apiRequest(`/api/records/search-farmer?phone=${phone}`, { method: 'GET' }),
    getPending: (farmerId) => apiRequest(`/api/records/pending/${farmerId}`, { method: 'GET' }),
    updateWeight: (id, weight) => apiRequest(`/api/records/${id}/weight`, {
      method: 'PATCH',
      body: JSON.stringify({ official_qty: weight })
    }),
  },

  // Inventory
  inventory: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/inventory${query ? '?' + query : ''}`, { method: 'GET' });
    },
    get: (id) => apiRequest(`/api/inventory/${id}`, { method: 'GET' }),
    create: (data) => apiRequest('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/api/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    adjust: (id, adjustment, reason) => apiRequest(`/api/inventory/${id}/adjust`, {
      method: 'PATCH',
      body: JSON.stringify({ adjustment, reason })
    }),
    delete: (id) => apiRequest(`/api/inventory/${id}`, { method: 'DELETE' }),
  },

  // User Profile
  users: {
    getProfile: () => apiRequest('/api/users/profile', { method: 'GET' }),
    updateProfile: (data) => apiRequest('/api/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    setRole: (role) => apiRequest('/api/users/set-role', { method: 'POST', body: JSON.stringify({ role }) }),
  },

  // Admin
  admin: {
    metrics: () => apiRequest('/api/admin/metrics', { method: 'GET' }),
    configs: {
      list: () => apiRequest('/api/admin/configs', { method: 'GET' }),
      update: (data) => apiRequest('/api/admin/configs', { method: 'POST', body: JSON.stringify(data) }),
    },
    commissionRules: {
      list: () => apiRequest('/api/admin/commission-rules', { method: 'GET' }),
      create: (data) => apiRequest('/api/admin/commission-rules', { method: 'POST', body: JSON.stringify(data) }),
    },
    users: {
      list: (params = {}) => {
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v != null)
        );
        const query = new URLSearchParams(cleanParams).toString();
        return apiRequest(`/api/admin/users${query ? '?' + query : ''}`, { method: 'GET' });
      },
      updateRole: (id, role) => apiRequest(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
      create: (data) => apiRequest('/api/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    },
  },

  // Finance
  finance: {
    billingRecords: {
      list: (params = {}) => {
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v != null)
        );
        const query = new URLSearchParams(cleanParams).toString();
        return apiRequest(`/api/finance/billing-records${query ? '?' + query : ''}`, { method: 'GET' });
      },
    },
    payments: {
      create: (data) => apiRequest('/api/finance/payments', { method: 'POST', body: JSON.stringify(data) }),
    },
    stats: () => apiRequest('/api/finance/stats', { method: 'GET' }),
  },

  // Trader
  trader: {
    stats: () => apiRequest('/api/trader/stats', { method: 'GET' }),
    transactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/trader/transactions${query ? '?' + query : ''}`, { method: 'GET' });
    },
  },
};

export default api;
