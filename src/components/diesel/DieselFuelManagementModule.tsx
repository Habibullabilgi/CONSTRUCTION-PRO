import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Fuel,
  Plus,
  Trash2,
  Calendar,
  Truck,
  User,
  Search,
  DollarSign,
  Droplet,
  Check,
  Edit2,
  X,
  ArrowRight
} from 'lucide-react';

export interface DieselVoucherLog {
  id: string;
  date: string;
  siteName: string;
  vehicleNumber: string;
  driverName: string;
  litresDispensed: number;
  ratePerLitre: number;
  totalCost: number;
}

const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_VOUCHERS_V1';
const STORAGE_FLEET_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';

export const DieselFuelManagementModule: React.FC = () => {
  const { siteSheets, selectedSiteId } = useERP();

  const currentSite = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];
  const siteList = siteSheets.length > 0
    ? siteSheets.map((s) => s.siteName)
    : ['Mulwad Ongoing Stretch', 'NH-50 Flexible Pavement Section', 'Quarry Crusher Unit'];

  // 1. Linked Vehicles from Fleet
  const [vehiclesList, setVehiclesList] = useState<string[]>(() => {
    try {
      const savedFleet = localStorage.getItem(STORAGE_FLEET_KEY);
      if (savedFleet) {
        const parsed = JSON.parse(savedFleet);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => item.vehicleNumber || item.code || item);
        }
      }
    } catch {}
    return ['KA28B8797', 'KA-28-EX-8901', 'MH-12-DT-5510', 'KA-28-TR-1092', 'KA-28-JC-3342'];
  });

  // 2. Persistent Diesel Vouchers State
  const [vouchers, setVouchers] = useState<DieselVoucherLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DIESEL_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'dsl-1',
        date: '2026-08-16',
        siteName: siteList[0] || 'Mulwad Ongoing Stretch',
        vehicleNumber: 'KA28B8797',
        driverName: 'Santosh Kamble',
        litresDispensed: 100,
        ratePerLitre: 92.5,
        totalCost: 9250
      },
      {
        id: 'dsl-2',
        date: '2026-08-16',
        siteName: siteList[0] || 'Mulwad Ongoing Stretch',
        vehicleNumber: 'KA-28-EX-8901',
        driverName: 'Ibrahim (Operator)',
        litresDispensed: 180,
        ratePerLitre: 92.5,
        totalCost: 16650
      }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States inside modal
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [siteName, setSiteName] = useState<string>(siteList[0] || 'Mulwad Ongoing Stretch');
  const [vehicleNumber, setVehicleNumber] = useState<string>(vehiclesList[0] || 'KA28B8797');
  const [driverName, setDriverName] = useState<string>('Santosh Kamble');
  const [litresDispensed, setLitresDispensed] = useState<number | ''>(100);
  const [ratePerLitre, setRatePerLitre] = useState<number>(92.5);

  const [isEditingRate, setIsEditingRate] = useState<boolean>(false);
  const [tempRate, setTempRate] = useState<number>(92.5);

  // New Vehicle inline state
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicleInput, setNewVehicleInput] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_DIESEL_KEY, JSON.stringify(vouchers));
  }, [vouchers]);

  const totalCost = Number(litresDispensed || 0) * Number(ratePerLitre || 0);

  const handleAddNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newVehicleInput.trim().toUpperCase();
    if (!clean) return;
    if (!vehiclesList.includes(clean)) {
      const updated = [clean, ...vehiclesList];
      setVehiclesList(updated);
      setVehicleNumber(clean);
    }
    setNewVehicleInput('');
    setIsAddingVehicle(false);
  };

  const handleApplyRate = () => {
    setRatePerLitre(Number(tempRate));
    setIsEditingRate(false);
  };

  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!litresDispensed || Number(litresDispensed) <= 0) return;

    const newVoucher: DieselVoucherLog = {
      id: `dsl-${Date.now()}`,
      date,
      siteName,
      vehicleNumber,
      driverName: driverName.trim() || 'Site Driver',
      litresDispensed: Number(litresDispensed),
      ratePerLitre: Number(ratePerLitre),
      totalCost
    };

    setVouchers([newVoucher, ...vouchers]);
    setIsModalOpen(false);
  };

  const handleDeleteVoucher = (id: string) => {
    if (window.confirm('Delete this fuel refueling voucher?')) {
      setVouchers(vouchers.filter((v) => v.id !== id));
    }
  };

  // KPI Calculations
  const grandTotalLitres = vouchers.reduce((sum, v) => sum + v.litresDispensed, 0);
  const grandTotalCost = vouchers.reduce((sum, v) => sum + v.totalCost, 0);
  const totalFuelVouchers = vouchers.length;

  const filteredVouchers = vouchers.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.vehicleNumber.toLowerCase().includes(q) ||
      v.driverName.toLowerCase().includes(q) ||
      v.date.includes(q) ||
      v.siteName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-orange-600 selection:text-white">
      {/* 1. Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800 text-[10px] font-black uppercase">
                Fuel Management
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Active Fuel Tanker / Bowser Telematics
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Diesel Consumption & Dispense Log
            </h1>
          </div>
        </div>

        <button
          onClick={() => {
            setDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-600/30 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Diesel Slip</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c1427] border border-[#182643] p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Diesel Consumed</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {grandTotalLitres.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">Litres</span>
          </div>
        </div>

        <div className="bg-[#0c1427] border border-[#182643] p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Fuel Expenditure</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            ₹{grandTotalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#0c1427] border border-[#182643] p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Vouchers Logged</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {totalFuelVouchers}{' '}
            <span className="text-xs font-normal text-slate-400">Slips</span>
          </div>
        </div>
      </div>

      {/* 3. Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter by date (YYYY-MM-DD), vehicle plate, driver name, site..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-amber-500 placeholder-slate-500"
        />
      </div>

      {/* 4. Diesel Vouchers Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1E293B] bg-[#0d1527]/50 flex items-center justify-between">
          <div className="font-bold text-sm text-white">Diesel Fuel Dispense Reconciliation Log</div>
          <div className="text-xs text-slate-400">{filteredVouchers.length} Slips Recorded</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Site Name</th>
                <th className="py-3 px-4">Vehicle Number</th>
                <th className="py-3 px-4">Driver / Operator</th>
                <th className="py-3 px-4 text-right">Litres Dispensed</th>
                <th className="py-3 px-4 text-right">Rate / Litre</th>
                <th className="py-3 px-4 text-right">Total Voucher Cost (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No diesel vouchers logged yet. Click "+ Record Diesel Slip" to add.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((item) => (
                  <tr key={item.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">{item.date}</td>
                    <td className="py-3.5 px-4 text-white font-medium">{item.siteName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-black text-[11px] border border-amber-500/30">
                        {item.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{item.driverName}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                      {item.litresDispensed.toFixed(1)} L
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      ₹{item.ratePerLitre.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400">
                      ₹{item.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteVoucher(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Slip"
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

      {/* 5. Modal: Record Diesel Refueling Voucher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Fuel className="w-5 h-5 text-amber-500" />
                <span>Record Diesel Refueling Voucher</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="space-y-3.5 text-xs">
              {/* Row 1: Voucher Date & Site Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Voucher Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 font-medium cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Site Name *</label>
                  <select
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 cursor-pointer font-medium"
                  >
                    {siteList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Vehicle Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold">Vehicle Number / Equipment *</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingVehicle(!isAddingVehicle)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add New Vehicle</span>
                  </button>
                </div>

                {isAddingVehicle ? (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-[#162032] border border-amber-500/40 rounded-xl">
                    <input
                      type="text"
                      placeholder="e.g. KA28B8797"
                      value={newVehicleInput}
                      onChange={(e) => setNewVehicleInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 bg-[#0D111D] border border-[#1E293B] rounded-lg text-white font-mono font-bold text-xs outline-none focus:border-amber-500 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewVehicle}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingVehicle(false)}
                      className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <select
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {vehiclesList.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Row 3: Driver Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Driver / Operator Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Santosh Kamble"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Row 4: Litres & Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Litres Dispensed *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    required
                    value={litresDispensed || ''}
                    onChange={(e) => setLitresDispensed(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-black text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-bold">Rate / Litre (₹) *</label>
                    {!isEditingRate ? (
                      <button
                        type="button"
                        onClick={() => {
                          setTempRate(ratePerLitre);
                          setIsEditingRate(true);
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingRate(false)}
                        className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {isEditingRate ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tempRate}
                        onChange={(e) => setTempRate(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-[#0D111D] border border-amber-500 rounded-xl text-white font-mono font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyRate}
                        className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="number"
                      readOnly
                      value={ratePerLitre}
                      className="w-full px-3.5 py-2.5 bg-[#162032]/60 border border-[#1E293B] rounded-xl text-slate-300 font-mono font-bold outline-none cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              {/* Computed Box */}
              <div className="p-4 bg-[#080d19] border border-[#1E293B] rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Rate: ₹{ratePerLitre.toFixed(2)} / Litre</div>
                  <div className="text-xs font-bold text-slate-200">Total Voucher Cost:</div>
                </div>
                <div className="text-xl font-black text-amber-400 font-mono">
                  ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black shadow-lg shadow-orange-600/30 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>Save & Lock Fuel Slip</span>
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

export default DieselFuelManagementModule;
