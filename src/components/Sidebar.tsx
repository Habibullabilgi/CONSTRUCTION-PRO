import React from 'react';
import { useERP } from '../context/ERPContext';
import {
  LayoutDashboard,
  Truck,
  Fuel,
  DollarSign,
  FileText,
  Calculator,
  HardHat,
  LogOut,
  Milestone,
  Users
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenArchitecture?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeStyle?: string;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useERP();

  // 1. SITE OPERATIONS
  const operationsItems: NavItem[] = [
    { id: 'dashboard', label: 'Site Overview', icon: LayoutDashboard },
    {
      id: 'road-sites',
      label: 'Ongoing Sites & Stretches',
      icon: Milestone,
      badge: 'Sites',
      badgeStyle: 'bg-blue-900/40 text-blue-300 border border-blue-500/40'
    },
    {
      id: 'haulage-trips',
      label: 'Trips',
      icon: Truck,
      badge: 'Trips',
      badgeStyle: 'bg-[#064E3B] text-[#34D399] border border-[#065F46]'
    },
    {
      id: 'diesel',
      label: 'Diesel',
      icon: Fuel,
      badge: 'Diesel',
      badgeStyle: 'bg-amber-950/60 text-amber-300 border border-amber-800'
    },
    {
      id: 'site-expenses',
      label: 'Site Cost & Expenses',
      icon: DollarSign,
      badge: 'Petty Cash',
      badgeStyle: 'bg-[#162032] text-blue-400 border border-[#1E293B]'
    }
  ];

  // 2. ENGINEERING
  const engineeringItems: NavItem[] = [
    {
      id: 'road-yield',
      label: 'Road Yield Calculator',
      icon: Calculator,
      badge: 'MoRTH',
      badgeStyle: 'bg-[#162032] text-blue-400 border border-[#1E293B]'
    },
    { id: 'reports', label: 'Daily Progress Report (DPR)', icon: FileText }
  ];

  // 3. ADMINISTRATION
  const administrationItems: NavItem[] = [
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      badge: 'RBAC',
      badgeStyle: 'bg-indigo-900/40 text-indigo-300 border border-indigo-500/40'
    }
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mb-1">
        {title}
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30'
                  : 'text-[#94A3B8] hover:bg-[#162032] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                    isActive ? 'bg-white/20 text-white' : item.badgeStyle
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="w-64 bg-[#0D111D] border-r border-[#1E293B] flex flex-col justify-between shrink-0 h-[calc(100vh-48px)] sticky top-12 overflow-y-auto select-none font-sans z-30 scrollbar-thin scrollbar-thumb-[#1E293B]">
      <div className="p-3.5 space-y-5">
        {/* Brand Card */}
        <div className="p-3 bg-[#121927] border border-[#1E293B] rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shrink-0 shadow-md shadow-blue-600/30">
              <HardHat className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-white uppercase tracking-wider truncate">
                PAVETRACK PRO
              </div>
              <div className="text-[10px] text-blue-400 font-mono truncate">
                Road Construction ERP
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: SITE OPERATIONS */}
        {renderNavGroup('SITE OPERATIONS', operationsItems)}

        {/* Section 2: ENGINEERING */}
        {renderNavGroup('ENGINEERING', engineeringItems)}

        {/* Section 3: ADMINISTRATION */}
        {renderNavGroup('ADMINISTRATION', administrationItems)}
      </div>

      {/* User Profile Card at Bottom */}
      <div className="p-3 border-t border-[#1E293B] bg-[#080C14]">
        <div className="p-2 rounded-xl bg-[#121927] border border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Habibulla Bilgi'}
              </div>
              <div className="text-[10px] text-[#94A3B8] truncate">
                Site Engineer & Admin
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#162032] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
