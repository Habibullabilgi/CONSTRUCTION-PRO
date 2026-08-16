import {
  Project,
  MaterialItem,
  StockLedgerEntry,
  MaterialConsumptionRecord,
  VehicleTrip,
  MachineryRecord,
  MachineryLog,
  DieselLog,
  Worker,
  AttendanceRecord,
  DailyRoadProduction,
  DailyBuildingProduction,
  BOQItem,
  MeasurementBookEntry,
  AuditLogEntry,
  ERPNotification,
  RoadSection,
  BuildingFloor,
  BBSItem,
  RCCFootingInput,
  RCCColumnInput,
  RCCBeamInput,
  RCCSlabInput,
  SiteMatrixSheet,
  SiteExpenseRecord
} from '../types/erp';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-road-1',
    name: 'NH-48 6-Lane Expressway (Package 3)',
    code: 'NH48-EXP-PKG3',
    type: 'ROAD',
    client: 'National Highways Authority of India (NHAI)',
    location: 'Pune - Kolhapur Sector (Km 120+000 to Km 162+500)',
    gpsCoordinates: { lat: 18.5204, lng: 73.8567 },
    startDate: '2025-01-15',
    expectedCompletion: '2026-12-31',
    contractValue: 450000000, // ₹45.0 Cr
    estimatedCost: 385000000,
    actualCost: 142850000,
    forecastFinalCost: 382400000,
    profitOrLoss: 67600000,
    progressPercent: 37.5,
    projectManager: 'Er. Rajesh Deshmukh',
    siteEngineer: 'Er. Amit Sharma',
    supervisor: 'Sunil Patil',
    status: 'Active',
    totalRoadKm: 42.5,
    description: 'Upgradation to 6-lane rigid & flexible pavement expressway with major culverts, GSB, WMM, DBM, BC, and drainage.',
    sites: [
      { id: 'site-road-1', projectId: 'proj-road-1', name: 'Section A (Km 120-135)', code: 'SEC-A', location: 'Shirwal Bypass', supervisor: 'Sunil Patil' },
      { id: 'site-road-2', projectId: 'proj-road-1', name: 'Section B (Km 135-150)', code: 'SEC-B', location: 'Khandala Toll Approach', supervisor: 'Vijay Shinde' },
      { id: 'site-road-3', projectId: 'proj-road-1', name: 'Section C (Km 150-162.5)', code: 'SEC-C', location: 'Bhuinj Junction', supervisor: 'Mahesh Jadhav' }
    ]
  },
  {
    id: 'proj-road-2',
    name: 'SH-17 State Highway Rehabilitation',
    code: 'SH17-REHAB-2025',
    type: 'ROAD',
    client: 'State Public Works Department (PWD)',
    location: 'Nashik - Trimbakeshwar Corridor',
    gpsCoordinates: { lat: 19.9975, lng: 73.7898 },
    startDate: '2025-03-01',
    expectedCompletion: '2026-06-30',
    contractValue: 185000000, // ₹18.5 Cr
    estimatedCost: 158000000,
    actualCost: 64200000,
    forecastFinalCost: 156500000,
    profitOrLoss: 28500000,
    progressPercent: 41.2,
    projectManager: 'Er. Vikram Joshi',
    siteEngineer: 'Er. Sanjay Gaikwad',
    supervisor: 'Ramesh Pawar',
    status: 'Active',
    totalRoadKm: 28.0,
    description: 'Widening from 2-lane to 4-lane with Bituminous Concrete top layer, paved shoulders, and precast Hume pipe culverts.',
    sites: [
      { id: 'site-sh17-1', projectId: 'proj-road-2', name: 'Section 1 (Km 0-14)', code: 'SH17-S1', location: 'Trimbak Road', supervisor: 'Ramesh Pawar' },
      { id: 'site-sh17-2', projectId: 'proj-road-2', name: 'Section 2 (Km 14-28)', code: 'SH17-S2', location: 'Anjaneri Stretch', supervisor: 'Pravin Rane' }
    ]
  },
  {
    id: 'proj-bldg-1',
    name: 'Zenith Heights Premium Residential (G+14)',
    code: 'ZEN-HT-T1',
    type: 'BUILDING',
    client: 'Zenith Realty Developers LLP',
    location: 'Sector 45, Baner, Pune',
    gpsCoordinates: { lat: 18.559, lng: 73.778 },
    startDate: '2024-09-01',
    expectedCompletion: '2026-11-30',
    contractValue: 320000000, // ₹32.0 Cr
    estimatedCost: 275000000,
    actualCost: 128400000,
    forecastFinalCost: 272000000,
    profitOrLoss: 48000000,
    progressPercent: 46.8,
    projectManager: 'Er. Rohan Mehta',
    siteEngineer: 'Er. Priyanka Kulkarni',
    supervisor: 'Dattatray Mane',
    status: 'Active',
    totalBuiltUpSqFt: 185000,
    description: 'High-rise residential tower with 2 basements, podium parking, G+14 floors, clubhouse, and modern MEP.',
    sites: [
      { id: 'site-bldg-1', projectId: 'proj-bldg-1', name: 'Tower A (Residential Core)', code: 'TOW-A', location: 'Tower A Plot', supervisor: 'Dattatray Mane' },
      { id: 'site-bldg-2', projectId: 'proj-bldg-1', name: 'Podium & Clubhouse Area', code: 'POD-1', location: 'Podium Sector', supervisor: 'Anil Thorat' }
    ]
  },
  {
    id: 'proj-bldg-2',
    name: 'Apex Commercial Tech Park (2B+G+8)',
    code: 'APX-TECH-2025',
    type: 'BUILDING',
    client: 'Apex Infrastructure & Tech Parks Ltd',
    location: 'Hinjawadi Phase 2, Pune',
    gpsCoordinates: { lat: 18.5913, lng: 73.7389 },
    startDate: '2024-11-15',
    expectedCompletion: '2026-08-31',
    contractValue: 280000000, // ₹28.0 Cr
    estimatedCost: 240000000,
    actualCost: 98500000,
    forecastFinalCost: 238000000,
    profitOrLoss: 42000000,
    progressPercent: 39.5,
    projectManager: 'Er. Arvind Swamy',
    siteEngineer: 'Er. Nitin Shirole',
    supervisor: 'Ganesh More',
    status: 'Active',
    totalBuiltUpSqFt: 142000,
    description: 'Grade-A IT office building featuring post-tensioned flat slabs, double-glazed curtain wall facade, and VRV HVAC.',
    sites: [
      { id: 'site-apx-1', projectId: 'proj-bldg-2', name: 'Block 1 IT Wing', code: 'BLK-1', location: 'Main Campus', supervisor: 'Ganesh More' }
    ]
  }
];

export const INITIAL_ROAD_SECTIONS: RoadSection[] = [
  {
    id: 'sec-1',
    projectId: 'proj-road-1',
    siteId: 'site-road-1',
    name: 'Shirwal Bypass Section (Km 120.000 to Km 135.000)',
    startChainage: 120.0,
    endChainage: 135.0,
    totalLengthMeters: 15000,
    carriagewayWidthMeters: 10.5,
    shoulderWidthMeters: 2.5,
    layers: [
      { id: 'l1', layerType: 'Earthwork / Embankment', designThicknessMm: 500, completedChainageStart: 120.0, completedChainageEnd: 135.0, completedLengthMeters: 15000, progressPercent: 100, theoreticalQty: 97500, actualQtyUsed: 98900, varianceQty: 1400, unit: 'm³' },
      { id: 'l2', layerType: 'Subgrade / Murum', designThicknessMm: 300, completedChainageStart: 120.0, completedChainageEnd: 132.5, completedLengthMeters: 12500, progressPercent: 83.3, theoreticalQty: 48750, actualQtyUsed: 49400, varianceQty: 650, unit: 'm³' },
      { id: 'l3', layerType: 'Granular Sub-Base (GSB)', designThicknessMm: 200, completedChainageStart: 120.0, completedChainageEnd: 130.0, completedLengthMeters: 10000, progressPercent: 66.7, theoreticalQty: 26000, actualQtyUsed: 26450, varianceQty: 450, unit: 'm³' },
      { id: 'l4', layerType: 'Wet Mix Macadam (WMM)', designThicknessMm: 250, completedChainageStart: 120.0, completedChainageEnd: 127.5, completedLengthMeters: 7500, progressPercent: 50.0, theoreticalQty: 24375, actualQtyUsed: 24700, varianceQty: 325, unit: 'm³' },
      { id: 'l5', layerType: 'Dense Bituminous Macadam (DBM)', designThicknessMm: 100, completedChainageStart: 120.0, completedChainageEnd: 125.0, completedLengthMeters: 5000, progressPercent: 33.3, theoreticalQty: 12075, actualQtyUsed: 12280, varianceQty: 205, unit: 'Tonnes' },
      { id: 'l6', layerType: 'Bituminous Concrete (BC)', designThicknessMm: 50, completedChainageStart: 120.0, completedChainageEnd: 123.0, completedLengthMeters: 3000, progressPercent: 20.0, theoreticalQty: 3622, actualQtyUsed: 3680, varianceQty: 58, unit: 'Tonnes' }
    ]
  }
];

export const INITIAL_BUILDING_FLOORS: BuildingFloor[] = [
  { id: 'fl-b2', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: 'Basement 2 (Lower Parking)', levelIndex: -2, builtUpAreaSqFt: 14500, plannedCost: 22000000, actualCost: 21850000, progressPercent: 100, status: 'Completed', rccElementsCount: 38 },
  { id: 'fl-b1', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: 'Basement 1 (Upper Parking)', levelIndex: -1, builtUpAreaSqFt: 14500, plannedCost: 20500000, actualCost: 20400000, progressPercent: 100, status: 'Completed', rccElementsCount: 38 },
  { id: 'fl-g', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: 'Ground Floor (Lobby & Amenities)', levelIndex: 0, builtUpAreaSqFt: 12000, plannedCost: 19500000, actualCost: 19200000, progressPercent: 100, status: 'Completed', rccElementsCount: 32 },
  { id: 'fl-1', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: '1st Floor (Typical Apts)', levelIndex: 1, builtUpAreaSqFt: 11000, plannedCost: 16000000, actualCost: 15800000, progressPercent: 100, status: 'Completed', rccElementsCount: 28 },
  { id: 'fl-2', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: '2nd Floor (Typical Apts)', levelIndex: 2, builtUpAreaSqFt: 11000, plannedCost: 16000000, actualCost: 15750000, progressPercent: 100, status: 'Completed', rccElementsCount: 28 },
  { id: 'fl-3', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: '3rd Floor (Typical Apts)', levelIndex: 3, builtUpAreaSqFt: 11000, plannedCost: 16000000, actualCost: 12200000, progressPercent: 78, status: 'Finishing', rccElementsCount: 28 },
  { id: 'fl-4', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: '4th Floor (Typical Apts)', levelIndex: 4, builtUpAreaSqFt: 11000, plannedCost: 16000000, actualCost: 8900000, progressPercent: 55, status: 'In Progress', rccElementsCount: 28 },
  { id: 'fl-5', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: '5th Floor (Slab Casting)', levelIndex: 5, builtUpAreaSqFt: 11000, plannedCost: 16000000, actualCost: 4500000, progressPercent: 30, status: 'RCC Cast', rccElementsCount: 28 },
  { id: 'fl-6', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: '6th Floor (Shuttering & Rebar)', levelIndex: 6, builtUpAreaSqFt: 11000, plannedCost: 16000000, actualCost: 1200000, progressPercent: 10, status: 'In Progress', rccElementsCount: 28 },
  { id: 'fl-7', projectId: 'proj-bldg-1', siteId: 'site-bldg-1', buildingName: 'Tower A', floorLevel: '7th Floor', levelIndex: 7, builtUpAreaSqFt: 11000, plannedCost: 16000000, actualCost: 0, progressPercent: 0, status: 'Not Started', rccElementsCount: 28 }
];

export const INITIAL_MATERIALS: MaterialItem[] = [
  { id: 'mat-oil-1', code: 'OIL-15W40', name: '15W/40 Engine Oil', category: 'Lubricants & Oils', unit: 'Litres', standardRate: 245, minReorderLevel: 50, currentStockTotal: 18, storeLocation: 'Crusher Main Store' },
  { id: 'mat-adb-1', code: 'ADB-VOLVO', name: 'VOLVO-SDLG-ADBLUE', category: 'DEF & Additives', unit: 'Litres', standardRate: 65, minReorderLevel: 100, currentStockTotal: 240, storeLocation: 'Crusher Main Store' },
  { id: 'mat-adb-2', code: 'ADB-BENZ', name: 'ADBLUE-BENZ', category: 'DEF & Additives', unit: 'Litres', standardRate: 72, minReorderLevel: 80, currentStockTotal: 180, storeLocation: 'Crusher Main Store' },
  { id: 'mat-oil-2', code: 'OIL-80W90', name: 'HP-80W/90 OIL', category: 'Lubricants & Oils', unit: 'Litres', standardRate: 280, minReorderLevel: 30, currentStockTotal: 25, storeLocation: 'Crusher Main Store' },
  { id: 'mat-oil-3', code: 'HYD-OIL-68', name: 'Hydraulic Oil Grade 68 (Servo/Castrol)', category: 'Lubricants & Oils', unit: 'Litres', standardRate: 210, minReorderLevel: 40, currentStockTotal: 15, storeLocation: 'Crusher Main Store' },
  { id: 'mat-grs-1', code: 'GRS-EP2', name: 'Heavy Duty Grease EP-2', category: 'Lubricants & Oils', unit: 'Kg', standardRate: 320, minReorderLevel: 25, currentStockTotal: 12, storeLocation: 'Crusher Main Store' },
  { id: 'mat-16', code: 'MAT-DSL-HSD', name: 'High Speed Diesel (HSD) Site Bowser', category: 'Fuel / Diesel', unit: 'Litres', standardRate: 92.5, minReorderLevel: 2000, currentStockTotal: 7450, storeLocation: 'Central Store' },
  { id: 'mat-8', code: 'MAT-AGG-20MM', name: 'Crushed Basalt Aggregate 20mm', category: 'Aggregates', unit: 'Tonnes', standardRate: 650, densityTonnesPerM3: 1.6, minReorderLevel: 50, currentStockTotal: 420, storeLocation: 'Crusher Yard A' },
  { id: 'mat-9', code: 'MAT-AGG-10MM', name: 'Crushed Basalt Aggregate 10mm', category: 'Aggregates', unit: 'Tonnes', standardRate: 680, densityTonnesPerM3: 1.55, minReorderLevel: 40, currentStockTotal: 310, storeLocation: 'Crusher Yard A' },
  { id: 'mat-agg-40', code: 'MAT-AGG-40MM', name: 'Crushed Basalt Aggregate 40mm', category: 'Aggregates', unit: 'Tonnes', standardRate: 590, densityTonnesPerM3: 1.62, minReorderLevel: 50, currentStockTotal: 580, storeLocation: 'Crusher Yard B' },
  { id: 'mat-10', code: 'MAT-SND-MSAND', name: 'Manufactured Sand (M-Sand Zone II)', category: 'Sand & M-Sand', unit: 'Tonnes', standardRate: 1100, densityTonnesPerM3: 1.65, minReorderLevel: 100, currentStockTotal: 680, storeLocation: 'Crusher Yard B' },
  { id: 'mat-12', code: 'MAT-GSB-GR1', name: 'Granular Sub-Base (GSB) Grading-I Mix', category: 'Aggregates', unit: 'Tonnes', standardRate: 480, densityTonnesPerM3: 2.15, minReorderLevel: 250, currentStockTotal: 2100, storeLocation: 'Central Store' },
  { id: 'mat-13', code: 'MAT-WMM-MIX', name: 'Wet Mix Macadam (WMM) Plant Mix', category: 'Aggregates', unit: 'Tonnes', standardRate: 980, densityTonnesPerM3: 2.2, minReorderLevel: 300, currentStockTotal: 1850, storeLocation: 'Central Store' },
  { id: 'mat-1', code: 'MAT-CEM-OPC53', name: 'UltraTech OPC 53 Grade Cement', category: 'Cement', unit: 'Bags (50kg)', standardRate: 385, minReorderLevel: 500, currentStockTotal: 1850, storeLocation: 'Central Store' }
];

export const INITIAL_STOCK_LEDGER: StockLedgerEntry[] = [];

export const INITIAL_CONSUMPTION_RECORDS: MaterialConsumptionRecord[] = [];

export const INITIAL_VEHICLE_TRIPS: VehicleTrip[] = [];

export const INITIAL_MACHINERY: MachineryRecord[] = [
  { id: 'mach-1', name: 'JCB 3DX Plus Backhoe Loader', type: 'JCB / Backhoe', registrationNo: 'MH-12-EQ-4401', ownership: 'Company', operatorName: 'Kishore Salunkhe', rateType: 'PER_HOUR', standardRate: 1100, status: 'Active' },
  { id: 'mach-2', name: 'CAT 320D Hydraulic Excavator', type: 'Excavator', registrationNo: 'MH-12-EX-8890', ownership: 'Rental', ownerName: 'Mahalaxmi Earthmovers', operatorName: 'Dharma Gavit', rateType: 'PER_HOUR', standardRate: 2200, status: 'Active' },
  { id: 'mach-3', name: 'Hamm 311D Soil Compactor Roller (11 Ton)', type: 'Road Roller', registrationNo: 'MH-14-RR-1120', ownership: 'Company', operatorName: 'Baban Gurav', rateType: 'PER_HOUR', standardRate: 1400, status: 'Active' },
  { id: 'mach-4', name: 'CAT 140M Motor Grader', type: 'Motor Grader', registrationNo: 'MH-12-MG-7070', ownership: 'Rental', ownerName: 'Kalyan Infra Heavy Fleet', operatorName: 'Shankar Mane', rateType: 'PER_HOUR', standardRate: 2800, status: 'Active' },
  { id: 'mach-5', name: 'Vogele Super 1800-3 Asphalt Paver', type: 'Asphalt Paver', registrationNo: 'MH-12-PV-2020', ownership: 'Company', operatorName: 'Tukaram Shelke', rateType: 'PER_HOUR', standardRate: 3500, status: 'Active' },
  { id: 'mach-6', name: 'Schwing Stetter Boom Concrete Pump (36m)', type: 'Concrete Pump', registrationNo: 'MH-14-CP-9011', ownership: 'Rental', ownerName: 'Stetter Concrete Services', operatorName: 'Nitin Pawar', rateType: 'PER_HOUR', standardRate: 2600, status: 'Active' },
  { id: 'mach-7', name: 'Potain MC 85B Tower Crane (5 Ton)', type: 'Crane', registrationNo: 'TC-TOW-01', ownership: 'Rental', ownerName: 'Apex Cranes Pvt Ltd', operatorName: 'Ramu Barve', rateType: 'PER_MONTH', standardRate: 185000, status: 'Active' },
  { id: 'mach-8', name: 'Tata 1613 10,000L Water Bowser', type: 'Water Tanker', registrationNo: 'MH-12-WT-5509', ownership: 'Company', operatorName: 'Ashok Chavan', rateType: 'PER_DAY', standardRate: 3200, status: 'Active' }
];

export const INITIAL_MACHINERY_LOGS: MachineryLog[] = [];

export const INITIAL_DIESEL_LOGS: DieselLog[] = [];

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w-1', code: 'WRK-MSN-01', name: 'Ramcharan Yadav', category: 'Mason', phone: '+91 98231 44510', dailyRate: 900, hourlyOtRate: 150, assignedProject: 'proj-bldg-1', status: 'Active' },
  { id: 'w-2', code: 'WRK-MSN-02', name: 'Gopal Mondal', category: 'Mason', phone: '+91 98231 44511', dailyRate: 900, hourlyOtRate: 150, assignedProject: 'proj-bldg-1', status: 'Active' },
  { id: 'w-3', code: 'WRK-BBR-01', name: 'Shyam Sundar', category: 'Bar Bender / Fitter', phone: '+91 98231 44512', dailyRate: 850, hourlyOtRate: 140, assignedProject: 'proj-bldg-1', status: 'Active' },
  { id: 'w-4', code: 'WRK-BBR-02', name: 'Dileep Paswan', category: 'Bar Bender / Fitter', phone: '+91 98231 44513', dailyRate: 850, hourlyOtRate: 140, assignedProject: 'proj-road-1', status: 'Active' },
  { id: 'w-5', code: 'WRK-CRP-01', name: 'Mohd. Salim', category: 'Carpenter', phone: '+91 98231 44514', dailyRate: 900, hourlyOtRate: 150, assignedProject: 'proj-bldg-1', status: 'Active' },
  { id: 'w-6', code: 'WRK-HLP-01', name: 'Ganesh Shinde', category: 'Helper / Unskilled', phone: '+91 98231 44515', dailyRate: 600, hourlyOtRate: 100, assignedProject: 'proj-road-1', status: 'Active' },
  { id: 'w-7', code: 'WRK-HLP-02', name: 'Sitaram Barde', category: 'Helper / Unskilled', phone: '+91 98231 44516', dailyRate: 600, hourlyOtRate: 100, assignedProject: 'proj-road-1', status: 'Active' },
  { id: 'w-8', code: 'WRK-HLP-03', name: 'Santosh Chavan', category: 'Helper / Unskilled', phone: '+91 98231 44517', dailyRate: 600, hourlyOtRate: 100, assignedProject: 'proj-bldg-1', status: 'Active' },
  { id: 'w-9', code: 'WRK-OPR-01', name: 'Kishore Salunkhe', category: 'Machine Operator', phone: '+91 98231 44518', dailyRate: 1100, hourlyOtRate: 180, assignedProject: 'proj-road-1', status: 'Active' },
  { id: 'w-10', code: 'WRK-DRV-01', name: 'Santosh Kamble', category: 'Driver', phone: '+91 98231 44519', dailyRate: 800, hourlyOtRate: 130, assignedProject: 'proj-road-1', status: 'Active' }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_ROAD_PRODUCTION: DailyRoadProduction[] = [];

export const INITIAL_BUILDING_PRODUCTION: DailyBuildingProduction[] = [];

export const INITIAL_BOQ: BOQItem[] = [
  {
    id: 'boq-1',
    itemCode: 'BOQ-RD-01',
    projectId: 'proj-road-1',
    workType: 'ROAD',
    chainageOrFloor: 'All Chainages',
    activityName: 'Earthwork in Excavation for Roadway',
    description: 'Earthwork in excavation for roadway, cutting roadway embankment with hydraulic excavator and hauling up to 1km.',
    unit: 'm³',
    plannedQuantity: 120000,
    unitRate: 165,
    plannedAmount: 19800000,
    executedQuantity: 0,
    executedAmount: 0,
    remainingQuantity: 120000,
    estimatedMaterialCost: 2400000,
    estimatedLabourCost: 3600000,
    estimatedMachineryCost: 9800000,
    actualTotalCost: 0
  },
  {
    id: 'boq-2',
    itemCode: 'BOQ-RD-02',
    projectId: 'proj-road-1',
    workType: 'ROAD',
    chainageOrFloor: 'All Chainages',
    activityName: 'Granular Sub-Base (GSB) Grading I',
    description: 'Construction of granular sub-base by providing well-graded material, spreading in uniform layers, and compacting to requirement.',
    unit: 'm³',
    plannedQuantity: 36000,
    unitRate: 1150,
    plannedAmount: 41400000,
    executedQuantity: 0,
    executedAmount: 0,
    remainingQuantity: 36000,
    estimatedMaterialCost: 26500000,
    estimatedLabourCost: 2200000,
    estimatedMachineryCost: 6500000,
    actualTotalCost: 0
  }
];

export const INITIAL_MEASUREMENTS: MeasurementBookEntry[] = [];

export const INITIAL_BBS: BBSItem[] = [];

export const INITIAL_NOTIFICATIONS: ERPNotification[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// Helper to build dates for Mulwad Site (June/July 2026)
const buildMulwadMurumRows = () => {
  const dates = [
    { day: 1, date: '14-6-2026' },
    { day: 2, date: '15-6-2026' },
    { day: 3, date: '16-6-2026' },
    { day: 4, date: '17-6-2026' },
    { day: 5, date: '18-6-2026' },
    { day: 6, date: '19-6-2026' },
    { day: 7, date: '20-6-2026' },
    { day: 8, date: '21-6-2026' },
    { day: 9, date: '22-6-2026' },
    { day: 10, date: '23-6-2026' },
    { day: 11, date: '24-6-2026' },
    { day: 12, date: '25-6-2026' },
    { day: 13, date: '26-6-2026' },
    { day: 14, date: '27-6-2026' },
    { day: 15, date: '28-6-2026' },
    { day: 16, date: '29-6-2026' },
    { day: 17, date: '30-6-2026' },
    { day: 18, date: '01-7-2026' },
    { day: 19, date: '02-7-2026' },
    { day: 20, date: '03-7-2026' },
    { day: 21, date: '04-7-2026' },
    { day: 22, date: '05-7-2026' },
    { day: 23, date: '06-7-2026' },
    { day: 24, date: '07-7-2026' },
    { day: 25, date: '08-7-2026' },
    { day: 26, date: '09-7-2026' },
    { day: 27, date: '10-7-2026' },
    { day: 28, date: '11-7-2026' },
    { day: 29, date: '12-7-2026' },
    { day: 30, date: '13-7-2026' }
  ];

  return dates.map(d => {
    const vVals: Record<string, number> = {
      '8797': 0,
      '7352': 0,
      '7353': 0,
      '9579': 0,
      '9580': 0
    };
    return {
      id: `mulwad-murum-${d.day}`,
      dayNumber: d.day,
      date: d.date,
      item: 'Murum',
      vehicleValues: vVals,
      total: 0,
      ratePerUnitOrTrip: 1200,
      unit: 'Trips'
    };
  });
};

const buildSampleTabRows = (itemName: string, defaultRate: number, unit: string) => {
  const dates = [
    { day: 1, date: '14-6-2026' },
    { day: 2, date: '15-6-2026' },
    { day: 3, date: '16-6-2026' },
    { day: 4, date: '17-6-2026' },
    { day: 5, date: '18-6-2026' },
    { day: 6, date: '19-6-2026' },
    { day: 7, date: '20-6-2026' },
    { day: 8, date: '21-6-2026' },
    { day: 9, date: '22-6-2026' },
    { day: 10, date: '23-6-2026' },
    { day: 11, date: '24-6-2026' },
    { day: 12, date: '25-6-2026' },
    { day: 13, date: '26-6-2026' },
    { day: 14, date: '27-6-2026' },
    { day: 15, date: '28-6-2026' },
    { day: 16, date: '29-6-2026' },
    { day: 17, date: '30-6-2026' },
    { day: 18, date: '01-7-2026' },
    { day: 19, date: '02-7-2026' },
    { day: 20, date: '03-7-2026' },
    { day: 21, date: '04-7-2026' },
    { day: 22, date: '05-7-2026' },
    { day: 23, date: '06-7-2026' },
    { day: 24, date: '07-7-2026' },
    { day: 25, date: '08-7-2026' },
    { day: 26, date: '09-7-2026' },
    { day: 27, date: '10-7-2026' },
    { day: 28, date: '11-7-2026' },
    { day: 29, date: '12-7-2026' },
    { day: 30, date: '13-7-2026' }
  ];

  return dates.map(d => {
    const vVals: Record<string, number> = {
      '8797': 0,
      '7352': 0,
      '7353': 0,
      '9579': 0,
      '9580': 0
    };

    return {
      id: `mulwad-${itemName.toLowerCase().replace(/\s+/g, '')}-${d.day}`,
      dayNumber: d.day,
      date: d.date,
      item: itemName,
      vehicleValues: vVals,
      total: 0,
      ratePerUnitOrTrip: defaultRate,
      unit
    };
  });
};

export const INITIAL_SITE_SHEETS: SiteMatrixSheet[] = [
  {
    siteId: 'site-mulwad',
    siteName: 'MULWAD SITE',
    monthTitle: 'JUNE/JULY',
    year: 2026,
    vehicles: ['8797', '7352', '7353', '9579', '9580'],
    tabs: [
      {
        id: 'tab-murum',
        tabKey: 'MURUM',
        label: 'MURUM',
        unit: 'Trips',
        defaultRate: 1400,
        rows: buildMulwadMurumRows()
      },
      {
        id: 'tab-msand',
        tabKey: 'M SAND',
        label: 'M SAND',
        unit: 'Trips',
        defaultRate: 3200,
        rows: buildSampleTabRows('M SAND', 3200, 'Trips')
      },
      {
        id: 'tab-20mm',
        tabKey: '20 MM',
        label: '20 MM',
        unit: 'Trips',
        defaultRate: 2800,
        rows: buildSampleTabRows('20 MM', 2800, 'Trips')
      },
      {
        id: 'tab-cement',
        tabKey: 'CEMENT',
        label: 'CEMENT',
        unit: 'Bags / Trips',
        defaultRate: 360,
        rows: buildSampleTabRows('CEMENT', 360, 'Bags')
      },
      {
        id: 'tab-steel',
        tabKey: 'STEEL',
        label: 'STEEL',
        unit: 'Tonnes',
        defaultRate: 58000,
        rows: buildSampleTabRows('STEEL', 58000, 'Tonnes')
      },
      {
        id: 'tab-gsb',
        tabKey: 'GSB',
        label: 'GSB',
        unit: 'Trips',
        defaultRate: 1950,
        rows: buildSampleTabRows('GSB', 1950, 'Trips')
      },
      {
        id: 'tab-wmm',
        tabKey: 'WMM',
        label: 'WMM',
        unit: 'Trips',
        defaultRate: 2400,
        rows: buildSampleTabRows('WMM', 2400, 'Trips')
      },
      {
        id: 'tab-diesel',
        tabKey: 'DESIEL',
        label: 'DESIEL',
        unit: 'Litres',
        defaultRate: 92.50,
        rows: buildSampleTabRows('DESIEL', 92.50, 'Litres')
      },
      {
        id: 'tab-bm',
        tabKey: 'BM',
        label: 'BM',
        unit: 'Trips',
        defaultRate: 4200,
        rows: buildSampleTabRows('BM', 4200, 'Trips')
      },
      {
        id: 'tab-silicote',
        tabKey: 'SILICOTE',
        label: 'SILICOTE',
        unit: 'Trips',
        defaultRate: 3500,
        rows: buildSampleTabRows('SILICOTE', 3500, 'Trips')
      }
    ]
  },
  {
    siteId: 'site-quarry-1',
    siteName: 'BILGI CRUSHER QUARRY SITE #1',
    monthTitle: 'JUNE/JULY',
    year: 2026,
    vehicles: ['8797', '9580', 'EX-01', 'LDR-02'],
    tabs: [
      {
        id: 'tab-q-murum',
        tabKey: 'MURUM',
        label: 'MURUM',
        unit: 'Trips',
        defaultRate: 1200,
        rows: buildSampleTabRows('MURUM', 1200, 'Trips')
      },
      {
        id: 'tab-q-20mm',
        tabKey: '20 MM',
        label: '20 MM',
        unit: 'Trips',
        defaultRate: 2700,
        rows: buildSampleTabRows('20 MM', 2700, 'Trips')
      },
      {
        id: 'tab-q-diesel',
        tabKey: 'DESIEL',
        label: 'DESIEL',
        unit: 'Litres',
        defaultRate: 92.50,
        rows: buildSampleTabRows('DESIEL', 92.50, 'Litres')
      }
    ]
  }
];

export const INITIAL_SITE_EXPENSES: SiteExpenseRecord[] = [];

