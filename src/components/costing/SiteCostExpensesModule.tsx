import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { SiteExpenseRecord, SiteExpenseCategory } from '../../types/erp';
import {
  DollarSign,
  Plus,
  Filter,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  Fuel,
  Wrench,
  Users,
  FileText,
  ShieldCheck,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Printer,
  Calendar
} from 'lucide-react';

const EXPENSE_CATEGORIES: SiteExpenseCategory[] = [
  'Diesel / Fuel',
  'Machinery Maintenance & Spares',
  'Labour & Operator Wages',
  'RTO / Royalty / Taxes',
  'Water Tanker & Bowser',
  'Civil Tools & Consumables',
  'Site Overheads & Mess',
  'Raw Material / Quarry',
  'Machinery Rental',
  'Vehicle / Tipper Running & Hire',
  'Other'
];

export const SiteCostExpensesModule: React.FC = () => {
  const {
    siteExpenses,
    addSiteExpense,
    deleteSiteExpense,
    updateSiteExpenseStatus,
    siteSheets,
    projects
  } = useERP();

  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-mulwad');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add Expense Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<SiteExpenseCategory>('Diesel / Fuel');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formVehicle, setFormVehicle] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formPaymentMode, setFormPaymentMode] = useState('UPI / PhonePe');
  const [formApprovedBy, setFormApprovedBy] = useState('Habibulla Bilgi');
  const [formVoucherNo, setFormVoucherNo] = useState('');

  // Selected Site Object
  const currentSheet = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];
  const siteName = currentSheet?.siteName || 'MULWAD SITE';

  // Filter site expenses for the selected site
  const siteExpenseList = useMemo(() => {
    return siteExpenses.filter((e) => e.siteId === selectedSiteId);
  }, [siteExpenses, selectedSiteId]);

  // Tab values from Site Trip Matrix for this site
  const siteMatrixMaterialValue = useMemo(() => {
    if (!currentSheet) return 0;
    return currentSheet.tabs
      .filter((t) => t.tabKey !== 'DESIEL')
      .reduce((sum, tab) => {
        const totalQty = tab.rows.reduce((rSum, r) => rSum + r.total, 0);
        return sum + totalQty * tab.defaultRate;
      }, 0);
  }, [currentSheet]);

  const siteMatrixDieselValue = useMemo(() => {
    if (!currentSheet) return 0;
    const dieselTab = currentSheet.tabs.find((t) => t.tabKey === 'DESIEL');
    if (!dieselTab) return 0;
    const totalLitres = dieselTab.rows.reduce((rSum, r) => rSum + r.total, 0);
    return totalLitres * dieselTab.defaultRate;
  }, [currentSheet]);

  // Expenses totals
  const totalDirectVoucherExpenses = useMemo(() => {
    return siteExpenseList.reduce((sum, e) => sum + e.amount, 0);
  }, [siteExpenseList]);

  const totalPaidExpenses = useMemo(() => {
    return siteExpenseList
      .filter((e) => e.status === 'PAID')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [siteExpenseList]);

  const totalPendingExpenses = useMemo(() => {
    return siteExpenseList
      .filter((e) => e.status === 'PENDING')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [siteExpenseList]);

  // Grand Combined Site Expenditure (Matrix Materials + Matrix Diesel + Site Vouchers)
  const grandSiteExpenditure = totalDirectVoucherExpenses + siteMatrixMaterialValue;

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    siteExpenseList.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [siteExpenseList]);

  // Filtered expense records
  const filteredExpenses = useMemo(() => {
    return siteExpenseList.filter((e) => {
      const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchStat = statusFilter === 'ALL' || e.status === statusFilter;
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        e.title.toLowerCase().includes(s) ||
        e.voucherNumber.toLowerCase().includes(s) ||
        e.vendorOrPayee.toLowerCase().includes(s) ||
        (e.vehicleOrMachineNumber && e.vehicleOrMachineNumber.toLowerCase().includes(s));
      return matchCat && matchStat && matchSearch;
    });
  }, [siteExpenseList, categoryFilter, statusFilter, searchTerm]);

  // Submit new expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;

    const voucherNum =
      formVoucherNo.trim() ||
      `VCH-${selectedSiteId.slice(-3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    addSiteExpense({
      siteId: selectedSiteId,
      siteName,
      date: formDate,
      category: formCategory,
      title: formTitle.trim(),
      description: formDescription.trim(),
      vehicleOrMachineNumber: formVehicle.trim() || undefined,
      amount: Number(formAmount),
      voucherNumber: voucherNum,
      vendorOrPayee: formVendor.trim() || 'Direct Cash / Site Petty',
      paymentMode: formPaymentMode,
      approvedBy: formApprovedBy,
      status: 'PAID'
    });

    // Reset Form
    setFormTitle('');
    setFormDescription('');
    setFormAmount('');
    setFormVehicle('');
    setFormVendor('');
    setFormVoucherNo('');
    setIsAddModalOpen(false);
  };

  // Export Expenses to CSV
  const handleExportExpensesCSV = () => {
    const headers = [
      'Voucher #',
      'Date',
      'Site Name',
      'Category',
      'Title / Description',
      'Vehicle / Machine',
      'Vendor / Payee',
      'Amount (INR)',
      'Payment Mode',
      'Approved By',
      'Status'
    ];

    const rows = filteredExpenses.map((e) => [
      e.voucherNumber,
      e.date,
      e.siteName,
      e.category,
      `"${e.title} - ${e.description || ''}"`,
      e.vehicleOrMachineNumber || '-',
      `"${e.vendorOrPayee}"`,
      e.amount,
      e.paymentMode,
      e.approvedBy,
      e.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${siteName.replace(/\s+/g, '_')}_Expense_Statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-rose-600 selection:text-white">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#0c1427] border border-[#1b2845] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  DEDICATED SITE COST & EXPENSE LEDGER
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {siteName}
                </h1>
                {/* Site Switcher */}
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="bg-[#070c1a] border border-[#1e2d4a] text-xs font-bold text-rose-400 px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-rose-500 transition-colors"
                >
                  {siteSheets.map((s) => (
                    <option key={s.siteId} value={s.siteId}>
                      📍 {s.siteName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Site Expense</span>
            </button>
            <button
              onClick={handleExportExpensesCSV}
              className="px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Statement</span>
            </button>
          </div>
        </div>

        {/* Site Cost KPI Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#182643]">
          {/* Card 1: Total Site Vouchers */}
          <div className="p-4 bg-[#070c1a] rounded-xl border border-[#182643]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Site Direct Expenses</span>
              <DollarSign className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              ₹{totalDirectVoucherExpenses.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
              <span className="text-emerald-400">Paid: ₹{totalPaidExpenses.toLocaleString()}</span>
              {totalPendingExpenses > 0 && (
                <span className="text-amber-400">Pending: ₹{totalPendingExpenses.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Card 2: Material Valuation from Matrix */}
          <div className="p-4 bg-[#070c1a] rounded-xl border border-[#182643]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Matrix Material Logs</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              ₹{siteMatrixMaterialValue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              Murum, Sand, 20mm, GSB, WMM, etc.
            </span>
          </div>

          {/* Card 3: Site Diesel Matrix Value */}
          <div className="p-4 bg-[#070c1a] rounded-xl border border-[#182643]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Site Diesel Dispensed</span>
              <Fuel className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ₹{siteMatrixDieselValue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-amber-500/80 mt-2 block font-mono">
              From {currentSheet?.monthTitle} DESIEL Tab
            </span>
          </div>

          {/* Card 4: Total Combined Site Expenditure */}
          <div className="p-4 bg-[#070c1a] rounded-xl border border-rose-900/40 bg-gradient-to-br from-[#0c162d] to-[#1a0f21]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Total Site Outflow</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ₹{grandSiteExpenditure.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-400 mt-2 block font-semibold">
              All Materials, Fuel & Site Operations
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Allocation Bar */}
      <div className="p-5 rounded-2xl bg-[#0c1427] border border-[#1b2845] shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-rose-400" />
          <span>{siteName} — Cost Breakdown by Category</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryBreakdown.map(([category, amount]) => {
            const percent = totalDirectVoucherExpenses > 0 ? (amount / totalDirectVoucherExpenses) * 100 : 0;
            return (
              <div
                key={category}
                className="p-3.5 bg-[#070c1a] rounded-xl border border-[#182643] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="truncate">{category}</span>
                  <span className="text-rose-400 font-mono">₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 mb-1">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{percent.toFixed(1)}% of voucher expenses</span>
                  <span>{siteExpenseList.filter((e) => e.category === category).length} Vouchers</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[#070c1a] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#070c1a] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search voucher, title, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#070c1a] border border-[#1e2d4a] rounded-xl text-xs text-white outline-none w-full sm:w-64 focus:border-rose-500"
          />
        </div>
      </div>

      {/* DETAILED EXPENSE LEDGER TABLE */}
      <div className="rounded-2xl bg-[#0c1427] border border-[#1b2845] shadow-2xl overflow-hidden">
        <div className="p-4 bg-[#0a1020] border-b border-[#182643] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Site Expense Vouchers & Receipts ({filteredExpenses.length})</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Total Filtered: ₹{filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0e172e] text-slate-300 font-semibold border-b border-[#182643]">
              <tr>
                <th className="py-3 px-4">VOUCHER #</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">TITLE & DETAILS</th>
                <th className="py-3 px-3">VEHICLE / MACHINE</th>
                <th className="py-3 px-4">VENDOR / PAYEE</th>
                <th className="py-3 px-4 text-right">AMOUNT (₹)</th>
                <th className="py-3 px-3 text-center">MODE</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15223c] text-slate-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No expense vouchers found matching the filter for this site.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#0f1c38] transition-colors">
                    {/* Voucher Number */}
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">
                      {exp.voucherNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono">
                      {exp.date}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                        {exp.category}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{exp.title}</div>
                      {exp.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{exp.description}</div>
                      )}
                    </td>

                    {/* Vehicle */}
                    <td className="py-3 px-3 font-mono font-bold text-amber-300">
                      {exp.vehicleOrMachineNumber ? `🚛 ${exp.vehicleOrMachineNumber}` : '-'}
                    </td>

                    {/* Vendor */}
                    <td className="py-3 px-4 text-slate-300">{exp.vendorOrPayee}</td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-white text-sm">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-3 text-center text-[10px] text-slate-400 font-medium">
                      {exp.paymentMode}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          const next = exp.status === 'PAID' ? 'PENDING' : 'PAID';
                          updateSiteExpenseStatus(exp.id, next);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          exp.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {exp.status}
                      </button>
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => deleteSiteExpense(exp.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete voucher"
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

      {/* MODAL: ADD SITE EXPENSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-500" />
                <span>Record Site Expense Voucher — {siteName}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SiteExpenseCategory)}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Voucher Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Expense Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tipper 8797 Clutch Plate Replacement & Gear Oil"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Additional Notes / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Details of bill, work done or site voucher notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white outline-none"
                />
              </div>

              {/* Amount & Vehicle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Vehicle / Tipper / Machine #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8797 or 9580 or Bowser #1"
                    value={formVehicle}
                    onChange={(e) => setFormVehicle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-yellow-300 font-mono uppercase outline-none"
                  />
                </div>
              </div>

              {/* Vendor & Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Vendor / Payee / Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mahalaxmi Auto Spares"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    <option value="UPI / PhonePe">UPI / PhonePe</option>
                    <option value="Cash">Cash (Site Petty)</option>
                    <option value="NEFT / RTGS">NEFT / RTGS Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Voucher # & Approved By */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Voucher / Bill Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VCH-MUL-045"
                    value={formVoucherNo}
                    onChange={(e) => setFormVoucherNo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white font-mono outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Approved By
                  </label>
                  <input
                    type="text"
                    value={formApprovedBy}
                    onChange={(e) => setFormApprovedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#182643]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-rose-600/30"
                >
                  Save Site Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
