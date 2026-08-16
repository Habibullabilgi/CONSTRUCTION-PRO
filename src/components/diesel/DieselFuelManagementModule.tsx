import React, { useState, useMemo } from 'react';
import { useRoadERP } from '../../context/RoadERPContext';
import { FuelDispenseLog, FuelSourceType } from '../../types/roadERP';
import {
  Fuel,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  Filter,
  Search
} from 'lucide-react';

const FUEL_SOURCES: { id: FuelSourceType; label: string; rate: number }[] = [
  { id: 'SITE_BOWSER_1', label: 'Site Mobile Fuel Bowser #1 (6000L)', rate: 92.5 },
  { id: 'SITE_BOWSER_2', label: 'Site Mobile Fuel Bowser #2 (4000L)', rate: 92.5 },
  { id: 'SITE_STATIC_TANK_20KL', label: 'Base Camp Static Storage Tank (20,000L)', rate: 91.8 },
  { id: 'IOCL_HIGHWAY_PUMP', label: 'IOCL Highway Commercial Pump', rate: 92.8 },
  { id: 'HPCL_COMMERCIAL_OUTLET', label: 'HPCL Commercial Fuel Outlet', rate: 92.8 }
];

export const DieselFuelManagementModule: React.FC = () => {
  const { fuelLogs, addFuelLog, deleteFuelLog, machines, kpis } = useRoadERP();

  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [spikeFilter, setSpikeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Refuel Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formTime, setFormTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [formMachineId, setFormMachineId] = useState(machines[0]?.id || '');
  const [formFuelSource, setFormFuelSource] = useState<FuelSourceType>('SITE_BOWSER_1');
  const [formLitres, setFormLitres] = useState<number | ''>(100);
  const [formRatePerLitre, setFormRatePerLitre] = useState<number | ''>(92.5);
  const [formPrevMeter, setFormPrevMeter] = useState<number>(0);
  const [formCurrMeter, setFormCurrMeter] = useState<number>(0);
  const [formMeterType, setFormMeterType] = useState<'HMR_HOURS' | 'KMR_ODOMETER'>('HMR_HOURS');
  const [formDispensedBy, setFormDispensedBy] = useState('Yallappa (Bowser Operator)');
  const [formNotes, setFormNotes] = useState('');

  // Selected Machine details for auto meter filling
  const selectedMachine = machines.find((m) => m.id === formMachineId);

  // When selected machine changes, update default meters
  const handleSelectMachine = (mId: string) => {
    setFormMachineId(mId);
    const target = machines.find((m) => m.id === mId);
    if (target) {
      if (target.benchmarkUnit === 'km/L') {
        setFormMeterType('KMR_ODOMETER');
        setFormPrevMeter(target.currentKMR);
        setFormCurrMeter(target.currentKMR + 150);
      } else {
        setFormMeterType('HMR_HOURS');
        setFormPrevMeter(target.currentHMR);
        setFormCurrMeter(Number((target.currentHMR + 8.5).toFixed(1)));
      }
    }
  };

  // Real-time live SFC math in modal
  const liveSFC = useMemo(() => {
    const litres = typeof formLitres === 'number' ? formLitres : 0;
    const diff = Math.max(0.1, formCurrMeter - formPrevMeter);
    const benchmark = selectedMachine?.averageConsumptionBenchmark || 15.0;

    let sfc = 0;
    let isSpike = false;
    let devPct = 0;

    if (formMeterType === 'HMR_HOURS') {
      sfc = Number((litres / diff).toFixed(2));
      if (benchmark > 0 && sfc > benchmark * 1.25) {
        isSpike = true;
        devPct = Number((((sfc - benchmark) / benchmark) * 100).toFixed(1));
      }
    } else {
      sfc = Number((diff / litres).toFixed(2));
      if (benchmark > 0 && sfc < benchmark * 0.75) {
        isSpike = true;
        devPct = Number((((benchmark - sfc) / benchmark) * 100).toFixed(1));
      }
    }

    return {
      runDiff: diff,
      sfc,
      isSpike,
      devPct,
      benchmark,
      totalCost: litres * (typeof formRatePerLitre === 'number' ? formRatePerLitre : 92.5)
    };
  }, [formLitres, formCurrMeter, formPrevMeter, formMeterType, selectedMachine, formRatePerLitre]);

  // Filtered Fuel Logs
  const filteredLogs = useMemo(() => {
    return fuelLogs.filter((log) => {
      const matchSrc = sourceFilter === 'ALL' || log.fuelSource === sourceFilter;
      const matchSpike =
        spikeFilter === 'ALL' ||
        (spikeFilter === 'SPIKE_ONLY' && log.isAbnormalSpike) ||
        (spikeFilter === 'NORMAL_ONLY' && !log.isAbnormalSpike);
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        log.machineCode.toLowerCase().includes(q) ||
        log.machineName.toLowerCase().includes(q) ||
        log.voucherChallanNo.toLowerCase().includes(q) ||
        log.dispensedBy.toLowerCase().includes(q);
      return matchSrc && matchSpike && matchSearch;
    });
  }, [fuelLogs, sourceFilter, spikeFilter, searchTerm]);

  // Submit Fuel Dispense
  const handleCreateFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMachineId || !formLitres) return;

    const target = machines.find((m) => m.id === formMachineId);
    if (!target) return;

    addFuelLog({
      timestamp: `${formDate} ${formTime}`,
      date: formDate,
      machineId: target.id,
      machineCode: target.code,
      machineName: target.name,
      fuelSource: formFuelSource,
      litresDispensed: Number(formLitres),
      ratePerLitre: Number(formRatePerLitre) || 92.5,
      meterType: formMeterType,
      previousMeterReading: formPrevMeter,
      currentMeterReading: formCurrMeter,
      benchmarkConsumption: target.averageConsumptionBenchmark,
      dispensedBy: formDispensedBy,
      approvedBy: 'Habibulla Bilgi',
      notes: formNotes.trim() || undefined
    });

    setIsAddModalOpen(false);
    setFormNotes('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Voucher #',
      'Timestamp',
      'Machine Code',
      'Machine Name',
      'Fuel Source',
      'Litres Dispensed',
      'Rate/Litre',
      'Total Cost (INR)',
      'Meter Type',
      'Prev Meter',
      'Curr Meter',
      'Run Delta',
      'Specific Fuel Consumption',
      'Benchmark',
      'Abnormal Spike Alert',
      'Dispensed By'
    ];

    const rows = filteredLogs.map((f) => [
      f.voucherChallanNo,
      f.timestamp,
      f.machineCode,
      `"${f.machineName}"`,
      f.fuelSource,
      f.litresDispensed,
      f.ratePerLitre,
      f.totalCost,
      f.meterType,
      f.previousMeterReading,
      f.currentMeterReading,
      f.runDifference,
      f.specificFuelConsumption,
      f.benchmarkConsumption,
      f.isAbnormalSpike ? `YES (+${f.spikeDeviationPercentage}%)` : 'NO',
      `"${f.dispensedBy}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Diesel_Fuel_Dispensation_Log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#1b2845] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Diesel
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Fuel Logs
                </span>
                {kpis.flaggedFuelAnomaliesCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> {kpis.flaggedFuelAnomaliesCount} Pilferage Spike Flagged
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Bowser and static tank dispensing logs, meter readings, and machine fuel consumption.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (machines[0]) handleSelectMachine(machines[0].id);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record Refueling Voucher</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Statement</span>
            </button>
          </div>
        </div>

        {/* Mini KPI Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#182643]">
          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Total Fuel Dispensed</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {kpis.totalFuelBurnedLitresToday.toLocaleString()} <span className="text-xs font-sans text-slate-400">Litres</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Total Diesel Cost</div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              ₹{kpis.totalFuelCostINR.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Bowser #1 Level</div>
            <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
              3,850 <span className="text-xs font-sans text-slate-400">/ 6,000L</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Pilferage Alerts</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {kpis.flaggedFuelAnomaliesCount} <span className="text-xs font-sans text-slate-400">Deviations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-[#070c18] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Fuel Sources</option>
              {FUEL_SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Spike Filter */}
          <div className="flex items-center gap-1 bg-[#070c18] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <select
              value={spikeFilter}
              onChange={(e) => setSpikeFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Consumption Logs</option>
              <option value="SPIKE_ONLY">⚠️ Flagged Spikes Only</option>
              <option value="NORMAL_ONLY">✓ Normal Benchmark Range</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search voucher, machine, operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#070c18] border border-[#1e2d4a] rounded-xl text-xs text-white outline-none w-full sm:w-64 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Fuel Ledger Table */}
      <div className="rounded-3xl bg-[#0c1427] border border-[#1b2845] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0e172e] text-slate-400 font-semibold border-b border-[#182643]">
              <tr>
                <th className="py-3 px-4">VOUCHER & TIMESTAMP</th>
                <th className="py-3 px-4">MACHINE & OPERATOR</th>
                <th className="py-3 px-4">FUEL SOURCE</th>
                <th className="py-3 px-3 text-right">LITRES</th>
                <th className="py-3 px-3 text-right">AMOUNT (₹)</th>
                <th className="py-3 px-4">METER VERIFICATION (HMR/KMR)</th>
                <th className="py-3 px-3 text-center">EFFICIENCY (SFC)</th>
                <th className="py-3 px-3 text-center">PILFERAGE STATUS</th>
                <th className="py-3 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15223c] text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No diesel refueling logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-[#0f1c38] transition-colors ${
                      log.isAbnormalSpike ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Voucher & Timestamp */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-amber-400">{log.voucherChallanNo}</div>
                      <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                    </td>

                    {/* Machine */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px]">
                          {log.machineCode}
                        </span>
                        <span>{log.machineName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Dispensed by: {log.dispensedBy}
                      </div>
                    </td>

                    {/* Fuel Source */}
                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.fuelSource.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Litres */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-sm">
                      {log.litresDispensed} L
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-amber-400 text-sm">
                      ₹{log.totalCost.toLocaleString('en-IN')}
                      <div className="text-[10px] text-slate-500 font-normal">
                        @ ₹{log.ratePerLitre}/L
                      </div>
                    </td>

                    {/* Meter Verification */}
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="text-slate-300">
                        {log.previousMeterReading} → <strong className="text-white">{log.currentMeterReading}</strong>
                      </div>
                      <div className="text-[10px] text-cyan-400">
                        Delta Run: +{log.runDifference} {log.meterType === 'HMR_HOURS' ? 'Hours' : 'Kms'}
                      </div>
                    </td>

                    {/* SFC Efficiency */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span
                        className={`${
                          log.isAbnormalSpike ? 'text-rose-400 text-sm' : 'text-emerald-400'
                        }`}
                      >
                        {log.specificFuelConsumption}{' '}
                        {log.meterType === 'HMR_HOURS' ? 'L/hr' : 'km/L'}
                      </span>
                      <div className="text-[10px] text-slate-500">
                        Target: {log.benchmarkConsumption}
                      </div>
                    </td>

                    {/* Spike Status */}
                    <td className="py-3 px-3 text-center">
                      {log.isAbnormalSpike ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>SPIKE +{log.spikeDeviationPercentage}%</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>VERIFIED</span>
                        </span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => deleteFuelLog(log.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
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

      {/* RECORD REFUELING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-500" />
                <span>Record Diesel Refueling Voucher</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFuelLog} className="space-y-3.5 text-xs">
              {/* Machine Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Machine / Fleet Equipment *
                </label>
                <select
                  value={formMachineId}
                  onChange={(e) => handleSelectMachine(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none cursor-pointer"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {m.name} — ({m.assignedOperator})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel Source & Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fuel Source *
                  </label>
                  <select
                    value={formFuelSource}
                    onChange={(e) => {
                      const s = e.target.value as FuelSourceType;
                      setFormFuelSource(s);
                      const opt = FUEL_SOURCES.find((f) => f.id === s);
                      if (opt) setFormRatePerLitre(opt.rate);
                    }}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none cursor-pointer"
                  >
                    {FUEL_SOURCES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rate per Litre (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formRatePerLitre}
                    onChange={(e) =>
                      setFormRatePerLitre(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Litres Dispensed */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Litres Dispensed (Flow Meter) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formLitres}
                    onChange={(e) =>
                      setFormLitres(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-black text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Total Voucher Cost
                  </label>
                  <div className="text-base font-black text-white font-mono pt-2">
                    ₹{liveSFC.totalCost.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Meter Verification Section */}
              <div className="p-3.5 bg-[#070c18] rounded-2xl border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mandatory Meter Verification ({formMeterType === 'HMR_HOURS' ? 'Hours' : 'Kilometers'})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Anti-Theft Protocol</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-semibold mb-1">
                      Previous Reading ({formMeterType === 'HMR_HOURS' ? 'HMR' : 'KMR'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formPrevMeter}
                      onChange={(e) => setFormPrevMeter(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-[#0c1427] border border-[#1b2845] rounded-xl text-slate-300 font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-semibold mb-1">
                      Current Reading ({formMeterType === 'HMR_HOURS' ? 'HMR' : 'KMR'}) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formCurrMeter}
                      onChange={(e) => setFormCurrMeter(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-[#0c1427] border border-[#1b2845] rounded-xl text-cyan-400 font-mono font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Real-time Calculated SFC & Spike Warning */}
                <div className="p-2 bg-[#0c1427] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Run Delta: </span>
                    <strong className="text-white font-mono">+{liveSFC.runDiff} {formMeterType === 'HMR_HOURS' ? 'hrs' : 'km'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">SFC: </span>
                    <strong className={`font-mono font-black ${liveSFC.isSpike ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {liveSFC.sfc} {formMeterType === 'HMR_HOURS' ? 'L/hr' : 'km/L'}
                    </strong>
                  </div>
                </div>

                {liveSFC.isSpike && (
                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      WARNING: Fuel burn exceeds benchmark by +{liveSFC.devPct}%. Anomaly reason required.
                    </span>
                  </div>
                )}
              </div>

              {/* Dispensed By & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Dispensed By (Bowser Operator) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDispensedBy}
                    onChange={(e) => setFormDispensedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Remarks / Site Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Refueled at Ch. 12+400 base"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#182643]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save & Lock Fuel Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
