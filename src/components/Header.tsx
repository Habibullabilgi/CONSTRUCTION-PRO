headertext

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { UserRole } from '../types/erp';
import {
  Menu,
  Search,
  ChevronDown,
  HardHat,
  Shield,
  Check,
  Cpu,
  Wifi,
  WifiOff,
  Building2,
  Bell,
  Activity,
  Layers,
  Plus,
  Milestone,
  Trash2
} from 'lucide-react';
import CreateProjectModal from './modals/CreateProjectModal';
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
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    selectedSiteId,
    setSelectedSiteId,
    siteSheets,
    userRole,
    setUserRole,
    currentUser
  } = useERP();

  const [isSiteOpen, setIsSiteOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddRoadSiteOpen, setIsAddRoadSiteOpen] = useState(false);
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  const roles: { role: UserRole; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Admin User (Habibulla Bilgi)' },
    { role: 'SITE_ENGINEER', label: 'Site Engineer (Civil & Yield)' },
    { role: 'SITE_SUPERVISOR', label: 'Site Supervisor (Ibrahim)' },
    { role: 'STORE_MANAGER', label: 'Store & Accounts (Neha)' },
    { role: 'OWNER', label: 'Project Director' }
  ];

  const currentSiteSheet = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];

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
              {currentSiteSheet ? currentSiteSheet.siteName : 'NH-48 Highway Extension - Package 3'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {isSiteOpen && (
            <div className="absolute left-0 mt-1.5 w-80 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] border-b border-[#1E293B] flex items-center justify-between">
                <span>Active Highway Site Stretches</span>
                <span className="text-blue-400 font-mono">{siteSheets.length} Sites</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {siteSheets.map((s) => (
                  <button
                    key={s.siteId}
                    onClick={() => {
                      setSelectedSiteId(s.siteId);
                      setIsSiteOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#162032] transition-colors ${
                      selectedSiteId === s.siteId ? 'text-blue-400 font-bold bg-[#162032]/60' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{s.siteName}</div>
                      <div className="text-[10px] text-[#94A3B8]">
                        {s.vehicles.length} Tippers Configured
                      </div>
                    </div>
                    {selectedSiteId === s.siteId && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>

              {/* Add New Road Site Section Action */}
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

      {/* Right: Site Status Indicator + Notifications + Connectivity + Role */}
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

        {/* Network Connectivity Simulator Button */}
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

        {/* Clear Data / Reset Database Button */}
        <button
          onClick={() => setIsClearDataOpen(true)}
          title="Clear all transactional data or reset database"
          className="p-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/60 border border-[#1E293B] hover:border-rose-700/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px] font-semibold">Clear Data</span>
        </button>

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
      </div>
      {/* Add Road Site Modal */}
      <CreateRoadSiteModal
        isOpen={isAddRoadSiteOpen}
        onClose={() => setIsAddRoadSiteOpen(false)}
      />
      {/* Clear Data & Reset Database Modal */}
      <ClearDataModal
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
      />
    </header>
  );
};
