import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Truck,
  Fuel,
  Tractor,
  Users,
  Ruler,
  Camera,
  CheckCircle2,
  ArrowLeft,
  Plus,
  MapPin,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface Props {
  onCloseMobileMode: () => void;
  onNavigateTab: (tab: string) => void;
}

export const MobileQuickActionsView: React.FC<Props> = ({ onCloseMobileMode, onNavigateTab }) => {
  const {
    currentProject,
    currentSite,
    addVehicleTrip,
    addDieselLog,
    addMachineryLog,
    workers,
    addAttendanceRecord,
    workType
  } = useERP();

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Trip form state
  const [quickTripVehicle, setQuickTripVehicle] = useState('MH-12-TR-9081');
  const [quickTripQty, setQuickTripQty] = useState(16);
  const [quickTripMaterial, setQuickTripMaterial] = useState('GSB Crushed Stone Aggregate');
  const [quickTripLocation, setQuickTripLocation] = useState('Km 122+500 RHS');

  // Quick Diesel form state
  const [quickDieselVehicle, setQuickDieselVehicle] = useState('JCB 3DX (MH-12-JC-4411)');
  const [quickDieselLitres, setQuickDieselLitres] = useState(65);
  const [quickDieselRate, setQuickDieselRate] = useState(94.5);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleQuickTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicleTrip({
      date: new Date().toISOString().substring(0, 10),
      workType: workType || 'ROAD',
      projectId: currentProject?.id || 'proj-road-1',
      siteId: currentSite?.id || 'site-road-1',
      tripNumber: 'Q-TRIP-' + Math.floor(1000 + Math.random() * 9000),
      vehicleNumber: quickTripVehicle,
      vehicleType: 'Tipper 10-Tyre',
      driverName: 'Site Driver (Mobile Quick Log)',
      ownership: 'Company Owned',
      materialName: quickTripMaterial,
      sourceLocation: 'Quarry / Crusher Plant #1',
      destinationLocation: quickTripLocation,
      chainageOrFloor: quickTripLocation,
      activity: 'Direct Unloading',
      vehicleCapacityTonnesOrM3: 16,
      actualLoadedQty: Number(quickTripQty),
      unit: 'Tonnes',
      ratePerUnitOrTrip: 450,
      totalAmount: Number(quickTripQty) * 450,
      challanNumber: 'CH-MOB-' + Math.floor(100 + Math.random() * 900),
      approvalStatus: 'APPROVED'
    });
    setActiveAction(null);
    showSuccess('Tipper trip logged successfully with GPS timestamp!');
  };

  const handleQuickDieselSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDieselLog({
      date: new Date().toISOString().substring(0, 10),
      projectId: currentProject?.id || 'proj-road-1',
      siteId: currentSite?.id || 'site-road-1',
      vehicleOrMachineName: quickDieselVehicle,
      registrationNumber: 'MH-12-JC-4411',
      category: 'JCB/Excavator',
      operatorOrDriver: 'Site Operator',
      fuelStation: 'Site Mobile Diesel Bowser',
      litresDispensed: Number(quickDieselLitres),
      ratePerLitre: Number(quickDieselRate),
      totalAmount: Number(quickDieselLitres) * Number(quickDieselRate),
      currentMeterOrKmReading: 4820,
      billNumber: 'MOB-DSL-' + Math.floor(1000 + Math.random() * 9000),
      approvalStatus: 'APPROVED'
    });
    setActiveAction(null);
    showSuccess('Diesel fueling record posted & deducted from stock!');
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-16 px-2">
      {/* Top Mobile Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📱</span>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100">
              FIELD SUPERVISOR MODE
            </div>
            <div className="text-sm font-black">
              1-Tap Quick Site Logger
            </div>
          </div>
        </div>

        <button
          onClick={onCloseMobileMode}
          className="px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Mobile</span>
        </button>
      </div>

      {/* Active Site Indicator */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Working Project</span>
          <span className="text-white font-bold">{currentProject?.name}</span>
        </div>
        <span className="font-mono text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
          {currentSite?.name || 'Package 1'}
        </span>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* QUICK 1-TAP ACTION GRID */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveAction('TRIP')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border-2 border-amber-500/40 hover:border-amber-500 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Truck className="h-5 w-5" />
            </span>
            <Plus className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Log Tipper Trip</div>
            <div className="text-[10px] text-slate-400">Record arriving load</div>
          </div>
        </button>

        <button
          onClick={() => setActiveAction('DIESEL')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border-2 border-rose-500/40 hover:border-rose-500 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Fuel className="h-5 w-5" />
            </span>
            <Plus className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Log Fuel / Diesel</div>
            <div className="text-[10px] text-slate-400">From bowser to vehicle</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('labour')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border-2 border-emerald-500/40 hover:border-emerald-500 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Users className="h-5 w-5" />
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400">
              {workers.length} Staff
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-white">Attendance Muster</div>
            <div className="text-[10px] text-slate-400">Mark workers present</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('mb')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border-2 border-cyan-500/40 hover:border-cyan-500 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Ruler className="h-5 w-5" />
            </span>
            <Plus className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Record MB Entry</div>
            <div className="text-[10px] text-slate-400">L × W × D measurements</div>
          </div>
        </button>
      </div>

      {/* QUICK FORM POPUPS */}
      {activeAction === 'TRIP' && (
        <div className="p-5 rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-400" />
              1-Tap Tipper Trip Entry
            </h4>
            <button onClick={() => setActiveAction(null)} className="text-slate-400 hover:text-white text-xs">
              Cancel
            </button>
          </div>

          <form onSubmit={handleQuickTripSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Vehicle Plate #</label>
              <input
                type="text"
                required
                value={quickTripVehicle}
                onChange={(e) => setQuickTripVehicle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Material</label>
                <input
                  type="text"
                  required
                  value={quickTripMaterial}
                  onChange={(e) => setQuickTripMaterial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Qty (Tonnes)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={quickTripQty}
                  onChange={(e) => setQuickTripQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Dump Location / Chainage / Floor</label>
              <input
                type="text"
                required
                value={quickTripLocation}
                onChange={(e) => setQuickTripLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>CONFIRM & RECORD TRIP</span>
            </button>
          </form>
        </div>
      )}

      {activeAction === 'DIESEL' && (
        <div className="p-5 rounded-3xl bg-slate-900 border-2 border-rose-500/50 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Fuel className="h-4 w-4 text-rose-400" />
              1-Tap Diesel Bowser Issue
            </h4>
            <button onClick={() => setActiveAction(null)} className="text-slate-400 hover:text-white text-xs">
              Cancel
            </button>
          </div>

          <form onSubmit={handleQuickDieselSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Vehicle / Machine Name</label>
              <input
                type="text"
                required
                value={quickDieselVehicle}
                onChange={(e) => setQuickDieselVehicle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Litres Dispensed</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={quickDieselLitres}
                  onChange={(e) => setQuickDieselLitres(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rate / Litre (₹)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={quickDieselRate}
                  onChange={(e) => setQuickDieselRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex justify-between">
              <span className="text-slate-400">Total Fuel Cost:</span>
              <span className="font-bold text-emerald-400">
                ₹{(quickDieselLitres * quickDieselRate).toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>POST FUEL TRANSACTION</span>
            </button>
          </form>
        </div>
      )}

      {/* QUICK SHORTCUTS */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Full System Modules
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-left cursor-pointer"
          >
            📊 Executive Dashboard
          </button>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-left cursor-pointer"
          >
            📦 Stock Stores
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-left cursor-pointer"
          >
            📑 P&L Reports
          </button>
          <button
            onClick={() => onNavigateTab('audit')}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-left cursor-pointer"
          >
            🛡️ Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
