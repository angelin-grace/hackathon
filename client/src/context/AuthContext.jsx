import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillswap_token') || null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fetchIncomingCount = useCallback(async () => {
    if (!localStorage.getItem('skillswap_token')) return;
    try {
      const res = await api.get('/requests/incoming');
      if (res.data?.success && Array.isArray(res.data.requests)) {
        const pending = res.data.requests.filter(r => r.status === 'Pending').length;
        setPendingRequestsCount(pending);
      }
    } catch (err) {
      console.warn('Failed to fetch pending requests count', err);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const savedToken = localStorage.getItem('skillswap_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/users/me');
      if (res.data?.success) {
        setUser(res.data.user);
        await fetchIncomingCount();
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error verifying user token:', err);
      // Don't log out immediately if server is temporary unreachable, but set loading false
    } finally {
      setLoading(false);
    }
  }, [fetchIncomingCount]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('skillswap_token', newToken);
      setToken(newToken);
      setUser(userData);
      await fetchIncomingCount();
      return userData;
    } else {
      throw new Error(res.data?.message || 'Login failed');
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('skillswap_token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    } else {
      throw new Error(res.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('skillswap_token');
    setToken(null);
    setUser(null);
    setPendingRequestsCount(0);
  };

  const updateProfile = async (updatedFields) => {
    const res = await api.put('/users/me', updatedFields);
    if (res.data?.success) {
      setUser(res.data.user);
      return res.data.user;
    } else {
      throw new Error(res.data?.message || 'Profile update failed');
    }
  };

  const refreshUser = async () => {
    await fetchUser();
    await fetchIncomingCount();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        pendingRequestsCount,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        fetchIncomingCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
