'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from './types';

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (params: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  customer: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refresh: async () => {},
});

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentCustomer = async () => {
    try {
      const res = await fetch('/api/customer/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.authenticated && data.customer) {
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentCustomer();
  }, []);

  const login = async (params: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        return { success: true };
      }
      return { success: false, error: data.error || 'Falha no login.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro de conexão.' };
    }
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
  }) => {
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        return { success: true };
      }
      return { success: false, error: data.error || 'Falha no cadastro.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro de conexão.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/customer/logout', { method: 'POST' });
    } finally {
      setCustomer(null);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: Boolean(customer),
        loading,
        login,
        register,
        logout,
        refresh: fetchCurrentCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
