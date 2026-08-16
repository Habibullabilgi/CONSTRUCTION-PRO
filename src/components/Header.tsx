import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { UserRole } from '../types/erp';
import {
  Menu,
  Search,
  ChevronDown,
  Shield,
  Check,
  Wifi,
  WifiOff,
  Building2,
  Bell,
  Activity,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  LogOut
} from 'lucide-react';
import CreateRoadSiteModal from './modals/CreateRoadSiteModal';
import { ClearDataModal } from './modals/ClearDataModal';

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
  onOpenArchitecture
}) => {
  const erpContext = useERP();
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    selectedSiteId,
    setSelectedSiteId,
    siteSheets,
    userRole,
    setUserRole,
    currentUser,
    logout
  } = erpContext;

  const [isSiteOpen, setIsSiteOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddRoadSiteOpen, setIsAddRoadSiteOpen] = useState(false);
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'OWNER';

  const roles: { role: UserRole; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Admin User (Habibulla Bilgi)' },
    { role: 'SITE_ENGINEER', label: 'Site Engineer (Civil & Yield)' },
    { role: 'SITE_SUPERVISOR', label: 'Site Supervisor (Ibrahim)' },
    { role: 'STORE_MANAGER', label: 'Store & Accounts (Neha)' },
    { role: 'OWNER', label: 'Project Director' }
  ];

  const currentSiteSheet = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];

  // Direct 1-Click Permanent Site Deletion Logic
  const handleExecuteDeleteSite = () => {
    if (!siteToDelete) return;

    const targetId = siteToDelete.id;

    if (typeof (erpContext as any).deleteSite === 'function') {
      (erpContext as any).deleteSite(targetId);
    } else {
      try {
        const savedDeleted = localStorage.getItem('PAVETRACK_DELETED_SITE_IDS');
        const list = savedDeleted ? JSON.parse(savedDeleted) : [];
        if (!list.includes(targetId)) {
          list.push(targetId);
          localStorage.setItem('PAVETRACK_DELETED_SITE_IDS', JSON.stringify(list));
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('trip') || q.includes('tipper') || q.includes('haul') || q.includes('weigh')) {
      setActiveTab('haulage-trips');
    } else if (q.includes('diesel') || q.includes('fuel') || q.includes('bowser')) {
      setActiveTab('diesel');
    } else if (q.includes('exp') || q.includes('cost') || q.includes('petty')) {
      setActiveTab('site-expenses');
    } else if (q.includes('yield') || q.includes('calc')) {
      setActiveTab('road-yield');
    } else if (q.includes('machin') || q.includes('fleet')) {
      setActiveTab('machinery');
    } else if (q.includes('dpr') || q.includes('report')) {
      setActiveTab('reports');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="h-12 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-4 text-xs select-none font-sans z-40 relative">
      {/* Left: Menu Toggle + Project / Site Selector Dropdown */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162032] transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Project & Site Selector Dropdown */}
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

                      {/* Delete Site Button */}
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

              {/* Add New Road Site Section Action */}
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

      {/* Center: Search input */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center relative w-80 max-w-sm"
      >
        <Search className="w-3.5 h-3.5 absolute left-3 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Quick search equipment, trips, diesel, yield..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#121927] border border-[#1E293B] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-blue-500 transition-colors"
        />
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Site Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#064E3B] text-[#34D399] border border-[#065F46] text-[11px] font-black">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>Site Active (Shift Day-1)</span>
        </div>

        {/* Notifications Badge */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-1.5 rounded-xl bg-[#121927] border border-[#1E293B] text-slate-300 hover:text-white hover:bg-[#162032] transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl p-3 z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5 text-[11px] font-bold text-white">
                <span>Site Alerts & Telematics</span>
                <span className="text-[10px] text-rose-400 font-mono">2 Critical</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-[#450A0A] border border-[#7F1D1D] rounded-xl text-[#F87171]">
                  <div className="font-bold">Low Fuel Alert (12%)</div>
                  <div className="text-[10px] text-rose-300">Hitachi ZX210 Excavator requires bowser refuel</div>
                </div>
                <div className="p-2 bg-[#451A03] border border-[#78350F] rounded-xl text-[#FBBF24]">
                  <div className="font-bold">Maintenance Due (15h)</div>
                  <div className="text-[10px] text-amber-300">HAMM HD90 Roller 250h service checkpoint</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connectivity Mode */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          title="Click to toggle offline mode simulation"
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isOnline
              ? 'bg-[#064E3B] text-[#34D399] border border-[#065F46]'
              : 'bg-[#450A0A] text-[#F87171] border border-[#7F1D1D] animate-pulse'
          }`}
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </button>

        {/* Clear Data (Super Admin Only) */}
        {isSuperAdmin && (
          <button
            onClick={() => setIsClearDataOpen(true)}
            title="Clear all transactional data or reset database"
            className="p-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/60 border border-[#1E293B] hover:border-rose-700/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px] font-semibold">Clear Data</span>
          </button>
        )}

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121927] border border-[#1E293B] hover:border-slate-700 rounded-xl text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[110px]">
              {roles.find((r) => r.role === userRole)?.label.split(' ')[0] || 'Admin'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </button>

          {isRoleOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] border-b border-[#1E293B]">
                Switch Operator Role
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    setUserRole(r.role);
                    setIsRoleOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#162032] ${
                    userRole === r.role ? 'text-blue-400 font-bold bg-[#162032]/60' : 'text-slate-300'
                  }`}
                >
                  <span>{r.label}</span>
                  {userRole === r.role && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] hover:border-rose-700/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Logout</span>
        </button>
      </div>

      {/* Direct Confirmation Modal (No typing required) */}
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

      {/* Clear Data Modal */}
      <ClearDataModal
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
      />
    </header>
  );
};
