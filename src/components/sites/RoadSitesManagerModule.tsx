import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Milestone,
  Plus,
  Truck,
  HardHat,
  MapPin,
  Compass,
  Layers,
  CheckCircle2,
  Trash2,
  Power,
  X,
  ArrowRight
} from 'lucide-react';

interface Props {
  onNavigateTab?: (tab: string) => void;
}

export const RoadSitesManagerModule: React.FC<Props> = ({ onNavigateTab }) => {
  const erp = useERP();
  const {
    projects = [],
    setSelectedProjectId,
    selectedSiteId,
    setSelectedSiteId,
    roadSections = [],
    siteSheets = [],
    vehicleTrips = [],
    dieselLogs = [],
    deleteSite,
    addRoadSiteSection
  } = erp;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Form State for Adding New Site
  const [newSiteName, setNewSiteName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSupervisor, setNewSupervisor] = useState('Er. Habibulla Bilgi');
  const [newStartKm, setNewStartKm] = useState<number | ''>(0);
  const [newEndKm, setNewEndKm] = useState<number | ''>(12.5);

  // Local site active/inactive state map
  const [siteStatuses, setSiteStatuses] = useState<Record<string, 'Active' | 'Inactive'>>(() => {
    try {
      const saved = localStorage.getItem('CONSTRUCTION_PRO_SITE_STATUSES');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSiteStatus = (siteId: string) => {
    const current = siteStatuses[siteId] || 'Active';
    const nextStatus = current === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...siteStatuses, [siteId]: nextStatus };
    setSiteStatuses(updated);
    localStorage.setItem('CONSTRUCTION_PRO_SITE_STATUSES', JSON.stringify(updated));
  };

  // Safe site collection
  const allRoadSites = Array.isArray(siteSheets) && siteSheets.length > 0
    ? siteSheets.map((sh, idx) => {
        const matchingSec = Array.isArray(roadSections)
          ? roadSections.find((r) => r && (r.siteId === sh.siteId || (r.name && r.name.toLowerCase().includes(sh.siteName.toLowerCase()))))
          : undefined;
        const matchingTrips = Array.isArray(vehicleTrips) ? vehicleTrips.filter((t) => t && t.siteId === sh.siteId) : [];
        const matchingDiesel = Array.isArray(dieselLogs) ? dieselLogs.filter((d) => d && d.siteId === sh.siteId) : [];
        const totalDieselL = matchingDiesel.reduce((sum, d) => sum + (d.litresDispensed || 0), 0);
        const status = siteStatuses[sh.siteId] || 'Active';

        return {
          id: sh.siteId,
          name: sh.siteName,
          code: `ST-${101 + idx}`,
          projectName: 'NH-50 Flexible Pavement Construction',
          projectId: projects[0]?.id || 'proj-ongoing-1',
          location: 'Main Highway Stretch Corridor',
          supervisor: 'Er. Habibulla Bilgi',
          tripsCount: matchingTrips.length,
          totalDieselL,
          status,
          vehicles: sh.vehicles || ['KA28B8797', 'KA-28-EX-8901', 'MH-12-DT-5510'],
          startKm: matchingSec?.startChainage ?? 0.0,
          endKm: matchingSec?.endChainage ?? 12.5,
          lengthKm: matchingSec && typeof matchingSec.endChainage === 'number' && typeof matchingSec.startChainage === 'number'
            ? Math.abs(matchingSec.endChainage - matchingSec.startChainage)
            : 12.5
        };
      })
    : [
        {
          id: 'site-ongoing-1',
          name: 'NH-50 Ongoing Site Stretch',
          code: 'ST-101',
          projectName: 'National Highway Expansion',
          projectId: 'proj-ongoing-1',
          location: 'Km 10+000 to Km 22+500',
          supervisor: 'Er. Habibulla Bilgi',
          tripsCount: 138,
          totalDieselL: 4200,
          status: 'Active',
          vehicles: ['KA28B8797', 'KA-28-EX-8901', 'MH-12-DT-5510'],
          startKm: 10.0,
          endKm: 22.5,
          lengthKm: 12.5
        }
      ];

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim()) return;

    if (typeof addRoadSiteSection === 'function') {
      addRoadSiteSection({
        siteName: newSiteName.trim(),
        location: newLocation.trim() || 'Main Highway Corridor',
        supervisor: newSupervisor.trim() || 'Site Incharge',
        startChainageKm: Number(newStartKm) || 0,
        endChainageKm: Number(newEndKm) || 10,
        vehicles: ['KA28B8797', 'KA-28-EX-8901', 'MH-12-DT-5510']
      });
    }

    setIsAddModalOpen(false);
    setNewSiteName('');
    setNewLocation('');
  };

  const handleDeleteSite = (siteId: string, siteName: string) => {
    if (window.confirm(`Are you sure you want to permanently remove "${siteName}"?`)) {
      if (typeof deleteSite === 'function') {
        deleteSite(siteId);
      }
    }
  };

  const filteredSites = allRoadSites.filter((item) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.supervisor.toLowerCase().includes(q)
    );
  });

  const totalLengthKm = allRoadSites.reduce((sum, s) => sum + s.lengthKm, 0);
  const totalVehiclesCount = Array.from(new Set(allRoadSites.flatMap((s) => s.vehicles))).length;

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-md shadow-blue-600/20">
            <Milestone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ongoing Site & Highway Execution
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#064E3B] text-[#34D399] border border-[#065F46] text-[10px] font-black uppercase">
                Active Sites
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Manage ongoing site execution, chainage progression, supervisory teams, and fleet deployments.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Ongoing Site Section</span>
        </button>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Ongoing Sites
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Milestone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {allRoadSites.length} <span className="text-xs font-semibold text-[#94A3B8]">Sections</span>
          </div>
          <div className="text-[11px] text-blue-400 font-medium mt-1">Active Execution Zones</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Highway Execution
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {totalLengthKm.toFixed(1)} <span className="text-xs font-semibold text-[#94A3B8]">KM Length</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">MoRTH Flexible Pavement Specs</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Assigned Tippers
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {totalVehiclesCount} <span className="text-xs font-semibold text-[#94A3B8]">Vehicles</span>
          </div>
          <div className="text-[11px] text-amber-400 font-medium mt-1">Active Multi-Axle Fleet</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Site Supervisor
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {allRoadSites.length} <span className="text-xs font-semibold text-[#94A3B8]">Engineers</span>
          </div>
          <div className="text-[11px] text-purple-400 font-medium mt-1">Field Incharge & Reporting</div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D111D] border border-[#1E293B] p-3 rounded-2xl">
        <input
          type="text"
          placeholder="Filter ongoing site sections by name, code, location..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full sm:w-96 px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs placeholder-[#64748B] focus:border-blue-500 outline-none"
        />

        <div className="text-xs text-[#94A3B8] font-semibold">
          Showing <span className="text-white font-bold">{filteredSites.length}</span> of{' '}
          {allRoadSites.length} Ongoing Site Sections
        </div>
      </div>

      {/* 4. Site Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredSites.map((item) => {
          const isCurrent = item.id === selectedSiteId;
          const isActiveStatus = item.status === 'Active';

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                isCurrent
                  ? 'bg-[#162032] border-blue-500/60 shadow-xl shadow-blue-600/10'
                  : 'bg-[#121927] border-[#1E293B] hover:border-slate-700'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm z-10">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ongoing Site Context</span>
                </div>
              )}

              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-2 pr-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#162032] border border-[#1E293B] text-blue-400 font-mono text-[10px] font-bold">
                        {item.code}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] font-semibold">
                        {item.projectName}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mt-1">{item.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSiteStatus(item.id)}
                      title={`Click to toggle status`}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActiveStatus
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{isActiveStatus ? 'Active' : 'Inactive'}</span>
                    </button>

                    <button
                      type="button"
                      title={`Delete ${item.name}`}
                      onClick={() => handleDeleteSite(item.id, item.name)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chainage Details */}
                <div className="p-3 bg-[#0D111D] border border-[#1E293B] rounded-2xl my-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8] font-semibold flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-400" />
                      <span>Chainage Stretch:</span>
                    </span>
                    <span className="text-white font-mono font-bold">
                      Ch. {item.startKm.toFixed(3)} → Ch. {item.endKm.toFixed(3)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8] font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Total Stretch Length:</span>
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {item.lengthKm.toFixed(2)} KM ({(item.lengthKm * 1000).toLocaleString()} M)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8] font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      <span>Location:</span>
                    </span>
                    <span className="text-[#94A3B8] font-medium truncate max-w-[200px]">
                      {item.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8] font-semibold flex items-center gap-1">
                      <HardHat className="w-3.5 h-3.5 text-amber-400" />
                      <span>Site Supervisor:</span>
                    </span>
                    <span className="text-white font-bold">{item.supervisor}</span>
                  </div>
                </div>

                {/* Tippers Assigned */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#94A3B8] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Assigned Tipper Fleet ({item.vehicles.length})</span>
                    </span>
                    <span className="text-[#94A3B8] font-mono text-[10px]">
                      {item.tripsCount} trips recorded
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.vehicles.map((veh) => (
                      <span
                        key={veh}
                        className="px-2 py-0.5 rounded-lg bg-[#162032] border border-[#1E293B] text-slate-200 text-xs font-mono font-bold"
                      >
                        #{veh}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {!isCurrent ? (
                    <button
                      onClick={() => {
                        if (typeof setSelectedProjectId === 'function') setSelectedProjectId(item.projectId);
                        if (typeof setSelectedSiteId === 'function') setSelectedSiteId(item.id);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Set as Ongoing Site Context</span>
                    </button>
                  ) : (
                    <div className="w-full py-1.5 text-center text-xs font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
                      ✓ Active Ongoing Site
                    </div>
                  )}
                </div>

                {onNavigateTab && (
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        if (typeof setSelectedSiteId === 'function') setSelectedSiteId(item.id);
                        onNavigateTab('haulage-trips');
                      }}
                      className="p-1.5 rounded-lg bg-[#0D111D] hover:bg-[#162032] text-slate-300 hover:text-white border border-[#1E293B] text-[10px] font-bold text-center transition-colors cursor-pointer"
                    >
                      🚛 Trips
                    </button>
                    <button
                      onClick={() => {
                        if (typeof setSelectedSiteId === 'function') setSelectedSiteId(item.id);
                        onNavigateTab('diesel');
                      }}
                      className="p-1.5 rounded-lg bg-[#0D111D] hover:bg-[#162032] text-slate-300 hover:text-white border border-[#1E293B] text-[10px] font-bold text-center transition-colors cursor-pointer"
                    >
                      ⛽ Diesel
                    </button>
                    <button
                      onClick={() => {
                        if (typeof setSelectedSiteId === 'function') setSelectedSiteId(item.id);
                        onNavigateTab('yield_calculator');
                      }}
                      className="p-1.5 rounded-lg bg-[#0D111D] hover:bg-[#162032] text-slate-300 hover:text-white border border-[#1E293B] text-[10px] font-bold text-center transition-colors cursor-pointer"
                    >
                      📐 Yield
                    </button>
                    <button
                      onClick={() => {
                        if (typeof setSelectedSiteId === 'function') setSelectedSiteId(item.id);
                        onNavigateTab('site-expenses');
                      }}
                      className="p-1.5 rounded-lg bg-[#0D111D] hover:bg-[#162032] text-slate-300 hover:text-white border border-[#1E293B] text-[10px] font-bold text-center transition-colors cursor-pointer"
                    >
                      💰 Expense
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Add Ongoing Site Section Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Milestone className="w-5 h-5 text-blue-400" />
                <span>Add Ongoing Site Section</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Site Section Name <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NH-50 Section Package B"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Location / Corridor</label>
                <input
                  type="text"
                  placeholder="e.g. Km 12+000 to 24+500"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Site Supervisor</label>
                <input
                  type="text"
                  value={newSupervisor}
                  onChange={(e) => setNewSupervisor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Start Km</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newStartKm}
                    onChange={(e) => setNewStartKm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">End Km</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newEndKm}
                    onChange={(e) => setNewEndKm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
                >
                  Create Site Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadSitesManagerModule;
