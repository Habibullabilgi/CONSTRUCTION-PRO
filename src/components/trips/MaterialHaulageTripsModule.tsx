import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Truck,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Search,
  X,
  Building2
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

export interface MaterialRateItem {
  id: string;
  name: string;
  fixedRate: number;
  defaultBrass: number;
}

const DEFAULT_MATERIALS: MaterialRateItem[] = [
  { id: 'm-1', name: 'BM', fixedRate: 5000, defaultBrass: 6 },
  { id: 'm-2', name: 'Murum Base Material', fixedRate: 1400, defaultBrass: 6 },
  { id: 'm-3', name: 'Granular Sub-Base (GSB)', fixedRate: 1650, defaultBrass: 5.5 },
  { id: 'm-4', name: 'Wet Mix Macadam (WMM)', fixedRate: 1850, defaultBrass: 5.5 },
  { id: 'm-5', name: 'M-Sand / Crushed Sand', fixedRate: 2200, defaultBrass: 5 },
  { id: 'm-6', name: '20mm Aggregate Metal', fixedRate: 2100, defaultBrass: 5 },
  { id: 'm-7', name: '40mm Ballast Metal', fixedRate: 1950, defaultBrass: 6 }
];

const STORAGE_TRIPS_KEY = 'CONSTRUCTION_PRO_DAY_TRIPS_V3';
const STORAGE_FLEET_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';
const STORAGE_MATERIALS_KEY = 'CONSTRUCTION_PRO_MATERIAL_RATES_V1';

export const MaterialHaulageTripsModule: React.FC = () => {
  const { siteSheets, selectedSiteId, currentUser, userRole } = useERP();

  // Strict Admin Check: Only Admin can delete entries
  const currentRoleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = currentRoleStr.includes('admin');

  const siteList = siteSheets && siteSheets.length > 0
    ? siteSheets.map((s) => s.siteName)
    : ['SINDAGI - ALMEL ROAD', 'Mulwad', 'NH-50 Site Stretch'];

  const currentSiteName = siteSheets.find((s) => s.siteId === selectedSiteId)?.siteName || siteList[0];

  // 1. Linked Vehicles from Fleet
  const [fleetVehicles, setFleetVehicles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FLEET_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => item.vehicleNumber || item.code || item);
        }
      }
    } catch {}
    return ['TOTAL TRIPS', 'KA28B8797', 'KA-28-EX-8901', 'MH-12-DT-5510', 'KA-28-TR-1092'];
  });

  // 2. Materials List
  const [materialsList, setMaterialsList] = useState<MaterialRateItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MATERIALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MATERIALS;
  });

  // 3. Day Trips
  const [tripLogs, setTripLogs] = useState<DayTripLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRIPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Vehicle inline add state
  const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(false);
  const [newVehicleInput, setNewVehicleInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    siteName: currentSiteName,
    vehicleNumber: fleetVehicles[0] || 'TOTAL TRIPS',
    materialName: materialsList[0]?.name || 'BM',
    totalTrips: 10,
    brassPerTrip: materialsList[0]?.defaultBrass || 6,
    ratePerBrass: materialsList[0]?.fixedRate || 5000
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, siteName: currentSiteName }));
  }, [currentSiteName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TRIPS_KEY, JSON.stringify(tripLogs));
  }, [tripLogs]);

  const handleMaterialChange = (matName: string) => {
    const matched = materialsList.find((m) => m.name === matName);
    setFormData((prev) => ({
      ...prev,
      materialName: matName,
      ratePerBrass: matched ? matched.fixedRate : prev.ratePerBrass,
      brassPerTrip: matched ? matched.defaultBrass : prev.brassPerTrip
    }));
  };

  const handleAddNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = newVehicleInput.trim().toUpperCase();
    if (!cleanPlate) return;

    if (!fleetVehicles.includes(cleanPlate)) {
      const updated = [cleanPlate, ...fleetVehicles];
      setFleetVehicles(updated);
      setFormData((prev) => ({ ...prev, vehicleNumber: cleanPlate }));
    }
    setNewVehicleInput('');
    setIsAddingNewVehicle(false);
  };

  const handleSaveDayTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.totalTrips || formData.totalTrips <= 0) return;

    const totalBrass = Number(formData.totalTrips) * Number(formData.brassPerTrip || 0);
    const totalAmount = totalBrass * Number(formData.ratePerBrass || 0);

    const newLog: DayTripLog = {
      id: `trip-${Date.now()}`,
      date: formData.date,
      dayNumber: tripLogs.length + 1,
      siteName: formData.siteName,
      vehicleNumber: formData.vehicleNumber,
      materialName: formData.materialName,
      totalTrips: Number(formData.totalTrips),
      brassPerTrip: Number(formData.brassPerTrip || 0),
      totalBrass,
      ratePerBrass: Number(formData.ratePerBrass || 0),
      totalAmount
    };

    setTripLogs([newLog, ...tripLogs]);
    setIsModalOpen(false);
  };

  const handleDeleteTrip = (id: string) => {
    if (!isAdmin) {
      alert('Action Restricted: Only Administrators are authorized to delete trip records.');
      return;
    }
    if (window.confirm('Delete this day trip record permanently?')) {
      setTripLogs(tripLogs.filter((t) => t.id !== id));
    }
  };

  // Site-specific Filtered Logs & KPIs
  const siteLogs = tripLogs.filter(
    (t) =>
      !t.siteName ||
      t.siteName.toLowerCase().includes(currentSiteName.toLowerCase()) ||
      currentSiteName.toLowerCase().includes(t.siteName.toLowerCase())
  );

  const grandTotalTrips = siteLogs.reduce((acc, t) => acc + t.totalTrips, 0);
  const grandTotalBrass = siteLogs.reduce((acc, t) => acc + t.totalBrass, 0);
  const grandTotalValuation = siteLogs.reduce((acc, t) => acc + t.totalAmount, 0);

  const filteredLogs = siteLogs.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.vehicleNumber.toLowerCase().includes(q) ||
      t.materialName.toLowerCase().includes(q) ||
      t.date.includes(q) ||
      t.siteName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-full flex flex-col gap-2.5 font-sans text-slate-100">
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121927] border border-[#1E293B] rounded-2xl shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-400 border border-blue-800 text-[9px] font-black uppercase">
                FLEET-LINKED HAULAGE
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {fleetVehicles.length} Active Fleet Tippers
              </span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none mt-0.5">
              Material Haulage & Daily Trippage Ledger
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Log Day Trips</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 shrink-0">
        <div className="bg-[#0c1427] border border-[#182643] px-3.5 py-2.5 rounded-xl">
          <div className="text-slate-400 text-[11px] font-semibold">Total Cumulative Trips</div>
          <div className="text-xl font-black text-white mt-0.5">
            {grandTotalTrips}{' '}
            <span className="text-xs font-normal text-slate-400">Trips</span>
          </div>
        </div>

        <div className="bg-[#0c1427] border border-[#182643] px-3.5 py-2.5 rounded-xl">
          <div className="text-slate-400 text-[11px] font-semibold">Total Material Volume</div>
          <div className="text-xl font-black text-blue-400 mt-0.5">
            {grandTotalBrass > 0 ? grandTotalBrass.toFixed(1) : '0.0'}{' '}
            <span className="text-xs font-normal text-slate-400">Brass</span>
          </div>
        </div>

        <div className="bg-[#0c1427] border border-[#182643] px-3.5 py-2.5 rounded-xl">
          <div className="text-slate-400 text-[11px] font-semibold">Total Ledger Valuation</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">
            ₹{grandTotalValuation.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 3. Search Filter */}
      <div className="relative shrink-0">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter by date (YYYY-MM-DD), vehicle plate, site name, or material..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-[#0D111D] border border-[#1E293B] rounded-xl text-xs text-white outline-none focus:border-blue-500 placeholder-slate-500"
        />
      </div>

      {/* 4. Table Container */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl flex-1 flex flex-col overflow-hidden shadow-xl min-h-0">
        <div className="px-4 py-2 border-b border-[#1E293B] bg-[#0d1527]/50 flex items-center justify-between shrink-0">
          <div className="font-bold text-xs text-white">Daily Trippage Reconciliation Log</div>
          <div className="text-[11px] text-slate-400">{filteredLogs.length} Records Logged</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-[#080d19] shadow-sm">
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Site Name</th>
                <th className="py-2.5 px-3">Vehicle Number</th>
                <th className="py-2.5 px-3">Material Name</th>
                <th className="py-2.5 px-3 text-center">Day Trips</th>
                <th className="py-2.5 px-3 text-center">Brass / Trip</th>
                <th className="py-2.5 px-3 text-right">Total Brass</th>
                <th className="py-2.5 px-3 text-right">Rate / Brass</th>
                <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                {isAdmin && <th className="py-2.5 px-3 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="py-12 text-center text-slate-500 text-xs">
                    No haulage trips logged. Click "+ Log Day Trips" above to record daily entries.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-300 font-semibold">{log.date}</td>
                    <td className="py-2 px-3 text-white font-medium">{log.siteName}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-mono font-black text-[10px] border border-amber-500/30">
                        {log.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-white">{log.materialName}</td>
                    <td className="py-2 px-3 text-center font-mono font-extrabold text-blue-400">
                      {log.totalTrips} Trips
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-300">
                      {log.brassPerTrip} Brass
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">
                      {log.totalBrass.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">
                      ₹{log.ratePerBrass.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black text-amber-400">
                      ₹{log.totalAmount.toLocaleString('en-IN')}
                    </td>
                    {isAdmin && (
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTrip(log.id)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Entry (Admin Only)"
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

      {/* 5. Modal: Log Day Trips */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-[#121927] border border-[#1E293B] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-3 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Log Total Day Haulage Trips</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDayTrip} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Trip Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#162032] border border-[#1E293B] rounded-lg text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-blue-400" />
                    <span>Site Name *</span>
                  </label>
                  <select
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#162032] border border-[#1E293B] rounded-lg text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {siteList.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">Vehicle Number *</label>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewVehicle(!isAddingNewVehicle)}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                    >
                      + Add Vehicle
                    </button>
                  )}
                </div>

                {isAddingNewVehicle ? (
                  <div className="flex items-center gap-1.5 p-1.5 bg-[#162032] border border-blue-500/40 rounded-lg">
                    <input
                      type="text"
                      placeholder="e.g. KA28B8797"
                      value={newVehicleInput}
                      onChange={(e) => setNewVehicleInput(e.target.value.toUpperCase())}
                      className="flex-1 px-2 py-1 bg-[#0D111D] border border-[#1E293B] rounded text-white font-mono text-xs uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewVehicle}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#162032] border border-[#1E293B] rounded-lg text-white font-mono font-bold outline-none"
                  >
                    {fleetVehicles.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Material Name *</label>
                <select
                  value={formData.materialName}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#162032] border border-[#1E293B] rounded-lg text-white outline-none"
                >
                  {materialsList.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} (₹{m.fixedRate}/Brass)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Day Trips *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalTrips || ''}
                    onChange={(e) => setFormData({ ...formData, totalTrips: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-[#162032] border border-[#1E293B] rounded-lg text-blue-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Brass/Trip</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.brassPerTrip || ''}
                    onChange={(e) => setFormData({ ...formData, brassPerTrip: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-[#162032] border border-[#1E293B] rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rate / Brass</label>
                  <input
                    type="number"
                    required
                    value={formData.ratePerBrass || ''}
                    onChange={(e) => setFormData({ ...formData, ratePerBrass: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-[#162032] border border-[#1E293B] rounded-lg text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-[#080d19] border border-[#1E293B] rounded-xl flex items-center justify-between">
                <span className="text-slate-400 text-xs">Total Day Amount:</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  ₹{(
                    Number(formData.totalTrips || 0) *
                    Number(formData.brassPerTrip || 0) *
                    Number(formData.ratePerBrass || 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-lg shadow-md"
                >
                  Save Record
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
