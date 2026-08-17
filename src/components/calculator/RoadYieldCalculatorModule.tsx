import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Calculator,
  Truck,
  Layers,
  Building2,
  Plus,
  Trash2,
  Ruler
} from 'lucide-react';

interface SavedYieldCalculation {
  id: string;
  siteName: string;
  materialName: string;
  lengthMeters: number;
  widthMeters: number;
  thicknessMm: number;
  volumeCubicMeters: number;
  totalBrass: number;
  tipperCapacityBrass: number;
  tripsRequired: number;
  date: string;
}

const MATERIAL_PRESETS = [
  { name: 'Wet Mix Macadam (WMM Base)', brassConversionFactor: 0.35315 },
  { name: 'Granular Sub-Base (GSB)', brassConversionFactor: 0.35315 },
  { name: 'Murum Subgrade Fill', brassConversionFactor: 0.35315 },
  { name: 'M-Sand / Crushed Sand', brassConversionFactor: 0.35315 },
  { name: '20mm Aggregate Metal', brassConversionFactor: 0.35315 },
  { name: '40mm Ballast Base', brassConversionFactor: 0.35315 }
];

const STORAGE_CALCULATIONS_KEY = 'CONSTRUCTION_PRO_ROAD_YIELD_CALCS_V1';

export const RoadYieldCalculatorModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId, currentUser, userRole } = useERP();

  const currentRoleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = currentRoleStr.includes('admin');

  const siteList = Array.isArray(siteSheets) && siteSheets.length > 0
    ? siteSheets.map((s) => s.siteName)
    : ['SINDAGI - ALMEL ROAD', 'Mulwad Ongoing Stretch', 'NH-50 Flexible Pavement Section'];

  const defaultSiteName = Array.isArray(siteSheets)
    ? siteSheets.find((s) => s.siteId === selectedSiteId)?.siteName || siteList[0]
    : siteList[0];

  // Default input states to empty so outputs display 0 until entered
  const [siteName, setSiteName] = useState<string>(defaultSiteName);
  const [materialName, setMaterialName] = useState<string>(MATERIAL_PRESETS[0].name);
  const [lengthMeters, setLengthMeters] = useState<number | ''>('');
  const [widthMeters, setWidthMeters] = useState<number | ''>('');
  const [thicknessMm, setThicknessMm] = useState<number | ''>('');
  const [tipperCapacityBrass, setTipperCapacityBrass] = useState<number | ''>('');

  useEffect(() => {
    if (defaultSiteName) {
      setSiteName(defaultSiteName);
    }
  }, [defaultSiteName]);

  // Saved calculations state
  const [savedRecords, setSavedRecords] = useState<SavedYieldCalculation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CALCULATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback on corrupt JSON
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_CALCULATIONS_KEY, JSON.stringify(savedRecords));
  }, [savedRecords]);

  // Real-time calculation: evaluates to 0 if inputs are missing or <= 0
  const L = typeof lengthMeters === 'number' && lengthMeters > 0 ? lengthMeters : 0;
  const W = typeof widthMeters === 'number' && widthMeters > 0 ? widthMeters : 0;
  const T_meters = typeof thicknessMm === 'number' && thicknessMm > 0 ? thicknessMm / 1000 : 0;
  const cap = typeof tipperCapacityBrass === 'number' && tipperCapacityBrass > 0 ? tipperCapacityBrass : 0;

  const volumeCubicMeters = L > 0 && W > 0 && T_meters > 0 ? L * W * T_meters : 0;
  const totalBrass = volumeCubicMeters > 0 ? volumeCubicMeters * 0.35315 : 0;
  const tripsRequired = totalBrass > 0 && cap > 0 ? Math.ceil(totalBrass / cap) : 0;

  const handleSaveCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    if (L <= 0 || W <= 0 || T_meters <= 0 || cap <= 0) {
      alert('Please fill in road length, width, thickness, and tipper capacity.');
      return;
    }

    const newRecord: SavedYieldCalculation = {
      id: `calc-${Date.now()}`,
      siteName,
      materialName,
      lengthMeters: L,
      widthMeters: W,
      thicknessMm: Number(thicknessMm || 0),
      volumeCubicMeters,
      totalBrass,
      tipperCapacityBrass: cap,
      tripsRequired,
      date: new Date().toISOString().split('T')[0]
    };

    setSavedRecords([newRecord, ...savedRecords]);
  };

  const handleDeleteRecord = (id: string) => {
    if (!isAdmin) {
      alert('Action Restricted: Only Administrators are authorized to delete calculation records.');
      return;
    }
    if (window.confirm('Delete this section calculation?')) {
      setSavedRecords(savedRecords.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-md shadow-cyan-600/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800 text-[10px] font-black uppercase">
                Trip Estimator
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                MoRTH Flexible Pavement Estimation
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Road Trip Calculator
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Top 3 Auto-Calculation Output Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Compacted Volume */}
        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Compacted Volume (V)</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-cyan-400 font-mono">
              {volumeCubicMeters > 0
                ? volumeCubicMeters.toLocaleString('en-IN', { maximumFractionDigits: 1 })
                : '0'}{' '}
              <span className="text-sm font-normal text-slate-400">m³</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {volumeCubicMeters > 0
                ? `V = ${L}m × ${W}m × ${T_meters.toFixed(3)}m`
                : 'V = L × W × Thickness'}
            </div>
          </div>
        </div>

        {/* Total Material Volume (Brass) */}
        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total Material Volume</span>
            <Ruler className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-amber-400 font-mono">
              {totalBrass > 0 ? totalBrass.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : '0.0'}{' '}
              <span className="text-sm font-normal text-slate-400">Brass</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {totalBrass > 0
                ? `~ ${(totalBrass * 100).toLocaleString('en-IN')} Cubic Feet`
                : 'Enter dimensions below'}
            </div>
          </div>
        </div>

        {/* Dump Truck Trips Needed */}
        <div className="p-5 rounded-3xl bg-[#141b12] border border-emerald-900/60 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Dump Truck Trips Needed</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {tripsRequired > 0 ? tripsRequired.toLocaleString('en-IN') : '0'}{' '}
              <span className="text-sm font-normal text-slate-400">Trips</span>
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">
              {cap > 0 ? `Based on ${cap} Brass payload per tipper` : 'Specify tipper capacity'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Parameter Inputs & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0C1427] border border-[#182643] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#182643] text-sm font-bold text-white">
            <Ruler className="w-4 h-4 text-cyan-400" />
            <span>Road Dimension Parameters</span>
          </div>

          <form onSubmit={handleSaveCalculation} className="space-y-3.5 text-xs">
            {/* Site Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Site Name *</span>
              </label>
              <select
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-cyan-500 cursor-pointer font-medium"
              >
                {siteList.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            </div>

            {/* Material Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Material Name *</span>
              </label>
              <select
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-cyan-500 cursor-pointer font-medium"
              >
                {MATERIAL_PRESETS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Road Length & Road Width */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Road Length (Meters) *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2500"
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                  {L > 0 ? `= ${(L / 1000).toFixed(2)} KM` : '= 0.00 KM'}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Road Width (Meters) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 9.0"
                  value={widthMeters}
                  onChange={(e) => setWidthMeters(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Carriageway width
                </span>
              </div>
            </div>

            {/* Thickness & Tipper Capacity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Thickness (mm) *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 250"
                  value={thicknessMm}
                  onChange={(e) => setThicknessMm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-mono font-bold outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                  {T_meters > 0 ? `= ${T_meters.toFixed(3)} Meters` : '= 0.000 Meters'}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Tipper Capacity (Brass) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 6"
                  value={tipperCapacityBrass}
                  onChange={(e) => setTipperCapacityBrass(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Standard 10-wheel/12-wheel
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Save Section Calculation</span>
            </button>
          </form>
        </div>

        {/* Right Table: Calculations Ledger (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#1E293B] bg-[#0d1527]/50 flex items-center justify-between">
              <div className="font-bold text-sm text-white">Active Section Calculations Ledger</div>
              <div className="text-xs text-slate-400">{savedRecords.length} Sections Saved</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                    <th className="py-3 px-4">Site & Material</th>
                    <th className="py-3 px-4 text-center">Dimensions (L × W × T)</th>
                    <th className="py-3 px-4 text-right">Volume (m³)</th>
                    <th className="py-3 px-4 text-right">Total Brass</th>
                    <th className="py-3 px-4 text-center">Trips Req.</th>
                    {isAdmin && <th className="py-3 px-4 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
                  {savedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-500 text-xs">
                        No active pavement sections saved yet.
                      </td>
                    </tr>
                  ) : (
                    savedRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#121c33]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{rec.materialName}</div>
                          <div className="text-[11px] text-slate-400">{rec.siteName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                          {rec.lengthMeters}m × {rec.widthMeters}m × {rec.thicknessMm}mm
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-cyan-400">
                          {rec.volumeCubicMeters.toLocaleString('en-IN', { maximumFractionDigits: 1 })} m³
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                          {rec.totalBrass.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-black text-xs border border-emerald-500/30">
                            {rec.tripsRequired} Trips
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Record (Admin Only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadYieldCalculatorModule;
