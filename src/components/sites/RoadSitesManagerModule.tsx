import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Milestone,
  Building2,
  Plus,
  Trash2,
  MapPin,
  Truck,
  X
} from 'lucide-react';

interface Props {
  onNavigateTab?: (tab: string) => void;
}

export const RoadSitesManagerModule: React.FC<Props> = () => {
  const { siteSheets = [], setSiteSheets, addRoadSiteSection, selectedSiteId, setSelectedSiteId, currentUser, userRole } = useERP();

  const currentRoleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = currentRoleStr.includes('admin');

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [siteCategory, setSiteCategory] = useState<'ROAD' | 'BUILDING'>('ROAD');
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState('');
  const [supervisor, setSupervisor] = useState(currentUser?.name || 'Er. Habibulla Bilgi');
  const [startKm, setStartKm] = useState<number | ''>(0);
  const [endKm, setEndKm] = useState<number | ''>(12.5);
  const [buildingFloors, setBuildingFloors] = useState('G + 12 Floors');

  const isRoad = siteCategory === 'ROAD';

  const handleDeleteSite = (e: React.MouseEvent, siteId: string, name: string) => {
    e.stopPropagation(); // Prevent card selection click

    if (window.confirm(`Are you sure you want to delete "${name}"? All associated local data for this section will be removed.`)) {
      const remainingSites = siteSheets.filter((s: any) => s.siteId !== siteId);
      if (setSiteSheets) {
        setSiteSheets(remainingSites);
      }
      
      // Also update localStorage if persisting directly
      try {
        localStorage.setItem('CONSTRUCTION_PRO_ERP_STORAGE_V7_SHEETS', JSON.stringify(remainingSites));
      } catch (err) {
        console.error(err);
      }

      // If the deleted site was currently active, select the first remaining site
      if (selectedSiteId === siteId && remainingSites.length > 0) {
        setSelectedSiteId(remainingSites[0].siteId);
      }
    }
  };

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return;

    const newId = addRoadSiteSection({
      siteName: siteName.trim().toUpperCase(),
      location: location.trim() || (isRoad ? 'Highway Corridor Stretch' : 'Building Site Campus'),
      supervisor: supervisor.trim() || 'Site Incharge',
      startChainageKm: isRoad ? Number(startKm) || 0 : 0,
      endChainageKm: isRoad ? Number(endKm) || 0 : 0,
      projectType: siteCategory,
      category: siteCategory,
      buildingFloors: !isRoad ? buildingFloors : undefined
    });

    setIsModalOpen(false);
    setSiteName('');
    setLocation('');
    if (newId) setSelectedSiteId(newId);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Milestone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800 text-[10px] font-black uppercase">
                Active Projects
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {siteSheets.length} Registered Packages
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Site Section & Package Management
            </h1>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSiteCategory('ROAD');
              setSiteName('');
              setLocation('');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Ongoing Site Section</span>
          </button>
        )}
      </div>

      {/* Grid of Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {siteSheets.map((site: any) => {
          const isSelected = site.siteId === selectedSiteId;
          const siteIsRoad = (site.projectType || site.category || 'ROAD').toUpperCase() === 'ROAD';

          return (
            <div
              key={site.siteId}
              onClick={() => setSelectedSiteId(site.siteId)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xl relative group ${
                isSelected
                  ? 'bg-[#111c36] border-blue-500 shadow-blue-950/40'
                  : 'bg-[#0c1427] border-[#182643] hover:border-slate-600'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] bg-[#080d19] text-blue-400 border border-[#182643] uppercase">
                    {siteIsRoad ? 'Road Section' : 'Building Site'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{site.siteId}</span>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteSite(e, site.siteId, site.siteName)}
                        title="Delete Site Section"
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{site.siteName}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{site.location || 'Site Corridor Stretch'}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#080d19] border border-[#182643] space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Supervisor:</span>
                  <span className="font-bold text-white">{site.supervisor || 'Site Incharge'}</span>
                </div>
                {siteIsRoad ? (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Chainage:</span>
                    <span className="font-mono text-blue-400 font-bold">
                      Km {site.startChainageKm || 0} – {site.endChainageKm || 10}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Structure:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {site.buildingFloors || 'G + 12 Floors'}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#182643] flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  {site.vehicles?.length || 0} Assigned Fleet
                </span>
                <span className={`font-bold ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                  {isSelected ? '● Active Selection' : 'Select Site'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Ongoing Site Section */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Milestone className="w-5 h-5 text-blue-400" />
                <span>Add Ongoing Site Section</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Site Construction Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSiteCategory('ROAD')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isRoad
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm'
                        : 'bg-[#162032] border-[#1E293B] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Milestone className="w-3.5 h-3.5" />
                    <span>Road Construction</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSiteCategory('BUILDING')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      !isRoad
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm'
                        : 'bg-[#162032] border-[#1E293B] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Building Construction</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isRoad ? 'Site Section Name *' : 'Building / Tower Project Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRoad ? 'e.g. NH-50 Section Package B' : 'e.g. BILGI HEIGHTS TOWER-A'}
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isRoad ? 'Location / Corridor' : 'Site Location / Campus'}
                </label>
                <input
                  type="text"
                  placeholder={isRoad ? 'e.g. Km 12+000 to 24+500' : 'e.g. Sector 4 Commercial Zone'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Site Supervisor</label>
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              {isRoad ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Start Km</label>
                    <input
                      type="number"
                      step="0.1"
                      value={startKm}
                      onChange={(e) => setStartKm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">End Km</label>
                    <input
                      type="number"
                      step="0.1"
                      value={endKm}
                      onChange={(e) => setEndKm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Building Structure / Floor Scope</label>
                  <input
                    type="text"
                    value={buildingFloors}
                    onChange={(e) => setBuildingFloors(e.target.value)}
                    placeholder="e.g. Basement + Ground + 12 Floors"
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
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
