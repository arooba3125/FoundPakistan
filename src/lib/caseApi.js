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

  getCase: async (caseId, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return handleResponse(res, 'Failed to load case');
  },

  getMyCases: async (token) => {
    const res = await fetch(`${API_BASE_URL}/cases/my-cases`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to load my cases');
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

  // DEPRECATED: Cases should only be marked as found through match confirmation
  // Admin should use confirmMatch to mark cases as found (matches 2 cases together)
  // markFound: async (id, token) => {
  //   const res = await fetch(`${API_BASE_URL}/cases/${id}/found`, {
  //     method: 'PATCH',
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   return handleResponse(res, 'Failed to mark as found');
  // },

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

  // Contact Request methods
  requestContact: async (caseId, email, message) => {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}/contact-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, message }),
    });
    return handleResponse(res, 'Failed to request contact');
  },

  getContactRequests: async (token) => {
    const res = await fetch(`${API_BASE_URL}/cases/contact-requests`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to load contact requests');
  },

  approveContactRequest: async (requestId, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/contact-requests/${requestId}/approve`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to approve contact request');
  },

  rejectContactRequest: async (requestId, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/contact-requests/${requestId}/reject`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to reject contact request');
  },

  // Matching methods (Admin only)
  getPotentialMatches: async (token) => {
    const res = await fetch(`${API_BASE_URL}/cases/matches/potential`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to load potential matches');
  },

  confirmMatch: async (matchId, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/matches/${matchId}/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to confirm match');
  },

  rejectMatch: async (matchId, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/matches/${matchId}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to reject match');
  },

  // User Actions
  cancelCase: async (caseId, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to cancel case');
  },

  markAsFoundByUser: async (caseId, token) => {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}/mark-found-by-user`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res, 'Failed to mark case as found');
  },
};
