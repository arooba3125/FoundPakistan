'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Verify token by fetching profile
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tk) => {
    try {
      const profile = await authApi.getProfile(tk);
      setUser(profile.user);
      setLoading(false);
    } catch (err) {
      // Only logout on auth errors; tolerate transient failures
      const msg = (err?.message || '').toLowerCase();
      const isAuthError = msg.includes('status: 401') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('status: 403');
      if (isAuthError) {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.signup(email, password, name);
      // Signup now requires OTP, so don't auto-login
      // Return data for OTP verification step
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, expectedRole) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password, expectedRole);
      // Login now requires OTP, so don't auto-login
      // Return data for OTP verification step
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndLogin = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.verifyOtp(email, otp);
      // Now we have the token and user data
      localStorage.setItem('auth_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    setError(null);
    try {
      const data = await authApi.resendOtp(email);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        signup,
        login,
        verifyOtpAndLogin,
        resendOtp,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
