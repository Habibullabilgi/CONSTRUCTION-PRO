import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Layers,
  DollarSign,
  Truck,
  Fuel,
  Calculator,
  Plus,
  ArrowRight,
  HardHat,
  ChevronRight,
  MapPin,
  Activity
} from 'lucide-react';

interface Props {
  onNavigateTab: (tabId: string) => void;
}

export const SiteCentricMidnightDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const { siteSheets = [], selectedSiteId } = useERP();

  // 1. Identify the currently active site
  const activeSite = siteSheets.find((s: any) => s.siteId === selectedSiteId) || {
    siteId: 'default-001',
    siteName: 'SINDAGI - ALMEL ROAD'
  };

  // 2. Load Live Data from LocalStorage
  const [trips, setTrips] = useState<any[]>([]);
  const [diesel, setDiesel] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedTrips = localStorage.getItem('CONSTRUCTION_PRO_HAULAGE_TRIPS_V2');
      if (savedTrips) setTrips(JSON.parse(savedTrips));

      const savedDiesel = localStorage.getItem('CONSTRUCTION_PRO_DIESEL_LOGS_V1');
      if (savedDiesel) setDiesel(JSON.parse(savedDiesel));

      // Assuming a generic key for expenses, update if yours differs
      const savedExpenses = localStorage.getItem('CONSTRUCTION_PRO_SITE_EXPENSES_V1');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    } catch (e) {
      console.error('Error loading dashboard data', e);
    }
  }, []);

  // 3. Compute Live Metrics for the Active Site
  const today = new Date().toISOString().substring(0, 10);

  const siteTrips = useMemo(() => trips.filter((t) => t.siteName === activeSite.siteName), [trips, activeSite.siteName]);
  const todayTrips = useMemo(() => siteTrips.filter((t) => t.tripDate === today), [siteTrips, today]);

  const siteDiesel = useMemo(() => diesel.filter((d) => d.siteName === activeSite.siteName), [diesel, activeSite.siteName]);
  const siteExpenses = useMemo(() => expenses.filter((e) => e.siteName === activeSite.siteName), [expenses, activeSite.siteName]);

  // KPIs
  const totalBrassToday = todayTrips.reduce((sum, t) => sum + (Number(t.dayTrips) * Number(t.brassPerTrip)), 0);
  const activeTripsCount = todayTrips.reduce((sum, t) => sum + Number(t.dayTrips), 0);
  const totalDieselDispensed = siteDiesel.reduce((sum, d) => sum + Number(d.litres), 0);
  const totalSiteExpense = siteExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6 font-sans text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Command Banner */}
      <div className="p-6 md:p-8 rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-blue-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Site Operations Command</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500 font-mono lowercase tracking-normal">{activeSite.siteId}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
              {activeSite.siteName}
            </h1>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Live site metrics, equipment telematics, material haulage, and petty cash ledger.
            </p>
          </div>

          {/* Action Buttons (Wired to Navigation) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigateTab('road-sites')}
              className="px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Add Site Section</span>
            </button>
            <button 
              onClick={() => onNavigateTab('yield_calculator')}
              className="px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yield Calc</span>
            </button>
            <button 
              onClick={() => onNavigateTab('diesel')}
              className="px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Log Diesel</span>
            </button>
            <button 
              onClick={() => onNavigateTab('haulage-trips')}
              className="px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Log Trip</span>
            </button>
            <button 
              onClick={() => onNavigateTab('site-expenses')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards (Wired to Navigation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Material Laid */}
        <div 
          onClick={() => onNavigateTab('haulage-trips')}
          className="p-5 rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-[11px] font-bold text-slate-400 tracking-wider">TOTAL MATERIAL LAID<br/>(TODAY)</div>
              <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center border border-blue-800/50">
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono tracking-tight">{totalBrassToday}</span>
              <span className="text-sm font-medium text-slate-500">Brass</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#1E293B] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {totalBrassToday > 0 ? `${todayTrips.length} material batches logged` : 'No material logged yet'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
              <span>View haulage logs</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: Site Expense */}
        <div 
          onClick={() => onNavigateTab('site-expenses')}
          className="p-5 rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-[11px] font-bold text-slate-400 tracking-wider">TOTAL SITE EXPENSE</div>
              <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center border border-emerald-800/50">
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
                ₹{totalSiteExpense.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#1E293B] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              {totalSiteExpense > 0 ? `${siteExpenses.length} expense vouchers` : 'No expenses recorded'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
              <span>Open expenses ledger</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: Active Trips */}
        <div 
          onClick={() => onNavigateTab('haulage-trips')}
          className="p-5 rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-[11px] font-bold text-slate-400 tracking-wider">ACTIVE TRIPS TODAY</div>
              <div className="w-8 h-8 rounded-lg bg-cyan-900/30 flex items-center justify-center border border-cyan-800/50">
                <Truck className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono tracking-tight">{activeTripsCount}</span>
              <span className="text-sm font-medium text-slate-500">Trips</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#1E293B] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-400">
              {activeTripsCount > 0 ? `${todayTrips.length} vehicles active` : '0 tippers active'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
              <span>Check trip records</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 4: Diesel Dispensed */}
        <div 
          onClick={() => onNavigateTab('diesel')}
          className="p-5 rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-[11px] font-bold text-slate-400 tracking-wider">DIESEL DISPENSED</div>
              <div className="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center border border-amber-800/50">
                <Fuel className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">{totalDieselDispensed}</span>
              <span className="text-sm font-medium text-slate-500">Litres</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#1E293B] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              {siteDiesel.length} Field fuel voucher logs
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
              <span>Manage diesel log</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Shortcuts & Fleet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Fleet Deployment Panel */}
        <div className="lg:col-span-2 p-6 rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Machine & Operator Deployment</h2>
            </div>
            <button 
              onClick={() => onNavigateTab('machinery_fleet')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>View Full Fleet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            <div className="p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-500 mb-1">Active Excavators</div>
              <div className="text-2xl font-black text-white mb-2">0 <span className="text-sm font-medium text-slate-500">Units</span></div>
              <div className="text-[10px] text-slate-600">No active machinery</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-500 mb-1">Backhoe Loaders</div>
              <div className="text-2xl font-black text-white mb-2">0 <span className="text-sm font-medium text-slate-500">Units</span></div>
              <div className="text-[10px] text-slate-600">No active machinery</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-500 mb-1">Tipper Dumpers</div>
              <div className="text-2xl font-black text-white mb-2">0 <span className="text-sm font-medium text-slate-500">Units</span></div>
              <div className="text-[10px] text-slate-600">No active tippers</div>
            </div>
          </div>
        </div>

        {/* Engineering Shortcuts Panel */}
        <div className="p-6 rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Engineering Shortcuts</h2>
            </div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MoRTH 5th Rev</span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <button 
              onClick={() => onNavigateTab('yield_calculator')}
              className="w-full p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] hover:border-cyan-500/50 hover:bg-[#121c33]/50 transition-all text-left group flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">Road Layer Yield & Thickness Calc</div>
                <div className="text-[10px] text-slate-500">Calculate GSB, WMM, DBM, BC tonnage & brass yield</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
            </button>

            <button 
              onClick={() => onNavigateTab('reports')}
              className="w-full p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] hover:border-blue-500/50 hover:bg-[#121c33]/50 transition-all text-left group flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Daily Progress Report (DPR)</div>
                <div className="text-[10px] text-slate-500">Auto-generate aggregate consumption summary</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
