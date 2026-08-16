import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Menu,
  Search,
  MoreVertical,
  Minus,
  Square,
  X,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useERP();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (!username.trim()) {
        setError('Please enter a valid username');
        setIsLoading(false);
        return;
      }
      login(username, password);
      setIsLoading(false);
    }, 250);
  };

  const handleQuickLogin = (user: string) => {
    setUsername(user);
    setPassword('••••••••');
    setIsLoading(true);
    setTimeout(() => {
      login(user, 'password');
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col select-none font-sans relative overflow-hidden">
      {/* Top Application Window Bar */}
      <header className="h-10 bg-[#060914] border-b border-[#141d33] flex items-center justify-between px-4 text-xs text-slate-400 z-20">
        <div className="flex items-center gap-3">
          <Menu className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
          <span className="font-medium tracking-wide text-slate-200 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            M B BILGI CRUSHERS - Plant Operations & Inventory
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-200 transition-colors p-1" title="Search">
            <Search className="w-4 h-4" />
          </button>
          <button className="text-slate-400 hover:text-slate-200 transition-colors p-1" title="Options">
            <MoreVertical className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <button className="text-slate-400 hover:text-slate-200 transition-colors p-1" title="Minimize">
            <Minus className="w-4 h-4" />
          </button>
          <button className="text-slate-400 hover:text-slate-200 transition-colors p-1" title="Maximize">
            <Square className="w-3.5 h-3.5" />
          </button>
          <button className="text-slate-400 hover:text-rose-400 transition-colors p-1" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Login Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Glowing Squircle Logo */}
          <div className="w-14 h-14 rounded-2xl bg-[#2563eb] shadow-xl shadow-blue-600/40 flex items-center justify-center mb-4 transition-transform hover:scale-105">
            <div className="space-y-1 w-6 flex flex-col items-center">
              <span className="block h-0.5 w-6 bg-white rounded-full"></span>
              <span className="block h-0.5 w-4 bg-white rounded-full"></span>
              <span className="block h-0.5 w-6 bg-white rounded-full"></span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white uppercase drop-shadow-sm">
            M B BILGI CRUSHER
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-normal tracking-wide">
            Plant Operations & Employee Management
          </p>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-[420px] bg-[#0c1427] border border-[#1b2845] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">System Login</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your credentials to access the terminal.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm tracking-widest transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Login to System</span>
              )}
            </button>
          </form>

          {/* Preset switchers for easy evaluation */}
          <div className="mt-6 pt-5 border-t border-[#17233c] text-center">
            <p className="text-[11px] text-slate-400 mb-3">
              Default: <span className="text-slate-300 font-medium">Admin / Neha</span>
            </p>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-lg bg-[#080f22] hover:bg-[#132042] border border-[#172647] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                  Admin User
                </div>
                <div className="text-[10px] text-slate-400">Full System Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('neha')}
                className="p-2 rounded-lg bg-[#080f22] hover:bg-[#132042] border border-[#172647] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                  Neha (Operations)
                </div>
                <div className="text-[10px] text-slate-400">Store & Accounts</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ibrahim')}
                className="p-2 rounded-lg bg-[#080f22] hover:bg-[#132042] border border-[#172647] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                  Ibrahim
                </div>
                <div className="text-[10px] text-slate-400">Plant Shift Supervisor</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner')}
                className="p-2 rounded-lg bg-[#080f22] hover:bg-[#132042] border border-[#172647] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                  Habibulla Bilgi
                </div>
                <div className="text-[10px] text-slate-400">Owner & Director</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center gap-3">
          <span>v3.4 Production Terminal</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-400/80">
            <CheckCircle2 className="w-3.5 h-3.5" /> Database Connected
          </span>
          <span>•</span>
          <span>Crusher & Infra Suite</span>
        </div>
      </main>
    </div>
  );
};
