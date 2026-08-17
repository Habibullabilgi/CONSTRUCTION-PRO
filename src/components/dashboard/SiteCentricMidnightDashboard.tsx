import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Milestone,
  Calculator,
  Fuel,
  Truck,
  DollarSign,
  Plus,
  ArrowRight,
  Layers,
  HardHat,
  ChevronRight
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const SiteCentricMidnightDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    siteSheets = [],
    selectedSiteId
  } = useERP();

  // Active Site Data
  const currentSite = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0] || {
    siteId: 'site-default',
    siteName: 'SINDAGI - ALMEL ROAD'
  };

  // 1. Live Trips & Material Calculation (Defaults to 0 if no entries exist)
  const [totalMaterialBrass, setTotalMaterialBrass] = useState<number>(0);
  const [totalTripsCount, setTotalTripsCount] = useState<number>(0);

  // 2. Live Diesel Fuel Calculation (Defaults to 0)
  const [totalDieselLitres, setTotalDieselLitres] = useState<number>(0);

  // 3. Live Site Expenses Calculation (Defaults to 0)
  const [totalExpensesAmount, setTotalExpensesAmount] = useState<number>(0);

  useEffect(() => {
    try {
      const siteQuery = (currentSite.siteName || '').trim().toLowerCase();

      // Read Trips data for THIS specific site only
      const savedTrips =
        localStorage.getItem('CONSTRUCTION_PRO_DAY_TRIPS_V3') ||
        localStorage.getItem('CONSTRUCTION_PRO_DAY_TRIPS_V2');
      if (savedTrips) {
        const parsed = JSON.parse(savedTrips);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const matchingTrips = parsed.filter(
            (t: any) =>
              t.siteName &&
              (t.siteName.toLowerCase().includes(siteQuery) ||
                siteQuery.includes(t.siteName.toLowerCase()))
          );
          const brassSum = matchingTrips.reduce(
            (sum: number, t: any) => sum + (Number(t.totalBrass) || 0),
            0
          );
          const tripsSum = matchingTrips.reduce(
            (sum: number, t: any) => sum + (Number(t.totalTrips) || 0),
            0
          );
          setTotalMaterialBrass(brassSum);
          setTotalTripsCount(tripsSum);
        } else {
          setTotalMaterialBrass(0);
          setTotalTripsCount(0);
        }
      } else {
        setTotalMaterialBrass(0);
        setTotalTripsCount(0);
      }

      // Read Diesel data for THIS specific site only
      const savedDiesel = localStorage.getItem('CONSTRUCTION_PRO_DIESEL_VOUCHERS_V1');
      if (savedDiesel) {
        const parsed = JSON.parse(savedDiesel);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const matchingDiesel = parsed.filter(
            (d: any) =>
              d.siteName &&
              (d.siteName.toLowerCase().includes(siteQuery) ||
                siteQuery.includes(d.siteName.toLowerCase()))
          );
          const dslSum = matchingDiesel.reduce(
            (sum: number, d: any) => sum + (Number(d.litresDispensed) || 0),
            0
          );
          setTotalDieselLitres(dslSum);
        } else {
          setTotalDieselLitres(0);
        }
      } else {
        setTotalDieselLitres(0);
      }

      // Read Expenses data for THIS specific site only
      const savedExpenses =
        localStorage.getItem('CONSTRUCTION_PRO_SITE_EXPENSES_V2') ||
        localStorage.getItem('CONSTRUCTION_PRO_ERP_STORAGE_V7_SITE_EXPENSES');
      if (savedExpenses) {
        const parsed = JSON.parse(savedExpenses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const matchingExpenses = parsed.filter(
            (e: any) =>
              (e.siteId && e.siteId === currentSite.siteId) ||
              (e.siteName &&
                (e.siteName.toLowerCase().includes(siteQuery) ||
                  siteQuery.includes(e.siteName.toLowerCase())))
          );
          const expSum = matchingExpenses.reduce(
            (sum: number, e: any) => sum + (Number(e.amount) || 0),
            0
          );
          setTotalExpensesAmount(expSum);
        } else {
          setTotalExpensesAmount(0);
        }
      } else {
        setTotalExpensesAmount(0);
      }
    } catch (e) {
      console.error(e);
      setTotalMaterialBrass(0);
      setTotalTripsCount(0);
      setTotalDieselLitres(0);
      setTotalExpensesAmount(0);
    }
  }, [currentSite.siteId, currentSite.siteName, selectedSiteId]);

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. TOP COMMAND BANNER */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-blue-400 tracking-wider uppercase font-mono">
              SITE OPERATIONS COMMAND
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {currentSite.siteId || 'ACTIVE-CORRIDOR'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5 leading-snug">
            {currentSite.siteName}
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Live site metrics, equipment telematics, material haulage, and petty cash ledger.
          </p>
        </div>

        {/* Action Button Links */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={() => onNavigateTab('road-sites')}
            className="px-3.5 py-2.5 rounded-2xl bg-[#142038] hover:bg-[#1f2f52] border border-[#22365e] text-blue-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Milestone className="w-4 h-4 text-blue-400" />
            <span>+ Add Site Section</span>
          </button>

          <button
            onClick={() => onNavigateTab('yield_calculator')}
            className="px-3.5 py-2.5 rounded-2xl bg-[#142038] hover:bg-[#1f2f52] border border-[#22365e] text-blue-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Yield Calc</span>
          </button>

          <button
            onClick={() => onNavigateTab('diesel')}
            className="px-3.5 py-2.5 rounded-2xl bg-[#142038] hover:bg-[#1f2f52] border border-[#22365e] text-amber-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Fuel className="w-4 h-4 text-amber-400" />
            <span>+ Log Diesel</span>
          </button>

          <button
            onClick={() => onNavigateTab('haulage-trips')}
            className="px-3.5 py-2.5 rounded-2xl bg-[#142038] hover:bg-[#1f2f52] border border-[#22365e] text-emerald-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>+ Log Trip</span>
          </button>

          <button
            onClick={() => onNavigateTab('site-expenses')}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Expense</span>
          </button>
        </div>
      </div>

      {/* 2. TOP 4 LIVE TELEMETRY CARDS (Shows 0 if no entries exist) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Material Laid */}
        <div
          onClick={() => onNavigateTab('haulage-trips')}
          className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>TOTAL MATERIAL LAID (TODAY)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-white font-mono">
              {totalMaterialBrass > 0 ? totalMaterialBrass.toFixed(1) : '0'}{' '}
              <span className="text-sm font-normal text-slate-400">Brass</span>
            </div>
            <div className="text-xs text-blue-400 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>
                {totalMaterialBrass > 0
                  ? 'Murum, GSB & WMM deliveries'
                  : 'No material logged yet'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
            <span>View haulage logs</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Site Direct Expense */}
        <div
          onClick={() => onNavigateTab('site-expenses')}
          className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>TOTAL SITE EXPENSE</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-emerald-400 font-mono">
              ₹
              {totalExpensesAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              {totalExpensesAmount > 0
                ? 'Petty cash, machine maintenance & repairs'
                : 'No expenses recorded'}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
            <span>Open expenses ledger</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Active Trips */}
        <div
          onClick={() => onNavigateTab('haulage-trips')}
          className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] hover:border-cyan-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>ACTIVE TRIPS TODAY</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-white font-mono">
              {totalTripsCount}{' '}
              <span className="text-sm font-normal text-slate-400">Trips</span>
            </div>
            <div className="text-xs text-cyan-400 font-medium mt-1">
              {totalTripsCount > 0
                ? 'Active multi-axle tipper cycle'
                : '0 tippers active'}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
            <span>Check trip records</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Diesel Dispensed */}
        <div
          onClick={() => onNavigateTab('diesel')}
          className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] hover:border-amber-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>DIESEL DISPENSED</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-amber-400 font-mono">
              {totalDieselLitres.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-normal text-slate-400">Litres</span>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              {totalDieselLitres > 0
                ? 'Field fuel voucher logs'
                : 'No fuel dispensed today'}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 group-hover:text-amber-400 transition-colors flex items-center gap-1">
            <span>Manage diesel log</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 3. MIDDLE ROW: MACHINERY FLEET & ENGINEERING SHORTCUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0c1427] border border-[#182643] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#182643]">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>Machine & Operator Deployment</span>
            </div>
            <button
              onClick={() => onNavigateTab('machinery_fleet')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Full Fleet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => onNavigateTab('machinery_fleet')}
              className="p-3.5 rounded-2xl bg-[#080d19] border border-[#182643] hover:border-slate-600 transition-all cursor-pointer"
            >
              <div className="text-[11px] text-slate-400 font-semibold">
                Active Excavators
              </div>
              <div className="text-xl font-extrabold text-white mt-1">0 Units</div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">
                No active machinery
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('machinery_fleet')}
              className="p-3.5 rounded-2xl bg-[#080d19] border border-[#182643] hover:border-slate-600 transition-all cursor-pointer"
            >
              <div className="text-[11px] text-slate-400 font-semibold">
                Backhoe Loaders
              </div>
              <div className="text-xl font-extrabold text-white mt-1">0 Units</div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">
                No active machinery
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('machinery_fleet')}
              className="p-3.5 rounded-2xl bg-[#080d19] border border-[#182643] hover:border-slate-600 transition-all cursor-pointer"
            >
              <div className="text-[11px] text-slate-400 font-semibold">
                Tipper Dumpers
              </div>
              <div className="text-xl font-extrabold text-white mt-1">0 Units</div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">
                No active tippers
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#0c1427] border border-[#182643] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#182643]">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Engineering Shortcuts</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">MoRTH 5th Rev</span>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('yield_calculator')}
              className="w-full p-3 bg-[#080d19] hover:bg-[#121c33] border border-[#182643] hover:border-blue-500/40 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-300">
                  Road Layer Yield & Thickness Calc
                </div>
                <div className="text-[11px] text-slate-400">
                  Calculate GSB, WMM, DBM, BC tonnage & brass yield
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => onNavigateTab('dpr')}
              className="w-full p-3 bg-[#080d19] hover:bg-[#121c33] border border-[#182643] hover:border-blue-500/40 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-300">
                  Daily Progress Report (DPR)
                </div>
                <div className="text-[11px] text-slate-400">
                  Generate daily physical & financial site telemetry
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteCentricMidnightDashboard;
