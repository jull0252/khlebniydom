import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiRegister } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveAuth = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      saveAuth(data.token, {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        companyName: data.companyName,
        inn: data.inn,
      });
      return data;
    } catch (err) {
      // Fallback: localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const u = users.find(u => u.email === email && u.password === password);
      if (u) {
        saveAuth('token-' + u.id, u);
        return u;
      }
      throw new Error('Неверный email или пароль');
    }
  };

  const register = async (data) => {
    try {
      const result = await apiRegister(data);
      saveAuth(result.token, {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        role: result.role,
        companyName: result.companyName,
        inn: result.inn,
      });
      return result;
    } catch (err) {
      // Fallback: localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find(u => u.email === data.email)) {
        throw new Error('Email уже зарегистрирован');
      }
      const newUser = {
        id: Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        companyName: data.companyName || '',
        inn: data.inn || '',
        password: data.password,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      saveAuth('token-' + newUser.id, newUser);
      return newUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
