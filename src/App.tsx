import React, { useState, useEffect, useMemo } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectTypeSelectionPage } from './components/auth/ProjectTypeSelectionPage';
import { SiteSelectionPage } from './components/auth/SiteSelectionPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Road Construction Components
import { SiteCentricMidnightDashboard } from './components/dashboard/SiteCentricMidnightDashboard';
import { RoadSitesManagerModule } from './components/sites/RoadSitesManagerModule';
import { MaterialHaulageTripsModule } from './components/trips/MaterialHaulageTripsModule';
import { DieselFuelManagementModule } from './components/diesel/DieselFuelManagementModule';
import { SiteCostExpensesModule } from './components/costing/SiteCostExpensesModule';
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
  CheckCircle2,
  Search,
  Download,
  Package,
  ArrowLeftRight,
  FileText,
  Bell,
  ShoppingCart,
  CalendarCheck,
  Tag,
  Archive,
  TrendingUp,
  TrendingDown
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
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
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
// Products Master Module
// ==========================================
export interface BuildingProduct {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  status: 'Active' | 'Inactive';
  currentStock: number;
  minStock: number;
  reorderLevel: number;
  maxStock: number;
  supplier: string;
  purchaseDate: string;
  location: string;
  skuPartNo: string;
  barcode: string;
  brand: string;
  rack?: string;
  bin?: string;
  expiryDate?: string;
  description?: string;
}

const STORAGE_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_V2';

const INITIAL_BUILDING_PRODUCTS: BuildingProduct[] = [
  {
    id: 'PRD-001',
    name: 'Castrol Optigear 320',
    category: 'Lubricants & Oils',
    unit: 'Litre',
    unitCost: 450,
    status: 'Active',
    currentStock: 10,
    minStock: 5,
    reorderLevel: 10,
    maxStock: 100,
    supplier: 'Castrol India Ltd',
    purchaseDate: '2026-08-17',
    location: 'Central Yard',
    skuPartNo: 'CST-OG320',
    barcode: '1234567890',
    brand: 'Castrol',
    rack: 'R-02',
    bin: 'B-14',
    description: 'Industrial heavy gear oil'
  },
  {
    id: 'PRD-002',
    name: 'HP-80W/90 OIL',
    category: 'Lubricants & Oils',
    unit: 'Litre',
    unitCost: 380,
    status: 'Active',
    currentStock: 10,
    minStock: 5,
    reorderLevel: 10,
    maxStock: 100,
    supplier: 'HPCL',
    purchaseDate: '2026-08-17',
    location: 'Central Yard',
    skuPartNo: 'HP-80W90',
    barcode: '89012345678',
    brand: 'HP',
    rack: 'R-01',
    bin: 'B-02',
    description: 'Transmission lubricant'
  }
];

export const ProductsMasterModule: React.FC = () => {
  const { currentUser, userRole } = useERP();
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [products, setProducts] = useState<BuildingProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BUILDING_PRODUCTS;
    } catch {
      return INITIAL_BUILDING_PRODUCTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Nos');
  const [unitCost, setUnitCost] = useState<number | ''>(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [currentStock, setCurrentStock] = useState<number | ''>(0);
  const [minStock, setMinStock] = useState<number | ''>(0);
  const [reorderLevel, setReorderLevel] = useState<number | ''>(10);
  const [maxStock, setMaxStock] = useState<number | ''>(100);
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-08-17');
  const [location, setLocation] = useState('');
  const [skuPartNo, setSkuPartNo] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [rack, setRack] = useState('');
  const [bin, setBin] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setProductName('');
    setCategory('Lubricants & Oils');
    setUnit('Nos');
    setUnitCost(0);
    setStatus('Active');
    setCurrentStock(0);
    setMinStock(0);
    setReorderLevel(10);
    setMaxStock(100);
    setSupplier('');
    setPurchaseDate('2026-08-17');
    setLocation('Central Yard');
    setSkuPartNo('');
    setBarcode('');
    setBrand('');
    setRack('');
    setBin('');
    setExpiryDate('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const payload: BuildingProduct = {
      id: editingId || `PRD-${Date.now().toString().slice(-4)}`,
      name: productName.trim(),
      category: category || 'General',
      unit,
      unitCost: Number(unitCost) || 0,
      status,
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 0,
      reorderLevel: Number(reorderLevel) || 0,
      maxStock: Number(maxStock) || 0,
      supplier: supplier.trim() || 'General Supplier',
      purchaseDate,
      location: location || 'Central Yard',
      skuPartNo: skuPartNo.trim() || 'SKU-GEN',
      barcode: barcode.trim() || `${Date.now()}`,
      brand: brand.trim() || 'Standard',
      rack: rack.trim() || undefined,
      bin: bin.trim() || undefined,
      expiryDate: expiryDate || undefined,
      description: description.trim() || undefined
    };

    if (editingId) {
      setProducts(products.map((p) => (p.id === editingId ? payload : p)));
    } else {
      setProducts([payload, ...products]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.skuPartNo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Products Master</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage catalog, inventory limits, and item details.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, ID, barcode, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-blue-500 placeholder-slate-500"
        />
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">NAME & DETAILS</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">LOCATION</th>
                <th className="py-3.5 px-4 text-right">STOCK</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No matching products found in catalog.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.currentStock <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{item.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.brand} • SKU: {item.skuPartNo}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">{item.location}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className={`font-mono font-black text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.currentStock} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                        </div>
                        {isLow && (
                          <span className="text-[9px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-800">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setProductName(item.name);
                              setCategory(item.category);
                              setUnit(item.unit);
                              setUnitCost(item.unitCost);
                              setStatus(item.status);
                              setCurrentStock(item.currentStock);
                              setMinStock(item.minStock);
                              setReorderLevel(item.reorderLevel);
                              setMaxStock(item.maxStock);
                              setSupplier(item.supplier);
                              setPurchaseDate(item.purchaseDate);
                              setLocation(item.location);
                              setSkuPartNo(item.skuPartNo);
                              setBarcode(item.barcode);
                              setBrand(item.brand);
                              setRack(item.rack || '');
                              setBin(item.bin || '');
                              setExpiryDate(item.expiryDate || '');
                              setDescription(item.description || '');
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Castrol Optigear 320"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">— Select Category —</option>
                    <option value="Lubricants & Oils">Lubricants & Oils</option>
                    <option value="Structural Steel">Structural Steel</option>
                    <option value="Cement & Binding">Cement & Binding</option>
                    <option value="Aggregates & Sand">Aggregates & Sand</option>
                    <option value="Bricks & Blocks">Bricks & Blocks</option>
                    <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Litre">Litre</option>
                    <option value="Ton">Ton</option>
                    <option value="Kg">Kg</option>
                    <option value="Bags">Bags</option>
                    <option value="Brass">Brass</option>
                    <option value="Meter">Meter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Min Stock *</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Stock *</label>
                  <input
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Supplier *</label>
                  <input
                    type="text"
                    required
                    placeholder="Supplier Name"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="">— Select Location —</option>
                    <option value="Central Yard">Central Yard</option>
                    <option value="Tower-A Yard">Tower-A Yard</option>
                    <option value="Tower-B Yard">Tower-B Yard</option>
                    <option value="Basement Staging">Basement Staging</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">SKU / Part No.</label>
                  <input
                    type="text"
                    placeholder="CST-OG320"
                    value={skuPartNo}
                    onChange={(e) => setSkuPartNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Barcode</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="Castrol"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rack</label>
                  <input
                    type="text"
                    placeholder="Rack number"
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bin</label>
                  <input
                    type="text"
                    placeholder="Bin code"
                    value={bin}
                    onChange={(e) => setBin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Used For</label>
                <textarea
                  rows={2}
                  placeholder="Notes about product application..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none resize-none"
                />
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Product' : 'Add Product'}
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
// Stock Transactions Module (Clean Form: Vehicle No, Work Order, Purpose removed)
// ==========================================
export interface StockTransaction {
  id: string;
  productName: string;
  type: 'Stock In' | 'Stock Out';
  quantity: number;
  date: string;
  department?: string;
  issuedTo?: string;
}

const STORAGE_TXNS_KEY = 'CONSTRUCTION_PRO_BUILDING_TXNS_V2';

const INITIAL_STOCK_TXNS: StockTransaction[] = [
  {
    id: 'TXN-001',
    productName: '15W/40 Engine Oil',
    type: 'Stock Out',
    quantity: 13,
    date: '2026-08-17',
    department: 'Maintenance',
    issuedTo: 'pivar'
  },
  {
    id: 'TXN-002',
    productName: 'Castrol Optigear 320',
    type: 'Stock In',
    quantity: 240,
    date: '2026-08-14',
    department: 'Stores Inward',
    issuedTo: 'Store Incharge'
  },
  {
    id: 'TXN-003',
    productName: 'HP-80W/90 OIL',
    type: 'Stock Out',
    quantity: 300,
    date: '2026-08-10',
    department: 'Heavy Fleet',
    issuedTo: 'Site Operator'
  }
];

export const StockTransactionsModule: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TXNS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_TXNS;
    } catch {
      return INITIAL_STOCK_TXNS;
    }
  });

  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-17');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State (Vehicle No, Work Order, and Purpose removed)
  const [productName, setProductName] = useState('');
  const [type, setType] = useState<'Stock In' | 'Stock Out'>('Stock Out');
  const [quantity, setQuantity] = useState<number | ''>(0);
  const [date, setDate] = useState('2026-08-17');
  const [department, setDepartment] = useState('Maintenance');
  const [issuedTo, setIssuedTo] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchDate = (!fromDate || t.date >= fromDate) && (!toDate || t.date <= toDate);
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        t.productName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q)) ||
        (t.issuedTo && t.issuedTo.toLowerCase().includes(q));
      return matchType && matchDate && matchQuery;
    });
  }, [transactions, typeFilter, fromDate, toDate, searchQuery]);

  const totalStockIn = filtered
    .filter((t) => t.type === 'Stock In')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalStockOut = filtered
    .filter((t) => t.type === 'Stock Out')
    .reduce((sum, t) => sum + t.quantity, 0);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete transaction "${id}" (${name})?`)) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !quantity || Number(quantity) <= 0) return;

    const newTxn: StockTransaction = {
      id: `TXN-${Date.now().toString().slice(-3)}`,
      productName: productName.trim(),
      type,
      quantity: Number(quantity),
      date,
      department: department.trim() || undefined,
      issuedTo: issuedTo.trim() || undefined
    };

    setTransactions([newTxn, ...transactions]);
    setIsModalOpen(false);
    setProductName('');
    setQuantity(0);
    setIssuedTo('');
  };

  const handleExportCSV = () => {
    const headers = ['Txn ID', 'Date', 'Type', 'Product', 'Quantity', 'Department', 'Issued To'];
    const rows = filtered.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.productName}"`,
      t.quantity,
      `"${t.department || '-'}"`,
      `"${t.issuedTo || '-'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Stock_Transactions_Audit_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-400 mt-0.5">Full audit log of all stock movements.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1f2f52] border border-[#22365e] text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-3xl bg-[#0c1427] border border-[#182643] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="Stock In">Stock In</option>
            <option value="Stock Out">Stock Out</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, product, employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#182643]">
          <div className="text-[11px] font-semibold text-slate-400">Records shown</div>
          <div className="text-3xl font-black text-white font-mono mt-1">{filtered.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1427] border border-emerald-900/40">
          <div className="text-[11px] font-semibold text-slate-400">Total Stock In</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{totalStockIn}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1427] border border-rose-900/40">
          <div className="text-[11px] font-semibold text-slate-400">Total Stock Out</div>
          <div className="text-3xl font-black text-rose-400 font-mono mt-1">{totalStockOut}</div>
        </div>
      </div>

      {/* Transactions Table with Delete Action */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">TXN ID & DATE</th>
                <th className="py-3.5 px-6">PRODUCT</th>
                <th className="py-3.5 px-4 text-center">TYPE</th>
                <th className="py-3.5 px-4 text-right">QTY</th>
                <th className="py-3.5 px-6">DEPARTMENT</th>
                <th className="py-3.5 px-6">ISSUED TO / EMPLOYEE</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isOut = t.type === 'Stock Out';
                  return (
                    <tr key={t.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-3.5 px-6 font-mono">
                        <div className="font-bold text-white">{t.id}</div>
                        <div className="text-[10px] text-slate-400">{t.date}</div>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-white text-xs">{t.productName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                            isOut
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-black text-sm ${isOut ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isOut ? `-${t.quantity}` : `+${t.quantity}`}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-300">
                        {t.department || '-'}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-200">
                        {t.issuedTo || '-'}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id, t.productName)}
                          title="Delete Transaction"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal (Simplified) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">New Transaction</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Product *</label>
                <input
                  type="text"
                  required
                  placeholder="Type code, name or select product..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Stock In' | 'Stock Out')}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="Stock Out">Stock Out</option>
                    <option value="Stock In">Stock In</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Transaction Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Maintenance"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Issued To / Employee *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name or employee ID"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none font-medium"
                  />
                </div>
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Record Transaction
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
// Reports & Analytics Module (LINKED TO TRANSACTIONS & PRODUCTS)
// ==========================================
export const ReportsAnalyticsModule: React.FC = () => {
  const [transactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TXNS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_TXNS;
    } catch {
      return INITIAL_STOCK_TXNS;
    }
  });

  const [products] = useState<BuildingProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BUILDING_PRODUCTS;
    } catch {
      return INITIAL_BUILDING_PRODUCTS;
    }
  });

  // Calculate live aggregates directly from transactions
  const totalStockInQty = useMemo(
    () => transactions.filter((t) => t.type === 'Stock In').reduce((sum, t) => sum + t.quantity, 0),
    [transactions]
  );

  const totalStockOutQty = useMemo(
    () => transactions.filter((t) => t.type === 'Stock Out').reduce((sum, t) => sum + t.quantity, 0),
    [transactions]
  );

  // Group transactions by product to build reconciliation table
  const productReconciliation = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        inQty: number;
        outQty: number;
        txnCount: number;
        lastDate: string;
        departments: Set<string>;
      }
    > = {};

    transactions.forEach((t) => {
      if (!map[t.productName]) {
        map[t.productName] = {
          name: t.productName,
          inQty: 0,
          outQty: 0,
          txnCount: 0,
          lastDate: t.date,
          departments: new Set()
        };
      }
      if (t.type === 'Stock In') map[t.productName].inQty += t.quantity;
      if (t.type === 'Stock Out') map[t.productName].outQty += t.quantity;
      map[t.productName].txnCount += 1;
      if (t.department) map[t.productName].departments.add(t.department);
      if (t.date > map[t.productName].lastDate) map[t.productName].lastDate = t.date;
    });

    return Object.values(map);
  }, [transactions]);

  // Department distribution
  const departmentBreakdown = useMemo(() => {
    const deptMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'Stock Out')
      .forEach((t) => {
        const d = t.department || 'General Site';
        deptMap[d] = (deptMap[d] || 0) + t.quantity;
      });
    return Object.entries(deptMap);
  }, [transactions]);

  const handleExportFullReport = () => {
    const headers = ['Product Name', 'Total Stock In', 'Total Stock Out', 'Net Consumption', 'Txn Count', 'Last Activity Date'];
    const rows = productReconciliation.map((r) => [
      `"${r.name}"`,
      r.inQty,
      r.outQty,
      r.outQty - r.inQty,
      r.txnCount,
      r.lastDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Material_Reconciliation_Audit_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Reports & Analytics</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live material consumption, wastage, and cost reconciliation linked to all site transactions.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportFullReport}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" />
          <span>Export Reconciliation PDF/CSV</span>
        </button>
      </div>

      {/* 4 Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Total Stock Inward</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            +{totalStockInQty} <span className="text-xs font-normal text-slate-400">Units</span>
          </div>
          <div className="text-[10px] text-slate-400">From supplier deliveries & GRN</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Total Stock Outward</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            -{totalStockOutQty} <span className="text-xs font-normal text-slate-400">Units</span>
          </div>
          <div className="text-[10px] text-slate-400">Issued to site fleet & plants</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Logged Transactions</span>
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {transactions.length} <span className="text-xs font-normal text-slate-400">Audited</span>
          </div>
          <div className="text-[10px] text-slate-400">Full tamper-evident movement trail</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Active SKU Catalog</span>
            <Package className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {products.length} <span className="text-xs font-normal text-slate-400">Products</span>
          </div>
          <div className="text-[10px] text-slate-400">Monitored with buffer levels</div>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#1E293B] bg-[#0d1527]/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Item-Wise Transaction Reconciliation</h2>
            <p className="text-xs text-slate-400 mt-0.5">Calculated in real-time from all inward and outward log vouchers</p>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-800 font-bold">
            Live Telemetry Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">PRODUCT NAME</th>
                <th className="py-3.5 px-4 text-right text-emerald-400">TOTAL INWARD (GRN)</th>
                <th className="py-3.5 px-4 text-right text-rose-400">TOTAL ISSUED (SITE)</th>
                <th className="py-3.5 px-4 text-right">NET SITE BURN</th>
                <th className="py-3.5 px-4 text-center">TOTAL AUDIT LOGS</th>
                <th className="py-3.5 px-6 text-right">LAST MOVEMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {productReconciliation.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                productReconciliation.map((rec, i) => (
                  <tr key={i} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-xs">{rec.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Used in: {Array.from(rec.departments).join(', ') || 'Site'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-emerald-400">
                      +{rec.inQty}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-rose-400">
                      -{rec.outQty}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-black text-amber-400">
                      {rec.outQty} Units
                    </td>
                    <td className="py-4 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px]">
                        {rec.txnCount} Vouchers
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-400">{rec.lastDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Consumption Distribution */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-2xl space-y-4">
        <h3 className="font-bold text-sm text-white">Department Consumption Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {departmentBreakdown.map(([dept, qty], idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] space-y-1">
              <div className="text-xs font-bold text-white">{dept}</div>
              <div className="text-lg font-black font-mono text-rose-400">{qty} Units Issued</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Generic Scaffold Views for Remaining Tabs
// ==========================================
const BuildingGenericView: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ title, subtitle, icon: Icon }) => (
  <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-2xl space-y-4 font-sans text-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
    <div className="p-8 rounded-2xl bg-[#080d19] border border-[#182643] text-center text-slate-400 text-xs">
      {title} operations and telematics active.
    </div>
  </div>
);

// ==========================================
// Main Application Router
// ==========================================
export const AppContent: React.FC = () => {
  const { isAuthenticated, selectedSiteId, setSelectedSiteId, siteSheets } = useERP();

  const [projectType, setProjectType] = useState<'ROAD' | 'BUILDING' | null>(() => {
    try {
      return (sessionStorage.getItem('CONSTRUCTION_PRO_DOMAIN_SESSION') as any) || null;
    } catch {
      return null;
    }
  });

  const [hasSelectedSite, setHasSelectedSite] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

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
            projectType={projectType}
            onSwitchDomain={() => {
              const next = projectType === 'ROAD' ? 'BUILDING' : 'ROAD';
              setProjectType(next);
              sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', next);
            }}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-48px)] scrollbar-thin scrollbar-thumb-[#1E293B] scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-12">
            {/* Shared Dashboard, Ongoing Sites & User Management */}
            {activeTab === 'dashboard' && <SiteCentricMidnightDashboard onNavigateTab={setActiveTab} />}
            {(activeTab === 'road-sites' || activeTab === 'sites') && (
              <RoadSitesManagerModule projectType={projectType || 'ROAD'} onNavigateTab={setActiveTab} />
            )}
            {activeTab === 'users' && <UserManagementModule />}

            {/* Road Construction Specific Tabs */}
            {projectType === 'ROAD' && (
              <>
                {activeTab === 'haulage-trips' && <MaterialHaulageTripsModule />}
                {activeTab === 'diesel' && <DieselFuelManagementModule />}
                {activeTab === 'site-expenses' && <SiteCostExpensesModule />}
                {(activeTab === 'yield_calculator' || activeTab === 'road-yield') && <RoadYieldCalculatorModule />}
                {(activeTab === 'machinery_fleet' || activeTab === 'machinery') && <MachineryFleetModule />}
              </>
            )}

            {/* Building Construction Specific Tabs */}
            {projectType === 'BUILDING' && (
              <>
                {activeTab === 'products' && <ProductsMasterModule />}
                {activeTab === 'transactions' && <StockTransactionsModule />}
                {activeTab === 'reports' && <ReportsAnalyticsModule />}
                {activeTab === 'attendance-salary' && (
                  <BuildingGenericView
                    title="Attendance & Payroll"
                    subtitle="Track attendance, salary payouts, and advance ledgers."
                    icon={CalendarCheck}
                  />
                )}
                {activeTab === 'equipment-register' && <MachineryFleetModule />}
                {activeTab === 'alerts' && (
                  <BuildingGenericView
                    title="Low Stock Alerts"
                    subtitle="Reorder buffer warnings and deficit notifications."
                    icon={Bell}
                  />
                )}
                {activeTab === 'reorder-suggestions' && (
                  <BuildingGenericView
                    title="Reorder Suggestions"
                    subtitle="Automated procurement indents."
                    icon={ShoppingCart}
                  />
                )}
                {activeTab === 'categories' && (
                  <BuildingGenericView
                    title="Material Categories"
                    subtitle="Item classifications and codes."
                    icon={Tag}
                  />
                )}
                {activeTab === 'yearly-archive' && (
                  <BuildingGenericView
                    title="Yearly Archive"
                    subtitle="Historical closing balances and audits."
                    icon={Archive}
                  />
                )}
              </>
            )}
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
