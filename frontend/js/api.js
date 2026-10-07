// Nagar e-Connect - API & Toast Utilities

const API_BASE = (window.location.port === '5000' || window.location.pathname.startsWith('/api'))
  ? '/api'
  : 'http://localhost:5000/api';

// Toast Notification System
const toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
      }
    }
  },
  show(message, type = 'info', duration = 3500) {
    this.init();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    el.innerHTML = `
      <span style="font-weight: 800; font-size: 16px;">${icon}</span>
      <span style="flex: 1;">${message}</span>
    `;

    this.container.appendChild(el);

    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); }
};

// Centralized API request wrapper
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.headers || {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
        window.location.href = '/login.html';
      }
      throw new Error('Session expired. Please sign in again.');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status})`);
    }

    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// Global API Services
const authService = {
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: data }),
  getMe: () => apiRequest('/auth/me', { method: 'GET' })
};

const complaintService = {
  create: (formData) => apiRequest('/complaints', { method: 'POST', body: formData }),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/complaints${query ? '?' + query : ''}`, { method: 'GET' });
  },
  getMy: () => apiRequest('/complaints/my', { method: 'GET' }),
  getAssigned: () => apiRequest('/complaints/assigned', { method: 'GET' }),
  getById: (id) => apiRequest(`/complaints/${id}`, { method: 'GET' }),
  updateStatus: (id, data) => apiRequest(`/complaints/${id}/status`, { method: 'PATCH', body: data }),
  assign: (id, worker_id) => apiRequest(`/complaints/${id}/assign`, { method: 'PATCH', body: { worker_id } }),
  getMap: () => apiRequest('/complaints/map', { method: 'GET' })
};

const rewardService = {
  getCatalog: () => apiRequest('/rewards/catalog', { method: 'GET' }),
  getMyPoints: () => apiRequest('/rewards/my-points', { method: 'GET' }),
  getTransactions: () => apiRequest('/rewards/transactions', { method: 'GET' }),
  redeem: (catalog_id) => apiRequest('/rewards/redeem', { method: 'POST', body: { catalog_id } })
};

const adminService = {
  getUsers: () => apiRequest('/admin/users', { method: 'GET' }),
  toggleUser: (id) => apiRequest(`/admin/users/${id}/toggle`, { method: 'PATCH' }),
  changeRole: (id, role) => apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
  getWorkers: () => apiRequest('/admin/workers', { method: 'GET' }),
  getStats: () => apiRequest('/admin/stats', { method: 'GET' }),
  getWorkerPerformance: () => apiRequest('/admin/worker-performance', { method: 'GET' })
};
