import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Fuel,
  TrendingDown,
  Search,
  Download,
  Building2,
  X,
  ArrowRight
} from 'lucide-react';

export interface SiteExpenseItem {
  id: string;
  siteId: string;
  siteName: string;
  date: string;
  category: 'Machinery Maintenance' | 'Petty Cash' | 'Site Labour' | 'Safety & PPE' | 'Toll & Transport' | 'Miscellaneous';
  title: string;
  vendorName: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI / Online' | 'Bank Transfer' | 'Cheque';
  status: 'PAID' | 'PENDING';
}

const STORAGE_EXPENSES_KEY = 'CONSTRUCTION_PRO_SITE_EXPENSES_V2';
const STORAGE_TRIPS_KEY = 'CONSTRUCTION_PRO_DAY_TRIPS_V3';
const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_VOUCHERS_V1';

export const SiteCostExpensesModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId, setSelectedSiteId } = useERP();

  // 1. Active Sites List
  const activeSites = useMemo(() => {
    if (siteSheets && siteSheets.length > 0) {
      return siteSheets.map((s) => ({
        id: s.siteId,
        name: s.siteName
      }));
    }
    return [
      { id: 'site-sindagi', name: 'SINDAGI - ALMEL ROAD' }
    ];
  }, [siteSheets]);

  const [currentSiteId, setCurrentSiteId] = useState<string>(
    selectedSiteId || activeSites[0]?.id || 'site-sindagi'
  );

  useEffect(() => {
    if (selectedSiteId) {
      setCurrentSiteId(selectedSiteId);
    }
  }, [selectedSiteId]);

  const currentSiteName = useMemo(() => {
    const matched = activeSites.find((s) => s.id === currentSiteId);
    return matched ? matched.name : activeSites[0]?.name || 'SINDAGI - ALMEL ROAD';
  }, [activeSites, currentSiteId]);

  // 2. Direct Site Expenses State (Strictly 0 if no entries exist)
  const [expenses, setExpenses] = useState<SiteExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPENSES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 3. Live Trips & Material Billing Amount (Defaults to 0)
  const [materialTripsBilling, setMaterialTripsBilling] = useState<number>(0);

  // 4. Live Diesel Dispensed Cost (Defaults to 0)
  const [dieselDispensedCost, setDieselDispensedCost] = useState<number>(0);

  // Sync with storage and compute site-specific values
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
      const siteQuery = currentSiteName.trim().toLowerCase();

      // Read Trips data for THIS site only
      const savedTrips =
        localStorage.getItem(STORAGE_TRIPS_KEY) ||
        localStorage.getItem('CONSTRUCTION_PRO_DAY_TRIPS_V2');
      if (savedTrips) {
        const parsed = JSON.parse(savedTrips);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const siteTripsSum = parsed
            .filter(
              (t: any) =>
                t.siteName &&
                (t.siteName.toLowerCase().includes(siteQuery) ||
                  siteQuery.includes(t.siteName.toLowerCase()))
            )
            .reduce((sum: number, t: any) => sum + (Number(t.totalAmount) || 0), 0);
          setMaterialTripsBilling(siteTripsSum);
        } else {
          setMaterialTripsBilling(0);
        }
      } else {
        setMaterialTripsBilling(0);
      }

      // Read Diesel data for THIS site only
      const savedDiesel = localStorage.getItem(STORAGE_DIESEL_KEY);
      if (savedDiesel) {
        const parsed = JSON.parse(savedDiesel);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const siteDieselSum = parsed
            .filter(
              (d: any) =>
                d.siteName &&
                (d.siteName.toLowerCase().includes(siteQuery) ||
                  siteQuery.includes(d.siteName.toLowerCase()))
            )
            .reduce((sum: number, d: any) => sum + (Number(d.totalCost) || 0), 0);
          setDieselDispensedCost(siteDieselSum);
        } else {
          setDieselDispensedCost(0);
        }
      } else {
        setDieselDispensedCost(0);
      }
    } catch (e) {
      console.error(e);
      setMaterialTripsBilling(0);
      setDieselDispensedCost(0);
    }
  }, [expenses, currentSiteId, currentSiteName]);

  // Modal & Filter States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<SiteExpenseItem['category']>('Machinery Maintenance');
  const [formTitle, setFormTitle] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formPaymentMode, setFormPaymentMode] = useState<SiteExpenseItem['paymentMode']>('Cash');
  const [formStatus, setFormStatus] = useState<'PAID' | 'PENDING'>('PAID');

  // Computed Outflow Sums for THIS Site
  const siteDirectExpensesTotal = useMemo(() => {
    const siteQuery = currentSiteName.trim().toLowerCase();
    return expenses
      .filter(
        (e) =>
          (e.siteId && e.siteId === currentSiteId) ||
          (e.siteName &&
            (e.siteName.toLowerCase().includes(siteQuery) ||
              siteQuery.includes(e.siteName.toLowerCase())))
      )
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses, currentSiteId, currentSiteName]);

  const paidExpensesTotal = useMemo(() => {
    const siteQuery = currentSiteName.trim().toLowerCase();
    return expenses
      .filter(
        (e) =>
          ((e.siteId && e.siteId === currentSiteId) ||
            (e.siteName &&
              (e.siteName.toLowerCase().includes(siteQuery) ||
                siteQuery.includes(e.siteName.toLowerCase())))) &&
          e.status === 'PAID'
      )
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses, currentSiteId, currentSiteName]);

  const totalSiteOutflow = siteDirectExpensesTotal + materialTripsBilling + dieselDispensedCost;

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount || Number(formAmount) <= 0) return;

    const newExp: SiteExpenseItem = {
      id: `exp-${Date.now()}`,
      siteId: currentSiteId,
      siteName: currentSiteName,
      date: formDate,
      category: formCategory,
      title: formTitle.trim(),
      vendorName: formVendor.trim() || 'General Vendor',
      amount: Number(formAmount),
      paymentMode: formPaymentMode,
      status: formStatus
    };

    setExpenses([newExp, ...expenses]);
    setIsRecordModalOpen(false);
    setFormTitle('');
    setFormVendor('');
    setFormAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Delete this site expense voucher?')) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  const handleTogglePaid = (id: string) => {
    setExpenses(
      expenses.map((e) =>
        e.id === id ? { ...e, status: e.status === 'PAID' ? 'PENDING' : 'PAID' } : e
      )
    );
  };

  const handleExportStatement = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Site,Category,Voucher Title,Vendor,Payment Mode,Status,Amount (INR)']
        .concat(
          expenses.map(
            (e) =>
              `"${e.date}","${e.siteName}","${e.category}","${e.title}","${e.vendorName}","${e.paymentMode}","${e.status}",${e.amount}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentSiteName.replace(/\s+/g, '_')}_Expense_Statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredExpenses = expenses.filter((e) => {
    const siteQuery = currentSiteName.trim().toLowerCase();
    const matchesSite =
      (e.siteId && e.siteId === currentSiteId) ||
      (e.siteName &&
        (e.siteName.toLowerCase().includes(siteQuery) ||
          siteQuery.includes(e.siteName.toLowerCase())));
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.date.includes(searchQuery);
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSite && matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-rose-600 selection:text-white">
      {/* 1. Header Banner & Ongoing Site Selector */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-600/20">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800 text-[10px] font-black uppercase tracking-wider">
              DEDICATED SITE COST & EXPENSE LEDGER
            </span>

            <div className="mt-1 flex items-center gap-2">
              <select
                value={currentSiteId}
                onChange={(e) => {
                  setCurrentSiteId(e.target.value);
                  if (typeof setSelectedSiteId === 'function') {
                    setSelectedSiteId(e.target.value);
                  }
                }}
                className="bg-transparent text-2xl sm:text-3xl font-black text-white outline-none cursor-pointer border-b border-dashed border-slate-600 pb-0.5"
              >
                {activeSites.map((site) => (
                  <option
                    key={site.id}
                    value={site.id}
                    className="bg-[#121927] text-white text-base font-bold"
                  >
                    {site.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Site Expense</span>
          </button>

          <button
            onClick={handleExportStatement}
            className="px-4 py-3 rounded-2xl bg-[#142038] hover:bg-[#1e2f52] border border-[#22365e] text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Download CSV Statement"
          >
            <Download className="w-4 h-4" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Live Financial Telemetry Cards (Defaults to 0) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Site Direct Expenses */}
        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Site Direct Expenses</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-white font-mono">
              ₹{siteDirectExpensesTotal.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              Paid: ₹{paidExpensesTotal.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Card 2: Matrix Material Logs */}
        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Matrix Material Logs</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-cyan-400 font-mono">
              ₹{materialTripsBilling.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {materialTripsBilling > 0 ? 'Murum, Sand, 20mm, GSB, WMM' : 'No material trips logged'}
            </div>
          </div>
        </div>

        {/* Card 3: Site Diesel Dispensed */}
        <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Site Diesel Dispensed</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400 font-mono">
              ₹{dieselDispensedCost.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-400/80 font-mono mt-1">
              {dieselDispensedCost > 0 ? 'From DIESEL Dispense Log' : 'No fuel dispensed'}
            </div>
          </div>
        </div>

        {/* Card 4: Total Site Outflow */}
        <div className="p-5 rounded-3xl bg-[#140a16] border border-rose-950/70 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total Site Outflow</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-3xl font-black text-white font-mono">
              ₹{totalSiteOutflow.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              All Materials, Fuel & Site Operations
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cost Breakdown Banner */}
      <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#182643] flex items-center gap-2 text-xs font-bold text-slate-300">
        <Building2 className="w-4 h-4 text-rose-400" />
        <span>{currentSiteName.toUpperCase()} — COST BREAKDOWN & PETTY CASH VOUCHERS</span>
      </div>

      {/* 4. Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D111D] border border-[#1E293B] p-3 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-rose-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Machinery Maintenance">Machinery Maintenance</option>
            <option value="Petty Cash">Petty Cash</option>
            <option value="Site Labour">Site Labour</option>
            <option value="Safety & PPE">Safety & PPE</option>
            <option value="Toll & Transport">Toll & Transport</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-rose-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search voucher, title, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-rose-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* 5. Vouchers Ledger Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1E293B] bg-[#0d1527]/50 flex items-center justify-between">
          <div className="font-bold text-sm text-white">Voucher Expenses Ledger</div>
          <div className="text-xs text-slate-400">{filteredExpenses.length} Records</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Voucher Title</th>
                <th className="py-3 px-4">Vendor / Payee</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No expense vouchers logged for this site. Click "+ Record Site Expense" to add.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">{exp.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{exp.title}</td>
                    <td className="py-3.5 px-4 text-slate-300">{exp.vendorName}</td>
                    <td className="py-3.5 px-4 text-slate-400">{exp.paymentMode}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-rose-400 text-sm">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePaid(exp.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer border transition-colors ${
                          exp.status === 'PAID'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800'
                        }`}
                      >
                        {exp.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal: Record Site Expense */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <DollarSign className="w-5 h-5 text-rose-500" />
                <span>Record Site Expense Voucher</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ongoing Site</label>
                  <input
                    type="text"
                    readOnly
                    value={currentSiteName}
                    className="w-full px-3 py-2 bg-[#162032]/60 border border-[#1E293B] rounded-xl text-slate-400 font-medium outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Expense Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-rose-500 cursor-pointer font-medium"
                >
                  <option value="Machinery Maintenance">Machinery Maintenance</option>
                  <option value="Petty Cash">Petty Cash</option>
                  <option value="Site Labour">Site Labour</option>
                  <option value="Safety & PPE">Safety & PPE</option>
                  <option value="Toll & Transport">Toll & Transport</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Voucher Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tipper puncture repair & grease oil"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Bilgi Auto Spares"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 4500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-rose-400 font-mono font-bold outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Payment Mode</label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-rose-500 cursor-pointer font-medium"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI / Online">UPI / Online</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-rose-500 cursor-pointer font-medium"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg shadow-rose-600/30 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>Save Expense Voucher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteCostExpensesModule;
