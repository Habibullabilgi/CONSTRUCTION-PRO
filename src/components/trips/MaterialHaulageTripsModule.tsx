import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Truck,
  Plus,
  Download,
  Search,
  Calendar,
  X,
  Trash2,
  Edit2,
  Check,
  Settings2
} from 'lucide-react';

interface MaterialRateItem {
  name: string;
  defaultRate: number;
}

const INITIAL_MATERIAL_RATES: MaterialRateItem[] = [
  { name: 'Murum', defaultRate: 1400 },
  { name: 'GSB', defaultRate: 1950 },
  { name: 'WMM', defaultRate: 2400 },
  { name: '20 MM Aggregate', defaultRate: 2800 },
  { name: 'M-Sand', defaultRate: 3200 },
  { name: '40 MM Aggregate', defaultRate: 2600 },
  { name: 'Grit / Dust', defaultRate: 1800 }
];

export const MaterialHaulageTripsModule: React.FC = () => {
  const {
    vehicleTrips,
    addVehicleTrip,
    deleteVehicleTrip,
    selectedSiteId,
    siteSheets,
    currentProject,
    addSiteSheetVehicle,
    deleteSiteSheetVehicle
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('ALL');
  const [filterVehicle, setFilterVehicle] = useState('ALL');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Persistent Material Catalog with Rates
  const [materialsList, setMaterialsList] = useState<MaterialRateItem[]>(() => {
    try {
      const saved = localStorage.getItem('PAVETRACK_MATERIAL_RATES_V1');
      return saved ? JSON.parse(saved) : INITIAL_MATERIAL_RATES;
    } catch {
      return INITIAL_MATERIAL_RATES;
    }
  });

  const saveMaterialsList = (newList: MaterialRateItem[]) => {
    setMaterialsList(newList);
    localStorage.setItem('PAVETRACK_MATERIAL_RATES_V1', JSON.stringify(newList));
  };

  // Manage Materials Mode
  const [isManagingMaterials, setIsManagingMaterials] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatRate, setNewMatRate] = useState<number | ''>('');
  const [editingMatName, setEditingMatName] = useState<string | null>(null);
  const [editingMatRate, setEditingMatRate] = useState<number | ''>('');

  // Inline Vehicle Input & Vehicle Management
  const [isManagingVehicles, setIsManagingVehicles] = useState(false);
  const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(false);
  const [newVehicleInput, setNewVehicleInput] = useState('');

  const currentSheet = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];
  const vehicles = currentSheet?.vehicles || ['8797', '7352', '7353', '9579', '9580'];

  // Form State
  const [tripForm, setTripForm] = useState<{
    siteName: string;
    vehicleNumber: string;
    materialName: string;
    brassQty: number | '';
    ratePerBrass: number | '';
  }>({
    siteName: currentSheet?.siteName || 'Ongoing Highway Site',
    vehicleNumber: vehicles[0] || '8797',
    materialName: materialsList[0]?.name || 'Murum',
    brassQty: 6,
    ratePerBrass: materialsList[0]?.defaultRate || 1400
  });

  const handleMaterialChange = (selectedName: string) => {
    const found = materialsList.find((m) => m.name === selectedName);
    const newRate = found ? found.defaultRate : 1400;
    setTripForm((prev) => ({
      ...prev,
      materialName: selectedName,
      ratePerBrass: newRate
    }));
  };

  const autoCalculatedTotal = useMemo(() => {
    const brass = typeof tripForm.brassQty === 'number' ? tripForm.brassQty : Number(tripForm.brassQty) || 0;
    const rate = typeof tripForm.ratePerBrass === 'number' ? tripForm.ratePerBrass : Number(tripForm.ratePerBrass) || 0;
    return brass * rate;
  }, [tripForm.brassQty, tripForm.ratePerBrass]);

  const handleAddNewMaterial = () => {
    const trimmed = newMatName.trim();
    if (!trimmed) return;
    const rateVal = Number(newMatRate) || 1400;
    const updated = [...materialsList, { name: trimmed, defaultRate: rateVal }];
    saveMaterialsList(updated);
    setTripForm((prev) => ({ ...prev, materialName: trimmed, ratePerBrass: rateVal }));
    setNewMatName('');
    setNewMatRate('');
  };

  const handleDeleteMaterial = (nameToDelete: string) => {
    if (materialsList.length <= 1) {
      alert('At least one material must remain in the catalog.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete material "${nameToDelete}"?`)) {
      const updated = materialsList.filter((m) => m.name !== nameToDelete);
      saveMaterialsList(updated);
      if (tripForm.materialName === nameToDelete) {
        setTripForm((prev) => ({
          ...prev,
          materialName: updated[0].name,
          ratePerBrass: updated[0].defaultRate
        }));
      }
    }
  };

  const handleSaveEditedRate = (matName: string) => {
    const rateVal = Number(editingMatRate) || 1400;
    const updated = materialsList.map((m) =>
      m.name === matName ? { ...m, defaultRate: rateVal } : m
    );
    saveMaterialsList(updated);
    if (tripForm.materialName === matName) {
      setTripForm((prev) => ({ ...prev, ratePerBrass: rateVal }));
    }
    setEditingMatName(null);
  };

  const handleAddNewVehicle = () => {
    const cleanNumber = newVehicleInput.trim().toUpperCase();
    if (!cleanNumber) return;

    if (currentSheet?.siteId && addSiteSheetVehicle) {
      addSiteSheetVehicle(currentSheet.siteId, cleanNumber);
    }
    setTripForm((prev) => ({ ...prev, vehicleNumber: cleanNumber }));
    setNewVehicleInput('');
    setIsAddingNewVehicle(false);
  };

  const handleDeleteVehicle = (vehNo: string) => {
    if (vehicles.length <= 1) {
      alert('At least one vehicle must remain in the roster.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete Vehicle #${vehNo}?`)) {
      if (currentSheet?.siteId && deleteSiteSheetVehicle) {
        deleteSiteSheetVehicle(currentSheet.siteId, vehNo);
      }
      const remaining = vehicles.filter((v) => v !== vehNo);
      if (tripForm.vehicleNumber === vehNo) {
        setTripForm((prev) => ({ ...prev, vehicleNumber: remaining[0] || '' }));
      }
    }
  };

  const siteTrips = vehicleTrips.filter(
    (t) => !selectedSiteId || t.siteId === selectedSiteId || (t as any).siteId === 'all'
  );

  const filteredTrips = siteTrips.filter((t) => {
    const matchesSearch =
      t.slipNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.materialName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMaterial = filterMaterial === 'ALL' || t.materialName === filterMaterial;
    const matchesVehicle = filterVehicle === 'ALL' || t.vehicleNumber === filterVehicle;

    return matchesSearch && matchesMaterial && matchesVehicle;
  });

  const totalTrips = filteredTrips.length;
  const totalBrass = filteredTrips.reduce((acc, t) => acc + (t.netWeightTons || 0), 0);
  const totalValuation = filteredTrips.reduce(
    (acc, t) => acc + (t.totalAmount || (t.netWeightTons || 1) * (t.ratePerUnitOrTrip || 1400)),
    0
  );

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().substring(0, 10);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const brass = typeof tripForm.brassQty === 'number' ? tripForm.brassQty : Number(tripForm.brassQty) || 1;
    const rate = typeof tripForm.ratePerBrass === 'number' ? tripForm.ratePerBrass : Number(tripForm.ratePerBrass) || 1400;

    addVehicleTrip({
      projectId: currentProject?.id || 'proj-ongoing-1',
      siteId: selectedSiteId || 'site-ongoing-1',
      slipNumber: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: today,
      time: timeNow,
      vehicleNumber: tripForm.vehicleNumber,
      driverName: 'Driver',
      materialName: tripForm.materialName,
      sourceLocation: tripForm.siteName,
      destinationChainage: 'Site Location',
      grossWeightKg: brass * 1000,
      tareWeightKg: 0,
      netWeightKg: brass * 1000,
      netWeightTons: brass,
      ratePerUnitOrTrip: rate,
      totalAmount: brass * rate,
      travelDistanceKm: 0,
      approvalStatus: 'APPROVED'
    });

    setIsLogModalOpen(false);
  };

  const handleDeleteTripLog = (tripId: string, slipNo: string) => {
    if (window.confirm(`Are you sure you want to delete trip "${slipNo}"?`)) {
      if (deleteVehicleTrip) {
        deleteVehicleTrip(tripId);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = 'Trip Slip,Date,Site Name,Vehicle,Material,Brass Qty,Rate/Brass (INR),Total (INR)\n';
    const rows = filteredTrips
      .map(
        (t) =>
          `"${t.slipNumber}","${t.date}","${t.sourceLocation || currentSheet?.siteName || ''}","${t.vehicleNumber}","${t.materialName}","${t.netWeightTons}","${t.ratePerUnitOrTrip}","${t.totalAmount}"`
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
              Record and track tipper trip slips, brass quantities, rates, and materials.
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
            Total Material (Brass)
          </span>
          <div className="text-2xl font-black text-cyan-400 mt-1.5">
            {totalBrass.toFixed(2)} <span className="text-xs font-semibold text-[#94A3B8]">Brass</span>
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
          {materialsList.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
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
            placeholder="Search slip, vehicle, material..."
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
                <th className="py-3 px-5">Site Name</th>
                <th className="py-3 px-5">Vehicle Number</th>
                <th className="py-3 px-5">Material Name</th>
                <th className="py-3 px-5 text-right">Material (Brass)</th>
                <th className="py-3 px-5 text-right">Rate / 1 Brass (₹)</th>
                <th className="py-3 px-5 text-right">Billing (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
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

                    <td className="py-3.5 px-5 text-slate-300 whitespace-nowrap font-medium">
                      {t.sourceLocation || currentSheet?.siteName || 'Ongoing Highway Site'}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-bold text-blue-400 font-mono">#{t.vehicleNumber}</div>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-950/40 border border-blue-600/40 text-blue-300 text-[11px] font-bold">
                        {t.materialName}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {t.netWeightTons ? `${t.netWeightTons.toFixed(2)} Brass` : '1.00 Brass'}
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono text-slate-300 whitespace-nowrap">
                      ₹{(t.ratePerUnitOrTrip || 1400).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                      ₹{(t.totalAmount || ((t.netWeightTons || 1) * (t.ratePerUnitOrTrip || 1400))).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteTripLog(t.id, t.slipNumber || 'Trip Entry')}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
                        title="Delete Logged Trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Log New Trip Modal */}
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
                onClick={() => {
                  setIsLogModalOpen(false);
                  setIsManagingVehicles(false);
                  setIsManagingMaterials(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
              {/* Site Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Site Name <span className="text-blue-400">*</span>
                </label>
                <select
                  value={tripForm.siteName}
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

              {/* Vehicle Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">
                    Vehicle Number <span className="text-blue-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManagingVehicles(!isManagingVehicles)}
                    className="text-blue-400 hover:text-blue-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>{isManagingVehicles ? 'Done' : 'Manage / Delete V.No'}</span>
                  </button>
                </div>

                {isManagingVehicles ? (
                  <div className="p-3 bg-[#0D111D] border border-[#1E293B] rounded-2xl space-y-3">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      Vehicle Roster (Click trash icon to delete):
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {vehicles.map((v) => (
                        <div
                          key={v}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#162032] border border-[#1E293B]"
                        >
                          <span className="font-mono font-bold text-blue-400 text-xs">
                            #{v}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(v)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                            title={`Delete Vehicle #${v}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#1E293B] flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. 9988 or KA-28-M-1234"
                        value={newVehicleInput}
                        onChange={(e) => setNewVehicleInput(e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-[#162032] border border-[#1E293B] rounded-lg text-white font-mono uppercase text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewVehicle}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0"
                      >
                        + Add V.No
                      </button>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>

              {/* Material Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">
                    Material Name <span className="text-blue-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManagingMaterials(!isManagingMaterials)}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>{isManagingMaterials ? 'Done' : 'Manage Rates / Delete'}</span>
                  </button>
                </div>

                {isManagingMaterials ? (
                  <div className="p-3 bg-[#0D111D] border border-[#1E293B] rounded-2xl space-y-3">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      Edit Default Rates or Delete Materials:
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {materialsList.map((m) => (
                        <div
                          key={m.name}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#162032] border border-[#1E293B]"
                        >
                          <span className="font-semibold text-slate-200 truncate flex-1">
                            {m.name}
                          </span>

                          {editingMatName === m.name ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                className="w-20 px-1.5 py-0.5 bg-[#0B1220] border border-blue-500 rounded text-right font-mono text-white text-xs"
                                value={editingMatRate}
                                onChange={(e) =>
                                  setEditingMatRate(e.target.value === '' ? '' : Number(e.target.value))
                                }
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditedRate(m.name)}
                                className="p-1 text-emerald-400 hover:bg-emerald-950/40 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-amber-400 text-xs">
                                ₹{m.defaultRate}/Brass
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMatName(m.name);
                                  setEditingMatRate(m.defaultRate);
                                }}
                                className="p-1 text-slate-400 hover:text-white rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(m.name)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#1E293B] flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Material name"
                        value={newMatName}
                        onChange={(e) => setNewMatName(e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-[#162032] border border-[#1E293B] rounded-lg text-white text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Rate ₹"
                        value={newMatRate}
                        onChange={(e) =>
                          setNewMatRate(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-20 px-2 py-1 bg-[#162032] border border-[#1E293B] rounded-lg text-white font-mono text-xs text-right"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewMaterial}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={tripForm.materialName}
                    onChange={(e) => handleMaterialChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium cursor-pointer"
                  >
                    {materialsList.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} (Preset: ₹{m.defaultRate}/Brass)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Material Quantity */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Material (in Brass) <span className="text-blue-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  placeholder="e.g. 6.00"
                  value={tripForm.brassQty ?? ''}
                  onChange={(e) =>
                    setTripForm({
                      ...tripForm,
                      brassQty: e.target.value === '' ? '' : Number(e.target.value)
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-mono font-bold placeholder-slate-500"
                />
              </div>

              {/* Rate per 1 Brass */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Rate per 1 Brass (₹) <span className="text-blue-400">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  placeholder="e.g. 1400"
                  value={tripForm.ratePerBrass ?? ''}
                  onChange={(e) =>
                    setTripForm({
                      ...tripForm,
                      ratePerBrass: e.target.value === '' ? '' : Number(e.target.value)
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-mono font-bold placeholder-slate-500"
                />
              </div>

              {/* Real-Time Calculation Card */}
              <div className="p-3.5 bg-[#0D111D] border border-blue-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    Rate: ₹{Number(tripForm.ratePerBrass || 0).toLocaleString('en-IN')} / 1 Brass
                  </div>
                  <div className="text-xs text-slate-300 font-bold">
                    Total Amount ({tripForm.brassQty || 0} Brass):
                  </div>
                </div>
                <div className="text-lg font-black font-mono text-amber-400">
                  ₹{autoCalculatedTotal.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogModalOpen(false);
                    setIsManagingVehicles(false);
                    setIsManagingMaterials(false);
                  }}
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
    </div>
  );
};

export default MaterialHaulageTripsModule;
