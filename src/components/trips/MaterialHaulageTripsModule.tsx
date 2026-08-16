import React, { useState, useMemo } from 'react';
import { useRoadERP } from '../../context/RoadERPContext';
import { TripLog, PavementLayerType, CarriagewaySide } from '../../types/roadERP';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  Scale,
  Navigation,
  Layers,
  ArrowRight,
  WifiOff,
  Wifi,
  Camera
} from 'lucide-react';

const MATERIAL_OPTIONS: { layer: PavementLayerType; label: string; defaultRate: number; mode: 'PER_TON' | 'PER_TRIP' }[] = [
  { layer: 'SUBGRADE_MURUM', label: 'Selected Soil / Murum Subgrade', defaultRate: 1400, mode: 'PER_TRIP' },
  { layer: 'GRANULAR_SUB_BASE_GSB', label: 'Granular Sub-Base (GSB Gr-I)', defaultRate: 450, mode: 'PER_TON' },
  { layer: 'WET_MIX_MACADAM_WMM', label: 'Wet Mix Macadam (WMM Graded Aggregates)', defaultRate: 520, mode: 'PER_TON' },
  { layer: 'DENSE_BITUMINOUS_MACADAM_DBM', label: 'Dense Bituminous Macadam (DBM Binder Course)', defaultRate: 3200, mode: 'PER_TON' },
  { layer: 'BITUMINOUS_CONCRETE_BC', label: 'Bituminous Concrete (BC Wearing Surface)', defaultRate: 3850, mode: 'PER_TON' },
  { layer: 'DRY_LEAN_CONCRETE_DLC', label: 'Dry Lean Concrete (DLC Mix)', defaultRate: 2800, mode: 'PER_TON' },
  { layer: 'PRIME_COAT_EMULSION', label: 'Prime Coat (SS-1 Bitumen Emulsion)', defaultRate: 65, mode: 'PER_TON' },
  { layer: 'TACK_COAT_EMULSION', label: 'Tack Coat (RS-1 Rapid Setting Emulsion)', defaultRate: 68, mode: 'PER_TON' }
];

export const MaterialHaulageTripsModule: React.FC = () => {
  const { trips, addTripLog, deleteTripLog, machines, isOnline } = useRoadERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');

  // Add Trip Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formTime, setFormTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [formVehicleId, setFormVehicleId] = useState(machines.find(m => m.category === 'HAULAGE_TRANSPORT')?.id || machines[0]?.id || '');
  const [formSource, setFormSource] = useState('Mulwad Murum Quarry Pit #1');
  const [formStartChKm, setFormStartChKm] = useState<number>(12.4);
  const [formEndChKm, setFormEndChKm] = useState<number>(14.2);
  const [formSide, setFormSide] = useState<CarriagewaySide>('LHS');
  const [formLayer, setFormLayer] = useState<PavementLayerType>('GRANULAR_SUB_BASE_GSB');
  const [formGrossWeight, setFormGrossWeight] = useState<number | ''>(38.5);
  const [formTareWeight, setFormTareWeight] = useState<number | ''>(12.2);
  const [formChallanNo, setFormChallanNo] = useState('');
  const [formWeighbridgeSlip, setFormWeighbridgeSlip] = useState('');
  const [formRate, setFormRate] = useState<number | ''>(450);
  const [formBillingMode, setFormBillingMode] = useState<'PER_TON' | 'PER_TRIP' | 'PER_M3'>('PER_TON');
  const [formOneWayDistKm, setFormOneWayDistKm] = useState<number>(14.5);
  const [formTurnaroundMins, setFormTurnaroundMins] = useState<number>(45);
  const [formRemarks, setFormRemarks] = useState('');

  // Selected Machine for vehicle plate & driver name
  const selectedVehicleObj = machines.find((m) => m.id === formVehicleId);

  // Auto calculate net weight
  const liveNetWeightTons = useMemo(() => {
    const gross = typeof formGrossWeight === 'number' ? formGrossWeight : 0;
    const tare = typeof formTareWeight === 'number' ? formTareWeight : 0;
    return Math.max(0, gross - tare);
  }, [formGrossWeight, formTareWeight]);

  // Handle Layer change to autofill rate and name
  const handleLayerSelect = (layer: PavementLayerType) => {
    setFormLayer(layer);
    const opt = MATERIAL_OPTIONS.find((m) => m.layer === layer);
    if (opt) {
      setFormRate(opt.defaultRate);
      setFormBillingMode(opt.mode);
    }
  };

  // Filtered Trip Records
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchMat = materialFilter === 'ALL' || t.layerType === materialFilter;
      const matchVeh = vehicleFilter === 'ALL' || t.machineId === vehicleFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        t.tripSlipNumber.toLowerCase().includes(q) ||
        t.vehiclePlate.toLowerCase().includes(q) ||
        t.challanNumber.toLowerCase().includes(q) ||
        t.formattedChainage.toLowerCase().includes(q) ||
        t.sourceLocation.toLowerCase().includes(q) ||
        t.materialName.toLowerCase().includes(q);
      return matchMat && matchVeh && matchSearch;
    });
  }, [trips, materialFilter, vehicleFilter, searchTerm]);

  // Totals
  const totalNetTons = useMemo(() => {
    return filteredTrips.reduce((sum, t) => sum + t.netWeightTons, 0);
  }, [filteredTrips]);

  const totalBillingAmount = useMemo(() => {
    return filteredTrips.reduce((sum, t) => sum + t.totalTripBillingAmount, 0);
  }, [filteredTrips]);

  // Submit Trip Entry
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVehicleId) return;

    const rate = Number(formRate) || 450;
    const gross = Number(formGrossWeight) || 0;
    const tare = Number(formTareWeight) || 0;
    const net = Math.max(0, gross - tare);

    let totalBill = 0;
    if (formBillingMode === 'PER_TON') {
      totalBill = net * rate;
    } else {
      totalBill = rate;
    }

    const matObj = MATERIAL_OPTIONS.find((m) => m.layer === formLayer);
    const matName = matObj ? matObj.label : 'Pavement Material';
    const formattedCh = `Ch. ${formStartChKm.toFixed(3).replace('.', '+')} to ${formEndChKm.toFixed(3).replace('.', '+')}`;
    const seq = Math.floor(100 + Math.random() * 900);
    const challan = formChallanNo.trim() || `CH-${formLayer.slice(0, 3)}-${seq}`;

    addTripLog({
      date: formDate,
      time: formTime,
      machineId: formVehicleId,
      vehiclePlate: selectedVehicleObj ? `${selectedVehicleObj.plateNumber} (${selectedVehicleObj.code})` : 'Tipper Fleet',
      driverName: selectedVehicleObj ? selectedVehicleObj.assignedOperator : 'Site Driver',
      sourceLocation: formSource,
      dropoffChainageStartKm: formStartChKm,
      dropoffChainageEndKm: formEndChKm,
      formattedChainage: formattedCh,
      carriagewaySide: formSide,
      layerType: formLayer,
      materialName: matName,
      grossWeightTons: gross,
      tareWeightTons: tare,
      netWeightTons: Number(net.toFixed(2)),
      volumeM3: Number((net / 2.2).toFixed(2)),
      challanNumber: challan,
      weighbridgeSlipNumber: formWeighbridgeSlip.trim() || `WB-AUTO-${seq}`,
      ratePerTonOrTrip: rate,
      billingMode: formBillingMode,
      totalTripBillingAmount: Number(totalBill.toFixed(2)),
      oneWayDistanceKm: formOneWayDistKm,
      roundTripDistanceKm: Number((formOneWayDistKm * 2).toFixed(1)),
      turnaroundTimeMinutes: formTurnaroundMins,
      supervisorName: 'Ibrahim (Site Supervisor)',
      remarks: formRemarks.trim() || undefined
    });

    setIsAddModalOpen(false);
    setFormChallanNo('');
    setFormWeighbridgeSlip('');
    setFormRemarks('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Trip Slip #',
      'Date',
      'Time',
      'Tipper Plate',
      'Driver',
      'Source Location',
      'Chainage Drop-off',
      'Side',
      'Material Layer',
      'Gross Weight (T)',
      'Tare Weight (T)',
      'Net Weight (T)',
      'Challan #',
      'Billing Rate',
      'Total Amount (INR)',
      '1-Way Dist (Km)',
      'Turnaround (Min)'
    ];

    const rows = filteredTrips.map((t) => [
      t.tripSlipNumber,
      t.date,
      t.time,
      `"${t.vehiclePlate}"`,
      `"${t.driverName}"`,
      `"${t.sourceLocation}"`,
      `"${t.formattedChainage}"`,
      t.carriagewaySide,
      `"${t.materialName}"`,
      t.grossWeightTons,
      t.tareWeightTons,
      t.netWeightTons,
      t.challanNumber,
      t.ratePerTonOrTrip,
      t.totalTripBillingAmount,
      t.oneWayDistanceKm,
      t.turnaroundTimeMinutes
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Highway_Material_Trip_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#1b2845] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  MODULE B • QUARRY TO CHAINAGE LOGISTICS
                </span>
                {!isOnline && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <WifiOff className="w-3 h-3" /> Offline Mode Active
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Trip Calculator & Material Haulage Tracker
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Tipper Trip Slip</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Mini-Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#182643]">
          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Total Trips Logged</div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {filteredTrips.length} <span className="text-xs font-sans text-slate-400">Trips</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Net Material Hauled</div>
            <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
              {totalNetTons.toLocaleString()} <span className="text-xs font-sans text-slate-400">Tons</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Total Haulage Valuation</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              ₹{totalBillingAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Material Filter */}
          <div className="flex items-center gap-1 bg-[#070c18] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Materials</option>
              {MATERIAL_OPTIONS.map((m) => (
                <option key={m.layer} value={m.layer}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Filter */}
          <div className="flex items-center gap-1 bg-[#070c18] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Tippers / Vehicles</option>
              {machines
                .filter((m) => m.category === 'HAULAGE_TRANSPORT')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    🚛 {m.code} - {m.plateNumber}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search challan, chainage, slip..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#070c18] border border-[#1e2d4a] rounded-xl text-xs text-white outline-none w-full sm:w-64 focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="rounded-3xl bg-[#0c1427] border border-[#1b2845] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0e172e] text-slate-400 font-semibold border-b border-[#182643]">
              <tr>
                <th className="py-3 px-4">TRIP SLIP & DATE</th>
                <th className="py-3 px-4">VEHICLE & DRIVER</th>
                <th className="py-3 px-4">SOURCE QUARRY / PLANT</th>
                <th className="py-3 px-4">CHAINAGE DROP-OFF</th>
                <th className="py-3 px-4">MATERIAL LAYER</th>
                <th className="py-3 px-3 text-right">NET WEIGHT</th>
                <th className="py-3 px-3 text-right">BILLING (₹)</th>
                <th className="py-3 px-3 text-center">DISTANCE & TIME</th>
                <th className="py-3 px-3 text-center">SYNC</th>
                <th className="py-3 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15223c] text-slate-200">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No material haulage trip records found.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-[#0f1c38] transition-colors">
                    {/* Trip Slip & Date */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-cyan-400">{trip.tripSlipNumber}</div>
                      <div className="text-[10px] text-slate-400">{trip.date} • {trip.time}</div>
                      <div className="text-[10px] text-slate-500">Challan: {trip.challanNumber}</div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{trip.vehiclePlate}</div>
                      <div className="text-[11px] text-slate-400">{trip.driverName}</div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{trip.sourceLocation}</span>
                      </div>
                    </td>

                    {/* Chainage */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-amber-400">{trip.formattedChainage}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {trip.carriagewaySide}
                      </span>
                    </td>

                    {/* Material */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {trip.materialName}
                      </span>
                    </td>

                    {/* Net Weight */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-sm">
                      {trip.netWeightTons} T
                      <div className="text-[10px] text-slate-500 font-normal">
                        Gross: {trip.grossWeightTons}T | Tare: {trip.tareWeightTons}T
                      </div>
                    </td>

                    {/* Billing */}
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-amber-400 text-sm">
                      ₹{trip.totalTripBillingAmount.toLocaleString('en-IN')}
                      <div className="text-[10px] text-slate-500 font-normal">
                        @ ₹{trip.ratePerTonOrTrip}/{trip.billingMode === 'PER_TON' ? 'Ton' : 'Trip'}
                      </div>
                    </td>

                    {/* Distance & Turnaround */}
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <div className="text-slate-300">{trip.oneWayDistanceKm} km 1-way</div>
                      <div className="text-slate-500 text-[10px]">{trip.turnaroundTimeMinutes} mins cycle</div>
                    </td>

                    {/* Sync Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trip.syncStatus === 'SYNCED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {trip.syncStatus}
                      </span>
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => deleteTripLog(trip.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
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

      {/* LOG TIPPER TRIP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <span>Log Tipper Trip & Material Weighbridge Slip</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-3 text-xs">
              {/* Vehicle & Date/Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Tipper / Truck *
                  </label>
                  <select
                    value={formVehicleId}
                    onChange={(e) => setFormVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    {machines
                      .filter((m) => m.category === 'HAULAGE_TRANSPORT')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} — {m.plateNumber} ({m.assignedOperator})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-2 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Time *</label>
                    <input
                      type="text"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-2 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Source & Material */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Source Quarry / Batch Plant *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g. Mulwad Murum Quarry Pit #1"
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Pavement Layer / Material *
                  </label>
                  <select
                    value={formLayer}
                    onChange={(e) => handleLayerSelect(e.target.value as PavementLayerType)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    {MATERIAL_OPTIONS.map((m) => (
                      <option key={m.layer} value={m.layer}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chainage Range & Side */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Chainage (Km)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formStartChKm}
                    onChange={(e) => setFormStartChKm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Chainage (Km)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formEndChKm}
                    onChange={(e) => setFormEndChKm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Carriageway Side</label>
                  <select
                    value={formSide}
                    onChange={(e) => setFormSide(e.target.value as CarriagewaySide)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    <option value="LHS">LHS (Left Hand Side)</option>
                    <option value="RHS">RHS (Right Hand Side)</option>
                    <option value="FULL_CARRIAGEWAY">Full Carriageway</option>
                    <option value="LEFT_SHOULDER">Left Shoulder</option>
                    <option value="RIGHT_SHOULDER">Right Shoulder</option>
                  </select>
                </div>
              </div>

              {/* Weighbridge Gross & Tare */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#070c18] rounded-2xl border border-[#182643]">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gross Wt (Tons)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={formGrossWeight}
                    onChange={(e) => setFormGrossWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#0c1427] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tare Wt (Tons)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={formTareWeight}
                    onChange={(e) => setFormTareWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#0c1427] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 font-bold mb-1">Net Weight (Tons)</label>
                  <div className="text-lg font-black text-cyan-400 font-mono pt-1">
                    {liveNetWeightTons.toFixed(2)} T
                  </div>
                </div>
              </div>

              {/* Challan & Billing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Challan / Slip #</label>
                  <input
                    type="text"
                    placeholder="e.g. CH-GSB-104"
                    value={formChallanNo}
                    onChange={(e) => setFormChallanNo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Billing Mode</label>
                  <select
                    value={formBillingMode}
                    onChange={(e) => setFormBillingMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    <option value="PER_TON">Per Ton (Weighbridge)</option>
                    <option value="PER_TRIP">Per Trip (Flat)</option>
                    <option value="PER_M3">Per m³ Volume</option>
                  </select>
                </div>
              </div>

              {/* Distance & Turnaround */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">1-Way Distance (Km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formOneWayDistKm}
                    onChange={(e) => setFormOneWayDistKm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cycle Turnaround (Mins)</label>
                  <input
                    type="number"
                    value={formTurnaroundMins}
                    onChange={(e) => setFormTurnaroundMins(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20"
                >
                  Save & Log Trip Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
