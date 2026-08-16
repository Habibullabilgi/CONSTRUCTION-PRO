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
  Clock,
  Fuel,
  Edit2,
  User as UserIcon
} from 'lucide-react';

export const MachineryFleetModule: React.FC = () => {
  const { machinery, addMachinery, deleteMachinery, clearAllMachinery } = useERP();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    registrationNumber: '',
    name: '',
    category: 'EARTHMOVING_EXCAVATION' as MachineryRecord['category'],
    ownershipType: 'COMPANY_OWNED' as 'COMPANY_OWNED' | 'RENTED',
    rentalHourlyRateINR: 0,
    currentHMR: 0,
    currentKMR: 0,
    averageConsumptionBenchmark: 15,
    benchmarkUnit: 'L/hr' as 'L/hr' | 'km/L',
    currentLocation: '',
    assignedOperator: '',
    status: 'ACTIVE' as MachineryRecord['status']
  });

  const filteredFleet = useMemo(() => {
    return (machinery || []).filter((m) => {
      const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.registrationNumber.toLowerCase().includes(q) ||
        m.assignedOperator.toLowerCase().includes(q);
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [machinery, categoryFilter, statusFilter, searchQuery]);

  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    addMachinery({
      ...formData,
      code: formData.code.toUpperCase(),
      registrationNumber: formData.registrationNumber.toUpperCase()
    });

    setIsRegisterModalOpen(false);
    setFormData({
      code: '',
      registrationNumber: '',
      name: '',
      category: 'EARTHMOVING_EXCAVATION',
      ownershipType: 'COMPANY_OWNED',
      rentalHourlyRateINR: 0,
      currentHMR: 0,
      currentKMR: 0,
      averageConsumptionBenchmark: 15,
      benchmarkUnit: 'L/hr',
      currentLocation: '',
      assignedOperator: '',
      status: 'ACTIVE'
    });
  };

  const handleDelete = (id: string, name: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete [${code}] ${name}?`)) {
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
                Heavy Asset Registry
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Total Fleet: {machinery.length} Units
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Machine & Heavy Fleet Equipment Management
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {machinery.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Delete all machinery records?')) {
                  clearAllMachinery();
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#162032] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-[#1E293B] hover:border-rose-800/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          )}

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register Machine / Tipper</span>
          </button>
        </div>
      </div>

      {/* 2. Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            categoryFilter === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-[#121927] text-slate-400 hover:text-white border border-[#1E293B]'
          }`}
        >
          <span>All Fleet Units</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px]">
            {machinery.length}
          </span>
        </button>

        <button
          onClick={() => setCategoryFilter('EARTHMOVING_EXCAVATION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            categoryFilter === 'EARTHMOVING_EXCAVATION'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#121927] text-slate-400 hover:text-white border border-[#1E293B]'
          }`}
        >
          Earthmoving & Excavation
        </button>

        <button
          onClick={() => setCategoryFilter('COMPACTION_PAVING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            categoryFilter === 'COMPACTION_PAVING'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#121927] text-slate-400 hover:text-white border border-[#1E293B]'
          }`}
        >
          Compaction & Paving
        </button>

        <button
          onClick={() => setCategoryFilter('HAULAGE_TRANSPORT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            categoryFilter === 'HAULAGE_TRANSPORT'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#121927] text-slate-400 hover:text-white border border-[#1E293B]'
          }`}
        >
          Haulage & Transport (Tippers/Tankers)
        </button>
      </div>

      {/* 3. Search & Status Filter */}
      <div className="p-3 rounded-2xl bg-[#0D111D] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-amber-500 font-semibold cursor-pointer"
        >
          <option value="ALL">All Operational Statuses</option>
          <option value="ACTIVE">Active / Operational</option>
          <option value="MAINTENANCE">In Maintenance / Breakdown</option>
          <option value="IDLE">Idle / Standby</option>
        </select>

        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search code, plate, operator, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-xs text-white outline-none focus:border-amber-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* 4. Fleet Grid with Delete Buttons */}
      {filteredFleet.length === 0 ? (
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <Truck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <div className="text-sm font-bold text-slate-300">No machinery or equipment in registry.</div>
          <div className="text-xs">Click <strong>+ Register Machine / Tipper</strong> above to add units.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFleet.map((machine) => (
            <div
              key={machine.id}
              className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] hover:border-[#2d416b] transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-black text-xs border border-amber-500/30">
                      {machine.code}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-semibold">
                      {machine.registrationNumber || machine.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        machine.status === 'ACTIVE'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : machine.status === 'MAINTENANCE'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {machine.status === 'ACTIVE' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                      {machine.status}
                    </span>

                    {/* Top Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(machine.id, machine.name, machine.code)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
                      title="Delete Machine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-black text-white leading-snug">
                  {machine.name}
                </h3>
                <div className="text-xs text-slate-400 mt-1">
                  Heavy Commercial Spec •{' '}
                  <span className="text-amber-400 font-semibold">
                    {machine.ownershipType === 'COMPANY_OWNED' ? 'Company Owned' : `Rented (₹${machine.rentalHourlyRateINR || 0}/hr)`}
                  </span>
                </div>
              </div>

              {/* Metrics Box */}
              <div className="p-3.5 bg-[#070c18] border border-[#182643] rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Hour-meter (HMR):
                  </span>
                  <span className="font-mono font-bold text-white">
                    {(machine.currentHMR || 0).toLocaleString()} hrs
                  </span>
                </div>

                {machine.currentKMR !== undefined && machine.currentKMR > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      Odometer (KMR):
                    </span>
                    <span className="font-mono font-bold text-white">
                      {machine.currentKMR.toLocaleString()} km
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    Avg Benchmark:
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {machine.averageConsumptionBenchmark || 0} {machine.benchmarkUnit || 'L/hr'}
                  </span>
                </div>

                {machine.currentLocation && (
                  <div className="text-[11px] text-slate-400 pt-1.5 border-t border-[#182643] truncate flex items-center gap-1">
                    <span className="text-rose-400">📍</span>
                    <span>{machine.currentLocation}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Operator + Update Meter + Delete Button */}
              <div className="pt-2 border-t border-[#182643] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[#162032] border border-[#1e2d4a] flex items-center justify-center text-slate-400 shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-200 text-xs truncate">
                      {machine.assignedOperator || 'Unassigned Operator'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      +91 90000 00000
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    className="px-2.5 py-1.5 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-cyan-400" />
                    <span>Update Meter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(machine.id, machine.name, machine.code)}
                    className="p-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 hover:border-rose-500 text-rose-400 transition-colors cursor-pointer"
                    title="Delete Machine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Register Machine Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Truck className="w-5 h-5 text-amber-400" />
                <span>Register Machine / Fleet Equipment</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMachine} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Machine Code <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EX-01 or TP-05"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold uppercase outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Registration / Plate No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KA-28-EX-8901"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold uppercase outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Machine Model / Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT 320D Heavy Crawler Excavator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Category <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="EARTHMOVING_EXCAVATION">Earthmoving & Excavation</option>
                    <option value="COMPACTION_PAVING">Compaction & Paving</option>
                    <option value="HAULAGE_TRANSPORT">Haulage & Transport</option>
                    <option value="CRUSHING_CONCRETE">Crushing & Concrete</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Ownership Type
                  </label>
                  <select
                    value={formData.ownershipType}
                    onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="COMPANY_OWNED">Company Owned</option>
                    <option value="RENTED">Rented / Hired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Current HMR (Hrs)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.currentHMR}
                    onChange={(e) => setFormData({ ...formData, currentHMR: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Benchmark Rate
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.averageConsumptionBenchmark}
                    onChange={(e) => setFormData({ ...formData, averageConsumptionBenchmark: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.benchmarkUnit}
                    onChange={(e) => setFormData({ ...formData, benchmarkUnit: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="L/hr">L/hr</option>
                    <option value="km/L">km/L</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Assigned Operator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patil"
                    value={formData.assignedOperator}
                    onChange={(e) => setFormData({ ...formData, assignedOperator: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Location / Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quarry Site / Ch. 12+400"
                    value={formData.currentLocation}
                    onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

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
                  Save Equipment
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
