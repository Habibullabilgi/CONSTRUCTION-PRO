import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SiteCentricMidnightDashboard } from './components/dashboard/SiteCentricMidnightDashboard';
import { MaterialHaulageTripsModule } from './components/trips/MaterialHaulageTripsModule';
import { DieselFuelManagementModule } from './components/diesel/DieselFuelManagementModule';
import { SiteCostExpensesModule } from './components/costing/SiteCostExpensesModule';
import { RoadSitesManagerModule } from './components/sites/RoadSitesManagerModule';
import { MachineFleetManagementModule } from './components/fleet/MachineFleetManagementModule';
import { RoadYieldCalculatorModule } from './components/calculator/RoadYieldCalculatorModule';
import { RoadAnalyticsDPRModule } from './components/analytics/RoadAnalyticsDPRModule';
import { TechnicalArchitectureModal } from './components/architecture/TechnicalArchitectureModal';

export const AppContent: React.FC = () => {
  const { isAuthenticated } = useERP();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);

  // If not authenticated, render the LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Main ERP Layout: Sidebar + Viewport */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Midnight Sidebar */}
        {isSidebarOpen && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
          />
        )}

        {/* Central Dashboard Viewport */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-48px)] scrollbar-thin scrollbar-thumb-[#1E293B]">
          <div className="max-w-7xl mx-auto">
            {/* 1. Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <SiteCentricMidnightDashboard onNavigateTab={setActiveTab} />
            )}

            {/* 2. Dedicated Section: Road Sites & Stretches */}
            {activeTab === 'road-sites' && (
              <RoadSitesManagerModule onNavigateTab={setActiveTab} />
            )}

            {/* 3. Dedicated Section: Material Trips & Weighbridge */}
            {activeTab === 'haulage-trips' && (
              <MaterialHaulageTripsModule />
            )}

            {/* 4. Dedicated Section: Diesel & Fuel Management */}
            {activeTab === 'diesel' && (
              <DieselFuelManagementModule />
            )}

            {/* 5. Dedicated Section: Site Cost & Expenses */}
            {activeTab === 'site-expenses' && (
              <SiteCostExpensesModule />
            )}

            {/* 6. Engineering: Road Yield Calculator */}
            {activeTab === 'road-yield' && (
              <RoadYieldCalculatorModule />
            )}

            {/* 7. Fleet: Machinery & Equipment */}
            {activeTab === 'machinery' && (
              <MachineFleetManagementModule />
            )}

            {/* 8. Reporting: Daily Progress Report */}
            {activeTab === 'reports' && (
              <RoadAnalyticsDPRModule />
            )}
          </div>
        </main>
      </div>

      {/* Interactive System Architecture & ERD Specification Modal */}
      <TechnicalArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
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
