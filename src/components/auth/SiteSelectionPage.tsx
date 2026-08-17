import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Building2,
  Plus,
  ArrowRight,
  MapPin,
  Truck,
  HardHat,
  LogOut,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';

interface Props {
  onSelectSite: (siteId: string) => void;
}

export const SiteSelectionPage: React.FC<Props> = ({ onSelectSite }) => {
  const { siteSheets = [], addRoadSiteSection, logout, currentUser, userRole } = useERP();
  
  const currentRoleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = currentRoleStr.includes('admin');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSupervisor, setNewSupervisor] = useState(currentUser?.name || 'Ibrahim (Site Incharge)');
  const [startChainage, setStartChainage] = useState<number>(0);
  const [endChainage, setEndChainage] = useState<number>(10);

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim()) return;

    const newId = addRoadSiteSection({
      siteName: newSiteName.trim().toUpperCase(),
      location: newLocation.trim() || 'Highway Project Stretch',
      supervisor: newSupervisor.trim(),
      startChainageKm: Number(startChainage),
      endChainageKm: Number(endChainage)
    });

    setIsAddModalOpen(false);
    setNewSiteName('');
    setNewLocation('');
    onSelectSite(newId);
  };

  return (
    <div className="min-h-screen w-full bg-[#080C14] text-slate-100 flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-6 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-blue-400 font-mono uppercase">
              Road Construction ERP
            </span>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              CONSTRUCTION PRO
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-white">{currentUser?.name || 'Habibulla Bilgi'}</div>
            <div className="text-[11px] text-blue-400 font-mono">{currentUser?.role || 'Admin'}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl w-full mx-auto my-auto py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Select Active Construction Site
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Choose an ongoing road package to access live material trippage, diesel bowsers, and telemetry.
          </p>
        </div>

        {siteSheets.length === 0 ? (
          /* Empty State: Prompt to create the first site */
          <div className="p-10 rounded-3xl bg-[#0c1427] border border-[#182643] text-center max-w-lg mx-auto shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400 shadow-md">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">No Sites Configured</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                There are no active road stretches or site packages registered in the system yet.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Site Stretch</span>
            </button>
          </div>
        ) : (
          /* Site Cards Grid */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {siteSheets.map((site) => (
                <div
                  key={site.siteId}
                  onClick={() => onSelectSite(site.siteId)}
                  className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] hover:border-blue-500/60 hover:bg-[#111c36] transition-all cursor-pointer group shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#080d19] px-2 py-0.5 rounded-md border border-[#182643]">
                        {site.siteId}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                      {site.siteName}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-[#182643] flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      {site.vehicles?.length || 0} Tippers
                    </span>
                    <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Launch Site</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}

              {/* Add Site Stretch Card (Admin Access) */}
              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="p-5 rounded-3xl border-2 border-dashed border-[#1E293B] hover:border-blue-500/50 bg-[#0c1427]/30 hover:bg-[#0c1427] transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 min-h-[140px] group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-300 group-hover:text-white">
                    + Add New Site Section
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E293B] pt-4 text-center text-[11px] text-slate-500 font-mono">
        Secured Road Project Dispatch & Asset Management
      </div>

      {/* Add Road Site Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Create Road Construction Site</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Site Name / Package Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SINDAGI - ALMEL ROAD"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Location / Route Stretch
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Highway 128 Stretch"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Start Chainage (Km)
                  </label>
                  <input
                    type="number"
                    value={startChainage}
                    onChange={(e) => setStartChainage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    End Chainage (Km)
                  </label>
                  <input
                    type="number"
                    value={endChainage}
                    onChange={(e) => setEndChainage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Site Supervisor / Incharge
                </label>
                <input
                  type="text"
                  value={newSupervisor}
                  onChange={(e) => setNewSupervisor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Create & Launch Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteSelectionPage;
