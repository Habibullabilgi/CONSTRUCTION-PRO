import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { MachineryLog } from '../../types/erp';
import {
  Tractor,
  Plus,
  Search,
  Clock,
  Activity,
  DollarSign,
  Fuel,
  CheckCircle2,
  Wrench,
  AlertCircle
} from 'lucide-react';

export const MachineryFleetModule: React.FC = () => {
  const { machineryLogs, addMachineryLog, currentProject, currentSite } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [machineryName, setMachineryName] = useState('CAT 320D Hydraulic Excavator');
  const [machineryType, setMachineryType] = useState<MachineryLog['machineryType']>('Excavator');
  const [registrationOrAssetCode, setRegistrationOrAssetCode] = useState('EXC-CAT-01');
  const [operatorName, setOperatorName] = useState('Dharmendra Yadav');
  const [ownership, setOwnership] = useState<MachineryLog['ownership']>('Company Owned');
  const [vendorName, setVendorName] = useState('');
  const [startHourMeter, setStartHourMeter] = useState<number>(3482.0);
  const [endHourMeter, setEndHourMeter] = useState<number>(3490.5);
  const [idleHours, setIdleHours] = useState<number>(0.5);
  const [breakdownHours, setBreakdownHours] = useState<number>(0.0);
  const [ratePerHour, setRatePerHour] = useState<number>(2400);
  const [dieselConsumedLitres, setDieselConsumedLitres] = useState<number>(140);
  const [activityOrLocation, setActivityOrLocation] = useState('Embankment Earth Cutting Km 124+000');

  // Automatic calculations
  const rawOperatingHours = Math.max(0, endHourMeter - startHourMeter);
  const netEffectiveHours = Math.max(0, rawOperatingHours - idleHours - breakdownHours);
  const totalCost = Number((rawOperatingHours * ratePerHour).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMachineryLog({
      date,
      projectId: currentProject?.id || 'proj-road-1',
      siteId: currentSite?.id || 'site-road-1',
      machineryName,
      machineryType,
      registrationOrAssetCode,
      operatorName,
      ownership,
      vendorName: ownership === 'Rental' ? vendorName : undefined,
      startHourMeter: Number(startHourMeter),
      endHourMeter: Number(endHourMeter),
      operatingHours: Number(rawOperatingHours),
      idleHours: Number(idleHours),
      breakdownHours: Number(breakdownHours),
      ratePerHour: Number(ratePerHour),
      totalCost,
      dieselConsumedLitres: Number(dieselConsumedLitres),
      activityOrLocation
    });

    setIsModalOpen(false);
  };

  const filteredLogs = machineryLogs.filter(
    (m) =>
      m.machineryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.registrationOrAssetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machineryType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOperatingHours = filteredLogs.reduce((sum, m) => sum + m.operatingHours, 0);
  const totalMachineryCost = filteredLogs.reduce((sum, m) => sum + m.totalCost, 0);
  const totalDieselConsumed = filteredLogs.reduce((sum, m) => sum + m.dieselConsumedLitres, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              FLEET & ASSET TELEMETRY
            </span>
            <span className="text-xs text-slate-400">Hour Meter & Utilization Logging</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Machinery & Heavy Equipment Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formula: Operating Hours = End Meter - Start Meter • Direct allocation of hourly rates, operator wages, and fuel burn.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Log Equipment Shift
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Shift Hours</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {totalOperatingHours.toFixed(1)} <span className="text-xs font-normal text-slate-400">Hrs</span>
          </div>
          <span className="text-xs text-slate-400">
            Across {filteredLogs.length} fleet sessions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Machinery Equipment Cost</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            ₹{totalMachineryCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-xs text-slate-400">
            Avg: ₹{(totalMachineryCost / (totalOperatingHours || 1)).toFixed(0)} / Operating Hr
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Diesel Consumed</span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
            {totalDieselConsumed} <span className="text-xs font-normal text-slate-400">Litres</span>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            Avg: {(totalDieselConsumed / (totalOperatingHours || 1)).toFixed(1)} L/hr
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Fleet Uptime</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono my-1">
            96.4%
          </div>
          <span className="text-xs text-slate-400">
            Low breakdown & idle percentage
          </span>
        </div>
      </div>

      {/* MACHINERY LOGS TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Tractor className="h-4 w-4 text-amber-400" />
            Heavy Fleet Daily Shift Logs
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search machinery, asset code, operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Date & Asset Code</th>
                <th className="py-3 px-3">Machinery / Model</th>
                <th className="py-3 px-3">Operator & Type</th>
                <th className="py-3 px-3">Hour Meter (Start → End)</th>
                <th className="py-3 px-3">Run Hours</th>
                <th className="py-3 px-3">Rate & Daily Cost</th>
                <th className="py-3 px-3">Diesel (L)</th>
                <th className="py-3 px-3 text-right">Location / Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-amber-300 block">{log.registrationOrAssetCode}</span>
                    <span className="text-[10px] text-slate-400">{log.date}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-white block">{log.machineryName}</span>
                    <span className="text-[10px] text-slate-400">
                      {log.ownership} {log.vendorName ? `(${log.vendorName})` : ''}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-slate-200 block">{log.operatorName}</span>
                    <span className="text-[10px] text-cyan-400">{log.machineryType}</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {log.startHourMeter.toFixed(1)} → {log.endHourMeter.toFixed(1)}
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-bold text-white block">{log.operatingHours.toFixed(1)} Hrs</span>
                    {(log.idleHours > 0 || log.breakdownHours > 0) && (
                      <span className="text-[10px] text-rose-400">
                        Idle: {log.idleHours}h • BD: {log.breakdownHours}h
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-bold text-emerald-400 block">₹{log.totalCost.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">@ ₹{log.ratePerHour}/hr</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-cyan-300">
                    {log.dieselConsumedLitres} L
                  </td>

                  <td className="py-3.5 px-3 text-right text-slate-300 text-[11px] line-clamp-1 max-w-[200px]">
                    {log.activityOrLocation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE LOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tractor className="h-4 w-4 text-amber-400" />
              Log Machinery Shift & Hour Meter
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Machinery Category</label>
                  <select
                    value={machineryType}
                    onChange={(e) => setMachineryType(e.target.value as MachineryLog['machineryType'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="JCB Backhoe Loader">JCB Backhoe Loader</option>
                    <option value="Excavator">Hydraulic Excavator</option>
                    <option value="Tandem Roller">Tandem Roller</option>
                    <option value="Soil Compactor">Soil Compactor</option>
                    <option value="Motor Grader">Motor Grader</option>
                    <option value="Asphalt Paver">Asphalt Paver</option>
                    <option value="Concrete Boom Pump">Concrete Boom Pump</option>
                    <option value="Tower Crane">Tower Crane</option>
                    <option value="Water Tanker">Water Tanker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={machineryName}
                    onChange={(e) => setMachineryName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Asset Code / Reg # *</label>
                  <input
                    type="text"
                    required
                    value={registrationOrAssetCode}
                    onChange={(e) => setRegistrationOrAssetCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Operator Name *</label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ownership</label>
                  <select
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value as MachineryLog['ownership'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Company Owned">Company Owned</option>
                    <option value="Rental">Rental / Vendor</option>
                  </select>
                </div>
              </div>

              {/* Meter Readings */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Hour Meter Readings
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Start Hour Meter</label>
                    <input
                      type="number"
                      step="0.1"
                      value={startHourMeter}
                      onChange={(e) => setStartHourMeter(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">End Hour Meter</label>
                    <input
                      type="number"
                      step="0.1"
                      value={endHourMeter}
                      onChange={(e) => setEndHourMeter(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      value={ratePerHour}
                      onChange={(e) => setRatePerHour(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-slate-400 mb-1">Idle Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      value={idleHours}
                      onChange={(e) => setIdleHours(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Breakdown (Hrs)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={breakdownHours}
                      onChange={(e) => setBreakdownHours(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Diesel Consumed (L)</label>
                    <input
                      type="number"
                      value={dieselConsumedLitres}
                      onChange={(e) => setDieselConsumedLitres(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">Total Shift Cost:</span>
                  <span className="font-bold text-amber-400">
                    ₹{totalCost.toLocaleString()} ({rawOperatingHours.toFixed(1)} Hrs run)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location & Task Activity</label>
                <input
                  type="text"
                  value={activityOrLocation}
                  onChange={(e) => setActivityOrLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Shift Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
