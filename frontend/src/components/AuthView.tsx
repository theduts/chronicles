import React, { useState, useEffect } from 'react';

interface AuthViewProps {
  onLoginSuccess: (userName: string, email: string, role: 'player' | 'dm') => void;
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
  const [signupRole, setSignupRole] = useState<'player' | 'dm'>('player');

  const [logins, setLogins] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('daemon_mock_logins');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Fetch initial logins from mock_login.json
  useEffect(() => {
    if (!logins) {
      fetch('/data-mock/mock_login.json')
        .then((res) => res.json())
        .then((data) => {
          setLogins(data);
          localStorage.setItem('daemon_mock_logins', JSON.stringify(data));
        })
        .catch((err) => {
          console.error('Error fetching mock_login.json:', err);
          // Fallback static structure matching mock_login.json
          const fallback = {
            "player": {
              "id": 1,
              "nome_usuario": "teste_pc",
              "email": "teste_pc@email.com",
              "senha": "teste",
              "role": "player"
            },
            "dm": {
              "id": 2,
              "nome_usuario": "teste_dm",
              "email": "teste_dm@email.com",
              "senha": "teste",
              "role": "dm"
            }
          };
          setLogins(fallback);
          localStorage.setItem('daemon_mock_logins', JSON.stringify(fallback));
        });
    }
  }, [logins]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginTab) {
      const emailOrUser = email.trim().toLowerCase();
      const pass = password;

      // Find matched user from mock logins database
      const existingUsers = logins ? Object.values(logins) as any[] : [];
      const matchedUser = existingUsers.find(
        (u) =>
          (u.email?.toLowerCase() === emailOrUser || u.nome_usuario?.toLowerCase() === emailOrUser) &&
          u.senha === pass
      );

      if (matchedUser) {
        onLoginSuccess(matchedUser.nome_usuario, matchedUser.email, matchedUser.role);
      } else {
        alert('Credenciais inválidas. Use teste_pc / teste (Jogador) ou teste_dm / teste (Mestre), ou crie uma nova conta.');
      }
    } else {
      // Sign up checks
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      if (password !== confirmPassword) {
        alert('As senhas digitadas não batem.');
        return;
      }

      // Check duplicate
      const existingUsers = logins ? Object.values(logins) as any[] : [];
      const userExists = existingUsers.some(
        (u) =>
          u.nome_usuario?.toLowerCase() === fullName.trim().toLowerCase() ||
          u.email?.toLowerCase() === email.trim().toLowerCase()
      );

      if (userExists) {
        alert('Este usuário ou email já existe.');
        return;
      }

      // Add to mock logins
      const newUserId = `user_${Date.now()}`;
      const newUserObj = {
        id: Date.now(),
        nome_usuario: fullName.trim(),
        email: email.trim(),
        senha: password,
        role: signupRole
      };

      const updatedLogins = {
        ...logins,
        [newUserId]: newUserObj
      };

      setLogins(updatedLogins);
      localStorage.setItem('daemon_mock_logins', JSON.stringify(updatedLogins));

      alert(`Conta criada com sucesso como ${signupRole === 'dm' ? 'Mestre' : 'Jogador'}! Realize o login.`);
      setIsLoginTab(true);
      // Reset password field for security
      setPassword('');
      setConfirmPassword('');
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
              className="w-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-sans text-xs font-bold py-4 tracking-[0.2em] transition-all hover:shadow-[0_0_15px_rgba(158,27,27,0.3)] active:scale-[0.98] group cursor-pointer border border-transparent"
            >
              <span className="flex items-center justify-center gap-2">
                ENTRAR <span className="material-symbols-outlined text-sm">keyboard_double_arrow_right</span>
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

            {/* Role Selection Option */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Função (Role)
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSignupRole('player')}
                  className={`flex-1 py-2.5 font-sans text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    signupRole === 'player'
                      ? 'bg-primary-container border-primary text-on-surface'
                      : 'bg-transparent border-outline-variant text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Jogador
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('dm')}
                  className={`flex-1 py-2.5 font-sans text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    signupRole === 'dm'
                      ? 'bg-primary-container border-primary text-on-surface'
                      : 'bg-transparent border-outline-variant text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Mestre
                </button>
              </div>
            </div>

            {/* CTA action trigger Button */}
            <button
              type="submit"
              className="w-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-sans text-xs font-bold py-4 tracking-[0.2em] transition-all border border-transparent active:scale-[0.98] cursor-pointer"
            >
              CRIAR CONTA »
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
