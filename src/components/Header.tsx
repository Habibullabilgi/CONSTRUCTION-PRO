import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Menu,
  ChevronDown,
  Building2,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  LogOut
} from 'lucide-react';
import CreateRoadSiteModal from './modals/CreateRoadSiteModal';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
  onOpenArchitecture?: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onToggleSidebar,
}) => {
  const erpContext = useERP();
  const {
    selectedSiteId,
    setSelectedSiteId,
    siteSheets,
    userRole,
    logout
  } = erpContext;

  const [isSiteOpen, setIsSiteOpen] = useState(false);
  const [isAddRoadSiteOpen, setIsAddRoadSiteOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<{ id: string; name: string } | null>(null);

  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'OWNER';
  const currentSiteSheet = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];

  const handleExecuteDeleteSite = () => {
    if (!siteToDelete) return;

    const targetId = siteToDelete.id;

    if (typeof (erpContext as any).deleteSite === 'function') {
      (erpContext as any).deleteSite(targetId);
    } else {
      try {
        const savedDeleted = localStorage.getItem('CONSTRUCTION_PRO_DELETED_SITE_IDS');
        const list = savedDeleted ? JSON.parse(savedDeleted) : [];
        if (!list.includes(targetId)) {
          list.push(targetId);
          localStorage.setItem('CONSTRUCTION_PRO_DELETED_SITE_IDS', JSON.stringify(list));
        }

        const savedSheets = localStorage.getItem('INFRABUILD_ERP_STATE_V1_SITE_SHEETS');
        if (savedSheets) {
          const parsed = JSON.parse(savedSheets);
          const filtered = parsed.filter((s: any) => s.siteId !== targetId);
          localStorage.setItem('INFRABUILD_ERP_STATE_V1_SITE_SHEETS', JSON.stringify(filtered));
        }
      } catch (e) {
        console.error(e);
      }
      window.location.reload();
    }

    setSiteToDelete(null);
    setIsSiteOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      if (typeof logout === 'function') {
        logout();
      } else {
        sessionStorage.clear();
        localStorage.removeItem('INFRABUILD_ERP_STATE_V1_AUTH');
        window.location.reload();
      }
    }
  };

  return (
    <header className="h-12 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-4 text-xs select-none font-sans z-40 relative">
      {/* Left: Menu Toggle + Site Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162032] transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Site Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSiteOpen(!isSiteOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#121927] hover:bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-blue-400 truncate max-w-[220px] sm:max-w-[340px]">
              {currentSiteSheet ? currentSiteSheet.siteName : 'Select Site'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {isSiteOpen && (
            <div className="absolute left-0 mt-1.5 w-84 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] border-b border-[#1E293B] flex items-center justify-between">
                <span>Active Highway Site Stretches</span>
                <span className="text-blue-400 font-mono">{siteSheets.length} Sites</span>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {siteSheets.map((s) => (
                  <div
                    key={s.siteId}
                    className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#162032] transition-colors group ${
                      selectedSiteId === s.siteId ? 'bg-[#162032]/60' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSiteId(s.siteId);
                        setIsSiteOpen(false);
                      }}
                      className="flex-1 text-left"
                    >
                      <div
                        className={`font-semibold ${
                          selectedSiteId === s.siteId ? 'text-blue-400 font-bold' : 'text-white'
                        }`}
                      >
                        {s.siteName}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        {s.vehicles?.length || 0} Tippers Configured
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      {selectedSiteId === s.siteId && <Check className="w-3.5 h-3.5 text-blue-400" />}

                      {isSuperAdmin && siteSheets.length > 1 && (
                        <button
                          type="button"
                          title={`Delete ${s.siteName}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSiteToDelete({ id: s.siteId, name: s.siteName });
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isSuperAdmin && (
                <div className="p-2 border-t border-[#1E293B] bg-[#0D111D] rounded-b-2xl">
                  <button
                    onClick={() => {
                      setIsSiteOpen(false);
                      setIsAddRoadSiteOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-300 hover:text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Road Site Section</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Logout Action */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className="px-3 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] hover:border-rose-700/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold">Logout</span>
        </button>
      </div>

      {/* Direct Confirmation Modal */}
      {siteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121927] border border-rose-900/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between bg-rose-950/30">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Delete Site</span>
              </div>
              <button
                type="button"
                onClick={() => setSiteToDelete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-300">
              <p>
                Are you sure you want to permanently delete{' '}
                <strong className="text-white font-bold">{siteToDelete.name}</strong>?
              </p>
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-[11px] space-y-1">
                <p className="font-bold">This will permanently remove:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                  <li>All material matrix sheets (Murum, GSB, WMM, Diesel)</li>
                  <li>All road chainage sections, layer logs, and trips</li>
                </ul>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#1E293B] bg-[#0D111D] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSiteToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDeleteSite}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Site Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Road Site Modal */}
      <CreateRoadSiteModal
        isOpen={isAddRoadSiteOpen}
        onClose={() => setIsAddRoadSiteOpen(false)}
      />
    </header>
  );
};

export default Header;
