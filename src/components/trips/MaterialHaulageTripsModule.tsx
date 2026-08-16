import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Truck,
  Plus,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Layers,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { VehicleTrip } from '../../types/erp';

export const MaterialHaulageTripsModule: React.FC = () => {
  const {
    vehicleTrips,
    addVehicleTrip,
    selectedSiteId,
    siteSheets,
    currentProject
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('ALL');
  const [filterVehicle, setFilterVehicle] = useState('ALL');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [tripForm, setTripForm] = useState({
    slipNumber: '',
    vehicleNumber: '8797',
    driverName: 'Santosh Kamble',
    materialName: 'Murum',
    sourceQuarry: 'Bilgi Pit #1',
    destinationChainage: 'Ch. 4+200',
    netWeightTons: 18.5,
    ratePerUnitOrTrip: 350,
    travelDistanceKm: 12.0
  });

  const currentSheet = siteSheets.find((s) => s.siteId === selectedSiteId);
  const vehicles = currentSheet?.vehicles || ['8797', '7352', '7353', '9579', '9580'];

  const siteTrips = vehicleTrips.filter(
    (t) => !selectedSiteId || t.siteId === selectedSiteId || (t as any).siteId === 'all'
  );

  const filteredTrips = siteTrips.filter((t) => {
    const matchesSearch =
      t.slipNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.materialName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMaterial = filterMaterial === 'ALL' || t.materialName === filterMaterial;
    const matchesVehicle = filterVehicle === 'ALL' || t.vehicleNumber === filterVehicle;

    return matchesSearch && matchesMaterial && matchesVehicle;
  });

  const totalTrips = filteredTrips.length;
  const totalWeight = filteredTrips.reduce((acc, t) => acc + (t.netWeightTons || 0), 0);
  const totalValuation = filteredTrips.reduce(
    (acc, t) => acc + (t.netWeightTons || 1) * (t.ratePerUnitOrTrip || 350),
    0
  );

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().substring(0, 10);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addVehicleTrip({
      projectId: currentProject?.id || 'proj-ongoing-1',
      siteId: selectedSiteId || 'site-ongoing-1',
      slipNumber: tripForm.slipNumber || `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: today,
      time: timeNow,
      vehicleNumber: tripForm.vehicleNumber,
      driverName: tripForm.driverName,
      materialName: tripForm.materialName,
      sourceLocation: tripForm.sourceQuarry,
      destinationChainage: tripForm.destinationChainage,
      grossWeightKg: (tripForm.netWeightTons + 10) * 1000,
      tareWeightKg: 10000,
      netWeightKg: tripForm.netWeightTons * 1000,
      netWeightTons: Number(tripForm.netWeightTons),
      ratePerUnitOrTrip: Number(tripForm.ratePerUnitOrTrip),
      totalAmount: Number(tripForm.netWeightTons) * Number(tripForm.ratePerUnitOrTrip),
      travelDistanceKm: Number(tripForm.travelDistanceKm),
      approvalStatus: 'APPROVED'
    });

    setIsLogModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = 'Trip Slip,Date,Vehicle,Driver,Material,Source,Drop-off,Net Tons,Rate,Total (INR)\n';
    const rows = filteredTrips
      .map(
        (t) =>
          `"${t.slipNumber}","${t.date}","${t.vehicleNumber}","${t.driverName}","${t.materialName}","${t.sourceLocation}","${t.destinationChainage}","${t.netWeightTons}","${t.ratePerUnitOrTrip}","${t.totalAmount}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Trips_Export_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-md shadow-blue-600/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Trips</h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800 text-[10px] font-black uppercase">
                Trip Logs
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Record and track tipper trip slips, net material weights, and drop-off chainages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Trip</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#162032] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1E293B] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Total Trips Logged
          </span>
          <div className="text-2xl font-black text-white mt-1.5">
            {totalTrips} <span className="text-xs font-semibold text-[#94A3B8]">Trips</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Net Material Hauled
          </span>
          <div className="text-2xl font-black text-cyan-400 mt-1.5">
            {totalWeight.toFixed(1)} <span className="text-xs font-semibold text-[#94A3B8]">Tons</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Total Valuation
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1.5">
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#0D111D] border border-[#1E293B] p-3 rounded-2xl">
        <select
          value={filterMaterial}
          onChange={(e) => setFilterMaterial(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-blue-500 font-semibold cursor-pointer"
        >
          <option value="ALL">All Materials</option>
          <option value="Murum">Murum</option>
          <option value="GSB">GSB</option>
          <option value="WMM">WMM</option>
          <option value="20 MM">20 MM Aggregate</option>
          <option value="M SAND">M-Sand</option>
        </select>

        <select
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-blue-500 font-semibold cursor-pointer"
        >
          <option value="ALL">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v} value={v}>
              Vehicle #{v}
            </option>
          ))}
        </select>

        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search slip, chainage, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 4. Trips Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] bg-[#080D19]">
                <th className="py-3 px-5">Trip Slip & Date</th>
                <th className="py-3 px-5">Vehicle & Driver</th>
                <th className="py-3 px-5">Source</th>
                <th className="py-3 px-5">Drop-off Chainage</th>
                <th className="py-3 px-5">Material</th>
                <th className="py-3 px-5 text-right">Net Weight</th>
                <th className="py-3 px-5 text-right">Billing (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    No trips recorded yet. Click <strong>+ Log Trip</strong> to create an entry.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-[#121927] transition-colors">
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-bold text-white font-mono">{t.slipNumber}</div>
                      <div className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>
                          {t.date} {t.time && `• ${t.time}`}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-bold text-blue-400 font-mono">#{t.vehicleNumber}</div>
                      <div className="text-[10px] text-slate-400">{t.driverName}</div>
                    </td>

                    <td className="py-3.5 px-5 text-slate-300 whitespace-nowrap">
                      {t.sourceLocation || 'Quarry Pit #1'}
                    </td>

                    <td className="py-3.5 px-5 text-slate-300 font-mono whitespace-nowrap">
                      {t.destinationChainage || 'Ch. 0+000'}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-950/40 border border-blue-600/40 text-blue-300 text-[11px] font-bold">
                        {t.materialName}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {t.netWeightTons ? `${t.netWeightTons} Tons` : '1 Trip'}
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                      ₹{((t.netWeightTons || 1) * (t.ratePerUnitOrTrip || 350)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log New Trip Modal */}
{isLogModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
    <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Truck className="w-5 h-5 text-blue-400" />
          <span>Log New Trip</span>
        </div>
        <button
          type="button"
          onClick={() => setIsLogModalOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
        
        {/* 1. Site Name */}
        <div>
          <label className="block text-slate-300 font-bold mb-1">
            Site Name <span className="text-blue-400">*</span>
          </label>
          <select
            value={tripForm.siteName || (currentSheet?.siteName || '')}
            onChange={(e) => setTripForm({ ...tripForm, siteName: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium cursor-pointer"
          >
            {siteSheets.map((s) => (
              <option key={s.siteId} value={s.siteName}>
                {s.siteName}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Vehicle Number */}
        <div>
          <label className="block text-slate-300 font-bold mb-1">
            Vehicle Number <span className="text-blue-400">*</span>
          </label>
          <select
            value={tripForm.vehicleNumber}
            onChange={(e) => setTripForm({ ...tripForm, vehicleNumber: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-mono font-bold cursor-pointer"
          >
            {vehicles.map((v) => (
              <option key={v} value={v}>
                #{v}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Material Name */}
        <div>
          <label className="block text-slate-300 font-bold mb-1">
            Material Name <span className="text-blue-400">*</span>
          </label>
          <select
            value={tripForm.materialName}
            onChange={(e) => setTripForm({ ...tripForm, materialName: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium cursor-pointer"
          >
            <option value="Murum">Murum</option>
            <option value="GSB">GSB</option>
            <option value="WMM">WMM</option>
            <option value="20 MM">20 MM Aggregate</option>
            <option value="M SAND">M-Sand</option>
            <option value="40 MM">40 MM Aggregate</option>
            <option value="Grit / Dust">Grit / Dust</option>
          </select>
        </div>

        {/* 4. Material Quantity (in Brass) */}
        <div>
          <label className="block text-slate-300 font-bold mb-1">
            Material (in Brass) <span className="text-blue-400">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            required
            placeholder="e.g. 4.50"
            value={tripForm.brassQty ?? ''}
            onChange={(e) =>
              setTripForm({ ...tripForm, brassQty: e.target.value === '' ? '' : Number(e.target.value) })
            }
            className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-mono font-bold placeholder-slate-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={() => setIsLogModalOpen(false)}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            Save Trip
          </button>
        </div>
      </form>
    </div>
  </div>
)}

              <div>
                <label className="block text-slate-400 font-bold mb-1">Drop-off Chainage *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ch. 4+500"
                  value={tripForm.destinationChainage}
                  onChange={(e) =>
                    setTripForm({ ...tripForm, destinationChainage: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30"
                >
                  Save Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialHaulageTripsModule;
