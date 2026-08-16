import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Shield, Key, User, HardHat, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types/erp';

export const LoginPage: React.FC = () => {
  const { login } = useERP();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');
  const [error, setError] = useState('');

  // Quick Preset Credential Handler
  const handleQuickLogin = (role: UserRole, user: string, pass: string) => {
    setSelectedRole(role);
    setUsername(user);
    setPassword(pass);
    login(user, pass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username or identifier.');
      return;
    }
    const success = login(username, password);
    if (!success) {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#121927] border border-[#1E293B] rounded-3xl p-8 shadow-2xl space-y-6 z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-2 shadow-inner">
            <HardHat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            PAVETRACK <span className="text-blue-500 font-mono">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Road Infrastructure & Pavement Construction ERP
          </p>
        </div>

        {/* Quick Role Selectors */}
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Select Access Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('SUPER_ADMIN', 'admin', 'admin123')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'SUPER_ADMIN'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-[#162032] border-[#1E293B] text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-400 mb-1" />
              <div className="text-xs font-bold leading-tight">Admin</div>
              <div className="text-[9px] text-blue-300">Full Power</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('STORE_MANAGER', 'neha', 'mgr123')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'STORE_MANAGER'
                  ? 'bg-emerald-600/20 border-emerald-500 text-white'
                  : 'bg-[#162032] border-[#1E293B] text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="text-xs font-bold leading-tight">Manager</div>
              <div className="text-[9px] text-emerald-300">Admin Control</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('SITE_SUPERVISOR', 'ibrahim', 'site123')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'SITE_SUPERVISOR'
                  ? 'bg-amber-600/20 border-amber-500 text-white'
                  : 'bg-[#162032] border-[#1E293B] text-slate-400 hover:text-white'
              }`}
            >
              <HardHat className="w-4 h-4 text-amber-400 mb-1" />
              <div className="text-xs font-bold leading-tight">Operator</div>
              <div className="text-[9px] text-amber-300">Site Trips/Fuel</div>
            </button>
          </div>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-slate-400 font-bold">Username / Login ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin, neha, ibrahim"
                className="w-full bg-[#162032] border border-[#1E293B] focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-400 font-bold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#162032] border border-[#1E293B] focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-mono outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30"
          >
            <span>Sign In to Site Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Access Rights Legend */}
        <div className="pt-4 border-t border-[#1E293B] text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span><strong>Admin</strong>: Site Deletion, Clear Data, System Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span><strong>Manager</strong>: Approvals, Costing, Machine Fleet & Yield</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span><strong>Operator</strong>: Diesel Logs, Trip Weighbridge Entries</span>
          </div>
        </div>

      </div>
    </div>
  );
};
