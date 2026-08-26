const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
window.__CACHE_BUST_V2__ = true;
const API_BASE_URL = isLocal 
  ? "http://localhost:8000" 
  : "https://light-tracker-backend-pp0d.onrender.com";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      // Unauthorized, clear token and maybe redirect
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    } else if (response.status === 402) {
      // Payment required (subscription inactive)
      // Disabling forced redirect so user can see dashboard
      // if (window.location.pathname !== '/pricing') {
      //   window.location.href = '/pricing';
      // }
      console.warn("402 Payment Required received.");
    }
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Exchanges
  getExchanges: () => request('/exchanges/'),
  createExchange: (data) => request('/exchanges/', { method: 'POST', body: JSON.stringify(data) }),
  updateExchange: (id, data) => request(`/exchanges/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExchange: (id) => request(`/exchanges/${id}`, { method: 'DELETE' }),

  // Strategies
  getStrategies: () => request('/strategies/'),
  createStrategy: (data) => request('/strategies/', { method: 'POST', body: JSON.stringify(data) }),
  updateStrategy: (id, data) => request(`/strategies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStrategy: (id) => request(`/strategies/${id}`, { method: 'DELETE' }),

  // Trades
  getTrades: () => request('/trades/'),
  createTrade: (data) => request('/trades/', { method: 'POST', body: JSON.stringify(data) }),
  updateTrade: (id, data) => request(`/trades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrade: (id) => request(`/trades/${id}`, { method: 'DELETE' }),

  // Live Prices
  getLivePrices: () => request('/live-prices'),
  getMarketOverview: () => request('/market-overview'),
  // Logs
  getLogs: (limit = 100) => request(`/admin/logs?limit=${limit}`),

  // Superadmin System Logs
  getSystemLogs: () => request('/admin/logs'),

  // Subscriptions
  getSubscriptionPlans: () => request('/subscriptions/plans'),
  getMySubscriptions: () => request('/subscriptions/me'),
  subscribeToPlan: (planId) => request(`/subscriptions/subscribe/${planId}`, { method: 'POST' }),
  mockPayInvoice: (invoiceId) => request(`/subscriptions/mock-pay/${invoiceId}`, { method: 'POST' }),

  // Waitlist
  joinWaitlist: (email) => request('/api/waitlist', { method: 'POST', body: JSON.stringify({ email }) }),
  getWaitlist: () => request('/api/waitlist/admin'),

  // Affiliates
  getAffiliateProfile: () => request('/affiliate/profile'),
  getAffiliateCommissions: () => request('/affiliate/commissions'),
  requestAffiliateWithdrawal: (address) => request(`/affiliate/withdraw?address=${address}`, { method: 'POST' }),

  // Wallet & Transactions
  getWalletTransactions: () => request('/wallet/transactions'),
  createWalletTransaction: (data) => request('/wallet/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteWalletTransaction: (id) => request(`/wallet/transactions/${id}`, {
    method: 'DELETE',
  }),

  // Users Management
  getUsers: () => request('/admin/users'),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  promoteUser: (id) => request(`/admin/users/${id}/promote`, { method: 'PUT' }),

  // Coupons Management
  getCoupons: () => request('/admin/coupons'),
  createCoupon: (data) => request('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),

  getCommoditiesOverview: () => request('/commodities-overview').then(res => res.data || res),

  // --- Auth APIs ---
  register: (data) => request(`/auth/register`, { method: 'POST', body: JSON.stringify(data) }),
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const url = `${API_BASE_URL}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Login failed");
    }
    return response.json();
  },
  getMe: () => request(`/auth/me`),
  updateProfile: (data) => request(`/auth/me`, { method: 'PUT', body: JSON.stringify(data) }),
};
