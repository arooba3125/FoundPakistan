/**
 * API Client for Found Pakistan Backend
 * Handles all HTTP requests to the NestJS API at localhost:3001
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 unauthorized - refresh token or redirect to login
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  signup: (email, password, name, phone) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    }),

  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken) =>
    apiCall('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken) =>
    apiCall('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  requestEmailVerify: () =>
    apiCall('/auth/request-email-verify', {
      method: 'POST',
    }),

  verifyEmail: (token) =>
    apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  forgotPassword: (email) =>
    apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) =>
    apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// Users API
export const usersAPI = {
  getMe: () => apiCall('/users/me'),

  updateMe: (name, phone) =>
    apiCall('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name, phone }),
    }),

  getById: (id) => apiCall(`/users/${id}`),
};

// Cases API
export const casesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.q) params.append('q', filters.q);
    const queryString = params.toString();
    return apiCall(`/cases${queryString ? '?' + queryString : ''}`);
  },

  getById: (id) => apiCall(`/cases/${id}`),

  create: (caseData) =>
    apiCall('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    }),

  update: (id, caseData) =>
    apiCall(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(caseData),
    }),

  resolve: (id) =>
    apiCall(`/cases/${id}/resolve`, {
      method: 'POST',
    }),

  delete: (id) =>
    apiCall(`/cases/${id}`, {
      method: 'DELETE',
    }),
};

// Media API
export const mediaAPI = {
  attachToCase: (caseId, url, mime, size, key) =>
    apiCall('/media', {
      method: 'POST',
      body: JSON.stringify({ caseId, url, mime, size, key }),
    }),
};

// Content API
export const contentAPI = {
  getBySlug: (slug, locale = 'en') =>
    apiCall(`/content/${slug}?locale=${locale}`),

  upsertBlock: (slug, title, body, locale = 'en') =>
    apiCall(`/content/${slug}`, {
      method: 'PUT',
      body: JSON.stringify({ slug, title, body, locale }),
    }),
};

// Admin API
export const adminAPI = {
  getOverview: () => apiCall('/admin/overview'),
};

export default apiCall;
