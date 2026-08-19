import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  Fuel,
  Download
} from 'lucide-react';

export interface DieselFuelRecord {
  id: string;
  date: string;
  siteName: string;
  vehicleNumber: string;
  driverName: string;
  slipNumber: string;
  litres: number;
  ratePerLitre: number;
  totalCost: number;
}

const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_LOGS_V1';

const INITIAL_RECORDS: DieselFuelRecord[] = [
  {
    id: 'DSL-101',
    date: '2026-08-19',
    siteName: 'SINDAGI - ALMEL ROAD',
    vehicleNumber: 'TOTAL TRIPS',
    driverName: 'Santosh Kamble',
    slipNumber: 'V-001',
    litres: 100,
    ratePerLitre: 92.50,
    totalCost: 9250.00
  }
];

export const DieselFuelManagementModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId } = useERP();

  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const defaultSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'Ongoing Site';

  const [records, setRecords] = useState<DieselFuelRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DIESEL_KEY);
      return saved ? JSON.parse(saved) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [date, setDate] = useState('2026-08-19');
  const [siteName, setSiteName] = useState(defaultSiteName);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [slipNumber, setSlipNumber] = useState('');
  const [litres, setLitres] = useState<number | ''>('');
  const [ratePerLitre, setRatePerLitre] = useState<number | ''>(92.50);

  useEffect(() => {
    localStorage.setItem(STORAGE_DIESEL_KEY, JSON.stringify(records));
  }, [records]);

  const computedTotalCost = useMemo(() => {
    const ltrs = Number(litres) || 0;
    const rate = Number(ratePerLitre) || 0;
    return ltrs * rate;
  }, [litres, ratePerLitre]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        r.siteName.toLowerCase().includes(q) ||
        r.vehicleNumber.toLowerCase().includes(q) ||
        r.driverName.toLowerCase().includes(q) ||
        r.slipNumber.toLowerCase().includes(q)
      );
    });
  }, [records, searchQuery]);

  const totalLitresDispensed = filtered.reduce((sum, r) => sum + r.litres, 0);
  const totalFuelCost = filtered.reduce((sum, r) => sum + r.totalCost, 0);

  const handleOpenAdd = () => {
    setEditingId(null);
    setDate(new Date().toISOString().substring(0, 10));
    setSiteName(defaultSiteName);
    setVehicleNumber('');
    setDriverName('');
    setSlipNumber(`V-${Date.now().toString().slice(-4)}`);
    setLitres('');
    setRatePerLitre(92.50);
    setIsModalOpen(true);
  };

  const handleEdit = (record: DieselFuelRecord) => {
    setEditingId(record.id);
    setDate(record.date);
    setSiteName(record.siteName);
    setVehicleNumber(record.vehicleNumber);
    setDriverName(record.driverName);
    setSlipNumber(record.slipNumber);
    setLitres(record.litres);
    setRatePerLitre(record.ratePerLitre);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this fuel record?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!litres || !ratePerLitre) return;

    const record: DieselFuelRecord = {
      id: editingId || `DSL-${Date.now().toString().slice(-4)}`,
      date,
      siteName: siteName.trim() || defaultSiteName,
      vehicleNumber: vehicleNumber.trim() || 'UNKNOWN',
      driverName: driverName.trim() || 'UNKNOWN',
      slipNumber: slipNumber.trim() || `V-${Date.now().toString().slice(-4)}`,
      litres: Number(litres),
      ratePerLitre: Number(ratePerLitre),
      totalCost: computedTotalCost
    };

    if (editingId) {
      setRecords(records.map((r) => (r.id === editingId ? record : r)));
    } else {
      setRecords([record, ...records]);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Site Name', 'Vehicle Number', 'Driver Name', 'Slip Number', 'Litres', 'Rate/Litre', 'Total Cost'];
    const rows = filtered.map((r) => [
      r.date,
      `"${r.siteName}"`,
      `"${r.vehicleNumber}"`,
      `"${r.driverName}"`,
      `"${r.slipNumber}"`,
      r.litres,
      r.ratePerLitre,
      r.totalCost
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Diesel_Fuel_Log_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Diesel Fuel Management</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Track daily fuel dispensing, vehicle consumption, and costs.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1f2f52] border border-[#22365e] text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Export</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Log Slip</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3 sm:p-4 rounded-[1.2rem] sm:rounded-3xl bg-[#0c1427] border border-[#182643] flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 sm:top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by site, vehicle, driver, slip..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0c1427] border border-amber-900/40">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400">Total Litres Dispensed</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">{totalLitresDispensed.toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">L</span></div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1427] border border-emerald-900/40">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400">Total Fuel Cost</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">₹{totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Fuel Log Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-[1.2rem] sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1E293B] bg-[#0d1527]/50 flex items-center justify-between">
          <h2 className="text-xs sm:text-base font-bold text-white">Diesel Fuel Dispense Reconciliation Log</h2>
          <span className="text-[10px] sm:text-xs text-slate-400">{filtered.length} Slips</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#1E293B]">
          <table className="w-full text-left text-[10px] sm:text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">DATE</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">SITE NAME</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">VEHICLE NUMBER</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">DRIVER / OPERATOR</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">LITRES DISPENSED</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">RATE / LITRE</th>
                <th className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">TOTAL COST (₹)</th>
                <th className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No fuel dispense logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3 sm:py-4 px-4 sm:px-6 font-mono font-bold text-slate-300 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-white whitespace-nowrap">{r.siteName}</td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-amber-900/30 text-amber-400 border border-amber-700/50 font-mono font-bold text-[9px] sm:text-[11px]">
                        {r.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-white whitespace-nowrap">{r.driverName}</td>
                    <td className="py-3 sm:py-4 px-4 text-right font-mono font-black text-amber-400 text-[11px] sm:text-sm whitespace-nowrap">
                      {r.litres.toFixed(1)} L
                    </td>
                    <td className="py-3 sm:py-4 px-4 text-right font-mono text-slate-400 whitespace-nowrap">
                      ₹{r.ratePerLitre.toFixed(2)}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-right font-mono font-black text-emerald-400 text-[11px] sm:text-sm whitespace-nowrap">
                      ₹{r.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleEdit(r)}
                          title="Edit Record"
                          className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-950/40 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Delete Record"
                          className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-[1.5rem] sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{editingId ? 'Edit Fuel Slip' : 'Log Fuel Dispense'}</span>
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Slip Number / Ref *</label>
                  <input
                    type="text"
                    required
                    value={slipNumber}
                    onChange={(e) => setSlipNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Site / Project *</label>
                {siteSheets.length > 0 ? (
                  <select
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    {siteSheets.map((s: any) => (
                      <option key={s.siteId} value={s.siteName}>
                        {s.siteName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-28-B-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Driver / Operator *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name of driver"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Litres Dispensed *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={litres}
                    onChange={(e) => setLitres(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rate per Litre (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={ratePerLitre}
                    onChange={(e) => setRatePerLitre(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] flex items-center justify-between mt-2">
                <span className="text-xs sm:text-sm font-bold text-slate-300">Total Voucher Cost:</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                  ₹{computedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex sm:flex-row flex-col justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-400 hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DieselFuelManagementModule;
