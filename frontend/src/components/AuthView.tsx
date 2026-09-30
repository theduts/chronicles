import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

interface AuthViewProps {
  onLoginSuccess?: (userName: string, email: string, role: 'player' | 'dm') => void;
  initialTab?: 'login' | 'signup';
  onNavigateTab?: (tab: 'login' | 'signup') => void;
}

export default function AuthView({ onLoginSuccess, initialTab = 'login', onNavigateTab }: AuthViewProps) {
  const [isLoginTab, setIsLoginTab] = useState(initialTab === 'login');

  useEffect(() => {
    setIsLoginTab(initialTab === 'login');
  }, [initialTab]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setErrorMessage(null);
      const userRole = data.role === 'ROLE_ADMIN' ? 'dm' : (data.role === 'ROLE_USER' ? 'player' : data.role);
      const user = {
        id: data.userId || String(data.id || ''),
        username: data.username,
        name: data.username,
        email: data.email,
        role: userRole,
      };
      useAppStore.getState().login(data.token, user);
      if (onLoginSuccess) {
        onLoginSuccess(user.username, user.email, userRole as 'player' | 'dm');
      }
    },
    onError: (error: any) => {
      if (error.response?.status === 429) {
        // On 429, the countdown toast raised by the interceptor is authoritative.
        // Clear inline banner so it does not contradict the live timer.
        setErrorMessage(null);
        return;
      }
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Falha ao entrar. Verifique seu e-mail/usuário e senha.';
      setErrorMessage(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: { username: string; email: string; password: string }) => {
      const response = await api.post('/auth/register', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setErrorMessage(null);
      const userRole = 'player';
      const user = {
        id: data.userId || String(data.id || ''),
        username: data.username,
        name: data.username,
        email: data.email,
        role: userRole,
      };
      useAppStore.getState().login(data.token, user);
      if (onLoginSuccess) {
        onLoginSuccess(user.username, user.email, userRole as 'player' | 'dm');
      }
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Erro ao criar conta. Verifique os dados informados.';
      setErrorMessage(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLoginTab) {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Por favor, informe seu usuário/e-mail e senha.');
        return;
      }
      loginMutation.mutate({
        email: email.trim(),
        password: password,
      });
    } else {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('Por favor, preencha todos os campos.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas digitadas não conferem.');
        return;
      }

      registerMutation.mutate({
        username: fullName.trim(),
        email: email.trim(),
        password: password,
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background text-on-surface select-none transition-colors duration-300">
      <div className="noise-overlay"></div>
      {/* Auth Card viewport spacer */}
      <main className="relative z-20 w-full max-w-[420px] px-8 py-12 flex flex-col justify-center gap-10 min-h-screen">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <img
            src="/images/logo%20v2.webp"
            alt="Logo"
            className="w-32 max-w-[160px] md:max-w-[180px] h-auto object-contain mb-4"
          />
          <h1 className="font-serif text-4xl lg:text-5xl text-primary font-bold tracking-[0.25em] uppercase text-center leading-none">
            Chronicles
          </h1>
        </div>

        {errorMessage && (
          <div className="bg-red-900/40 border border-primary text-red-200 px-4 py-3 text-xs rounded font-sans tracking-wide">
            {errorMessage}
          </div>
        )}

        {isLoginTab ? (
          /* ================= LOGIN FORM ================= */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="email">
                Usuário ou Email
              </label>
              <div className="relative group border-b border-outline-variant hover:border-primary transition-all duration-300">
                <input
                  id="email"
                  type="text"
                  required
                  placeholder="Seu usuário ou email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface text-base py-3.5 pr-10 focus:ring-0 outline-none"
                />
                <span className="material-symbols-outlined absolute right-2 top-4 text-outline-variant group-focus-within:text-primary transition-colors text-lg">
                  account_circle
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="password">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => alert('Sussurre as palavras de restauração ao mestre do jogo.')}
                  className="font-sans text-[9px] font-bold text-outline hover:text-primary transition-colors uppercase tracking-wider bg-transparent border-none"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative group border-b border-outline-variant hover:border-primary transition-all duration-300">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface text-base py-3.5 pr-10 focus:ring-0 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-2 top-4 text-outline-variant hover:text-primary transition-colors text-lg cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? 'visibility' : 'lock'}
                </button>
              </div>
            </div>

            {/* CTA action trigger Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-sans text-xs font-bold py-4 tracking-[0.2em] transition-all hover:shadow-[0_0_15px_rgba(158,27,27,0.3)] active:scale-[0.98] group cursor-pointer border border-transparent disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loginMutation.isPending ? 'ENTRANDO...' : 'ENTRAR'}{' '}
                <span className="material-symbols-outlined text-sm">keyboard_double_arrow_right</span>
              </span>
            </button>
          </form>
        ) : (
          /* ================= SIGNUP FORM ================= */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="fullName">
                usuário
              </label>
              <div className="relative group border-b border-outline-variant hover:border-primary transition-all duration-300">
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Seu nome de usuário"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface text-base py-3.5 pr-10 focus:ring-0 outline-none"
                />
                <span className="material-symbols-outlined absolute right-2 top-4 text-outline-variant group-focus-within:text-primary transition-colors text-lg">
                  account_circle
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="signup-email">
                email
              </label>
              <div className="relative group border-b border-outline-variant hover:border-primary transition-all duration-300">
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="nome@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface text-base py-3.5 pr-10 focus:ring-0 outline-none"
                />
                <span className="material-symbols-outlined absolute right-2 top-4 text-outline-variant group-focus-within:text-primary transition-colors text-lg">
                  mail
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="signup-password">
                senha
              </label>
              <div className="relative group border-b border-outline-variant hover:border-primary transition-all duration-300">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo de 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface text-base py-3.5 pr-10 focus:ring-0 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-2 top-4 text-outline-variant hover:text-primary transition-colors text-lg cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? 'visibility' : 'lock'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="confirm-password">
                Confirmar senha
              </label>
              <div className="relative group border-b border-outline-variant hover:border-primary transition-all duration-300">
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repita a Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface text-base py-3.5 pr-10 focus:ring-0 outline-none"
                />
                <span className="material-symbols-outlined absolute right-2 top-4 text-outline-variant group-focus-within:text-primary transition-colors text-lg">
                  lock
                </span>
              </div>
            </div>


            {/* CTA action trigger Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-sans text-xs font-bold py-4 tracking-[0.2em] transition-all border border-transparent active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {registerMutation.isPending ? 'CRIANDO CONTA...' : 'CRIAR CONTA »'}
            </button>
          </form>
        )}

        {/* Footer switcher tabs */}
        <div className="pt-6 border-t border-outline-variant/30 text-center">
          {isLoginTab ? (
            <p className="font-sans text-xs text-on-surface-variant/80">
              Ainda não foi iniciado?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(false);
                  setEmail('');
                  setPassword('');
                  if (onNavigateTab) onNavigateTab('signup');
                }}
                className="text-primary hover:underline font-bold transition-all ml-1 cursor-pointer bg-transparent border-none font-serif text-sm inline-block"
              >
                Criar Conta
              </button>
            </p>
          ) : (
            <p className="font-sans text-xs text-on-surface-variant/80">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(true);
                  setEmail('');
                  setPassword('');
                  if (onNavigateTab) onNavigateTab('login');
                }}
                className="text-primary hover:underline font-bold transition-all ml-1 cursor-pointer bg-transparent border-none font-serif text-sm inline-block"
              >
                Faça o login
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
