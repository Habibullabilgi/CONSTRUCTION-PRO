import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Truck,
  Plus,
  Trash2,
  Calendar,
  Layers,
  DollarSign,
  Search,
  CheckCircle2,
  X,
  Hash,
  ArrowRight
} from 'lucide-react';

export interface DayTripLog {
  id: string;
  date: string;
  dayNumber: number;
  siteName: string;
  vehicleNumber: string;
  materialName: string;
  totalTrips: number;
  brassPerTrip: number;
  totalBrass: number;
  ratePerBrass: number;
  totalAmount: number;
}

const MATERIAL_PRESETS = [
  { name: 'Murum', defaultRate: 1400, defaultBrassPerTrip: 6 },
  { name: 'Granular Sub-Base (GSB)', defaultRate: 1650, defaultBrassPerTrip: 5.5 },
  { name: 'Wet Mix Macadam (WMM)', defaultRate: 1850, defaultBrassPerTrip: 5.5 },
  { name: 'M-Sand / Crushed Sand', defaultRate: 2200, defaultBrassPerTrip: 5 },
  { name: '20mm Aggregate', defaultRate: 2100, defaultBrassPerTrip: 5 },
  { name: '40mm Ballast / Base', defaultRate: 1950, defaultBrassPerTrip: 6 }
];

const LOCAL_STORAGE_TRIPS_KEY = 'CONSTRUCTION_PRO_DAY_TRIPS_V1';

export const MaterialHaulageTripsModule: React.FC = () => {
  const { siteSheets, selectedSiteId } = useERP();

  const currentSite = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];
  const activeVehicles = currentSite?.vehicles?.length
    ? currentSite.vehicles
    : ['KA-28-EX-8901', 'KA-28-JC-3342', 'MH-12-DT-5510', 'KA-28-TR-1092'];

  // Persistent Day Trips State
  const [tripLogs, setTripLogs] = useState<DayTripLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}

    // Default sample entries showing whole-day totals
    return [
      {
        id: 'trip-1',
        date: '2026-08-16',
        dayNumber: 1,
        siteName: currentSite?.siteName || 'NH-50 Ongoing Site Stretch',
        vehicleNumber: 'MH-12-DT-5510',
        materialName: 'Murum',
        totalTrips: 10,
        brassPerTrip: 6,
        totalBrass: 60,
        ratePerBrass: 1400,
        totalAmount: 84000
      },
      {
        id: 'trip-2',
        date: '2026-08-16',
        dayNumber: 1,
        siteName: currentSite?.siteName || 'NH-50 Ongoing Site Stretch',
        vehicleNumber: 'KA-28-TR-1092',
        materialName: 'Granular Sub-Base (GSB)',
        totalTrips: 8,
        brassPerTrip: 5.5,
        totalBrass: 44,
        ratePerBrass: 1650,
        totalAmount: 72600
      }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    siteName: currentSite?.siteName || 'NH-50 Ongoing Site Stretch',
    vehicleNumber: activeVehicles[0] || 'MH-12-DT-5510',
    materialName: MATERIAL_PRESETS[0].name,
    totalTrips: 10,
    brassPerTrip: MATERIAL_PRESETS[0].defaultBrassPerTrip,
    ratePerBrass: MATERIAL_PRESETS[0].defaultRate
  });

  const handleMaterialSelect = (matName: string) => {
    const matched = MATERIAL_PRESETS.find((m) => m.name === matName);
    setFormData((prev) => ({
      ...prev,
      materialName: matName,
      ratePerBrass: matched ? matched.defaultRate : prev.ratePerBrass,
      brassPerTrip: matched ? matched.defaultBrassPerTrip : prev.brassPerTrip
    }));
  };

  const handleSaveDayTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.totalTrips || formData.totalTrips <= 0) return;

    const totalBrass = Number(formData.totalTrips) * Number(formData.brassPerTrip);
    const totalAmount = totalBrass * Number(formData.ratePerBrass);

    const newLog: DayTripLog = {
      id: `trip-${Date.now()}`,
      date: formData.date,
      dayNumber: tripLogs.length + 1,
      siteName: formData.siteName,
      vehicleNumber: formData.vehicleNumber,
      materialName: formData.materialName,
      totalTrips: Number(formData.totalTrips),
      brassPerTrip: Number(formData.brassPerTrip),
      totalBrass,
      ratePerBrass: Number(formData.ratePerBrass),
      totalAmount
    };

    const updated = [newLog, ...tripLogs];
    setTripLogs(updated);
    localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(updated));
    setIsModalOpen(false);
  };

  const handleDeleteTrip = (id: string) => {
    if (window.confirm('Delete this day trip record?')) {
      const updated = tripLogs.filter((t) => t.id !== id);
      setTripLogs(updated);
      localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(updated));
    }
  };

  // KPI Calculations
  const grandTotalTrips = tripLogs.reduce((acc, t) => acc + t.totalTrips, 0);
  const grandTotalBrass = tripLogs.reduce((acc, t) => acc + t.totalBrass, 0);
  const grandTotalValuation = tripLogs.reduce((acc, t) => acc + t.totalAmount, 0);

  const filteredLogs = tripLogs.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.vehicleNumber.toLowerCase().includes(q) ||
      t.materialName.toLowerCase().includes(q) ||
      t.date.includes(q) ||
      t.siteName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800 text-[10px] font-black uppercase">
                Haulage Matrix
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Active Site: {currentSite?.siteName || 'Main Stretch'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Material Haulage & Daily Trippage Ledger
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Day Trips</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c1427] border border-[#182643] p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Cumulative Trips</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {grandTotalTrips.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">Trips Delivered</span>
          </div>
        </div>

        <div className="bg-[#0c1427] border border-[#182643] p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Material Quantity</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1">
            {grandTotalBrass.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">Brass (Murum / GSB / WMM)</span>
          </div>
        </div>

        <div className="bg-[#0c1427] border border-[#182643] p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Day Valuation</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            ₹{grandTotalValuation.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 3. Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter by date (YYYY-MM-DD), vehicle plate, or material (Murum, GSB)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-blue-500 placeholder-slate-500"
        />
      </div>

      {/* 4. Trips Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1E293B] bg-[#0d1527]/50 flex items-center justify-between">
          <div className="font-bold text-sm text-white">Daily Trippage Reconciliation Log</div>
          <div className="text-xs text-slate-400">{filteredLogs.length} Records Logged</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Vehicle Number</th>
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4 text-center">Day Trips (Total)</th>
                <th className="py-3 px-4 text-center">Brass / Trip</th>
                <th className="py-3 px-4 text-right">Total Brass</th>
                <th className="py-3 px-4 text-right">Rate / Brass</th>
                <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    No haulage trips logged for this selection. Click "+ Log Day Trips" to record.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">
                      {log.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-black text-[11px] border border-amber-500/30">
                        {log.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {log.materialName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-blue-400 text-sm">
                      {log.totalTrips} Trips
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {log.brassPerTrip} Brass
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {log.totalBrass.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      ₹{log.ratePerBrass.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400">
                      ₹{log.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteTrip(log.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Whole Day Trips Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Log Total Day Haulage Trips</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDayTrip} className="space-y-4 text-xs">
              {/* Row 1: Date & Site */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Trip Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Site Location
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Vehicle & Material */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Vehicle Number / Tipper *
                  </label>
                  <select
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {activeVehicles.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Material Name *
                  </label>
                  <select
                    value={formData.materialName}
                    onChange={(e) => handleMaterialSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer font-medium"
                  >
                    {MATERIAL_PRESETS.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} (Preset: ₹{m.defaultRate}/Brass)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Total Day Trips Count + Brass Per Trip + Rate Per Brass */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-blue-400" />
                    <span>Total Day Trips *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={formData.totalTrips || ''}
                    onChange={(e) => setFormData({ ...formData, totalTrips: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-blue-400 font-mono font-black text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Brass / Trip</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="e.g. 6"
                    value={formData.brassPerTrip || ''}
                    onChange={(e) => setFormData({ ...formData, brassPerTrip: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Rate / 1 Brass (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.ratePerBrass || ''}
                    onChange={(e) => setFormData({ ...formData, ratePerBrass: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Day Computation Summary Box */}
              <div className="p-4 bg-[#080d19] border border-[#1E293B] rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Quantity Delivered ({formData.totalTrips || 0} Trips × {formData.brassPerTrip || 0} Brass):</span>
                  <span className="text-white font-bold font-mono text-sm">
                    {(Number(formData.totalTrips || 0) * Number(formData.brassPerTrip || 0)).toFixed(1)} Brass
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#182643]">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      Rate: ₹{Number(formData.ratePerBrass || 0).toLocaleString('en-IN')} / 1 Brass
                    </div>
                    <div className="text-xs font-bold text-slate-200">
                      Total Day Amount ({formData.totalTrips || 0} Trips):
                    </div>
                  </div>
                  <div className="text-xl font-black text-amber-400 font-mono">
                    ₹{(Number(formData.totalTrips || 0) * Number(formData.brassPerTrip || 0) * Number(formData.ratePerBrass || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>Save Day Record ({formData.totalTrips || 0} Trips)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialHaulageTripsModule;
