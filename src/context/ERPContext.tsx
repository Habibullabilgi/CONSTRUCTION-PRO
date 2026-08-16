import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  WorkType,
  UserRole,
  User,
  Project,
  Site,
  RoadSection,
  BuildingFloor,
  MaterialItem,
  StockLedgerEntry,
  MaterialConsumptionRecord,
  VehicleTrip,
  MachineryRecord,
  MachineryLog,
  DieselLog,
  Worker,
  AttendanceRecord,
  LabourPaymentSheet,
  DailyRoadProduction,
  DailyBuildingProduction,
  BOQItem,
  MeasurementBookEntry,
  BBSItem,
  AuditLogEntry,
  ERPNotification,
  ApprovalStatus,
  SiteMatrixSheet,
  SiteMatrixRow,
  SiteExpenseRecord
} from '../types/erp';
import {
  INITIAL_PROJECTS,
  INITIAL_ROAD_SECTIONS,
  INITIAL_BUILDING_FLOORS,
  INITIAL_MATERIALS,
  INITIAL_STOCK_LEDGER,
  INITIAL_CONSUMPTION_RECORDS,
  INITIAL_VEHICLE_TRIPS,
  INITIAL_MACHINERY,
  INITIAL_MACHINERY_LOGS,
  INITIAL_DIESEL_LOGS,
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_ROAD_PRODUCTION,
  INITIAL_BUILDING_PRODUCTION,
  INITIAL_BOQ,
  INITIAL_MEASUREMENTS,
  INITIAL_BBS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SITE_SHEETS,
  INITIAL_SITE_EXPENSES
} from '../data/initialData';

interface ERPContextType {
  // Authentication & RBAC
  isAuthenticated: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Navigation & Mode
  workType: WorkType | null;
  setWorkType: (type: WorkType | null) => void;

  // Selected Context
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedSiteId: string;
  setSelectedSiteId: (id: string) => void;
  currentProject: Project | undefined;
  currentSite: Site | undefined;

  // Projects & Sites Master
  projects: Project[];
  addProject: (proj: Partial<Project>) => Project;
  updateProject: (id: string, proj: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSiteToProject: (projectId: string, siteName: string, location: string, supervisor: string) => void;
  deleteSite: (siteId: string) => void;
  addRoadSiteSection: (input: {
    projectId?: string;
    siteName: string;
    siteCode?: string;
    location: string;
    supervisor: string;
    startChainageKm: number;
    endChainageKm: number;
    carriagewayWidthMeters?: number;
    carriagewayType?: string;
    vehicles?: string[];
  }) => string;

  // Engineering & Layer Stretches
  roadSections: RoadSection[];
  updateRoadLayerProgress: (sectionId: string, layerId: string, completedMeters: number, actualQty: number) => void;
  buildingFloors: BuildingFloor[];
  updateBuildingFloor: (floorId: string, data: Partial<BuildingFloor>) => void;
  addBuildingFloor: (floor: Partial<BuildingFloor>) => void;

  // Materials & Ledger
  materials: MaterialItem[];
  stockLedger: StockLedgerEntry[];
  addStockTransaction: (entry: Omit<StockLedgerEntry, 'id'>) => void;
  consumptionRecords: MaterialConsumptionRecord[];
  addConsumptionRecord: (rec: Omit<MaterialConsumptionRecord, 'id'>) => void;

  // Trips & Weighbridge
  vehicleTrips: VehicleTrip[];
  addVehicleTrip: (trip: Omit<VehicleTrip, 'id'>) => void;
  updateVehicleTripStatus: (tripId: string, status: ApprovalStatus) => void;

  // Site Matrix Sheets
  siteSheets: SiteMatrixSheet[];
  updateSiteCellValue: (siteId: string, tabKey: string, rowId: string, vehicle: string, value: number) => void;
  updateSiteRowRate: (siteId: string, tabKey: string, rowId: string, rate: number) => void;
  addSiteSheetRow: (siteId: string, tabKey: string, date: string, item: string) => void;
  addSiteSheetVehicle: (siteId: string, vehicleNumber: string) => void;
  addSiteSheetTab: (siteId: string, tabKey: string, label: string, defaultRate: number, unit: string) => void;

  // Expenses & Accounts
  siteExpenses: SiteExpenseRecord[];
  addSiteExpense: (exp: Omit<SiteExpenseRecord, 'id' | 'createdAt'>) => void;
  deleteSiteExpense: (id: string) => void;
  updateSiteExpenseStatus: (id: string, status: 'PAID' | 'PENDING' | 'APPROVED') => void;

  // Machinery & Telematics
  machinery: MachineryRecord[];
  machineryLogs: MachineryLog[];
  addMachineryLog: (log: Omit<MachineryLog, 'id'>) => void;
  dieselLogs: DieselLog[];
  addDieselLog: (log: Omit<DieselLog, 'id'>) => void;

  // Labor & Wages
  workers: Worker[];
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (rec: Omit<AttendanceRecord, 'id'>) => void;
  markAttendancePaid: (attendanceId: string, ref: string) => void;
  bulkAddAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  paymentSheets: LabourPaymentSheet[];

  // Production & Billing
  roadProductions: DailyRoadProduction[];
  addRoadProduction: (prod: Omit<DailyRoadProduction, 'id'>) => void;
  buildingProductions: DailyBuildingProduction[];
  addBuildingProduction: (prod: Omit<DailyBuildingProduction, 'id'>) => void;
  boqItems: BOQItem[];
  addBOQItem: (item: Omit<BOQItem, 'id'>) => void;
  updateBOQItem: (id: string, data: Partial<BOQItem>) => void;
  measurements: MeasurementBookEntry[];
  addMeasurementEntry: (entry: Omit<MeasurementBookEntry, 'id'>) => void;
  bbsItems: BBSItem[];
  addBBSItem: (item: Omit<BBSItem, 'id'>) => void;
  deleteBBSItem: (id: string) => void;

  // System & Logs
  notifications: ERPNotification[];
  markNotificationRead: (id: string) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (module: string, transactionId: string, action: AuditLogEntry['action'], details: string, prev?: string, next?: string) => void;
  clearAllData: () => void;
  resetToSampleData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
  mobileSiteMode: boolean;
  setMobileSiteMode: (active: boolean) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'INFRABUILD_ERP_STATE_V1';

const getZeroedSiteSheets = (sheets: SiteMatrixSheet[]): SiteMatrixSheet[] => {
  return (sheets || []).map((sheet) => ({
    ...sheet,
    tabs: (sheet.tabs || []).map((tab) => ({
      ...tab,
      rows: (tab.rows || []).map((row) => {
        const zeroVV: Record<string, number> = {};
        (sheet.vehicles || []).forEach((v) => {
          zeroVV[v] = 0;
        });
        return {
          ...row,
          vehicleValues: zeroVV,
          total: 0
        };
      })
    }))
  }));
};

export const ERPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isClearedSlate = typeof window !== 'undefined' && localStorage.getItem('ERP_DATA_CLEARED_SLATE') === 'true';

  // --- 1. Persistent Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_AUTH');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_USER');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'usr-owner-1',
          name: 'Admin User',
          email: 'admin@bilgicrushers.com',
          role: 'SUPER_ADMIN'
        };
  });

  const [userRole, setUserRole] = useState<UserRole>(() => currentUser?.role || 'SUPER_ADMIN');

  const login = (username: string, _password?: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    let name = 'Admin User';
    let role: UserRole = 'SUPER_ADMIN';
    let email = 'admin@bilgicrushers.com';

    if (cleanUser === 'neha' || cleanUser.includes('neha') || cleanUser.includes('manager')) {
      name = 'Neha (Accounts & Ops)';
      role = 'STORE_MANAGER';
      email = 'neha.ops@bilgicrushers.com';
    } else if (cleanUser === 'ibrahim' || cleanUser.includes('ibrahim') || cleanUser.includes('operator')) {
      name = 'Ibrahim (Site Incharge)';
      role = 'SITE_SUPERVISOR';
      email = 'ibrahim@bilgicrushers.com';
    } else if (cleanUser === 'billing' || cleanUser.includes('eng')) {
      name = 'Er. Amit Sharma';
      role = 'SITE_ENGINEER';
      email = 'amit.billing@bilgicrushers.com';
    } else if (cleanUser === 'owner' || cleanUser.includes('bilgi')) {
      name = 'Habibulla Bilgi (Director)';
      role = 'OWNER';
      email = 'habibullabilgiabu@gmail.com';
    }

    const usr: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role
    };

    setCurrentUser(usr);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem(LOCAL_STORAGE_KEY + '_AUTH', JSON.stringify(true));
    localStorage.setItem(LOCAL_STORAGE_KEY + '_USER', JSON.stringify(usr));
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(LOCAL_STORAGE_KEY + '_AUTH', JSON.stringify(false));
  };

  const [workType, setWorkType] = useState<WorkType | null>('ROAD');
  const [mobileSiteMode, setMobileSiteMode] = useState<boolean>(false);

  // --- 2. Database Entities ---
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_PROJECTS');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    INITIAL_PROJECTS[0]?.id || 'proj-road-1'
  );
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    INITIAL_PROJECTS[0]?.sites?.[0]?.id || 'site-road-1'
  );

  const [roadSections, setRoadSections] = useState<RoadSection[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_ROAD_SECTIONS');
    return saved ? JSON.parse(saved) : INITIAL_ROAD_SECTIONS;
  });

  const [buildingFloors, setBuildingFloors] = useState<BuildingFloor[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_BUILDING_FLOORS');
    return saved ? JSON.parse(saved) : INITIAL_BUILDING_FLOORS;
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_MATERIALS');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_STOCK_LEDGER');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_LEDGER;
  });

  const [consumptionRecords, setConsumptionRecords] = useState<MaterialConsumptionRecord[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_CONSUMPTION');
    return saved ? JSON.parse(saved) : INITIAL_CONSUMPTION_RECORDS;
  });

  const [vehicleTrips, setVehicleTrips] = useState<VehicleTrip[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_TRIPS');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLE_TRIPS;
  });

  const [machinery, setMachinery] = useState<MachineryRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_MACHINERY');
    return saved ? JSON.parse(saved) : INITIAL_MACHINERY;
  });

  const [machineryLogs, setMachineryLogs] = useState<MachineryLog[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_MACHINERY_LOGS');
    return saved ? JSON.parse(saved) : INITIAL_MACHINERY_LOGS;
  });

  const [dieselLogs, setDieselLogs] = useState<DieselLog[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_DIESEL_LOGS');
    return saved ? JSON.parse(saved) : INITIAL_DIESEL_LOGS;
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_WORKERS');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_ATTENDANCE');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [paymentSheets, setPaymentSheets] = useState<LabourPaymentSheet[]>([]);

  const [roadProductions, setRoadProductions] = useState<DailyRoadProduction[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_ROAD_PROD');
    return saved ? JSON.parse(saved) : INITIAL_ROAD_PRODUCTION;
  });

  const [buildingProductions, setBuildingProductions] = useState<DailyBuildingProduction[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_BLDG_PROD');
    return saved ? JSON.parse(saved) : INITIAL_BUILDING_PRODUCTION;
  });

  const [boqItems, setBOQItems] = useState<BOQItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_BOQ');
    return saved ? JSON.parse(saved) : INITIAL_BOQ;
  });

  const [measurements, setMeasurements] = useState<MeasurementBookEntry[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_MEASUREMENTS');
    return saved ? JSON.parse(saved) : INITIAL_MEASUREMENTS;
  });

  const [bbsItems, setBBSItems] = useState<BBSItem[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_BBS');
    return saved ? JSON.parse(saved) : INITIAL_BBS;
  });

  const [notifications, setNotifications] = useState<ERPNotification[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_NOTIFS');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_AUDIT');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [siteSheets, setSiteSheets] = useState<SiteMatrixSheet[]>(() => {
    if (isClearedSlate) return getZeroedSiteSheets(INITIAL_SITE_SHEETS);
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_SITE_SHEETS');
    return saved ? JSON.parse(saved) : INITIAL_SITE_SHEETS;
  });

  const [siteExpenses, setSiteExpenses] = useState<SiteExpenseRecord[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_SITE_EXPENSES');
    return saved ? JSON.parse(saved) : INITIAL_SITE_EXPENSES;
  });

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const currentSite = currentProject?.sites?.find((s) => s.id === selectedSiteId) || currentProject?.sites?.[0];

  const handleSelectProjectId = (id: string) => {
    setSelectedProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p) {
      if (p.sites?.length > 0) {
        setSelectedSiteId(p.sites[0].id);
      }
      if (workType && p.type !== workType) {
        setWorkType(p.type);
      }
    }
  };

  // --- 3. Synchronize State to LocalStorage ---
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY + '_PROJECTS', JSON.stringify(projects));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_ROAD_SECTIONS', JSON.stringify(roadSections));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_BUILDING_FLOORS', JSON.stringify(buildingFloors));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_MATERIALS', JSON.stringify(materials));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_STOCK_LEDGER', JSON.stringify(stockLedger));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_CONSUMPTION', JSON.stringify(consumptionRecords));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_TRIPS', JSON.stringify(vehicleTrips));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_MACHINERY', JSON.stringify(machinery));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_MACHINERY_LOGS', JSON.stringify(machineryLogs));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_DIESEL_LOGS', JSON.stringify(dieselLogs));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_WORKERS', JSON.stringify(workers));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_ATTENDANCE', JSON.stringify(attendanceRecords));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_ROAD_PROD', JSON.stringify(roadProductions));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_BLDG_PROD', JSON.stringify(buildingProductions));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_BOQ', JSON.stringify(boqItems));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_MEASUREMENTS', JSON.stringify(measurements));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_BBS', JSON.stringify(bbsItems));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_NOTIFS', JSON.stringify(notifications));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_AUDIT', JSON.stringify(auditLogs));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_SITE_SHEETS', JSON.stringify(siteSheets));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_SITE_EXPENSES', JSON.stringify(siteExpenses));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  }, [
    projects,
    roadSections,
    buildingFloors,
    materials,
    stockLedger,
    consumptionRecords,
    vehicleTrips,
    machinery,
    machineryLogs,
    dieselLogs,
    workers,
    attendanceRecords,
    roadProductions,
    buildingProductions,
    boqItems,
    measurements,
    bbsItems,
    notifications,
    auditLogs,
    siteSheets,
    siteExpenses
  ]);

  const addAuditLog = (
    module: string,
    transactionId: string,
    action: AuditLogEntry['action'],
    details: string,
    prev?: string,
    next?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const entry: AuditLogEntry = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: now,
      userEmail: currentUser?.email || 'admin@site.com',
      userName: currentUser?.name || 'Administrator',
      module,
      transactionId,
      action,
      previousValue: prev,
      newValue: next,
      details
    };
    setAuditLogs((prevLogs) => [entry, ...prevLogs]);
  };

  const addStockTransaction = (entryData: Omit<StockLedgerEntry, 'id'>) => {
    const newId = 'stk-' + Date.now();
    const newEntry: StockLedgerEntry = { ...entryData, id: newId };
    setStockLedger((prev) => [newEntry, ...prev]);

    setMaterials((prevMats) =>
      prevMats.map((mat) => {
        if (mat.id === entryData.materialId) {
          const qtyDiff = (entryData.quantityIn || 0) - (entryData.quantityOut || 0);
          const updatedStock = Math.max(0, (mat.currentStockTotal || 0) + qtyDiff);
          return { ...mat, currentStockTotal: updatedStock };
        }
        return mat;
      })
    );

    addAuditLog('Inventory Ledger', newId, 'CREATE', `Stock ${entryData.type}: ${entryData.materialName}`);
  };

  const addConsumptionRecord = (rec: Omit<MaterialConsumptionRecord, 'id'>) => {
    const newId = 'con-' + Date.now();
    const newRec: MaterialConsumptionRecord = { ...rec, id: newId };
    setConsumptionRecords((prev) => [newRec, ...prev]);

    if (rec.status === 'OVER_CONSUMPTION_ALERT') {
      const notif: ERPNotification = {
        id: 'notif-' + Date.now(),
        date: new Date().toISOString().substring(0, 16).replace('T', ' '),
        type: 'EXCESS_CONSUMPTION',
        title: `Over-consumption in ${rec.activityName}`,
        message: `${rec.materialName} consumed exceeds theoretical requirement.`,
        severity: 'warning',
        isRead: false,
        linkModule: 'consumption'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const addProject = (projData: Partial<Project>): Project => {
    const newId = 'proj-' + Date.now();
    const newProj: Project = {
      id: newId,
      name: projData.name || 'New Construction Project',
      code: projData.code || 'PRJ-' + Math.floor(1000 + Math.random() * 9000),
      type: projData.type || workType || 'ROAD',
      client: projData.client || 'Government Infra',
      location: projData.location || 'Site Location, India',
      startDate: projData.startDate || new Date().toISOString().substring(0, 10),
      expectedCompletion: projData.expectedCompletion || '2027-12-31',
      contractValue: projData.contractValue || 50000000,
      estimatedCost: projData.estimatedCost || 42000000,
      actualCost: 0,
      forecastFinalCost: projData.estimatedCost || 42000000,
      profitOrLoss: (projData.contractValue || 50000000) - (projData.estimatedCost || 42000000),
      progressPercent: 0,
      projectManager: projData.projectManager || 'Er. Site Manager',
      siteEngineer: projData.siteEngineer || 'Er. Field Engineer',
      supervisor: projData.supervisor || 'Site Supervisor',
      status: 'Active',
      sites: projData.sites && projData.sites.length > 0 ? projData.sites : [
        { id: 'site-' + Date.now(), projectId: newId, name: 'Package Section 1', code: 'S1', location: 'Main Stretch', supervisor: 'Supervisor' }
      ],
      totalRoadKm: projData.type === 'ROAD' ? (projData.totalRoadKm || 10) : undefined,
      totalBuiltUpSqFt: projData.type === 'BUILDING' ? (projData.totalBuiltUpSqFt || 50000) : undefined,
      description: projData.description || 'Project created in ERP.'
    };

    setProjects((prev) => [newProj, ...prev]);
    setSelectedProjectId(newId);
    if (newProj.sites.length > 0) {
      setSelectedSiteId(newProj.sites[0].id);
    }
    return newProj;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const addSiteToProject = (projectId: string, siteName: string, location: string, supervisor: string) => {
    const newSiteId = 'site-' + Date.now();
    const newSite: Site = {
      id: newSiteId,
      projectId,
      name: siteName,
      code: 'ST-' + Math.floor(100 + Math.random() * 900),
      location,
      supervisor
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, sites: [...p.sites, newSite] } : p))
    );
  };

  // --- 4. Permanent Site Purge Function ---
  const deleteSite = (siteId: string) => {
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        sites: (p.sites || []).filter((s) => s.id !== siteId)
      }))
    );
    setSiteSheets((prev) => (prev || []).filter((s) => s.siteId !== siteId));
    setRoadSections((prev) => (prev || []).filter((s) => s.siteId !== siteId));
    setBuildingFloors((prev) => (prev || []).filter((f) => f.siteId !== siteId));
    setSiteExpenses((prev) => (prev || []).filter((e) => e.siteId !== siteId));
    setVehicleTrips((prev) => (prev || []).filter((t) => t.siteId !== siteId));

    if (selectedSiteId === siteId) {
      const remaining = siteSheets.filter((s) => s.siteId !== siteId);
      if (remaining.length > 0) {
        setSelectedSiteId(remaining[0].siteId);
      }
    }
    addAuditLog('Site Master', siteId, 'DELETE', `Deleted site stretch ${siteId}`);
  };

  const addRoadSiteSection = (input: {
    projectId?: string;
    siteName: string;
    siteCode?: string;
    location: string;
    supervisor: string;
    startChainageKm: number;
    endChainageKm: number;
    carriagewayWidthMeters?: number;
    carriagewayType?: string;
    vehicles?: string[];
  }): string => {
    const targetProjId = input.projectId || selectedProjectId || (projects[0]?.id || 'prj-1');
    const newSiteId = 'site-' + Date.now();
    const vehicleList = input.vehicles?.length ? input.vehicles : ['8797', '7352', '7353', '9579', '9580'];

    const newSite: Site = {
      id: newSiteId,
      projectId: targetProjId,
      name: input.siteName,
      code: input.siteCode || 'ST-' + Math.floor(100 + Math.random() * 900),
      location: input.location,
      supervisor: input.supervisor
    };

    setProjects((prev) =>
      prev.map((p) => (p.id === targetProjId ? { ...p, sites: [...p.sites, newSite] } : p))
    );

    const makeDayRow = (d: number, item: string) => {
      const vVals: Record<string, number> = {};
      vehicleList.forEach((v) => {
        vVals[v] = 0;
      });
      return {
        id: `r-${newSiteId}-${item.toLowerCase().replace(/\s+/g, '')}-${d}`,
        dayNumber: d,
        date: `${d}-6-2026`,
        item,
        vehicleValues: vVals,
        total: 0
      };
    };

    const newSheet: SiteMatrixSheet = {
      siteId: newSiteId,
      siteName: input.siteName,
      monthTitle: 'JUNE/JULY',
      year: 2026,
      vehicles: vehicleList,
      tabs: [
        {
          id: `tab-${newSiteId}-murum`,
          tabKey: 'MURUM',
          label: 'Murum / Borrow Soil',
          unit: 'Trips',
          defaultRate: 350,
          rows: Array.from({ length: 15 }, (_, i) => makeDayRow(i + 1, 'Murum'))
        },
        {
          id: `tab-${newSiteId}-gsb`,
          tabKey: 'GSB',
          label: 'GSB (Granular Sub-Base)',
          unit: 'Tonnes',
          defaultRate: 390,
          rows: Array.from({ length: 15 }, (_, i) => makeDayRow(i + 1, 'GSB'))
        },
        {
          id: `tab-${newSiteId}-wmm`,
          tabKey: 'WMM',
          label: 'WMM (Wet Mix Macadam)',
          unit: 'Tonnes',
          defaultRate: 420,
          rows: Array.from({ length: 15 }, (_, i) => makeDayRow(i + 1, 'WMM'))
        },
        {
          id: `tab-${newSiteId}-diesel`,
          tabKey: 'DIESEL',
          label: 'Diesel Dispensed (L)',
          unit: 'Litres',
          defaultRate: 92.5,
          rows: Array.from({ length: 15 }, (_, i) => makeDayRow(i + 1, 'Diesel'))
        }
      ]
    };

    setSiteSheets((prev) => [...prev, newSheet]);
    setSelectedSiteId(newSiteId);
    return newSiteId;
  };

  const updateRoadLayerProgress = (sectionId: string, layerId: string, completedMeters: number, actualQty: number) => {
    setRoadSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            layers: sec.layers.map((lay) =>
              lay.id === layerId
                ? {
                    ...lay,
                    completedLengthMeters: completedMeters,
                    progressPercent: Math.min(100, Math.round((completedMeters / sec.totalLengthMeters) * 100)),
                    actualQtyUsed: actualQty
                  }
                : lay
            )
          };
        }
        return sec;
      })
    );
  };

  const updateBuildingFloor = (floorId: string, data: Partial<BuildingFloor>) => {
    setBuildingFloors((prev) =>
      prev.map((f) => (f.id === floorId ? { ...f, ...data } : f))
    );
  };

  const addBuildingFloor = (floorData: Partial<BuildingFloor>) => {
    const newId = 'fl-' + Date.now();
    const newFloor: BuildingFloor = {
      id: newId,
      projectId: floorData.projectId || selectedProjectId,
      siteId: floorData.siteId || selectedSiteId,
      buildingName: floorData.buildingName || 'Tower A',
      floorLevel: floorData.floorLevel || 'Floor Level',
      levelIndex: floorData.levelIndex || 1,
      builtUpAreaSqFt: floorData.builtUpAreaSqFt || 10000,
      plannedCost: floorData.plannedCost || 15000000,
      actualCost: 0,
      progressPercent: 0,
      status: 'Not Started',
      rccElementsCount: floorData.rccElementsCount || 20
    };
    setBuildingFloors((prev) => [...prev, newFloor]);
  };

  const addVehicleTrip = (tripData: Omit<VehicleTrip, 'id'>) => {
    const newId = 'trip-' + Date.now();
    setVehicleTrips((prev) => [{ ...tripData, id: newId }, ...prev]);
  };

  const updateVehicleTripStatus = (tripId: string, status: ApprovalStatus) => {
    setVehicleTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, approvalStatus: status } : t))
    );
  };

  const addMachineryLog = (logData: Omit<MachineryLog, 'id'>) => {
    const newId = 'mlog-' + Date.now();
    setMachineryLogs((prev) => [{ ...logData, id: newId }, ...prev]);
  };

  const addDieselLog = (logData: Omit<DieselLog, 'id'>) => {
    const newId = 'dsl-' + Date.now();
    setDieselLogs((prev) => [{ ...logData, id: newId }, ...prev]);
  };

  const addAttendanceRecord = (recData: Omit<AttendanceRecord, 'id'>) => {
    const newId = 'att-' + Date.now();
    setAttendanceRecords((prev) => [{ ...recData, id: newId }, ...prev]);
  };

  const bulkAddAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    const newEntries = records.map((r, idx) => ({ ...r, id: `att-${Date.now()}-${idx}` }));
    setAttendanceRecords((prev) => [...newEntries, ...prev]);
  };

  const markAttendancePaid = (attendanceId: string, ref: string) => {
    setAttendanceRecords((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, isPaid: true, paymentRef: ref } : a))
    );
  };

  const addRoadProduction = (prodData: Omit<DailyRoadProduction, 'id'>) => {
    setRoadProductions((prev) => [{ ...prodData, id: 'prod-rd-' + Date.now() }, ...prev]);
  };

  const addBuildingProduction = (prodData: Omit<DailyBuildingProduction, 'id'>) => {
    setBuildingProductions((prev) => [{ ...prodData, id: 'prod-bg-' + Date.now() }, ...prev]);
  };

  const addBOQItem = (itemData: Omit<BOQItem, 'id'>) => {
    setBOQItems((prev) => [{ ...itemData, id: 'boq-' + Date.now() }, ...prev]);
  };

  const updateBOQItem = (id: string, data: Partial<BOQItem>) => {
    setBOQItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  };

  const addMeasurementEntry = (entryData: Omit<MeasurementBookEntry, 'id'>) => {
    setMeasurements((prev) => [{ ...entryData, id: 'mb-' + Date.now() }, ...prev]);
  };

  const addBBSItem = (itemData: Omit<BBSItem, 'id'>) => {
    setBBSItems((prev) => [{ ...itemData, id: 'bbs-' + Date.now() }, ...prev]);
  };

  const deleteBBSItem = (id: string) => {
    setBBSItems((prev) => prev.filter((b) => b.id !== id));
  };

  const updateSiteCellValue = (siteId: string, tabKey: string, rowId: string, vehicle: string, value: number) => {
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        return {
          ...sheet,
          tabs: sheet.tabs.map((tab) => {
            if (tab.tabKey !== tabKey) return tab;
            return {
              ...tab,
              rows: tab.rows.map((row) => {
                if (row.id !== rowId) return row;
                const vVals = { ...row.vehicleValues, [vehicle]: Math.max(0, value) };
                const total = Object.values(vVals).reduce((a, b) => a + (Number(b) || 0), 0);
                return { ...row, vehicleValues: vVals, total };
              })
            };
          })
        };
      })
    );
  };

  const updateSiteRowRate = (siteId: string, tabKey: string, rowId: string, rate: number) => {
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        return {
          ...sheet,
          tabs: sheet.tabs.map((tab) => {
            if (tab.tabKey !== tabKey) return tab;
            return {
              ...tab,
              rows: tab.rows.map((row) => (row.id === rowId ? { ...row, ratePerUnitOrTrip: rate } : row))
            };
          })
        };
      })
    );
  };

  const addSiteSheetRow = (siteId: string, tabKey: string, date: string, item: string) => {
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        return {
          ...sheet,
          tabs: sheet.tabs.map((tab) => {
            if (tab.tabKey !== tabKey) return tab;
            const vVals: Record<string, number> = {};
            (sheet.vehicles || []).forEach((v) => {
              vVals[v] = 0;
            });
            const newRow: SiteMatrixRow = {
              id: `row-${siteId}-${tabKey}-${Date.now()}`,
              dayNumber: tab.rows.length + 1,
              date,
              item: item || tab.label,
              vehicleValues: vVals,
              total: 0,
              ratePerUnitOrTrip: tab.defaultRate,
              unit: tab.unit
            };
            return { ...tab, rows: [...tab.rows, newRow] };
          })
        };
      })
    );
  };

  const addSiteSheetVehicle = (siteId: string, vehicleNumber: string) => {
    const cleanNum = vehicleNumber.trim().toUpperCase();
    if (!cleanNum) return;
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId || sheet.vehicles.includes(cleanNum)) return sheet;
        return {
          ...sheet,
          vehicles: [...sheet.vehicles, cleanNum],
          tabs: sheet.tabs.map((tab) => ({
            ...tab,
            rows: tab.rows.map((row) => ({
              ...row,
              vehicleValues: { ...row.vehicleValues, [cleanNum]: 0 }
            }))
          }))
        };
      })
    );
  };

  const addSiteSheetTab = (siteId: string, tabKey: string, label: string, defaultRate: number, unit: string) => {
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId || sheet.tabs.some((t) => t.tabKey === tabKey)) return sheet;
        const initialRows: SiteMatrixRow[] = Array.from({ length: 15 }, (_, i) => {
          const vv: Record<string, number> = {};
          sheet.vehicles.forEach((v) => {
            vv[v] = 0;
          });
          return {
            id: `row-${siteId}-${tabKey}-${i + 1}`,
            dayNumber: i + 1,
            date: `${i + 1}-6-2026`,
            item: label,
            vehicleValues: vv,
            total: 0,
            ratePerUnitOrTrip: defaultRate,
            unit
          };
        });

        return {
          ...sheet,
          tabs: [...sheet.tabs, { id: `tab-${Date.now()}`, tabKey, label, unit, defaultRate, rows: initialRows }]
        };
      })
    );
  };

  const addSiteExpense = (expData: Omit<SiteExpenseRecord, 'id' | 'createdAt'>) => {
    const newId = 'exp-' + Date.now();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setSiteExpenses((prev) => [{ ...expData, id: newId, createdAt: now }, ...prev]);
  };

  const deleteSiteExpense = (id: string) => {
    setSiteExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateSiteExpenseStatus = (id: string, status: 'PAID' | 'PENDING' | 'APPROVED') => {
    setSiteExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  // --- 5. Total Data Purge Engine ---
  const clearAllData = () => {
    setStockLedger([]);
    setConsumptionRecords([]);
    setVehicleTrips([]);
    setDieselLogs([]);
    setMachineryLogs([]);
    setAttendanceRecords([]);
    setPaymentSheets([]);
    setRoadProductions([]);
    setBuildingProductions([]);
    setMeasurements([]);
    setBBSItems([]);
    setSiteExpenses([]);
    setNotifications([]);
    setSiteSheets((prev) => getZeroedSiteSheets(prev));

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_TRIPS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_DIESEL_LOGS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_SITE_EXPENSES');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_STOCK_LEDGER');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_CONSUMPTION');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_ATTENDANCE');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_ROAD_PROD');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_BLDG_PROD');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_MEASUREMENTS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_BBS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_NOTIFS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_MACHINERY_LOGS');
      localStorage.setItem('ERP_DATA_CLEARED_SLATE', 'true');
    } catch {
      // ignore
    }
  };

  const resetToSampleData = () => {
    localStorage.removeItem('ERP_DATA_CLEARED_SLATE');
    setProjects(INITIAL_PROJECTS);
    setRoadSections(INITIAL_ROAD_SECTIONS);
    setBuildingFloors(INITIAL_BUILDING_FLOORS);
    setMaterials(INITIAL_MATERIALS);
    setStockLedger(INITIAL_STOCK_LEDGER);
    setConsumptionRecords(INITIAL_CONSUMPTION_RECORDS);
    setVehicleTrips(INITIAL_VEHICLE_TRIPS);
    setMachinery(INITIAL_MACHINERY);
    setMachineryLogs(INITIAL_MACHINERY_LOGS);
    setDieselLogs(INITIAL_DIESEL_LOGS);
    setWorkers(INITIAL_WORKERS);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setRoadProductions(INITIAL_ROAD_PRODUCTION);
    setBuildingProductions(INITIAL_BUILDING_PRODUCTION);
    setBOQItems(INITIAL_BOQ);
    setMeasurements(INITIAL_MEASUREMENTS);
    setBBSItems(INITIAL_BBS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSiteSheets(INITIAL_SITE_SHEETS);
    setSiteExpenses(INITIAL_SITE_EXPENSES);
  };

  const exportDatabaseJSON = () => {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        projects,
        roadSections,
        materials,
        stockLedger,
        vehicleTrips,
        machinery,
        dieselLogs,
        siteSheets,
        siteExpenses
      },
      null,
      2
    );
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.projects) setProjects(data.projects);
      if (data.siteSheets) setSiteSheets(data.siteSheets);
      if (data.materials) setMaterials(data.materials);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ERPContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole,
        workType,
        setWorkType,
        selectedProjectId,
        setSelectedProjectId: handleSelectProjectId,
        selectedSiteId,
        setSelectedSiteId,
        currentProject,
        currentSite,
        projects,
        addProject,
        updateProject,
        deleteProject,
        addSiteToProject,
        deleteSite,
        addRoadSiteSection,
        roadSections,
        updateRoadLayerProgress,
        buildingFloors,
        updateBuildingFloor,
        addBuildingFloor,
        materials,
        stockLedger,
        addStockTransaction,
        consumptionRecords,
        addConsumptionRecord,
        vehicleTrips,
        addVehicleTrip,
        updateVehicleTripStatus,
        siteSheets,
        updateSiteCellValue,
        updateSiteRowRate,
        addSiteSheetRow,
        addSiteSheetVehicle,
        addSiteSheetTab,
        siteExpenses,
        addSiteExpense,
        deleteSiteExpense,
        updateSiteExpenseStatus,
        machinery,
        machineryLogs,
        addMachineryLog,
        dieselLogs,
        addDieselLog,
        workers,
        attendanceRecords,
        addAttendanceRecord,
        bulkAddAttendance,
        markAttendancePaid,
        paymentSheets,
        roadProductions,
        addRoadProduction,
        buildingProductions,
        addBuildingProduction,
        boqItems,
        addBOQItem,
        updateBOQItem,
        measurements,
        addMeasurementEntry,
        bbsItems,
        addBBSItem,
        deleteBBSItem,
        notifications,
        markNotificationRead,
        auditLogs,
        addAuditLog,
        clearAllData,
        resetToSampleData,
        exportDatabaseJSON,
        importDatabaseJSON,
        mobileSiteMode,
        setMobileSiteMode
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
