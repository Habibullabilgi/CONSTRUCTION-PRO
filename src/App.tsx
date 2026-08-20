import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectTypeSelectionPage } from './components/auth/ProjectTypeSelectionPage';
import { SiteSelectionPage } from './components/auth/SiteSelectionPage';
import { Header } from './components/Header';
import { Sidebar, RoadMaterialCategoriesModule } from './App'; // Or from your sidebar file path

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
  Bell, ShoppingCart, Cpu, CalendarCheck, Tag, Archive
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
// Main Application Router Content
// ==========================================
export const AppContent: React.FC = () => {
  const { isAuthenticated, selectedSiteId, setSelectedSiteId, siteSheets } = useERP();

  // Auto-seed default master sample datasets on first load for any device
  useEffect(() => {
    try {
      if (!localStorage.getItem('CONSTRUCTION_PRO_HAULAGE_TRIPS_V2')) {
        localStorage.setItem('CONSTRUCTION_PRO_HAULAGE_TRIPS_V2', JSON.stringify([
          {
            id: 'TRIP-101',
            tripDate: '2026-08-19',
            siteName: 'Ongoing Highway Site (Active Stretch)',
            vehicleNumber: '8797',
            materialName: 'Bituminous Macadam (BM) (₹5000/Brass)',
            dayTrips: 10,
            brassPerTrip: 6,
            ratePerBrass: 5000,
            totalAmount: 300000
          }
        ]));
      }

      if (!localStorage.getItem('CONSTRUCTION_PRO_DIESEL_LOGS_V1')) {
        localStorage.setItem('CONSTRUCTION_PRO_DIESEL_LOGS_V1', JSON.stringify([
          {
            id: 'DSL-101',
            date: '2026-08-19',
            siteName: 'Ongoing Highway Site (Active Stretch)',
            vehicleNumber: '8797',
            driverName: 'Santosh Kamble',
            slipNumber: 'V-001',
            litres: 100,
            ratePerLitre: 92.5,
            totalCost: 9250.00
          }
        ]));
      }

      if (!localStorage.getItem('CONSTRUCTION_PRO_SITE_EXPENSES_V1')) {
        localStorage.setItem('CONSTRUCTION_PRO_SITE_EXPENSES_V1', JSON.stringify([
          {
            id: 'EXP-101',
            date: '2026-08-19',
            siteName: 'Ongoing Highway Site (Active Stretch)',
            title: 'Weekly Labor Payout',
            vendor: 'Local Contractor',
            category: 'Labor/Wages',
            amount: 45000,
            status: 'Paid'
          }
        ]));
      }
    } catch (e) {
      console.error('Failed to auto-seed initial data', e);
    }
  }, []);

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

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
        onToggleSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="flex flex-1 relative h-[calc(100vh-48px)] overflow-hidden">
        
        {/* Desktop Sidebar Container (Hidden on Mobile) */}
        <div className="hidden lg:block h-full shrink-0">
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
        </div>

        {/* Mobile Slide-over Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
              onClick={() => setMobileSidebarOpen(false)}
            />
            
            {/* Sidebar drawer container */}
            <div className="relative flex-1 max-w-xs w-full bg-[#0D111D] h-full flex flex-col z-50 animate-in slide-in-from-left duration-200 shadow-2xl">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                projectType={projectType}
                onSwitchDomain={() => {
                  const next = projectType === 'ROAD' ? 'BUILDING' : 'ROAD';
                  setProjectType(next);
                  sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', next);
                }}
                onClose={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-48px)] scrollbar-thin scrollbar-thumb-[#1E293B] scrollbar-track-transparent">
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
