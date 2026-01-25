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
      // Optional: Redirect to login
      // window.location.href = '/login';
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
  // --- GENERIC METHODS (Fixes "api.get is not a function" error) ---
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data, options) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  patch: (endpoint, data, options) => apiRequest(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),

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

  // Records (Weighing + Farmer Dashboard)
  records: {
    // --- Existing Weight Staff Methods ---
    searchFarmer: (phone) => apiRequest(`/api/records/search-farmer?phone=${phone}`, { method: 'GET' }),
    getPending: (farmerId) => apiRequest(`/api/records/pending/${farmerId}`, { method: 'GET' }),
    updateWeight: (id, weight) => apiRequest(`/api/records/${id}/weight`, {
      method: 'PATCH',
      body: JSON.stringify({ official_qty: weight })
    }),

    // --- NEW Farmer Dashboard Methods ---
    myRecords: () => apiRequest('/api/records/my-records', { method: 'GET' }),
    add: (data) => apiRequest('/api/records/add', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/api/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/api/records/${id}`, { method: 'DELETE' }),
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
    seed: () => apiRequest('/api/trader/seed', { method: 'POST' }),
  },
  weight: {
    stats: () => apiRequest('/api/weight/stats', { method: 'GET' }),
    records: () => apiRequest('/api/weight/records', { method: 'GET' }),
    pendingRecords: () => apiRequest('/api/weight/pending', { method: 'GET' }),
    createRecord: (data) => apiRequest('/api/weight/record', { method: 'POST', body: JSON.stringify(data) }),
    updateRecord: (id, data) => apiRequest(`/api/weight/record/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteRecord: (id) => apiRequest(`/api/weight/record/${id}`, { method: 'DELETE' }),
    getProfile: () => apiRequest('/api/weight/profile', { method: 'GET' }),
    updateProfile: (data) => apiRequest('/api/weight/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
};

export default api;