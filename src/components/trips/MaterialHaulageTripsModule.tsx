import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Plus,
  Download,
  Search,
  X,
  Trash2,
  Truck
} from 'lucide-react';

export interface HaulageTripRecord {
  id: string;
  tripDate: string;
  siteName: string;
  vehicleNumber: string;
  materialName: string;
  dayTrips: number;
  brassPerTrip: number;
  ratePerBrass: number;
  totalAmount: number;
}

const STORAGE_HAULAGE_KEY = 'CONSTRUCTION_PRO_HAULAGE_TRIPS_V2';

const INITIAL_HAULAGE_TRIPS: HaulageTripRecord[] = [
  {
    id: 'TRIP-101',
    tripDate: '2026-08-19',
    siteName: 'SINDAGI - ALMEL ROAD',
    vehicleNumber: 'TOTAL TRIPS',
    materialName: 'BM (₹5000/Brass)',
    dayTrips: 10,
    brassPerTrip: 6,
    ratePerBrass: 5000,
    totalAmount: 300000
  }
];

const MATERIAL_PRESETS = [
  { name: 'BM (₹5000/Brass)', defaultRate: 5000 },
  { name: 'GSB (₹4200/Brass)', defaultRate: 4200 },
  { name: 'WMM (₹4500/Brass)', defaultRate: 4500 },
  { name: 'Wet Mix (₹4600/Brass)', defaultRate: 4600 },
  { name: 'DBM (₹5500/Brass)', defaultRate: 5500 },
  { name: 'BC (₹6000/Brass)', defaultRate: 6000 }
];

export const MaterialHaulageTripsModule: React.FC = () => {
  const { siteSheets = [] } = useERP();

  const [trips, setTrips] = useState<HaulageTripRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HAULAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_HAULAGE_TRIPS;
    } catch {
      return INITIAL_HAULAGE_TRIPS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [tripDate, setTripDate] = useState('2026-08-19');
  const [siteName, setSiteName] = useState('SINDAGI - ALMEL ROAD');
  const [vehicleNumber, setVehicleNumber] = useState('TOTAL TRIPS');
  const [materialName, setMaterialName] = useState(MATERIAL_PRESETS[0].name);
  const [dayTrips, setDayTrips] = useState<number | ''>(10);
  const [brassPerTrip, setBrassPerTrip] = useState<number | ''>(6);
  const [ratePerBrass, setRatePerBrass] = useState<number | ''>(5000);

  // Update default rate when material preset changes
  const handleMaterialChange = (selectedName: string) => {
    setMaterialName(selectedName);
    const found = MATERIAL_PRESETS.find((m) => m.name === selectedName);
    if (found) {
      setRatePerBrass(found.defaultRate);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_HAULAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  const computedTotalAmount = useMemo(() => {
    const tripsNum = Number(dayTrips) || 0;
    const brassNum = Number(brassPerTrip) || 0;
    const rateNum = Number(ratePerBrass) || 0;
    return tripsNum * brassNum * rateNum;
  }, [dayTrips, brassPerTrip, ratePerBrass]);

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        t.siteName.toLowerCase().includes(q) ||
        t.vehicleNumber.toLowerCase().includes(q) ||
        t.materialName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    });
  }, [trips, searchQuery]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip record?')) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayTrips || !brassPerTrip || !ratePerBrass) return;

    const newRecord: HaulageTripRecord = {
      id: `TRIP-${Date.now().toString().slice(-4)}`,
      tripDate,
      siteName: siteName.trim() || 'SINDAGI - ALMEL ROAD',
      vehicleNumber: vehicleNumber.trim() || 'TOTAL TRIPS',
      materialName,
      dayTrips: Number(dayTrips),
      brassPerTrip: Number(brassPerTrip),
      ratePerBrass: Number(ratePerBrass),
      totalAmount: computedTotalAmount
    };

    setTrips([newRecord, ...trips]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Material Haulage Trips</h1>
            <p className="text-xs text-slate-400 mt-0.5">Track daily trip counts, material volumes, and haulage expenses.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Haulage Trips</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-[#0c1427] border border-[#182643] flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by site, vehicle, material name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">TRIP ID & DATE</th>
                <th className="py-3.5 px-6">SITE NAME</th>
                <th className="py-3.5 px-6">VEHICLE / BATCH</th>
                <th className="py-3.5 px-6">MATERIAL NAME</th>
                <th className="py-3.5 px-4 text-center">TRIPS</th>
                <th className="py-3.5 px-4 text-right">BRASS/TRIP</th>
                <th className="py-3.5 px-4 text-right">RATE/BRASS</th>
                <th className="py-3.5 px-6 text-right">TOTAL AMOUNT</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No haulage trip records found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono">
                      <div className="font-bold text-white">{t.id}</div>
                      <div className="text-[10px] text-slate-400">{t.tripDate}</div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-cyan-400">{t.siteName}</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-300">{t.vehicleNumber}</td>
                    <td className="py-3.5 px-6 font-bold text-amber-300">{t.materialName}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">{t.dayTrips}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{t.brassPerTrip}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400">₹{t.ratePerBrass.toLocaleString()}</td>
                    <td className="py-3.5 px-6 text-right font-mono font-black text-amber-400 text-sm">
                      ₹{t.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDelete(t.id)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Total Day Haulage Trips Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Log Total Day Haulage Trips</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Trip Date *</label>
                  <input
                    type="date"
                    required
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Site Name *</label>
                  <select
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-medium outline-none cursor-pointer"
                  >
                    <option value="SINDAGI - ALMEL ROAD">SINDAGI - ALMEL ROAD</option>
                    <option value="TOWER-A BUILDING">TOWER-A BUILDING</option>
                    <option value="CENTRAL CAMPUS">CENTRAL CAMPUS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  required
                  placeholder="TOTAL TRIPS or vehicle registration..."
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none uppercase"
                />
              </div>

              {/* Material Name Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Material Name *</label>
                <select
                  value={materialName}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-300 font-bold outline-none cursor-pointer"
                >
                  {MATERIAL_PRESETS.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Day Trips *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dayTrips}
                    onChange={(e) => setDayTrips(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Brass/Trip *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={brassPerTrip}
                    onChange={(e) => setBrassPerTrip(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rate / Brass *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={ratePerBrass}
                    onChange={(e) => setRatePerBrass(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              {/* Live Calculated Total Amount Display */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Total Day Amount:</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  ₹{computedTotalAmount.toLocaleString()}
                </span>
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
