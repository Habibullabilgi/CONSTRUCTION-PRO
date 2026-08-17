import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectTypeSelectionPage } from './components/auth/ProjectTypeSelectionPage';
import { SiteSelectionPage } from './components/auth/SiteSelectionPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SiteCentricMidnightDashboard } from './components/dashboard/SiteCentricMidnightDashboard';
import { MaterialHaulageTripsModule } from './components/trips/MaterialHaulageTripsModule';
import { DieselFuelManagementModule } from './components/diesel/DieselFuelManagementModule';
import { SiteCostExpensesModule } from './components/costing/SiteCostExpensesModule';
import { RoadSitesManagerModule } from './components/sites/RoadSitesManagerModule';
import { RoadYieldCalculatorModule } from './components/calculator/RoadYieldCalculatorModule';
import { MachineryFleetModule } from './components/machinery/MachineryFleetModule';

import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Shield,
  Clock,
  CheckCircle2
} from 'lucide-react';

// ==========================================
// User Management Module
// ==========================================
export type SystemRole = 'Admin' | 'Inventory Manager' | 'Store Keeper' | 'Auditor' | 'Read Only';

export interface ManagedUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: SystemRole;
  expiryType: 'PERMANENT' | 'DEMO';
  expiryDateTime?: string;
  createdDate: string;
  isCurrentUser?: boolean;
}

const INITIAL_SYSTEM_USERS: ManagedUser[] = [
  {
    id: 'u-1',
    name: 'Habibulla Bilgi (Director)',
    username: 'admin',
    password: '123',
    role: 'Admin',
    expiryType: 'PERMANENT',
    createdDate: '16/08/2026',
    isCurrentUser: true
  },
  {
    id: 'u-2',
    name: 'Neha Bilgi',
    username: 'neha',
    password: '123',
    role: 'Inventory Manager',
    expiryType: 'PERMANENT',
    createdDate: '23/06/2026'
  },
  {
    id: 'u-3',
    name: 'Ibrahim (Site Incharge)',
    username: 'keeper',
    password: '123',
    role: 'Store Keeper',
    expiryType: 'DEMO',
    expiryDateTime: '2026-08-30T18:00',
    createdDate: '28/07/2026'
  },
  {
    id: 'u-4',
    name: 'Auditor User',
    username: 'auditor',
    password: '123',
    role: 'Auditor',
    expiryType: 'PERMANENT',
    createdDate: '22/06/2026'
  }
];

const LOCAL_STORAGE_USERS_KEY = 'CONSTRUCTION_PRO_SYSTEM_USERS_V2';

export const UserManagementModule: React.FC = () => {
  const { currentUser, userRole } = useERP();

  const roleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = roleStr.includes('admin');

  const [users, setUsers] = useState<ManagedUser[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SYSTEM_USERS;
    } catch {
      return INITIAL_SYSTEM_USERS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Store Keeper' as SystemRole,
    expiryType: 'PERMANENT' as 'PERMANENT' | 'DEMO',
    expiryDateTime: '2026-08-31T23:59'
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);

  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '123',
      role: 'Store Keeper',
      expiryType: 'PERMANENT',
      expiryDateTime: '2026-08-31T23:59'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: ManagedUser) => {
    if (!isAdmin) return;
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password || '',
      role: user.role,
      expiryType: user.expiryType || 'PERMANENT',
      expiryDateTime: user.expiryDateTime || '2026-08-31T23:59'
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!formData.name.trim() || !formData.username.trim()) return;

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name.trim(),
                username: formData.username.toLowerCase().trim(),
                password: formData.password.trim() || u.password,
                role: formData.role,
                expiryType: formData.expiryType,
                expiryDateTime:
                  formData.expiryType === 'DEMO' ? formData.expiryDateTime : undefined
              }
            : u
        )
      );
    } else {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
        today.getMonth() + 1
      ).padStart(2, '0')}/${today.getFullYear()}`;

      const newUser: ManagedUser = {
        id: `u-${Date.now()}`,
        name: formData.name.trim(),
        username: formData.username.toLowerCase().trim(),
        password: formData.password.trim() || '123',
        role: formData.role,
        expiryType: formData.expiryType,
        expiryDateTime:
          formData.expiryType === 'DEMO' ? formData.expiryDateTime : undefined,
        createdDate: formattedDate
      };
      setUsers((prev) => [newUser, ...prev]);
    }

    setIsModalOpen(false);
  };

  const getRoleBadgeStyle = (role: SystemRole) => {
    switch (role) {
      case 'Admin':
        return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
      case 'Inventory Manager':
        return 'text-blue-400 border-blue-500/40 bg-blue-950/20';
      case 'Store Keeper':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
      case 'Auditor':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
      case 'Read Only':
        return 'text-slate-400 border-slate-600 bg-slate-900/40';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">User Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage system users, login credentials, passwords, and demo expiry limits.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add User</span>
          </button>
        )}
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-[#0e1626] border border-rose-600/50 space-y-1.5">
          <div className="text-sm font-bold text-rose-400">Admin</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Full access — edit users, passwords, expiry limits, and sites
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1626] border border-blue-600/50 space-y-1.5">
          <div className="text-sm font-bold text-blue-400">Inventory Manager</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Manage trips, fuel logs, road yield & expenses
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1626] border border-emerald-600/50 space-y-1.5">
          <div className="text-sm font-bold text-emerald-400">Store Keeper</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Record day trips, diesel vouchers & fleet logs
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1626] border border-amber-600/50 space-y-1.5">
          <div className="text-sm font-bold text-amber-400">Auditor</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Read-only audit access to telemetry and records
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1626] border border-slate-700 space-y-1.5">
          <div className="text-sm font-bold text-slate-300">Read Only</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            View dashboard and telemetry overview only
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0b1220] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#1e293b] bg-[#0d1527]/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Registered Users & Demo Accounts</h2>
            <p className="text-xs text-slate-400 mt-0.5">{users.length} users registered</p>
          </div>
          {!isAdmin && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800 text-[10px] font-bold">
              View Only (Admin Permission Required for Editing)
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/60">
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Username</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Account Access & Expiry</th>
                <th className="py-3.5 px-6">Created</th>
                {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-slate-200">
              {users.map((user) => {
                const isYou = user.username === currentUser?.name || user.username === 'admin';
                const isDemo = user.expiryType === 'DEMO';

                return (
                  <tr key={user.id} className="hover:bg-[#121c33]/50 transition-colors group">
                    <td className="py-4 px-6 font-bold text-white whitespace-nowrap">
                      {user.name}{' '}
                      {isYou && (
                        <span className="text-blue-400 font-normal text-[11px] ml-1">(you)</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-300">
                      {user.username}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeStyle(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {isDemo ? (
                        <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Expires: {user.expiryDateTime ? user.expiryDateTime.replace('T', ' ') : 'Demo Period'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Permanent Access</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">{user.createdDate}</td>
                    {isAdmin && (
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User & Password"
                            className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isYou && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              title="Delete User"
                              className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>{editingUser ? 'Edit System User Credentials' : 'Add New System User'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Patil"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. anand"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as SystemRole })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer font-medium"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Store Keeper">Store Keeper</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Read Only">Read Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Login Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter login password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Account Expiry Plan *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, expiryType: 'PERMANENT' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all cursor-pointer ${
                      formData.expiryType === 'PERMANENT'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm'
                        : 'bg-[#162032] border-[#1E293B] text-slate-400'
                    }`}
                  >
                    Permanent Access
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, expiryType: 'DEMO' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all cursor-pointer ${
                      formData.expiryType === 'DEMO'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-[#162032] border-[#1E293B] text-slate-400'
                    }`}
                  >
                    Demo / Temporary
                  </button>
                </div>
              </div>

              {formData.expiryType === 'DEMO' && (
                <div className="p-3 bg-[#0d1527] border border-amber-500/40 rounded-2xl space-y-1.5 animate-in fade-in">
                  <label className="block text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Demo Expiry Date & Time *</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.expiryDateTime}
                    onChange={(e) => setFormData({ ...formData, expiryDateTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    User login access will automatically deactivate after this date & time.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Main Application Content Router
// ==========================================
export const AppContent: React.FC = () => {
  const { isAuthenticated, selectedSiteId, setSelectedSiteId, siteSheets } = useERP();

  // 1. Domain Type Selection State ('ROAD' | 'BUILDING' | null)
  const [projectType, setProjectType] = useState<'ROAD' | 'BUILDING' | null>(() => {
    try {
      return (sessionStorage.getItem('CONSTRUCTION_PRO_DOMAIN_SESSION') as any) || null;
    } catch {
      return null;
    }
  });

  // 2. Specific Site Chosen State
  const [hasSelectedSite, setHasSelectedSite] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Step 1: Authentication Check
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Step 2: Domain Choice Check (Road vs Building)
  if (!projectType) {
    return (
      <ProjectTypeSelectionPage
        onSelectProjectType={(type) => {
          setProjectType(type);
          sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', type);
        }}
      />
    );
  }

  // Step 3: Site Selection Check
  if (!hasSelectedSite || !selectedSiteId || siteSheets.length === 0) {
    return (
      <SiteSelectionPage
        projectType={projectType}
        onSelectSite={(siteId) => {
          setSelectedSiteId(siteId);
          setHasSelectedSite(true);
          sessionStorage.setItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION', 'true');
        }}
        onBackToDomainSelect={() => {
          setProjectType(null);
          setHasSelectedSite(false);
          sessionStorage.removeItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
          sessionStorage.removeItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION');
        }}
      />
    );
  }

  // Step 4: Main Application Viewport
  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 relative min-h-[calc(100vh-48px)]">
        {isSidebarOpen && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-48px)] scrollbar-thin scrollbar-thumb-[#1E293B] scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && <SiteCentricMidnightDashboard onNavigateTab={setActiveTab} />}
            {activeTab === 'users' && <UserManagementModule />}
            {(activeTab === 'road-sites' || activeTab === 'sites') && <RoadSitesManagerModule onNavigateTab={setActiveTab} />}
            {activeTab === 'haulage-trips' && <MaterialHaulageTripsModule />}
            {activeTab === 'diesel' && <DieselFuelManagementModule />}
            {activeTab === 'site-expenses' && <SiteCostExpensesModule />}
            {(activeTab === 'yield_calculator' || activeTab === 'road-yield') && <RoadYieldCalculatorModule />}
            {(activeTab === 'machinery_fleet' || activeTab === 'machinery') && <MachineryFleetModule />}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ERPProvider>
      <RoadERPProvider>
        <AppContent />
      </RoadERPProvider>
    </ERPProvider>
  );
};

export default App;
