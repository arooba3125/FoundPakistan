const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

async function handleResponse(res, fallbackMessage = 'Request failed') {
  if (!res.ok) {
    let message = fallbackMessage;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch (_) {
      message = res.statusText || message;
    }
    throw new Error(`${message} (Status: ${res.status})`);
  }
  return res.json();
}

export const usersApi = {
  async listAdmins(token) {
    const res = await fetch(`${API_BASE_URL}/users/admins`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await handleResponse(res, 'Failed to list admins');
    return data.admins || [];
  },

  async getUserByEmail(email, token) {
    const res = await fetch(`${API_BASE_URL}/users/by-email/${encodeURIComponent(email)}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await handleResponse(res, 'Failed to fetch user by email');
    return data.user || null;
  },

  async promoteToAdmin(userId, token) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/promote`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await handleResponse(res, 'Failed to promote user');
    return data.user;
  },

  async demoteFromAdmin(userId, token) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/demote`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await handleResponse(res, 'Failed to demote admin');
    return data.user;
  },
};
