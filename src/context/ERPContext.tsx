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
  RCCFootingInput,
  RCCColumnInput,
  RCCBeamInput,
  RCCSlabInput,
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
  // Authentication
  isAuthenticated: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;

  // Navigation & Mode
  workType: WorkType | null;
  setWorkType: (type: WorkType | null) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Selected Context
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedSiteId: string;
  setSelectedSiteId: (id: string) => void;
  currentProject: Project | undefined;
  currentSite: Site | undefined;

  // Projects & Sites
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

  // Road & Building Modules
  roadSections: RoadSection[];
  updateRoadLayerProgress: (sectionId: string, layerId: string, completedMeters: number, actualQty: number) => void;
  buildingFloors: BuildingFloor[];
  updateBuildingFloor: (floorId: string, data: Partial<BuildingFloor>) => void;
  addBuildingFloor: (floor: Partial<BuildingFloor>) => void;

  // Material & Inventory Ledger
  materials: MaterialItem[];
  stockLedger: StockLedgerEntry[];
  addStockTransaction: (entry: Omit<StockLedgerEntry, 'id'>) => void;
  consumptionRecords: MaterialConsumptionRecord[];
  addConsumptionRecord: (rec: Omit<MaterialConsumptionRecord, 'id'>) => void;

  // Trips & Rental Vehicles
  vehicleTrips: VehicleTrip[];
  addVehicleTrip: (trip: Omit<VehicleTrip, 'id'>) => void;
  updateVehicleTripStatus: (tripId: string, status: ApprovalStatus) => void;

  // Site Matrix Sheets (Mulwad Site Sheet 1:1)
  siteSheets: SiteMatrixSheet[];
  updateSiteCellValue: (siteId: string, tabKey: string, rowId: string, vehicle: string, value: number) => void;
  updateSiteRowRate: (siteId: string, tabKey: string, rowId: string, rate: number) => void;
  addSiteSheetRow: (siteId: string, tabKey: string, date: string, item: string) => void;
  addSiteSheetVehicle: (siteId: string, vehicleNumber: string) => void;
  addSiteSheetTab: (siteId: string, tabKey: string, label: string, defaultRate: number, unit: string) => void;

  // Site Specific Cost & Expenses
  siteExpenses: SiteExpenseRecord[];
  addSiteExpense: (exp: Omit<SiteExpenseRecord, 'id' | 'createdAt'>) => void;
  deleteSiteExpense: (id: string) => void;
  updateSiteExpenseStatus: (id: string, status: 'PAID' | 'PENDING' | 'APPROVED') => void;

  // Machinery & Diesel
  machinery: MachineryRecord[];
  machineryLogs: MachineryLog[];
  addMachineryLog: (log: Omit<MachineryLog, 'id'>) => void;
  dieselLogs: DieselLog[];
  addDieselLog: (log: Omit<DieselLog, 'id'>) => void;

  // Labour & Attendance & Wages
  workers: Worker[];
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (rec: Omit<AttendanceRecord, 'id'>) => void;
  markAttendancePaid: (attendanceId: string, ref: string) => void;
  bulkAddAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  paymentSheets: LabourPaymentSheet[];

  // Daily Production
  roadProductions: DailyRoadProduction[];
  addRoadProduction: (prod: Omit<DailyRoadProduction, 'id'>) => void;
  buildingProductions: DailyBuildingProduction[];
  addBuildingProduction: (prod: Omit<DailyBuildingProduction, 'id'>) => void;

  // BOQ & MB
  boqItems: BOQItem[];
  addBOQItem: (item: Omit<BOQItem, 'id'>) => void;
  updateBOQItem: (id: string, data: Partial<BOQItem>) => void;
  measurements: MeasurementBookEntry[];
  addMeasurementEntry: (entry: Omit<MeasurementBookEntry, 'id'>) => void;

  // BBS & RCC
  bbsItems: BBSItem[];
  addBBSItem: (item: Omit<BBSItem, 'id'>) => void;
  deleteBBSItem: (id: string) => void;

  // System & Audit & Notifications
  notifications: ERPNotification[];
  markNotificationRead: (id: string) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (module: string, transactionId: string, action: AuditLogEntry['action'], details: string, prev?: string, next?: string) => void;

  // Backup & Reset
  clearAllData: () => void;
  resetToSampleData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;

  // Mobile Mode Active
  mobileSiteMode: boolean;
  setMobileSiteMode: (active: boolean) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'INFRABUILD_ERP_STATE_V1';

// Helper to create blank zero-quantity site sheets
const getZeroedSiteSheets = (sheets: SiteMatrixSheet[]): SiteMatrixSheet[] => {
  return sheets.map((sheet) => ({
    ...sheet,
    tabs: sheet.tabs.map((tab) => ({
      ...tab,
      rows: tab.rows.map((row) => {
        const zeroVV: Record<string, number> = {};
        sheet.vehicles.forEach((v) => {
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

 // Inside ERPProvider in src/context/ERPContext.tsx:
const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_AUTH');
  return saved !== null ? JSON.parse(saved) : true; // Default to true so it stays logged in
});

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_USER');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'usr-owner-1',
          name: 'Admin User',
          email: 'habibullabilgiabu@gmail.com',
          role: 'SUPER_ADMIN'
        };
  });

  const [userRole, setUserRole] = useState<UserRole>('SUPER_ADMIN');

  const login = (username: string, _password?: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    let name = 'Admin User';
    let role: UserRole = 'SUPER_ADMIN';
    let email = 'admin@bilgicrushers.com';

    if (cleanUser === 'neha' || cleanUser.includes('neha')) {
      name = 'Neha';
      role = 'STORE_MANAGER';
      email = 'neha.ops@bilgicrushers.com';
    } else if (cleanUser === 'ibrahim' || cleanUser.includes('ibrahim')) {
      name = 'Ibrahim';
      role = 'SITE_SUPERVISOR';
      email = 'ibrahim@bilgicrushers.com';
    } else if (cleanUser === 'billing' || cleanUser.includes('eng')) {
      name = 'Er. Amit Sharma';
      role = 'SITE_ENGINEER';
      email = 'amit.billing@bilgicrushers.com';
    } else if (cleanUser === 'owner' || cleanUser.includes('bilgi')) {
      name = 'Habibulla Bilgi';
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

  // Relational Entities
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_PROJECTS');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(INITIAL_PROJECTS[0].sites[0]?.id || '');

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
  const currentSite = currentProject?.sites.find((s) => s.id === selectedSiteId) || currentProject?.sites[0];

  const handleSelectProjectId = (id: string) => {
    setSelectedProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p) {
      if (p.sites.length > 0) {
        setSelectedSiteId(p.sites[0].id);
      }
      if (workType && p.type !== workType) {
        setWorkType(p.type);
      }
    }
  };

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
      userEmail: currentUser.email,
      userName: currentUser.name,
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

    addAuditLog('Inventory Ledger', newId, 'CREATE', `Stock ${entryData.type}: ${entryData.materialName} (${entryData.quantityIn || entryData.quantityOut} ${entryData.unit})`);
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
        message: `${rec.materialName} consumed exceeds theoretical requirement by ${rec.variancePercent.toFixed(1)}% (${rec.varianceQty} ${rec.unit}).`,
        severity: 'warning',
        isRead: false,
        linkModule: 'consumption'
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    addAuditLog('Material Consumption', newId, 'CREATE', `Logged consumption for ${rec.activityName} - ${rec.materialName}: ${rec.actualUsedQty} ${rec.unit}`);
  };

  const addProject = (projData: Partial<Project>): Project => {
    const newId = 'proj-' + Date.now();
    const newProj: Project = {
      id: newId,
      name: projData.name || 'New Construction Project',
      code: projData.code || 'PRJ-' + Math.floor(1000 + Math.random() * 9000),
      type: projData.type || workType || 'ROAD',
      client: projData.client || 'Government Infrastructure Dept',
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
        { id: 'site-' + Date.now(), projectId: newId, name: 'Main Site Package 1', code: 'S1', location: projData.location || 'Main Site', supervisor: 'Supervisor' }
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
    addAuditLog('Project Master', newId, 'CREATE', `Created project ${newProj.name} (${newProj.code}) [${newProj.type}]`);
    return newProj;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data };
          if (updated.contractValue !== undefined && updated.actualCost !== undefined) {
            updated.profitOrLoss = updated.contractValue - (updated.forecastFinalCost || updated.actualCost);
          }
          return updated;
        }
        return p;
      })
    );
    addAuditLog('Project Master', id, 'UPDATE', `Updated project properties for ${id}`);
  };

  const deleteProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setSelectedProjectId(remaining[0].id);
        if (remaining[0].sites.length > 0) setSelectedSiteId(remaining[0].sites[0].id);
      }
    }
    addAuditLog('Project Master', id, 'DELETE', `Deleted project ${proj?.name || id}`);
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
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, sites: [...p.sites, newSite] };
        }
        return p;
      })
    );
    addAuditLog('Project Master', projectId, 'UPDATE', `Added new site ${siteName} to project ${projectId}`);
  };

  // --- DELETE THE WHOLE SITE FUNCTION ---
  const deleteSite = (siteId: string) => {
    // 1. Remove from projects
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        sites: p.sites.filter((s) => s.id !== siteId)
      }))
    );

    // 2. Remove site matrix sheets
    setSiteSheets((prev) => prev.filter((s) => s.siteId !== siteId));

    // 3. Remove road sections
    setRoadSections((prev) => prev.filter((s) => s.siteId !== siteId));

    // 4. Remove building floors
    setBuildingFloors((prev) => prev.filter((f) => f.siteId !== siteId));

    // 5. Remove site expenses
    setSiteExpenses((prev) => prev.filter((e) => e.siteId !== siteId));

    // 6. Remove vehicle trips
    setVehicleTrips((prev) => prev.filter((t) => t.siteId !== siteId));

    // 7. If currently selected, select another site
    if (selectedSiteId === siteId) {
      const remainingSheets = siteSheets.filter((s) => s.siteId !== siteId);
      if (remainingSheets.length > 0) {
        setSelectedSiteId(remainingSheets[0].siteId);
      }
    }

    addAuditLog('Site Master', siteId, 'DELETE', `Permanently deleted site and all associated matrices: ${siteId}`);
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
    const targetProjId = input.projectId || selectedProjectId || (projects[0] ? projects[0].id : 'prj-1');
    const newSiteId = 'site-' + Date.now();
    const siteCode = input.siteCode || 'ST-' + Math.floor(100 + Math.random() * 900);
    const vehicleList = input.vehicles && input.vehicles.length > 0 ? input.vehicles : ['8797', '7352', '7353', '9579', '9580'];
    const totalLengthM = Math.max(100, Math.round(Math.abs(input.endChainageKm - input.startChainageKm) * 1000));
    const widthM = input.carriagewayWidthMeters || 7.5;

    const newSite: Site = {
      id: newSiteId,
      projectId: targetProjId,
      name: input.siteName,
      code: siteCode,
      location: input.location,
      supervisor: input.supervisor
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === targetProjId) {
          return { ...p, sites: [...p.sites, newSite] };
        }
        return p;
      })
    );

    const newRoadSection: RoadSection = {
      id: 'sec-' + Date.now(),
      projectId: targetProjId,
      siteId: newSiteId,
      name: input.siteName,
      startChainage: input.startChainageKm,
      endChainage: input.endChainageKm,
      totalLengthMeters: totalLengthM,
      carriagewayWidthMeters: widthM,
      shoulderWidthMeters: 1.5,
      layers: [
        {
          id: 'lay-emb-' + Date.now(),
          layerType: 'Subgrade / Murum',
          designThicknessMm: 500,
          completedChainageStart: input.startChainageKm,
          completedChainageEnd: input.startChainageKm,
          completedLengthMeters: 0,
          progressPercent: 0,
          theoreticalQty: Math.round(totalLengthM * widthM * 0.5 * 1.85),
          actualQtyUsed: 0,
          varianceQty: 0,
          unit: 'Tonnes'
        },
        {
          id: 'lay-gsb-' + Date.now(),
          layerType: 'Granular Sub-Base (GSB)',
          designThicknessMm: 150,
          completedChainageStart: input.startChainageKm,
          completedChainageEnd: input.startChainageKm,
          completedLengthMeters: 0,
          progressPercent: 0,
          theoreticalQty: Math.round(totalLengthM * widthM * 0.15 * 2.25),
          actualQtyUsed: 0,
          varianceQty: 0,
          unit: 'Tonnes'
        },
        {
          id: 'lay-wmm-' + Date.now(),
          layerType: 'Wet Mix Macadam (WMM)',
          designThicknessMm: 150,
          completedChainageStart: input.startChainageKm,
          completedChainageEnd: input.startChainageKm,
          completedLengthMeters: 0,
          progressPercent: 0,
          theoreticalQty: Math.round(totalLengthM * widthM * 0.15 * 2.35),
          actualQtyUsed: 0,
          varianceQty: 0,
          unit: 'Tonnes'
        },
        {
          id: 'lay-dbm-' + Date.now(),
          layerType: 'Dense Bituminous Macadam (DBM)',
          designThicknessMm: 75,
          completedChainageStart: input.startChainageKm,
          completedChainageEnd: input.startChainageKm,
          completedLengthMeters: 0,
          progressPercent: 0,
          theoreticalQty: Math.round(totalLengthM * widthM * 0.075 * 2.42),
          actualQtyUsed: 0,
          varianceQty: 0,
          unit: 'Tonnes'
        },
        {
          id: 'lay-bc-' + Date.now(),
          layerType: 'Bituminous Concrete (BC)',
          designThicknessMm: 40,
          completedChainageStart: input.startChainageKm,
          completedChainageEnd: input.startChainageKm,
          completedLengthMeters: 0,
          progressPercent: 0,
          theoreticalQty: Math.round(totalLengthM * widthM * 0.04 * 2.45),
          actualQtyUsed: 0,
          varianceQty: 0,
          unit: 'Tonnes'
        }
      ]
    };

    setRoadSections((prev) => [newRoadSection, ...prev]);

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
          id: `tab-${newSiteId}-sand`,
          tabKey: 'M SAND',
          label: 'M Sand / Crushed Sand',
          unit: 'Tonnes',
          defaultRate: 520,
          rows: Array.from({ length: 15 }, (_, i) => makeDayRow(i + 1, 'M Sand'))
        },
        {
          id: `tab-${newSiteId}-20mm`,
          tabKey: '20 MM',
          label: '20 MM Crushed Aggregate',
          unit: 'Tonnes',
          defaultRate: 480,
          rows: Array.from({ length: 15 }, (_, i) => makeDayRow(i + 1, '20 MM'))
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

    addAuditLog(
      'Site Master',
      newSiteId,
      'CREATE',
      `Created Road Site Section "${input.siteName}" (${siteCode}) Ch. ${input.startChainageKm} to ${input.endChainageKm} km.`
    );

    return newSiteId;
  };

  const updateRoadLayerProgress = (sectionId: string, layerId: string, completedMeters: number, actualQty: number) => {
    setRoadSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          const updatedLayers = sec.layers.map((lay) => {
            if (lay.id === layerId) {
              const progress = Math.min(100, Math.round((completedMeters / sec.totalLengthMeters) * 100));
              const variance = actualQty - lay.theoreticalQty;
              return {
                ...lay,
                completedLengthMeters: completedMeters,
                progressPercent: progress,
                actualQtyUsed: actualQty,
                varianceQty: variance
              };
            }
            return lay;
          });
          return { ...sec, layers: updatedLayers };
        }
        return sec;
      })
    );
    addAuditLog('Road Chainage', sectionId, 'UPDATE', `Updated progress for layer ${layerId} to ${completedMeters}m`);
  };

  const updateBuildingFloor = (floorId: string, data: Partial<BuildingFloor>) => {
    setBuildingFloors((prev) =>
      prev.map((f) => {
        if (f.id === floorId) {
          return { ...f, ...data };
        }
        return f;
      })
    );
    addAuditLog('Building Floors', floorId, 'UPDATE', `Updated floor status/progress`);
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
    addAuditLog('Building Floors', newId, 'CREATE', `Added floor ${newFloor.floorLevel} to ${newFloor.buildingName}`);
  };

  const addVehicleTrip = (tripData: Omit<VehicleTrip, 'id'>) => {
    const newId = 'trip-' + Date.now();
    const newTrip: VehicleTrip = { ...tripData, id: newId };
    setVehicleTrips((prev) => [newTrip, ...prev]);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === tripData.projectId) {
          const newActual = (p.actualCost || 0) + (tripData.totalAmount || 0);
          return { ...p, actualCost: newActual };
        }
        return p;
      })
    );

    addAuditLog('Trip Counter', newId, 'CREATE', `Recorded trip ${tripData.tripNumber} (${tripData.actualLoadedQty} ${tripData.unit} ${tripData.materialName})`);
  };

  const updateVehicleTripStatus = (tripId: string, status: ApprovalStatus) => {
    setVehicleTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, approvalStatus: status } : t))
    );
    addAuditLog('Trip Counter', tripId, 'APPROVE', `Trip status changed to ${status}`);
  };

  const addMachineryLog = (logData: Omit<MachineryLog, 'id'>) => {
    const newId = 'mlog-' + Date.now();
    const newLog: MachineryLog = { ...logData, id: newId };
    setMachineryLogs((prev) => [newLog, ...prev]);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === logData.projectId) {
          return { ...p, actualCost: (p.actualCost || 0) + (logData.totalCost || 0) };
        }
        return p;
      })
    );

    addAuditLog('Machinery Fleet', newId, 'CREATE', `Logged ${logData.operatingHours} hrs for ${logData.machineryName} (Cost: ₹${logData.totalCost.toLocaleString()})`);
  };

  const addDieselLog = (logData: Omit<DieselLog, 'id'>) => {
    const newId = 'dsl-' + Date.now();
    const newLog: DieselLog = { ...logData, id: newId };
    setDieselLogs((prev) => [newLog, ...prev]);

    setMaterials((prev) =>
      prev.map((m) => {
        if (m.category === 'Fuel / Diesel') {
          return { ...m, currentStockTotal: Math.max(0, m.currentStockTotal - logData.litresDispensed) };
        }
        return m;
      })
    );

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === logData.projectId) {
          return { ...p, actualCost: (p.actualCost || 0) + (logData.totalAmount || 0) };
        }
        return p;
      })
    );

    addAuditLog('Diesel Management', newId, 'CREATE', `Dispensed ${logData.litresDispensed}L diesel to ${logData.vehicleOrMachineName} (Amount: ₹${logData.totalAmount.toLocaleString()})`);
  };

  const addAttendanceRecord = (recData: Omit<AttendanceRecord, 'id'>) => {
    const newId = 'att-' + Date.now();
    const newRec: AttendanceRecord = { ...recData, id: newId };
    setAttendanceRecords((prev) => [newRec, ...prev]);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === recData.projectId) {
          return { ...p, actualCost: (p.actualCost || 0) + (recData.grossWage || 0) };
        }
        return p;
      })
    );

    addAuditLog('Labour Attendance', newId, 'CREATE', `Attendance logged for ${recData.workerName}: Gross Wage ₹${recData.grossWage}`);
  };

  const bulkAddAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    const newEntries: AttendanceRecord[] = records.map((r, idx) => ({
      ...r,
      id: 'att-' + Date.now() + '-' + idx
    }));
    setAttendanceRecords((prev) => [...newEntries, ...prev]);

    const totalWage = records.reduce((sum, r) => sum + r.grossWage, 0);
    if (records.length > 0) {
      const projId = records[0].projectId;
      setProjects((prev) =>
        prev.map((p) => (p.id === projId ? { ...p, actualCost: (p.actualCost || 0) + totalWage } : p))
      );
    }
    addAuditLog('Labour Attendance', 'bulk', 'CREATE', `Bulk marked attendance for ${records.length} workers (Total Wages: ₹${totalWage.toLocaleString()})`);
  };

  const markAttendancePaid = (attendanceId: string, ref: string) => {
    setAttendanceRecords((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, isPaid: true, paymentRef: ref } : a))
    );
    addAuditLog('Labour Payment', attendanceId, 'POST', `Wage payment processed with Ref ${ref}`);
  };

  const addRoadProduction = (prodData: Omit<DailyRoadProduction, 'id'>) => {
    const newId = 'prod-rd-' + Date.now();
    const newProd: DailyRoadProduction = { ...prodData, id: newId };
    setRoadProductions((prev) => [newProd, ...prev]);
    addAuditLog('Road Production', newId, 'CREATE', `Logged ${prodData.lengthCompletedMeters}m of ${prodData.layerType} (Cost: ₹${prodData.totalDailyCost.toLocaleString()})`);
  };

  const addBuildingProduction = (prodData: Omit<DailyBuildingProduction, 'id'>) => {
    const newId = 'prod-bg-' + Date.now();
    const newProd: DailyBuildingProduction = { ...prodData, id: newId };
    setBuildingProductions((prev) => [newProd, ...prev]);
    addAuditLog('Building Production', newId, 'CREATE', `Logged ${prodData.completedQty} ${prodData.unit} for ${prodData.activityName} (Cost: ₹${prodData.totalDailyCost.toLocaleString()})`);
  };

  const addBOQItem = (itemData: Omit<BOQItem, 'id'>) => {
    const newId = 'boq-' + Date.now();
    const newItem: BOQItem = { ...itemData, id: newId };
    setBOQItems((prev) => [newItem, ...prev]);
    addAuditLog('BOQ Master', newId, 'CREATE', `Added BOQ item ${newItem.itemCode}: ${newItem.activityName}`);
  };

  const updateBOQItem = (id: string, data: Partial<BOQItem>) => {
    setBOQItems((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data, remainingQuantity: (data.plannedQuantity || b.plannedQuantity) - (data.executedQuantity || b.executedQuantity) } : b))
    );
    addAuditLog('BOQ Master', id, 'UPDATE', `Updated BOQ item ${id}`);
  };

  const addMeasurementEntry = (entryData: Omit<MeasurementBookEntry, 'id'>) => {
    const newId = 'mb-' + Date.now();
    const newEntry: MeasurementBookEntry = { ...entryData, id: newId };
    setMeasurements((prev) => [newEntry, ...prev]);
    addAuditLog('Measurement Book', newId, 'CREATE', `Recorded MB entry ${newEntry.mbNumber} (${newEntry.calculatedQuantity} ${newEntry.unit} for ${newEntry.activity})`);
  };

  const addBBSItem = (itemData: Omit<BBSItem, 'id'>) => {
    const newId = 'bbs-' + Date.now();
    const newItem: BBSItem = { ...itemData, id: newId };
    setBBSItems((prev) => [newItem, ...prev]);
    addAuditLog('Bar Bending Schedule', newId, 'CREATE', `Added BBS item for ${newItem.member} (${newItem.totalWeightKg.toFixed(2)} kg)`);
  };

  const deleteBBSItem = (id: string) => {
    setBBSItems((prev) => prev.filter((b) => b.id !== id));
    addAuditLog('Bar Bending Schedule', id, 'DELETE', `Deleted BBS item ${id}`);
  };

  const updateSiteCellValue = (
    siteId: string,
    tabKey: string,
    rowId: string,
    vehicle: string,
    value: number
  ) => {
    setSiteSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        const updatedTabs = sheet.tabs.map((tab) => {
          if (tab.tabKey !== tabKey) return tab;
          const updatedRows = tab.rows.map((row) => {
            if (row.id !== rowId) return row;
            const updatedVehicleValues = {
              ...row.vehicleValues,
              [vehicle]: Math.max(0, value)
            };
            const total = Object.values(updatedVehicleValues).reduce<number>((a, b) => a + (Number(b) || 0), 0);
            return {
              ...row,
              vehicleValues: updatedVehicleValues,
              total
            };
          });
          return { ...tab, rows: updatedRows };
        });
        return { ...sheet, tabs: updatedTabs };
      })
    );
  };

  const updateSiteRowRate = (
    siteId: string,
    tabKey: string,
    rowId: string,
    rate: number
  ) => {
    setSiteSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        const updatedTabs = sheet.tabs.map((tab) => {
          if (tab.tabKey !== tabKey) return tab;
          const updatedRows = tab.rows.map((row) => {
            if (row.id !== rowId) return row;
            return { ...row, ratePerUnitOrTrip: rate };
          });
          return { ...tab, rows: updatedRows };
        });
        return { ...sheet, tabs: updatedTabs };
      })
    );
  };

  const addSiteSheetRow = (
    siteId: string,
    tabKey: string,
    date: string,
    item: string
  ) => {
    setSiteSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        const updatedTabs = sheet.tabs.map((tab) => {
          if (tab.tabKey !== tabKey) return tab;
          const nextDayNum = tab.rows.length + 1;
          const initialVV: Record<string, number> = {};
          sheet.vehicles.forEach((v) => {
            initialVV[v] = 0;
          });
          const newRow: SiteMatrixRow = {
            id: `row-${siteId}-${tabKey}-${Date.now()}`,
            dayNumber: nextDayNum,
            date,
            item: item || tab.label,
            vehicleValues: initialVV,
            total: 0,
            ratePerUnitOrTrip: tab.defaultRate,
            unit: tab.unit
          };
          return { ...tab, rows: [...tab.rows, newRow] };
        });
        return { ...sheet, tabs: updatedTabs };
      })
    );
    addAuditLog('Site Sheets', siteId, 'CREATE', `Added date row ${date} to ${tabKey} sheet in ${siteId}`);
  };

  const addSiteSheetVehicle = (siteId: string, vehicleNumber: string) => {
    const cleanNum = vehicleNumber.trim().toUpperCase();
    if (!cleanNum) return;
    setSiteSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        if (sheet.vehicles.includes(cleanNum)) return sheet;
        const updatedVehicles = [...sheet.vehicles, cleanNum];
        const updatedTabs = sheet.tabs.map((tab) => {
          const updatedRows = tab.rows.map((row) => ({
            ...row,
            vehicleValues: {
              ...row.vehicleValues,
              [cleanNum]: 0
            }
          }));
          return { ...tab, rows: updatedRows };
        });
        return { ...sheet, vehicles: updatedVehicles, tabs: updatedTabs };
      })
    );
    addAuditLog('Site Sheets', siteId, 'UPDATE', `Added vehicle column ${cleanNum} to ${siteId}`);
  };

  const addSiteSheetTab = (
    siteId: string,
    tabKey: string,
    label: string,
    defaultRate: number,
    unit: string
  ) => {
    setSiteSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        if (sheet.tabs.some((t) => t.tabKey === tabKey)) return sheet;
        const initialRows: SiteMatrixRow[] = [];
        for (let i = 1; i <= 15; i++) {
          const vv: Record<string, number> = {};
          sheet.vehicles.forEach((v) => {
            vv[v] = 0;
          });
          initialRows.push({
            id: `row-${siteId}-${tabKey}-${i}`,
            dayNumber: i,
            date: `${i}-6-2026`,
            item: label,
            vehicleValues: vv,
            total: 0,
            ratePerUnitOrTrip: defaultRate,
            unit
          });
        }
        const newTab = {
          id: `tab-${Date.now()}`,
          tabKey,
          label,
          unit,
          defaultRate,
          rows: initialRows
        };
        return { ...sheet, tabs: [...sheet.tabs, newTab] };
      })
    );
    addAuditLog('Site Sheets', siteId, 'CREATE', `Added new material sheet tab ${label} to ${siteId}`);
  };

  const addSiteExpense = (expData: Omit<SiteExpenseRecord, 'id' | 'createdAt'>) => {
    const newId = 'exp-' + Date.now();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newExp: SiteExpenseRecord = {
      ...expData,
      id: newId,
      createdAt: now
    };
    setSiteExpenses((prev) => [newExp, ...prev]);
    addAuditLog('Site Expenses', newId, 'CREATE', `Added expense ₹${expData.amount.toLocaleString()} for ${expData.siteName} (${expData.category}: ${expData.title})`);
  };

  const deleteSiteExpense = (id: string) => {
    setSiteExpenses((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('Site Expenses', id, 'DELETE', `Deleted expense voucher ${id}`);
  };

  const updateSiteExpenseStatus = (id: string, status: 'PAID' | 'PENDING' | 'APPROVED') => {
    setSiteExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
    addAuditLog('Site Expenses', id, 'UPDATE', `Updated expense status to ${status}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

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

    setRoadSections((prevSections) =>
      prevSections.map((sec) => ({
        ...sec,
        layers: sec.layers.map((layer) => ({
          ...layer,
          completedLengthMeters: 0,
          progressPercent: 0,
          actualQtyUsed: 0,
          varianceQty: 0
        }))
      }))
    );

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
      localStorage.removeItem('road_erp_trips');
      localStorage.removeItem('road_erp_fuel_logs');
      localStorage.removeItem('road_erp_expenses');
      localStorage.removeItem('road_erp_yield_calcs');
      localStorage.removeItem('road_erp_sync_queue');
      localStorage.setItem('ERP_DATA_CLEARED_SLATE', 'true');
    } catch {
      // ignore
    }

    setAuditLogs([
      {
        id: `audit-clear-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: currentUser.id,
        userName: currentUser.name,
        module: 'System',
        transactionId: 'sys-clear-all',
        action: 'DELETE',
        details: 'All transactional trips, diesel logs, expenses, material ledgers, and matrix quantities have been cleared to a clean slate.'
      }
    ]);
  };

  const resetToSampleData = () => {
    localStorage.removeItem('ERP_DATA_CLEARED_SLATE');
    setProjects(INITIAL_PROJECTS);
    setSelectedProjectId(INITIAL_PROJECTS[0].id);
    setSelectedSiteId(INITIAL_PROJECTS[0].sites[0].id);
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
    localStorage.clear();
    addAuditLog('System', 'sys-reset', 'ADJUST', 'Reset all system database tables to factory default sample data.');
  };

  const exportDatabaseJSON = () => {
    const payload = {
      exportDate: new Date().toISOString(),
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
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.projects) setProjects(data.projects);
      if (data.roadSections) setRoadSections(data.roadSections);
      if (data.buildingFloors) setBuildingFloors(data.buildingFloors);
      if (data.materials) setMaterials(data.materials);
      if (data.stockLedger) setStockLedger(data.stockLedger);
      if (data.consumptionRecords) setConsumptionRecords(data.consumptionRecords);
      if (data.vehicleTrips) setVehicleTrips(data.vehicleTrips);
      if (data.machinery) setMachinery(data.machinery);
      if (data.machineryLogs) setMachineryLogs(data.machineryLogs);
      if (data.dieselLogs) setDieselLogs(data.dieselLogs);
      if (data.workers) setWorkers(data.workers);
      if (data.attendanceRecords) setAttendanceRecords(data.attendanceRecords);
      if (data.roadProductions) setRoadProductions(data.roadProductions);
      if (data.buildingProductions) setBuildingProductions(data.buildingProductions);
      if (data.boqItems) setBOQItems(data.boqItems);
      if (data.measurements) setMeasurements(data.measurements);
      if (data.bbsItems) setBBSItems(data.bbsItems);
      if (data.siteSheets) setSiteSheets(data.siteSheets);
      if (data.siteExpenses) setSiteExpenses(data.siteExpenses);
      addAuditLog('System', 'sys-import', 'ADJUST', 'Imported ERP database from JSON backup file.');
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <ERPContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        workType,
        setWorkType,
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole,
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
