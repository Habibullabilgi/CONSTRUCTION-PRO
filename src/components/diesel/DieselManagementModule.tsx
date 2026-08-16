import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { DieselLog } from '../../types/erp';
import {
  Fuel,
  Plus,
  Search,
  Truck,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Receipt,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const DieselManagementModule: React.FC = () => {
  const { dieselLogs, addDieselLog, currentProject, currentSite } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Diesel Entry Form
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [fuelSource, setFuelSource] = useState<DieselLog['fuelSource']>('Site Diesel Bowser #1 (5000L)');
  const [equipmentOrVehicle, setEquipmentOrVehicle] = useState('CAT 320D Excavator');
  const [vehicleNumber, setVehicleNumber] = useState('EX-02');
  const [startMeterHoursOrKm, setStartMeter] = useState<number>(3482.0);
  const [endMeterHoursOrKm, setEndMeter] = useState<number>(3490.5);
  const [litresDispensed, setLitresDispensed] = useState<number>(140);
  const [ratePerLitre, setRatePerLitre] = useState<number>(91.50);
  const [dispensedBy, setDispensedBy] = useState('Raju Yadav (Fuel Bowser Incharge)');
  const [receiptOrSlipNumber, setReceiptOrSlipNumber] = useState('DSL-SLIP-408');
  const [activity, setActivity] = useState('Subgrade Excavation & Loading');

  // Automatic calculation
  const totalAmount = Number((litresDispensed * ratePerLitre).toFixed(2));
  const runDiff = endMeterHoursOrKm - startMeterHoursOrKm;
  const calculatedEfficiency = runDiff > 0 ? Number((litresDispensed / runDiff).toFixed(2)) : 0; // L/hr

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDieselLog({
      date,
      projectId: currentProject?.id || 'proj-road-1',
      siteId: currentSite?.id || 'site-road-1',
      fuelSource,
      equipmentOrVehicle,
      vehicleNumber,
      startMeterHoursOrKm: Number(startMeterHoursOrKm),
      endMeterHoursOrKm: Number(endMeterHoursOrKm),
      litresDispensed: Number(litresDispensed),
      ratePerLitre: Number(ratePerLitre),
      totalAmount,
      calculatedEfficiency: `${calculatedEfficiency} L/hr`,
      dispensedBy,
      receiptOrSlipNumber,
      activity
    });

    setIsModalOpen(false);
  };

  const filteredLogs = dieselLogs.filter(
    (d) =>
      d.equipmentOrVehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.receiptOrSlipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fuelSource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLitres = filteredLogs.reduce((sum, d) => sum + d.litresDispensed, 0);
  const totalCost = filteredLogs.reduce((sum, d) => sum + d.totalAmount, 0);
  const avgRate = totalLitres > 0 ? totalCost / totalLitres : 91.50;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              FUEL TELEMETRY & COST CONTROL
            </span>
            <span className="text-xs text-slate-400">High-Speed Diesel (HSD) Ledger</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Diesel, Bowser & Fuel Efficiency Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track daily dispenser logs for heavy machinery, tippers, generators, and bowsers with L/hr & km/L consumption auditing.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Dispense Diesel / Add Log
        </button>
      </div>

      {/* FUEL STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Diesel Dispensed</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {totalLitres.toLocaleString()} <span className="text-xs font-normal text-slate-400">Litres</span>
          </div>
          <span className="text-xs text-slate-400">
            Across {filteredLogs.length} logged sessions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Fuel Expenditure</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-xs text-slate-400">
            Avg Rate: ₹{avgRate.toFixed(2)} / Litre
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Site Bowser Remaining</span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
            3,480 <span className="text-xs font-normal text-slate-400">Litres</span>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            69.6% Tank Capacity (5000L)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Fuel Consumption Status</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono my-1">
            Optimal (98.2%)
          </div>
          <span className="text-xs text-slate-400">
            No pilferage / siphoning detected
          </span>
        </div>
      </div>

      {/* DIESEL LOGS TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Fuel className="h-4 w-4 text-amber-400" />
            Diesel Fuel Logs & Efficiency Breakdown
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search equipment, slip#, vehicle#..."
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
                <th className="py-3 px-3">Date & Slip #</th>
                <th className="py-3 px-3">Equipment / Vehicle</th>
                <th className="py-3 px-3">Fuel Source</th>
                <th className="py-3 px-3">Hour / Km Meter</th>
                <th className="py-3 px-3">Litres Dispensed</th>
                <th className="py-3 px-3">Fuel Cost</th>
                <th className="py-3 px-3">Burn Rate / Eff.</th>
                <th className="py-3 px-3 text-right">Incharge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-white block">{log.receiptOrSlipNumber}</span>
                    <span className="text-[10px] text-slate-400">{log.date}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-amber-300 block">{log.equipmentOrVehicle}</span>
                    <span className="text-[10px] font-mono text-slate-400">Reg: {log.vehicleNumber}</span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 text-[11px]">
                    {log.fuelSource}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    <div>Start: {log.startMeterHoursOrKm}</div>
                    <div>End: {log.endMeterHoursOrKm} (Run: {(log.endMeterHoursOrKm - log.startMeterHoursOrKm).toFixed(1)})</div>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {log.litresDispensed} <span className="text-[10px] text-slate-400 font-normal">Litres</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-bold text-emerald-400 block">₹{log.totalAmount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">@ ₹{log.ratePerLitre}/L</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {log.calculatedEfficiency}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right text-slate-400 text-[11px]">
                    {log.dispensedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fuel className="h-4 w-4 text-amber-400" />
              Dispense Fuel & Record Meter Reading
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
                  <label className="block text-slate-300 font-semibold mb-1">Fuel Source / Bowser</label>
                  <select
                    value={fuelSource}
                    onChange={(e) => setFuelSource(e.target.value as DieselLog['fuelSource'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Site Diesel Bowser #1 (5000L)">Site Diesel Bowser #1 (5000L)</option>
                    <option value="Main Yard Tank (20000L)">Main Yard Tank (20000L)</option>
                    <option value="Indian Oil Highway Pump (Retail)">Indian Oil Highway Pump (Retail)</option>
                    <option value="Bharat Petroleum Outpost">Bharat Petroleum Outpost</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Equipment / Vehicle *</label>
                  <input
                    type="text"
                    required
                    value={equipmentOrVehicle}
                    onChange={(e) => setEquipmentOrVehicle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle / Reg # *</label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Meter (Hrs / Km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={startMeterHoursOrKm}
                    onChange={(e) => setStartMeter(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Meter (Hrs / Km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={endMeterHoursOrKm}
                    onChange={(e) => setEndMeter(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Litres Dispensed *</label>
                  <input
                    type="number"
                    required
                    value={litresDispensed}
                    onChange={(e) => setLitresDispensed(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Diesel Rate (₹ / L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ratePerLitre}
                    onChange={(e) => setRatePerLitre(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Receipt / Slip # *</label>
                  <input
                    type="text"
                    required
                    value={receiptOrSlipNumber}
                    onChange={(e) => setReceiptOrSlipNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dispenser Incharge *</label>
                  <input
                    type="text"
                    required
                    value={dispensedBy}
                    onChange={(e) => setDispensedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400">Total Fuel Cost:</span>
                <span className="font-bold text-amber-400 text-sm">
                  ₹{totalAmount.toLocaleString()} ({calculatedEfficiency} L/hr efficiency)
                </span>
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
                  Save Diesel Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
