import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { MachineryRecord } from '../../types/erp';
import {
  Truck,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Gauge,
  Clock,
  Car,
  Tractor
} from 'lucide-react';

const VEHICLE_TYPES = [
  'Tipper / Dump Truck',
  'Excavator / JCB',
  'Tractor',
  'Roller / Compactor',
  'Motor Grader',
  'Car / Jeep / Site Vehicle',
  'Water Tanker',
  'Transit Mixer / Concrete Truck',
  'Asphalt / Sensor Paver',
  'Wheel Loader / Backhoe',
  'Other Equipment'
];

export const MachineryFleetModule: React.FC = () => {
  const { machinery, addMachinery, deleteMachinery, clearAllMachinery } = useERP();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Simplified Form State
  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: VEHICLE_TYPES[0],
    meterTrackingType: 'HOURS' as 'HOURS' | 'KM',
    currentReading: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const filteredFleet = useMemo(() => {
    return (machinery || []).filter((m) => {
      const matchesType = typeFilter === 'ALL' || m.name === typeFilter || (m as any).vehicleType === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.registrationNumber.toLowerCase().includes(q);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [machinery, typeFilter, statusFilter, searchQuery]);

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReg = formData.registrationNumber.trim().toUpperCase();
    if (!cleanReg) return;

    const isKm = formData.meterTrackingType === 'KM';

    addMachinery({
      code: cleanReg.startsWith('#') ? cleanReg : `#${cleanReg}`,
      registrationNumber: cleanReg,
      name: formData.vehicleType,
      category: isKm ? 'HAULAGE_TRANSPORT' : 'EARTHMOVING_EXCAVATION',
      ownershipType: 'COMPANY_OWNED',
      currentHMR: isKm ? 0 : Number(formData.currentReading) || 0,
      currentKMR: isKm ? Number(formData.currentReading) || 0 : 0,
      averageConsumptionBenchmark: isKm ? 3.5 : 15,
      benchmarkUnit: isKm ? 'km/L' : 'L/hr',
      currentLocation: 'Active Site',
      assignedOperator: 'Site Operator',
      status: formData.status as any
    });

    setIsRegisterModalOpen(false);
    setFormData({
      registrationNumber: '',
      vehicleType: VEHICLE_TYPES[0],
      meterTrackingType: 'HOURS',
      currentReading: 0,
      status: 'ACTIVE'
    });
  };

  const handleDelete = (id: string, name: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete ${name} (${code})?`)) {
      deleteMachinery(id);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md shadow-amber-600/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800 text-[10px] font-black uppercase">
                Fleet Registry
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Total Vehicles: {machinery.length}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Road Construction Vehicles & Fleet Management
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {machinery.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Delete all registered vehicles?')) {
                  clearAllMachinery();
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#162032] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-[#1E293B] hover:border-rose-800/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register Vehicle</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="p-3 rounded-2xl bg-[#0D111D] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-60 px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-amber-500 font-semibold cursor-pointer"
        >
          <option value="ALL">All Vehicle Types</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-amber-500 font-semibold cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search vehicle number or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-xs text-white outline-none focus:border-amber-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* 3. Fleet Cards Grid */}
      {filteredFleet.length === 0 ? (
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <Truck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <div className="text-sm font-bold text-slate-300">No vehicles registered yet.</div>
          <div className="text-xs">Click <strong>+ Register Vehicle</strong> above to add cars, jeeps, tippers, tractors, and road machinery.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFleet.map((v) => {
            const isKmTracking = (v.currentKMR || 0) > 0 || v.benchmarkUnit === 'km/L';
            return (
              <div
                key={v.id}
                className="p-5 rounded-3xl bg-[#121927] border border-[#1E293B] hover:border-[#334155] transition-all space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-400 font-mono font-black text-sm border border-amber-500/30">
                        {v.registrationNumber || v.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                          v.status === 'ACTIVE'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {v.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {v.status || 'ACTIVE'}
                      </span>

                      {/* Delete Option */}
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id, v.name, v.registrationNumber || v.code)}
                        className="p-1.5 rounded-xl bg-[#162032] hover:bg-rose-950/50 border border-[#1E293B] hover:border-rose-800/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white leading-snug">
                    {v.name}
                  </h3>
                </div>

                {/* Running Meter Data Box */}
                <div className="p-3.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      {isKmTracking ? (
                        <>
                          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Odometer (KM):</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Running Hours:</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono font-black text-white text-sm">
                      {isKmTracking
                        ? `${(v.currentKMR || 0).toLocaleString()} km`
                        : `${(v.currentHMR || 0).toLocaleString()} hrs`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Streamlined Register Vehicle Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Truck className="w-5 h-5 text-amber-400" />
                <span>Register Vehicle / Road Equipment</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              {/* 1. Vehicle Number */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Vehicle Number / Plate No <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-28-C-8797 or #8797"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold uppercase outline-none focus:border-amber-500 placeholder-slate-500"
                />
              </div>

              {/* 2. Type of Vehicle */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Type of Vehicle <span className="text-amber-400">*</span>
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => {
                    const selected = e.target.value;
                    const autoKm = selected.includes('Car') || selected.includes('Tipper') || selected.includes('Tanker') || selected.includes('Jeep');
                    setFormData({
                      ...formData,
                      vehicleType: selected,
                      meterTrackingType: autoKm ? 'KM' : 'HOURS'
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-semibold outline-none focus:border-amber-500 cursor-pointer"
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Odometer / Running Hours Mode & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Tracking Mode <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.meterTrackingType}
                    onChange={(e) =>
                      setFormData({ ...formData, meterTrackingType: e.target.value as 'HOURS' | 'KM' })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-semibold outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="KM">Odometer (KM)</option>
                    <option value="HOURS">Running Hours (HMR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Current {formData.meterTrackingType === 'KM' ? 'Reading (KM)' : 'Reading (Hours)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 14200"
                    value={formData.currentReading || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, currentReading: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-amber-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* 4. Active / Inactive Status */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Status <span className="text-amber-400">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-semibold outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE (Operational)</option>
                  <option value="INACTIVE">INACTIVE (Standby / Maintenance)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineryFleetModule;
