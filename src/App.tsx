import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectTypeSelectionPage } from './components/auth/ProjectTypeSelectionPage';
import { SiteSelectionPage } from './components/auth/SiteSelectionPage';
import { Header } from './components/Header';
import { Sidebar } from './Sidebar';

import { SiteCentricMidnightDashboard } from './components/dashboard/SiteCentricMidnightDashboard';
import { RoadSitesManagerModule } from './components/sites/RoadSitesManagerModule';
import { MaterialHaulageTripsModule } from './components/trips/MaterialHaulageTripsModule';
import { DieselFuelManagementModule } from './components/diesel/DieselFuelManagementModule';
import { SiteCostExpensesModule } from './components/costing/SiteCostExpensesModule';
import { RoadYieldCalculatorModule } from './components/calculator/RoadYieldCalculatorModule';
import { MachineryFleetModule } from './components/machinery/MachineryFleetModule';
import StockTransactionsModule from './components/building/StockTransactionsModule';

import {
  Users, Package, ArrowLeftRight, FileText,
  Bell, ShoppingCart, Cpu, CalendarCheck, Tag, Archive,
  Plus, Edit2, Trash2, X
} from 'lucide-react';

// ==========================================
// Generic Scaffold View for Pending Tabs
// ==========================================
const GenericView: React.FC<{
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
      {title} telemetry and operations active.
    </div>
  </div>
);

// ==========================================
// Road Material Categories & Rates Module
// ==========================================
export interface RoadMaterialCategory {
  id: string;
  name: string;
  description: string;
  standardRate: number;
  unit: string;
}

const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';

const INITIAL_ROAD_CATEGORIES: RoadMaterialCategory[] = [
  { id: 'RCAT-01', name: 'Bituminous Macadam (BM)', description: 'Dense bituminous macadam binder course', standardRate: 5000, unit: 'Brass' },
  { id: 'RCAT-02', name: 'Wet Mix Macadam (WMM)', description: 'Crushed stone aggregate base/sub-base layer', standardRate: 4500, unit: 'Brass' },
  { id: 'RCAT-03', name: 'Granular Sub-Base (GSB)', description: 'Coarse graded granular material sub-base', standardRate: 4200, unit: 'Brass' },
  { id: 'RCAT-04', name: 'Dense Bituminous Macadam (DBM)', description: 'Structural layer in flexible pavements', standardRate: 5500, unit: 'Brass' },
  { id: 'RCAT-05', name: 'Bituminous Concrete (BC)', description: 'High quality wearing course finish', standardRate: 6000, unit: 'Brass' }
];

export const RoadMaterialCategoriesModule: React.FC = () => {
  const { currentUser, userRole } = useERP();
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [categories, setCategories] = useState<RoadMaterialCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ROAD_CATEGORIES;
    } catch {
      return INITIAL_ROAD_CATEGORIES;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [standardRate, setStandardRate] = useState<number | ''>(5000);
  const [unit, setUnit] = useState('Brass');

  useEffect(() => {
    localStorage.setItem(STORAGE_ROAD_CATS_KEY, JSON.stringify(categories));
  }, [categories]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setStandardRate(5000);
    setUnit('Brass');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: RoadMaterialCategory = {
      id: editingId || `RCAT-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      description: description.trim() || 'Road construction material specification',
      standardRate: Number(standardRate) || 0,
      unit
    };

    if (editingId) {
      setCategories(categories.map((c) => (c.id === editingId ? payload : c)));
    } else {
      setCategories([payload, ...categories]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this road material category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Road Material Categories & Rates</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage standard road aggregate and mix names, specifications, and benchmark rates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Material Category</span>
        </button>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">MATERIAL NAME</th>
                <th className="py-3.5 px-6">SPECIFICATION / DESCRIPTION</th>
                <th className="py-3.5 px-6 text-right">BENCHMARK RATE</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#121c33]/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-400">{cat.id}</td>
                  <td className="py-4 px-6 font-bold text-white text-xs whitespace-nowrap">{cat.name}</td>
                  <td className="py-4 px-6 text-slate-300 min-w-[200px]">{cat.description}</td>
                  <td className="py-4 px-6 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                    ₹{cat.standardRate.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ {cat.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setName(cat.name);
                          setDescription(cat.description);
                          setStandardRate(cat.standardRate);
                          setUnit(cat.unit);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Material Category' : 'Add Road Material Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bituminous Macadam (BM)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Specification</label>
                <textarea
                  rows={2}
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Standard Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={standardRate}
                    onChange={(e) => setStandardRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="Brass">Brass</option>
                    <option value="Ton">Ton</option>
                    <option value="Cu.M">Cu.M</option>
                    <option value="Load">Load</option>
                  </select>
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Category' : 'Save Category'}
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
// Main Application Router Content
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
      />

      <div className="flex flex-1 relative h-[calc(100vh-48px)] overflow-hidden">
        
        {/* Desktop Sidebar Container */}
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

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 p-6 overflow-y-auto max-h-[calc(100vh-48px)] scrollbar-thin scrollbar-thumb-[#1E293B] scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-12 w-full overflow-x-hidden">
            
            {/* Shared Route */}
            {activeTab === 'dashboard' && <SiteCentricMidnightDashboard onNavigateTab={setActiveTab} />}
            {(activeTab === 'road-sites' || activeTab === 'sites') && (
              <RoadSitesManagerModule projectType={projectType || 'ROAD'} onNavigateTab={setActiveTab} />
            )}

            {/* ROAD CONSTRUCTION ROUTES */}
            {projectType === 'ROAD' && (
              <>
                {activeTab === 'haulage-trips' && <MaterialHaulageTripsModule />}
                {activeTab === 'diesel' && <DieselFuelManagementModule />}
                {activeTab === 'site-expenses' && <SiteCostExpensesModule />}
                {(activeTab === 'yield_calculator' || activeTab === 'road-yield') && <RoadYieldCalculatorModule />}
                {(activeTab === 'machinery_fleet' || activeTab === 'machinery') && <MachineryFleetModule />}
                {activeTab === 'categories' && <RoadMaterialCategoriesModule />}

                {/* Road Config Fallbacks */}
                {activeTab === 'users' && (
                  <GenericView title="User Management" subtitle="Manage RBAC access." icon={Users} />
                )}
              </>
            )}

            {/* BUILDING CONSTRUCTION ROUTES */}
            {projectType === 'BUILDING' && (
              <>
                {activeTab === 'products' && (
                  <GenericView title="Products Catalog" subtitle="Building materials." icon={Package} />
                )}
                {activeTab === 'transactions' && <StockTransactionsModule />}
                {activeTab === 'reports' && (
                  <GenericView title="Reports & Analytics" subtitle="Material consumption." icon={FileText} />
                )}
                {activeTab === 'alerts' && (
                  <GenericView title="Low Stock Alerts" subtitle="Reorder buffers." icon={Bell} />
                )}
                {activeTab === 'reorder-suggestions' && (
                  <GenericView title="Reorder Suggestions" subtitle="Procurement indents." icon={ShoppingCart} />
                )}
                {activeTab === 'equipment-register' && <MachineryFleetModule />}
                {activeTab === 'attendance-salary' && (
                  <GenericView title="Attendance & Payroll" subtitle="Salary payouts." icon={CalendarCheck} />
                )}
                {activeTab === 'categories' && (
                  <GenericView title="Material Categories" subtitle="Item classifications." icon={Tag} />
                )}
                {activeTab === 'users' && (
                  <GenericView title="User Management" subtitle="Manage RBAC access." icon={Users} />
                )}
                {activeTab === 'yearly-archive' && (
                  <GenericView title="Yearly Archive" subtitle="Historical audits." icon={Archive} />
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
