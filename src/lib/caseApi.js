const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

async function handleResponse(res, fallbackMessage = 'Request failed') {
  if (!res.ok) {
    let message = fallbackMessage;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch (_) {
      // If response is not JSON, use status text
      message = res.statusText || message;
    }
    
    // Add status code to error message for debugging
    const errorMsg = `${message} (Status: ${res.status})`;
    throw new Error(errorMsg);
  }
  return res.json();
}

export const caseApi = {
  getCases: async (params = {}, token) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'any' && value !== '') {
        query.append(key, value);
      }
    });
    const url = `${API_BASE_URL}/cases${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return handleResponse(res, 'Failed to load cases');
  },

  createCase: async (payload, token) => {
    const res = await fetch(`${API_BASE_URL}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res, 'Failed to submit case');
  },

  verifyCase: async (id, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/${id}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res, 'Failed to verify case');
  },

  markFound: async (id, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/${id}/found`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res, 'Failed to mark as found');
  },

  rejectCase: async (id, reason, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res, 'Failed to reject case');
  },
};
