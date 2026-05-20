import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load auth from storage on app start ─────────────────────────────────
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet([
          'token',
          'user'
        ]);
        if (storedToken[1] && storedUser[1]) {
          setToken(storedToken[1]);
          setUser(JSON.parse(storedUser[1]));
        }
      } catch (err) {
        console.error('Auth load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  // ─── Save auth to storage ─────────────────────────────────────────────────
  const saveAuth = async (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    await AsyncStorage.multiSet([
      ['token', tokenValue],
      ['user', JSON.stringify(userData)],
    ]);
  };

  // ─── Login with email or phone + password ─────────────────────────────────
  const login = async ({ email, phone, password, fcmToken }) => {
    const { data } = await authAPI.login({
      email,
      phone,
      password,
      fcmToken
    });
    await saveAuth(data.token, data.user);
    return data;
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    await saveAuth(data.token, data.user);
    return data;
  };

  // ─── Update user ──────────────────────────────────────────────────────────
  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem('user', JSON.stringify(updated));
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['token', 'user']);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      saveAuth,
      login,
      register,
      updateUser,
      logout,
      isAuthenticated: !!token,
      isClient: user?.role === 'client',
      isHalwai: user?.role === 'halwai',
      isAdmin:  user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);