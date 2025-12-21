/**
 * API Client for Found Pakistan Backend
 * Handles all HTTP requests to the NestJS API at localhost:3001
 */

// Use relative base and Next.js rewrites to proxy to backend (avoids CORS)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
      throw new Error('Unauthorized');
    }

    // Handle empty responses (204 No Content, etc.)
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // If no content or not JSON, return null or empty object
    if (response.status === 204 || !isJson) {
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP Error: ${response.status}`);
      }
      return null;
    }

    // Parse JSON response
    let data;
    let responseText = '';
    try {
      responseText = await response.text();
      data = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      // If JSON parsing fails, it might be an HTML error page or plain text
      if (!response.ok) {
        // Try to extract error message from text response
        const errorMsg = responseText || `Invalid response format from server. Status: ${response.status}`;
        throw new Error(errorMsg);
      }
      // If response is ok but not JSON, return the text
      return responseText || null;
    }

    if (!response.ok) {
      // Handle NestJS error format
      let errorMessage = `HTTP Error: ${response.status}`;
      
      if (data) {
        if (data.message) {
          // NestJS can return message as string or array
          errorMessage = Array.isArray(data.message) 
            ? data.message.join(', ') 
            : String(data.message);
        } else if (data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        } else if (data.statusCode) {
          errorMessage = `Error ${data.statusCode}: ${data.message || 'Unknown error'}`;
        }
      } else if (responseText) {
        // If we couldn't parse JSON but have text, use it
        errorMessage = responseText.length > 200 
          ? responseText.substring(0, 200) + '...' 
          : responseText;
      }
      
      // Log full error details for debugging
      console.error('API Error Response', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        url,
        data,
        responseText: responseText.substring(0, 500), // Limit log size
      });
      
      throw new Error(errorMessage);
    }

    // Return null for empty responses, otherwise return the data
    return data ?? null;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - unable to reach server', {
        endpoint,
        url,
        method: options.method || 'GET',
      });
      throw new Error('Unable to connect to server. Please check your connection and ensure the backend is running on http://localhost:3001');
    }

    // Re-throw if it's already our custom error (it will have a proper message)
    if (error.message && !error.message.includes('fetch') && error.message !== 'An unexpected error occurred') {
      throw error;
    }

    // Otherwise, wrap in a more descriptive error
    console.error('API call failed', {
      endpoint,
      url,
      method: options.method || 'GET',
      message: error?.message,
      stack: error?.stack,
    });
    throw new Error(error?.message || 'An unexpected error occurred');
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
