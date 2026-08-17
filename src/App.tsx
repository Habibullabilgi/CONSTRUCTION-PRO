Here is the setup to support the dedicated **Building Construction ERP** menu structure alongside the **Road Construction ERP** mode.

---

### 1. Update `src/components/Sidebar.tsx`

This updates the sidebar to dynamically render the building construction workflow when in `BUILDING` mode:

* **Core:** Dashboard, Products, Transactions, Scan Barcode
* **Analysis:** Reports, Alerts (with badge count), Reorder Suggestions, Equipment Register, Attendance & Salary
* **Configuration:** Categories, Locations, User Management, Yearly Archive

```tsx
import React from 'react';
import { useERP } from '../context/ERPContext';
import {
  LayoutDashboard,
  Truck,
  Fuel,
  DollarSign,
  Calculator,
  HardHat,
  LogOut,
  Milestone,
  Users,
  Package,
  ArrowLeftRight,
  ScanLine,
  FileText,
  Bell,
  ShoppingCart,
  Cpu,
  CalendarCheck,
  Tag,
  MapPin,
  Archive,
  Building2
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectType?: 'ROAD' | 'BUILDING';
  onSwitchDomain?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeStyle?: string;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  projectType = 'ROAD',
  onSwitchDomain
}) => {
  const { currentUser, logout } = useERP();
  const isBuilding = projectType === 'BUILDING';

  // ==========================================
  // ROAD CONSTRUCTION NAVIGATION ITEMS
  // ==========================================
  const roadOperationsItems: NavItem[] = [
    { id: 'dashboard', label: 'Site Overview', icon: LayoutDashboard },
    {
      id: 'road-sites',
      label: 'Ongoing Site',
      icon: Milestone,
      badge: 'Sites',
      badgeStyle: 'bg-blue-900/40 text-blue-300 border border-blue-500/40'
    },
    {
      id: 'haulage-trips',
      label: 'Trips',
      icon: Truck,
      badge: 'Trips',
      badgeStyle: 'bg-[#064E3B] text-[#34D399] border border-[#065F46]'
    },
    {
      id: 'diesel',
      label: 'Diesel',
      icon: Fuel,
      badge: 'Diesel',
      badgeStyle: 'bg-amber-950/60 text-amber-300 border border-amber-800'
    },
    {
      id: 'site-expenses',
      label: 'Site Expense',
      icon: DollarSign,
      badge: 'Petty Cash',
      badgeStyle: 'bg-[#162032] text-blue-400 border border-[#1E293B]'
    }
  ];

  const roadEngineeringItems: NavItem[] = [
    {
      id: 'yield_calculator',
      label: 'Road Trip Calculator',
      icon: Calculator,
      badge: 'MoRTH',
      badgeStyle: 'bg-blue-900/60 text-blue-300 border border-blue-500/40 font-mono'
    },
    {
      id: 'machinery_fleet',
      label: 'Machinery',
      icon: HardHat
    }
  ];

  const roadAdminItems: NavItem[] = [
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      badge: 'RBAC',
      badgeStyle: 'bg-indigo-900/40 text-indigo-300 border border-indigo-500/40'
    }
  ];

  // ==========================================
  // BUILDING CONSTRUCTION NAVIGATION ITEMS
  // ==========================================
  const buildingCoreItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'scan-barcode', label: 'Scan Barcode', icon: ScanLine }
  ];

  const buildingAnalysisItems: NavItem[] = [
    { id: 'reports', label: 'Reports', icon: FileText },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: 3,
      badgeStyle: 'bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black'
    },
    { id: 'reorder-suggestions', label: 'Reorder Suggestions', icon: ShoppingCart },
    { id: 'equipment-register', label: 'Equipment Register', icon: Cpu },
    { id: 'attendance-salary', label: 'Attendance & Salary', icon: CalendarCheck }
  ];

  const buildingConfigItems: NavItem[] = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'yearly-archive', label: 'Yearly Archive', icon: Archive }
  ];

  const renderNavGroup = (title: string | null, items: NavItem[]) => (
    <div className="space-y-1">
      {title && (
        <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mb-1">
          {title}
        </div>
      )}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30'
                  : 'text-[#94A3B8] hover:bg-[#162032] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={
                    item.badgeStyle ||
                    `text-[9px] px-1.5 py-0.5 rounded font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-900/40 text-blue-300 border border-blue-500/40'
                    }`
                  }
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="w-64 bg-[#0D111D] border-r border-[#1E293B] flex flex-col justify-between shrink-0 h-[calc(100vh-48px)] sticky top-12 overflow-y-auto select-none font-sans z-30 scrollbar-thin scrollbar-thumb-[#1E293B]">
      <div className="p-3.5 space-y-5">
        {/* Brand Card */}
        <div className="p-3 bg-[#121927] border border-[#1E293B] rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-md ${
                isBuilding
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/30'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-600/30'
              }`}
            >
              {isBuilding ? <Building2 className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-white uppercase tracking-wider truncate">
                CONSTRUCTION PRO
              </div>
              <div className="text-[10px] text-blue-400 font-mono truncate">
                {isBuilding ? 'Building Construction ERP' : 'Road Construction ERP'}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Nav Groups */}
        {isBuilding ? (
          <>
            {renderNavGroup(null, buildingCoreItems)}
            {renderNavGroup('ANALYSIS', buildingAnalysisItems)}
            {renderNavGroup('CONFIGURATION', buildingConfigItems)}
          </>
        ) : (
          <>
            {renderNavGroup('SITE OPERATIONS', roadOperationsItems)}
            {renderNavGroup('ENGINEERING', roadEngineeringItems)}
            {renderNavGroup('ADMINISTRATION', roadAdminItems)}
          </>
        )}
      </div>

      {/* User Profile Card at Bottom */}
      <div className="p-3 border-t border-[#1E293B] bg-[#080C14] space-y-2">
        {onSwitchDomain && (
          <button
            onClick={onSwitchDomain}
            className="w-full py-1.5 px-2 bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Switch to {isBuilding ? 'Roads' : 'Buildings'}</span>
          </button>
        )}

        <div className="p-2 rounded-xl bg-[#121927] border border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Habibulla Bilgi'}
              </div>
              <div className="text-[10px] text-[#94A3B8] truncate">
                Site Engineer & Admin
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#162032] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

```

---

### 2. Update `src/App.tsx`

This connects the building module views with the sidebar router:

```tsx
import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectTypeSelectionPage } from './components/auth/ProjectTypeSelectionPage';
import { SiteSelectionPage } from './components/auth/SiteSelectionPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Road Construction Components
import { SiteCentricMidnightDashboard } from './components/dashboard/SiteCentricMidnightDashboard';
import { MaterialHaulageTripsModule } from './components/trips/MaterialHaulageTripsModule';
import { DieselFuelManagementModule } from './components/diesel/DieselFuelManagementModule';
import { SiteCostExpensesModule } from './components/costing/SiteCostExpensesModule';
import { RoadSitesManagerModule } from './components/sites/RoadSitesManagerModule';
import { RoadYieldCalculatorModule } from './components/calculator/RoadYieldCalculatorModule';
import { MachineryFleetModule } from './components/machinery/MachineryFleetModule';

// Shared User Management
import { UserManagementModule } from './components/admin/UserManagementModule';

// Generic Building Placeholder View for remaining tabs
const GenericBuildingView: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-2xl space-y-3 font-sans">
    <h1 className="text-2xl font-black text-white">{title}</h1>
    <p className="text-xs text-slate-400">{subtitle}</p>
    <div className="p-8 rounded-2xl bg-[#080d19] border border-[#182643] text-center text-slate-500 text-xs">
      {title} module ready for operations.
    </div>
  </div>
);

export const AppContent: React.FC = () => {
  const { isAuthenticated, selectedSiteId, setSelectedSiteId, siteSheets } = useERP();

  // Domain state: 'ROAD' | 'BUILDING' | null
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

  // Step 1: Login Check
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Step 2: Domain Choice Check
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
              const nextDomain = projectType === 'ROAD' ? 'BUILDING' : 'ROAD';
              setProjectType(nextDomain);
              sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', nextDomain);
            }}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-48px)] scrollbar-thin scrollbar-thumb-[#1E293B] scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-12">
            {/* Common Tabs */}
            {activeTab === 'dashboard' && <SiteCentricMidnightDashboard onNavigateTab={setActiveTab} />}
            {activeTab === 'users' && <UserManagementModule />}

            {/* Road Construction Specific Tabs */}
            {projectType === 'ROAD' && (
              <>
                {(activeTab === 'road-sites' || activeTab === 'sites') && <RoadSitesManagerModule onNavigateTab={setActiveTab} />}
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
                {activeTab === 'products' && <GenericBuildingView title="Building Materials & Inventory" subtitle="Track cement, TMT steel rebars, sand, aggregates, and hardware." />}
                {activeTab === 'transactions' && <GenericBuildingView title="Stock In / Out Transactions" subtitle="Material procurement, inward delivery GRN, and contractor issue logs." />}
                {activeTab === 'scan-barcode' && <GenericBuildingView title="Barcode & QR Scanner" subtitle="Scan incoming materials and equipment tool tags." />}
                {activeTab === 'reports' && <GenericBuildingView title="Analytics & Material Consumption Reports" subtitle="Concrete mix consumption, floor-wise burn rates, and wastage tracking." />}
                {activeTab === 'alerts' && <GenericBuildingView title="Low Stock & Critical Alerts" subtitle="Safety stock warnings and reorder threshold breaches." />}
                {activeTab === 'reorder-suggestions' && <GenericBuildingView title="Automated Reorder Suggestions" subtitle="Procurement proposals for TMT steel, ready-mix concrete, and blocks." />}
                {activeTab === 'equipment-register' && <MachineryFleetModule />}
                {activeTab === 'attendance-salary' && <GenericBuildingView title="Labour Attendance & Contractor Wages" subtitle="Site muster roll, mason/helper daily batta, and contractor billing." />}
                {activeTab === 'categories' && <GenericBuildingView title="Product & Material Categories" subtitle="Configure structural, plumbing, electrical, and finishing categories." />}
                {activeTab === 'locations' && <GenericBuildingView title="Site Storage Locations & Towers" subtitle="Manage central store, tower floor stores, and batching plant yards." />}
                {activeTab === 'yearly-archive' && <GenericBuildingView title="Financial Year Archive" subtitle="Audit logs and fiscal year-end material balance sheets." />}
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

```
