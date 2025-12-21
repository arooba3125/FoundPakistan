import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from './api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const stored = {
      user: localStorage.getItem('user'),
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };

    if (stored.user && stored.accessToken) {
      try {
        setUser(JSON.parse(stored.user));
        setAccessToken(stored.accessToken);
        setRefreshToken(stored.refreshToken);
      } catch (e) {
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      const { user: userData, accessToken: token, refreshToken: refresh } = response;

      setUser(userData);
      setAccessToken(token);
      setRefreshToken(refresh);

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const signup = useCallback(async (email, password, name, phone) => {
    setError(null);
    try {
      const response = await authAPI.signup(email, password, name, phone);
      const { user: userData, accessToken: token, refreshToken: refresh } = response;

      setUser(userData);
      setAccessToken(token);
      setRefreshToken(refresh);

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.clear();
    }
  }, [refreshToken]);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return false;
    try {
      const response = await authAPI.refresh(refreshToken);
      const { accessToken: newToken, refreshToken: newRefresh } = response;

      setAccessToken(newToken);
      setRefreshToken(newRefresh);

      localStorage.setItem('accessToken', newToken);
      localStorage.setItem('refreshToken', newRefresh);

      return true;
    } catch (err) {
      logout();
      return false;
    }
  }, [refreshToken, logout]);

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
