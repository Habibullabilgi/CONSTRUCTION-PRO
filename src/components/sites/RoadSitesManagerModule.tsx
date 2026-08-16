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
  Fuel,
  DollarSign,
  Calculator,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CreateRoadSiteModal } from '../modals/CreateRoadSiteModal';

interface Props {
  onNavigateTab?: (tab: string) => void;
}

export const RoadSitesManagerModule: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    selectedSiteId,
    setSelectedSiteId,
    currentProject,
    roadSections,
    siteSheets,
    vehicleTrips,
    dieselLogs
  } = useERP();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Collect all road sites across projects
  const allRoadSites = projects.flatMap((p) =>
    p.sites.map((s) => {
      const roadSec = roadSections.find((r) => r.siteId === s.id || r.name.toLowerCase().includes(s.name.toLowerCase()));
      const sheet = siteSheets.find((sh) => sh.siteId === s.id);
      const siteTrips = vehicleTrips.filter((t) => t.siteId === s.id);
      const siteDiesel = dieselLogs.filter((d) => d.siteId === s.id);
      const totalDieselL = siteDiesel.reduce((sum, d) => sum + (d.litresDispensed || 0), 0);

      return {
        site: s,
        project: p,
        roadSec,
        sheet,
        tripsCount: siteTrips.length,
        totalDieselL,
        vehicles: sheet?.vehicles || ['8797', '7352', '7353', '9579', '9580'],
        lengthKm: roadSec ? Math.abs(roadSec.endChainage - roadSec.startChainage) : 12.5
      };
    })
  );

  const filteredSites = allRoadSites.filter((item) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      item.site.name.toLowerCase().includes(q) ||
      item.site.code.toLowerCase().includes(q) ||
      item.project.name.toLowerCase().includes(q) ||
      item.site.location.toLowerCase().includes(q) ||
      item.site.supervisor.toLowerCase().includes(q)
    );
  });

  const totalLengthKm = allRoadSites.reduce((sum, s) => sum + s.lengthKm, 0);
  const totalVehiclesCount = Array.from(new Set(allRoadSites.flatMap((s) => s.vehicles))).length;

  const handleSelectSite = (siteId: string, projId: string) => {
    setSelectedProjectId(projId);
    setSelectedSiteId(siteId);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Banner / Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-md shadow-blue-600/20">
            <Milestone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Road Sites & Highway Stretches
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#064E3B] text-[#34D399] border border-[#065F46] text-[10px] font-black uppercase">
                Active Sections
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Manage multi-package road sections, chainage boundaries, supervisory teams, and fleet deployments.
            </p>
          </div>
        </div>

        {/* Add New Road Site Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Road Site Section</span>
          </button>
        </div>
      </div>

      {/* 4-Column Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Stretches */}
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Active Road Sites
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Milestone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {allRoadSites.length}{' '}
            <span className="text-xs font-semibold text-[#94A3B8]">Sections</span>
          </div>
          <div className="text-[11px] text-blue-400 font-medium mt-1">
            {projects.length} Parent Projects Configured
          </div>
        </div>

        {/* Card 2: Total Road Length */}
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Highway Execution
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {totalLengthKm.toFixed(1)}{' '}
            <span className="text-xs font-semibold text-[#94A3B8]">KM Length</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            MoRTH Flexible Pavement Specs
          </div>
        </div>

        {/* Card 3: Tipper Fleet */}
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Assigned Tippers
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {totalVehiclesCount}{' '}
            <span className="text-xs font-semibold text-[#94A3B8]">Vehicles</span>
          </div>
          <div className="text-[11px] text-amber-400 font-medium mt-1">
            Active Multi-Axle & 10-Tyre Fleet
          </div>
        </div>

        {/* Card 4: Supervisors */}
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Site Incharge
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {allRoadSites.length}{' '}
            <span className="text-xs font-semibold text-[#94A3B8]">Engineers</span>
          </div>
          <div className="text-[11px] text-purple-400 font-medium mt-1">
            Field Logins & Offline Delta Sync
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D111D] border border-[#1E293B] p-3 rounded-2xl">
        <input
          type="text"
          placeholder="Filter road sites by name, package code, location, or supervisor..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full sm:w-96 px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs placeholder-[#64748B] focus:border-blue-500 outline-none"
        />

        <div className="text-xs text-[#94A3B8] font-semibold">
          Showing <span className="text-white font-bold">{filteredSites.length}</span> of {allRoadSites.length} Road Sections
        </div>
      </div>

      {/* Road Site Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredSites.map((item) => {
          const isCurrent = item.site.id === selectedSiteId;
          const startKm = item.roadSec?.startChainage ?? 14.0;
          const endKm = item.roadSec?.endChainage ?? (startKm + item.lengthKm);

          return (
            <div
              key={item.site.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                isCurrent
                  ? 'bg-[#162032] border-blue-500/60 shadow-xl shadow-blue-600/10'
                  : 'bg-[#121927] border-[#1E293B] hover:border-slate-700'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-[#2563EB] text-white text-[10px] font-black rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active Site Context</span>
                </div>
              )}

              {/* Section Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#162032] border border-[#1E293B] text-blue-400 font-mono text-[10px] font-bold">
                        {item.site.code}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] font-semibold">
                        {item.project.name}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mt-1">
                      {item.site.name}
                    </h3>
                  </div>
                </div>

                {/* Chainage & Geometry Details */}
                <div className="p-3 bg-[#0D111D] border border-[#1E293B] rounded-2xl my-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8] font-semibold flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-400" />
                      <span>Chainage Stretch:</span>
                    </span>
                    <span className="text-white font-mono font-bold">
                      Ch. {startKm.toFixed(3)} → Ch. {endKm.toFixed(3)}
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
                      {item.site.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8] font-semibold flex items-center gap-1">
                      <HardHat className="w-3.5 h-3.5 text-amber-400" />
                      <span>Site Supervisor:</span>
                    </span>
                    <span className="text-white font-bold">
                      {item.site.supervisor}
                    </span>
                  </div>
                </div>

                {/* Assigned Tipper Roster */}
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

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {!isCurrent ? (
                    <button
                      onClick={() => handleSelectSite(item.site.id, item.project.id)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Set as Active Site Context</span>
                    </button>
                  ) : (
                    <div className="w-full py-1.5 text-center text-xs font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
                      ✓ Currently Active Site Context
                    </div>
                  )}
                </div>

                {/* Quick Navigation Links */}
                {onNavigateTab && (
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        handleSelectSite(item.site.id, item.project.id);
                        onNavigateTab('haulage-trips');
                      }}
                      className="p-1.5 rounded-lg bg-[#0D111D] hover:bg-[#162032] text-slate-300 hover:text-white border border-[#1E293B] text-[10px] font-bold text-center transition-colors cursor-pointer"
                    >
                      🚛 Trips Log
                    </button>
                    <button
                      onClick={() => {
                        handleSelectSite(item.site.id, item.project.id);
                        onNavigateTab('diesel');
                      }}
                      className="p-1.5 rounded-lg bg-[#0D111D] hover:bg-[#162032] text-slate-300 hover:text-white border border-[#1E293B] text-[10px] font-bold text-center transition-colors cursor-pointer"
                    >
                      ⛽ Diesel
                    </button>
                    <button
                      onClick={() => {
                        handleSelectSite(item.site.id, item.project.id);
                        onNavigateTab('road-yield');
                      }}
                      className="p-1.5 rounded-lg bg-[#0D111D] hover:bg-[#162032] text-slate-300 hover:text-white border border-[#1E293B] text-[10px] font-bold text-center transition-colors cursor-pointer"
                    >
                      📐 Yield Calc
                    </button>
                    <button
                      onClick={() => {
                        handleSelectSite(item.site.id, item.project.id);
                        onNavigateTab('site-expenses');
                      }}
                      className="p-1.5 rounded-lg bg-[#0D111D] hover:bg-[#162032] text-slate-300 hover:text-white border border-[#1E293B] text-[10px] font-bold text-center transition-colors cursor-pointer"
                    >
                      💰 Expenses
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Road Site Modal */}
      <CreateRoadSiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newId) => {
          setSelectedSiteId(newId);
        }}
      />
    </div>
  );
};
export default RoadSitesManagerModule;
