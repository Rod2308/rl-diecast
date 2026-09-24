'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdminAuthContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  isLoginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Form modal state
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Checa status de autenticação no mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me', { cache: 'no-store' });
        const data = await res.json();
        setIsAdmin(Boolean(data.authenticated));
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdmin(true);
        return { success: true };
      }
      return { success: false, error: data.error || 'Senha incorreta.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao conectar ao servidor.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setIsAdmin(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPassword.trim()) {
      setErrorMessage('Por favor, informe a senha de administrador.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await login(inputPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Acesso de administrador liberado com sucesso!');
      setInputPassword('');
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setSuccessMessage('');
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Senha de administrador incorreta.');
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        loading,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal: () => {
          setErrorMessage('');
          setSuccessMessage('');
          setInputPassword('');
          setIsLoginModalOpen(true);
        },
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}

      {/* MODAL DE LOGIN ADMIN FLUTUANTE */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0e121b] border border-white/20 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Acesso do Administrador
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Digite a senha de administrador para liberar as ferramentas de edição da loja.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Senha de Administrador</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite sua senha..."
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl pl-4 pr-11 py-3 text-white text-xs focus:border-amber-400 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Verificando senha...' : 'Entrar no Perfil Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
