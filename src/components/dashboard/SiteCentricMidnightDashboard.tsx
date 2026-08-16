import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { useRoadERP } from '../../context/RoadERPContext';
import {
  Layers,
  DollarSign,
  Truck,
  AlertTriangle,
  HardHat,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Filter,
  Calculator,
  Fuel,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  Shield,
  Gauge,
  Calendar,
  X,
  FileCheck,
  TrendingDown,
  TrendingUp,
  MapPin,
  Building2,
  Search,
  Sparkles,
  Milestone
} from 'lucide-react';
import { CreateRoadSiteModal } from '../modals/CreateRoadSiteModal';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const SiteCentricMidnightDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const { selectedSiteId, siteSheets, projects, selectedProjectId } = useERP();
  const {
    machines,
    trips,
    fuelLogs,
    expenses,
    yieldCalculations,
    addTripLog,
    addFuelDispenseLog,
    addExpenseVoucher,
    kpis
  } = useRoadERP();

  // Active Site Details
  const activeSite = useMemo(() => {
    return siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0] || {
      siteId: 'site-mulwad',
      siteName: 'NH-48 Highway Extension - Package 3 (Mulwad Stretch)',
      siteCode: 'NH48-PKG3-MUL'
    };
  }, [siteSheets, selectedSiteId]);

  // Activity Feed Filter
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'DIESEL' | 'MATERIAL' | 'EXPENSE'>('ALL');

  // Quick Action Modal States
  const [isDieselModalOpen, setIsDieselModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [isAddRoadSiteOpen, setIsAddRoadSiteOpen] = useState(false);

  // Form States for Diesel Refueling
  const [fuelMachineId, setFuelMachineId] = useState('m-grd-01');
  const [fuelLitres, setFuelLitres] = useState<number | ''>(180);
  const [fuelSource, setFuelSource] = useState('SITE_BOWSER_1');
  const [fuelHmrStart, setFuelHmrStart] = useState<number>(3410);
  const [fuelHmrEnd, setFuelHmrEnd] = useState<number>(3418);
  const [fuelChallan, setFuelChallan] = useState('BWS-885');

  // Form States for Trip Challan
  const [tripVehicleNo, setTripVehicleNo] = useState('KA-28-C-8797');
  const [tripMaterial, setTripMaterial] = useState('WMM (Wet Mix Macadam)');
  const [tripOrigin, setTripOrigin] = useState('Bilgi Crusher Pit #2');
  const [tripChainage, setTripChainage] = useState('Ch. 14+200 LHS');
  const [tripGross, setTripGross] = useState<number | ''>(48.5);
  const [tripTare, setTripTare] = useState<number | ''>(16.0);
  const [tripChallanNo, setTripChallanNo] = useState('WB-49110');

  // Form States for Site Expense
  const [expCategory, setExpCategory] = useState<any>('EQUIPMENT_REPAIR_PARTS');
  const [expPayee, setExpPayee] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>(4500);
  const [expDesc, setExpDesc] = useState('');
  const [expChainage, setExpChainage] = useState('Ch. 14+200 Workshop');

  // Yield Calculator interactive state in modal
  const [calcLength, setCalcLength] = useState<number>(1000);
  const [calcWidth, setCalcWidth] = useState<number>(7.5);
  const [calcThicknessMm, setCalcThicknessMm] = useState<number>(150);
  const [calcDensity, setCalcDensity] = useState<number>(2.25);
  const [calcWastage, setCalcWastage] = useState<number>(5);
  const [calcTipperCap, setCalcTipperCap] = useState<number>(30);
  const [calcActualDelivered, setCalcActualDelivered] = useState<number>(2800);

  // Machine Roster Statuses (matching exact prompt specs)
  const machineRoster = useMemo(() => {
    return [
      {
        id: 'CAT-GRD-01',
        name: 'CAT 140K Motor Grader',
        operator: 'Mahesh Patil',
        status: 'Active' as const,
        workingHours: 8.5,
        targetHours: 10,
        fuelLevel: 68,
        section: 'Ch. 14+200 GSB Sub-Base Leveling'
      },
      {
        id: 'JCB-3DX-04',
        name: 'JCB 3DX Super Backhoe',
        operator: 'Irfan Mulla',
        status: 'Active' as const,
        workingHours: 7.2,
        targetHours: 9,
        fuelLevel: 54,
        section: 'Ch. 13+800 Side Drain Trenching'
      },
      {
        id: 'EX-HITACHI-210',
        name: 'Hitachi ZX210 Excavator',
        operator: 'Prakash Patil',
        status: 'Active' as const,
        workingHours: 9.0,
        targetHours: 10,
        fuelLevel: 12, // Critical Low Fuel Alert
        isLowFuel: true,
        section: 'Mulwad Quarry Borrow Pit #1'
      },
      {
        id: 'VIB-ROLLER-01',
        name: 'HAMM 311D Soil Compactor',
        operator: 'Raju Rathod',
        status: 'Active' as const,
        workingHours: 6.8,
        targetHours: 8,
        fuelLevel: 48,
        section: 'Ch. 14+100 WMM Compaction'
      },
      {
        id: 'PAVER-VOGELE-1800',
        name: 'Vögele 1800-3 Sensor Paver',
        operator: 'Anand Biradar',
        status: 'Idle' as const,
        workingHours: 2.5,
        targetHours: 8,
        fuelLevel: 80,
        section: 'Standby for DBM Shift (Ch. 12+500)'
      },
      {
        id: 'TIP-9580',
        name: 'BharatBenz 2828C Tipper (9580)',
        operator: 'Ramesh Lamani',
        status: 'Breakdown' as const,
        workingHours: 0.0,
        targetHours: 10,
        fuelLevel: 25,
        section: 'Camp Garage (Hydraulic Hose Leak)'
      }
    ];
  }, []);

  // Combined Real-Time Activity Feed
  const activityLedger = useMemo(() => {
    const list = [
      {
        id: 'act-1',
        type: 'DIESEL' as const,
        title: 'Diesel Dispensed',
        direction: 'OUT' as const,
        value: '[-] 180.00 L',
        subtext: 'To CAT-GRD-01 (CAT 140K Grader)',
        detail: 'Bowser: Site Mobile Bowser #1 • Challan: BWS-884',
        timestamp: '10:45 AM Today',
        tagColor: 'crimson'
      },
      {
        id: 'act-2',
        type: 'MATERIAL' as const,
        title: 'Material Haul Delivery',
        direction: 'IN' as const,
        value: '[+] 32.50 Tons WMM',
        subtext: 'Tipper: KA-28-C-8797 • Challan #WB-49102',
        detail: 'From Bilgi Crusher Pit -> Ch. 14+200 LHS',
        timestamp: '10:30 AM Today',
        tagColor: 'emerald'
      },
      {
        id: 'act-3',
        type: 'EXPENSE' as const,
        title: 'Petty Cash Expense',
        direction: 'OUT' as const,
        value: '[-] ₹4,500.00',
        subtext: 'Hydraulic Hose Replacement on EX-210',
        detail: 'Payee: Mahaveer Hydraulics • Mode: Petty Cash Float',
        timestamp: '10:15 AM Today',
        tagColor: 'crimson'
      },
      {
        id: 'act-4',
        type: 'MATERIAL' as const,
        title: 'Material Haul Delivery',
        direction: 'IN' as const,
        value: '[+] 28.40 Tons GSB',
        subtext: 'Tipper: KA-28-D-7352 • Challan #WB-49098',
        detail: 'From Mulwad Quarry Pit #1 -> Ch. 14+150',
        timestamp: '09:50 AM Today',
        tagColor: 'emerald'
      },
      {
        id: 'act-5',
        type: 'DIESEL' as const,
        title: 'Diesel Dispensed',
        direction: 'OUT' as const,
        value: '[-] 210.00 L',
        subtext: 'To EX-HITACHI-210 (ZX210 Excavator)',
        detail: 'Source: Base Camp Static Tank (20KL) • Challan: BWS-883',
        timestamp: '09:15 AM Today',
        tagColor: 'crimson'
      },
      {
        id: 'act-6',
        type: 'EXPENSE' as const,
        title: 'Equipment Spares Expense',
        direction: 'OUT' as const,
        value: '[-] ₹14,800.00',
        subtext: 'Tipper 9580 Leaf Spring Bushings & U-Bolts',
        detail: 'Payee: Mahalaxmi Auto Garage • Voucher: EXP-NH48-014',
        timestamp: '08:30 AM Today',
        tagColor: 'crimson'
      }
    ];

    if (feedFilter === 'ALL') return list;
    return list.filter((item) => item.type === feedFilter);
  }, [feedFilter]);

  // Handlers for quick entries
  const handleSaveDiesel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelLitres) return;

    addFuelDispenseLog({
      date: new Date().toISOString().substring(0, 10),
      machineId: fuelMachineId,
      machineCode: fuelMachineId.toUpperCase(),
      machineName: 'CAT 140K Motor Grader',
      fuelSource: fuelSource as any,
      litresDispensed: Number(fuelLitres),
      ratePerLitre: 92.5,
      meterType: 'HMR_HOURS',
      previousMeterReading: fuelHmrStart,
      currentMeterReading: fuelHmrEnd,
      voucherChallanNo: fuelChallan,
      dispensedBy: 'Ibrahim (Bowser Incharge)',
      approvedBy: 'Habibulla Bilgi'
    });

    setIsDieselModalOpen(false);
  };

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripGross || !tripTare) return;
    const net = Math.max(0, Number(tripGross) - Number(tripTare));

    addTripLog({
      date: new Date().toISOString().substring(0, 10),
      tripTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleNumberPlate: tripVehicleNo,
      driverName: 'Santosh Chavan',
      sourceQuarryOrPlant: tripOrigin,
      destinationChainageKm: 14.2,
      formattedChainage: tripChainage,
      carriagewaySide: 'LHS',
      layerType: 'WMM',
      materialName: tripMaterial,
      grossWeightTons: Number(tripGross),
      tareWeightTons: Number(tripTare),
      netWeightTons: net,
      challanNumber: tripChallanNo,
      ratePerTonOrTrip: 420,
      billingMode: 'PER_TON',
      oneWayDistanceKm: 12.5,
      roundTripDistanceKm: 25.0,
      turnaroundTimeMinutes: 45,
      supervisorName: 'Ibrahim (Site Supervisor)'
    });

    setIsTripModalOpen(false);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expPayee || !expAmount) return;

    addExpenseVoucher({
      date: new Date().toISOString().substring(0, 10),
      category: expCategory,
      costCenterChainage: expChainage,
      amount: Number(expAmount),
      paymentMode: 'PETTY_CASH',
      payeeVendorName: expPayee,
      description: expDesc || 'Site emergency procurement',
      requestedBy: 'Ibrahim (Site Engineer)',
      status: 'SUBMITTED'
    });

    setIsExpenseModalOpen(false);
  };

  // Dynamic Yield Calculations
  const yieldCompactedVolM3 = (calcLength * calcWidth * (calcThicknessMm / 1000));
  const yieldTotalTonnageReq = yieldCompactedVolM3 * calcDensity * (1 + calcWastage / 100);
  const yieldTripsNeeded = Math.ceil(yieldTotalTonnageReq / calcTipperCap);
  const yieldVarianceTons = calcActualDelivered - yieldTotalTonnageReq;
  const yieldVariancePct = ((yieldVarianceTons / yieldTotalTonnageReq) * 100).toFixed(1);

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. Main Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
              SITE OPERATIONS COMMAND
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">
              {activeSite.siteCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            {activeSite.siteName}
          </h1>
          <p className="text-[13px] text-[#94A3B8] mt-0.5">
            Live site metrics, equipment telematics, material haulage, and petty cash ledger.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddRoadSiteOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Milestone className="w-3.5 h-3.5" />
            <span>+ Add Site Section</span>
          </button>

          <button
            onClick={() => setIsYieldModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-white"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>Yield Calc</span>
          </button>

          <button
            onClick={() => setIsDieselModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-white"
          >
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Log Diesel</span>
          </button>

          <button
            onClick={() => setIsTripModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-white"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Log Trip</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Material Laid (Today) */}
        <div className="p-5 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-xl hover:border-slate-700 transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
              Total Material Laid (Today)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#162032] border border-[#1E293B] flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            1,240 <span className="text-lg font-bold text-slate-400">Tons</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>GSB & WMM on Ch. 14+200</span>
          </div>
        </div>

        {/* Card 2: Total Site Expense */}
        <div className="p-5 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-xl hover:border-slate-700 transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
              Total Site Expense
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#162032] border border-[#1E293B] flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            ₹3,42,850.00
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Fuel, vendor spares & petty cash</span>
          </div>
        </div>

        {/* Card 3: Active Trips Today */}
        <div className="p-5 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-xl hover:border-slate-700 transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
              Active Trips Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#162032] border border-[#1E293B] flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            48 <span className="text-lg font-bold text-slate-400">Trips</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>6 Tippers in active transit</span>
          </div>
        </div>

        {/* Card 4: Fuel Alert / Critical Stock */}
        <div className="p-5 rounded-2xl bg-[#121927] border border-[#7F1D1D]/50 shadow-xl hover:border-rose-700 transition-all space-y-2 group bg-gradient-to-br from-[#121927] to-[#250808]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>Fuel Alert / Critical</span>
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#450A0A] border border-[#7F1D1D] flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 tracking-tight">
            2 Machines <span className="text-lg font-bold text-rose-300/80">Low</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-300">
            <span>Hitachi 210 & Cat Grader &lt; 15%</span>
          </div>
        </div>
      </div>

      {/* 3. Secondary Status Cards (3-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status 1: Active Machines */}
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-[#94A3B8] font-bold">Active Machines</div>
            <div className="text-xl font-black text-white">
              18 <span className="text-xs text-[#94A3B8] font-normal">of 22 deployed</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#064E3B] text-[#34D399] border border-[#065F46] text-xs font-black flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>82% Online</span>
          </div>
        </div>

        {/* Status 2: Breakdown / Idle */}
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-[#94A3B8] font-bold">Breakdown / Idle</div>
            <div className="text-xl font-black text-white">
              3 <span className="text-xs text-[#94A3B8] font-normal">machines stopped</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#450A0A] text-[#F87171] border border-[#7F1D1D] text-xs font-black flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Action Req.</span>
          </div>
        </div>

        {/* Status 3: Maintenance Scheduled */}
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-[#94A3B8] font-bold">Maintenance Scheduled</div>
            <div className="text-xl font-black text-white">
              1 <span className="text-xs text-[#94A3B8] font-normal">machine due</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#451A03] text-[#FBBF24] border border-[#78350F] text-xs font-black flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>Due in 15h</span>
          </div>
        </div>
      </div>

      {/* 4. Main Analytics & Activity Feeds (Split Layout: 35% Left / 65% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL (35% - 4.2 cols -> 4 or 5 cols) — Machine & Operator Status */}
        <div className="lg:col-span-5 rounded-2xl bg-[#121927] border border-[#1E293B] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Machine & Operator Status
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('machinery')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Full Fleet ↗</span>
            </button>
          </div>

          {/* Roster List */}
          <div className="space-y-3">
            {machineRoster.map((m) => {
              const isActive = m.status === 'Active';
              const isIdle = m.status === 'Idle';
              const isBreakdown = m.status === 'Breakdown';

              return (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-[#162032] border border-[#1E293B] hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {m.id}
                      </span>
                      {m.isLowFuel && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black animate-pulse">
                          LOW FUEL ({m.fuelLevel}%)
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                        isActive
                          ? 'bg-[#064E3B] text-[#34D399] border border-[#065F46]'
                          : isIdle
                          ? 'bg-[#451A03] text-[#FBBF24] border border-[#78350F]'
                          : 'bg-[#450A0A] text-[#F87171] border border-[#7F1D1D]'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold truncate max-w-[180px]">
                      {m.name}
                    </span>
                    <span className="text-[#94A3B8] font-mono text-[11px]">
                      Op: <strong className="text-slate-200">{m.operator}</strong>
                    </span>
                  </div>

                  <div className="text-[10px] text-[#94A3B8] truncate">
                    {m.section}
                  </div>

                  {/* Progress bar of working hours */}
                  <div className="space-y-1 pt-1 border-t border-[#1E293B]/60">
                    <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                      <span>Working: {m.workingHours} hrs</span>
                      <span>Target: {m.targetHours} hrs</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#0D111D] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isBreakdown
                            ? 'bg-rose-500'
                            : isIdle
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, (m.workingHours / m.targetHours) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL (65% - 7 cols) — Recent Transactions & Material/Fuel Logs */}
        <div className="lg:col-span-7 rounded-2xl bg-[#121927] border border-[#1E293B] p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Recent Transactions & Material/Fuel Logs
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Real-time site inflows, diesel dispensing, and contractor petty cash
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#162032] p-1 rounded-xl border border-[#1E293B]">
              {(['ALL', 'DIESEL', 'MATERIAL', 'EXPENSE'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFeedFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    feedFilter === filter
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {filter === 'ALL' ? 'All Activity' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Ledger Feed */}
          <div className="space-y-2.5">
            {activityLedger.map((item) => {
              const isOut = item.direction === 'OUT';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#162032] border border-[#1E293B] hover:border-slate-700 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Bubble */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isOut
                          ? 'bg-[#450A0A] text-[#F87171] border border-[#7F1D1D]'
                          : 'bg-[#064E3B] text-[#34D399] border border-[#065F46]'
                      }`}
                    >
                      {isOut ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          • {item.timestamp}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        {item.subtext}
                      </div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {item.detail}
                      </div>
                    </div>
                  </div>

                  {/* Highlight Metric Value */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black font-mono px-2.5 py-1 rounded-lg ${
                        isOut
                          ? 'bg-[#450A0A]/70 text-[#F87171] border border-[#7F1D1D]'
                          : 'bg-[#064E3B]/70 text-[#34D399] border border-[#065F46]'
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Footnote & Navigation */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#1E293B] text-xs">
            <span className="text-[#94A3B8] text-[11px]">
              Showing real-time site events (Auto-refreshed via local ledger)
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateTab('haulage-trips')}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Material Trips Log ↗</span>
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => onNavigateTab('diesel')}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Diesel & Fuel Log ↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MODALS FOR ENTRIES & YIELD CALCULATIONS */}
      {/* ============================================================ */}

      {/* MODAL 1: MATERIAL QUANTITY & YIELD CALCULATOR */}
      {isYieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Road Pavement Quantity & Yield Calculator
                  </h3>
                  <p className="text-[11px] text-[#94A3B8]">
                    MoRTH Section 500 Formula: Volume = L × W × T; Tonnage = V × ρ × (1 + Wastage%)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsYieldModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Stretch Length (m)</label>
                <input
                  type="number"
                  value={calcLength}
                  onChange={(e) => setCalcLength(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Width (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Compacted Thickness (mm)</label>
                <input
                  type="number"
                  value={calcThicknessMm}
                  onChange={(e) => setCalcThicknessMm(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Bulk Density (t/m³)</label>
                <input
                  type="number"
                  step="0.05"
                  value={calcDensity}
                  onChange={(e) => setCalcDensity(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Wastage Factor (%)</label>
                <input
                  type="number"
                  value={calcWastage}
                  onChange={(e) => setCalcWastage(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Avg Tipper Payload (T)</label>
                <input
                  type="number"
                  value={calcTipperCap}
                  onChange={(e) => setCalcTipperCap(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                />
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="p-4 rounded-2xl bg-[#0D111D] border border-[#1E293B] space-y-3">
              <div className="text-xs font-black uppercase text-blue-400 tracking-wider">
                Theoretical Requirements Output
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#121927] rounded-xl border border-[#1E293B]">
                  <div className="text-[10px] text-[#94A3B8]">Compacted Volume</div>
                  <div className="text-lg font-black text-white font-mono">
                    {yieldCompactedVolM3.toLocaleString(undefined, { maximumFractionDigits: 1 })} m³
                  </div>
                </div>

                <div className="p-3 bg-[#121927] rounded-xl border border-[#1E293B]">
                  <div className="text-[10px] text-[#94A3B8]">Required Aggregate</div>
                  <div className="text-lg font-black text-blue-400 font-mono">
                    {yieldTotalTonnageReq.toLocaleString(undefined, { maximumFractionDigits: 1 })} Tons
                  </div>
                </div>

                <div className="p-3 bg-[#121927] rounded-xl border border-[#1E293B]">
                  <div className="text-[10px] text-[#94A3B8]">Trips Required</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {yieldTripsNeeded} Tipper Trips
                  </div>
                </div>
              </div>

              {/* Planned vs Actual Reconciliation */}
              <div className="pt-3 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <label className="text-[#94A3B8] font-semibold block">
                    Actual Aggregate Delivered from Weighbridge (Tons):
                  </label>
                  <input
                    type="number"
                    value={calcActualDelivered}
                    onChange={(e) => setCalcActualDelivered(Number(e.target.value) || 0)}
                    className="mt-1 px-3 py-1.5 bg-[#162032] border border-[#1E293B] rounded-lg text-white font-mono font-bold w-48 outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#162032] border border-[#1E293B] text-xs font-mono">
                  <span className="text-[#94A3B8]">Yield Variance: </span>
                  <strong className={yieldVarianceTons > 0 ? 'text-[#F87171]' : 'text-[#34D399]'}>
                    {yieldVarianceTons > 0 ? `+${yieldVarianceTons.toFixed(1)}` : yieldVarianceTons.toFixed(1)} Tons ({yieldVariancePct}%)
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsYieldModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DIESEL REFUELING ENTRY */}
      {isDieselModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Log Diesel Bowser Dispensing</h3>
              </div>
              <button onClick={() => setIsDieselModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiesel} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Target Machine *</label>
                <select
                  value={fuelMachineId}
                  onChange={(e) => setFuelMachineId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                >
                  <option value="m-grd-01">CAT-GRD-01 (CAT 140K Grader)</option>
                  <option value="m-ex-210">EX-HITACHI-210 (ZX210 Excavator)</option>
                  <option value="m-jcb-04">JCB-3DX-04 (Backhoe Loader)</option>
                  <option value="m-rol-01">VIB-ROLLER-01 (HAMM 311D Compactor)</option>
                  <option value="m-tip-8797">TIP-8797 (BharatBenz 2828C Tipper)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Litres Issued (L) *</label>
                  <input
                    type="number"
                    required
                    value={fuelLitres}
                    onChange={(e) => setFuelLitres(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Bowser / Fuel Source *</label>
                  <select
                    value={fuelSource}
                    onChange={(e) => setFuelSource(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  >
                    <option value="SITE_BOWSER_1">Site Mobile Bowser #1 (6KL)</option>
                    <option value="SITE_BOWSER_2">Site Mobile Bowser #2 (9KL)</option>
                    <option value="SITE_STATIC_TANK_20KL">Base Camp Static Tank (20KL)</option>
                    <option value="IOCL_HIGHWAY_PUMP">IOCL Highway Commercial Pump</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Start Hour-Meter (HMR) *</label>
                  <input
                    type="number"
                    value={fuelHmrStart}
                    onChange={(e) => setFuelHmrStart(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">End Hour-Meter (HMR) *</label>
                  <input
                    type="number"
                    value={fuelHmrEnd}
                    onChange={(e) => setFuelHmrEnd(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Bowser Challan / Slip #</label>
                <input
                  type="text"
                  value={fuelChallan}
                  onChange={(e) => setFuelChallan(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsDieselModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  Save Diesel Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRIP CHALLAN LOGGING */}
      {isTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Log Material Haulage Trip</h3>
              </div>
              <button onClick={() => setIsTripModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrip} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Tipper Vehicle Plate *</label>
                  <input
                    type="text"
                    required
                    value={tripVehicleNo}
                    onChange={(e) => setTripVehicleNo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Material Name *</label>
                  <select
                    value={tripMaterial}
                    onChange={(e) => setTripMaterial(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  >
                    <option value="WMM (Wet Mix Macadam)">WMM (Wet Mix Macadam)</option>
                    <option value="GSB (Granular Sub-Base)">GSB (Granular Sub-Base)</option>
                    <option value="DBM (Dense Bituminous)">DBM (Dense Bituminous)</option>
                    <option value="Murum / Borrow Soil">Murum / Borrow Soil</option>
                    <option value="Crushed Aggregate 20mm">Crushed Aggregate 20mm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Origin (Quarry/Plant) *</label>
                  <input
                    type="text"
                    value={tripOrigin}
                    onChange={(e) => setTripOrigin(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Destination (Chainage) *</label>
                  <input
                    type="text"
                    value={tripChainage}
                    onChange={(e) => setTripChainage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Gross (Tons) *</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tripGross}
                    onChange={(e) => setTripGross(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Tare (Tons) *</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tripTare}
                    onChange={(e) => setTripTare(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Net (Tons)</label>
                  <div className="px-3 py-2 bg-[#0D111D] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold">
                    {tripGross && tripTare ? (Number(tripGross) - Number(tripTare)).toFixed(2) : '0.00'} T
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Weighbridge Slip / Challan #</label>
                <input
                  type="text"
                  value={tripChallanNo}
                  onChange={(e) => setTripChallanNo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsTripModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                >
                  Submit Trip Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SITE EXPENSE VOUCHER */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Raise Site Expense Voucher</h3>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Expense Category *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  >
                    <option value="EQUIPMENT_REPAIR_PARTS">Equipment Repair & Spares</option>
                    <option value="DAILY_SITE_OPERATIONS">Daily Site Operations</option>
                    <option value="WATER_TANKER_HIRING">Water Tanker (Compaction)</option>
                    <option value="OPERATOR_WAGES_BATTA">Driver & Operator Batta</option>
                    <option value="TOLL_TAX_PERMITS">Tolls & Quarry Royalty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Amount (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Payee / Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahaveer Hydraulic Works"
                  value={expPayee}
                  onChange={(e) => setExpPayee(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Cost Center (Chainage Stretch) *</label>
                <input
                  type="text"
                  value={expChainage}
                  onChange={(e) => setExpChainage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Hydraulic hose replacement"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Submit Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Road Site Modal */}
      <CreateRoadSiteModal
        isOpen={isAddRoadSiteOpen}
        onClose={() => setIsAddRoadSiteOpen(false)}
      />
    </div>
  );
};
