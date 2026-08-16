import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  Gauge, 
  X, 
  HardHat 
} from 'lucide-react';

// Road Construction & Site Vehicle Presets
const CONSTRUCTION_VEHICLES = [
  { id: 'TIPPER', name: 'Tipper / Dump Truck', category: 'Haulage', defaultUnit: 'KM' },
  { id: 'TRACTOR', name: 'Tractor & Trolley / Water Tanker', category: 'Transport', defaultUnit: 'HMR' },
  { id: 'JEEP', name: 'Site Jeep / Bolero / Pickup', category: 'Inspection', defaultUnit: 'KM' },
  { id: 'CAR', name: 'Site Engineer Car / SUV', category: 'Inspection', defaultUnit: 'KM' },
  { id: 'EXCAVATOR', name: 'Hydraulic Excavator (CAT/Tata Hitachi/JCB)', category: 'Earthmoving', defaultUnit: 'HMR' },
  { id: 'BACKHOE', name: 'Backhoe Loader (JCB 3DX)', category: 'Earthmoving', defaultUnit: 'HMR' },
  { id: 'ROLLER', name: 'Vibratory Soil Compactor / Road Roller', category: 'Compaction', defaultUnit: 'HMR' },
  { id: 'GRADER', name: 'Motor Grader', category: 'Grading', defaultUnit: 'HMR' },
  { id: 'PAVER', name: 'Bitumen / Asphalt Paver', category: 'Paving', defaultUnit: 'HMR' },
  { id: 'TRANSIT_MIXER', name: 'Concrete Transit Mixer (RMC)', category: 'Concrete', defaultUnit: 'KM' },
  { id: 'WATER_TANKER', name: 'Road Sprinkler Water Tanker', category: 'Earthwork', defaultUnit: 'KM' }
];

export interface VehicleRecord {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  category: string;
  trackingType: 'KM' | 'HMR';
  currentReading: number;
}

export const MachineryFleetModule: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([
    {
      id: '1',
      vehicleNumber: 'KA-28-EX-8901',
      vehicleType: 'Hydraulic Excavator (CAT/Tata Hitachi/JCB)',
      category: 'Earthmoving',
      trackingType: 'HMR',
      currentReading: 4215.5
    },
    {
      id: '2',
      vehicleNumber: 'KA-28-JC-3342',
      vehicleType: 'Backhoe Loader (JCB 3DX)',
      category: 'Earthmoving',
      trackingType: 'HMR',
      currentReading: 2850.0
    },
    {
      id: '3',
      vehicleNumber: 'MH-12-DT-5510',
      vehicleType: 'Tipper / Dump Truck',
      category: 'Haulage',
      trackingType: 'KM',
      currentReading: 14200
    },
    {
      id: '4',
      vehicleNumber: 'KA-28-TR-1092',
      vehicleType: 'Tractor & Trolley / Water Tanker',
      category: 'Transport',
      trackingType: 'HMR',
      currentReading: 1120.0
    },
    {
      id: '5',
      vehicleNumber: 'KA-28-JP-7890',
      vehicleType: 'Site Jeep / Bolero / Pickup',
      category: 'Inspection',
      trackingType: 'KM',
      currentReading: 38450
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formNumber, setFormNumber] = useState('');
  const [formType, setFormType] = useState(CONSTRUCTION_VEHICLES[0].id);
  const [formMetric, setFormMetric] = useState<'KM' | 'HMR'>(CONSTRUCTION_VEHICLES[0].defaultUnit as 'KM' | 'HMR');
  const [formReading, setFormReading] = useState<number | ''>('');

  const handleTypeSelect = (typeId: string) => {
    const selected = CONSTRUCTION_VEHICLES.find((v) => v.id === typeId);
    setFormType(typeId);
    if (selected) {
      setFormMetric(selected.defaultUnit as 'KM' | 'HMR');
    }
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber || formReading === '') return;

    const matched = CONSTRUCTION_VEHICLES.find((v) => v.id === formType);

    const newVehicle: VehicleRecord = {
      id: Date.now().toString(),
      vehicleNumber: formNumber.trim().toUpperCase(),
      vehicleType: matched ? matched.name : formType,
      category: matched ? matched.category : 'General',
      trackingType: formMetric,
      currentReading: Number(formReading)
    };

    setVehicles([newVehicle, ...vehicles]);
    setIsModalOpen(false);
    setFormNumber('');
    setFormReading('');
  };

  const handleDelete = (id: string, number: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name} [${number}]?`)) {
      setVehicles(vehicles.filter((v) => v.id !== id));
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.vehicleNumber.toLowerCase().includes(q) ||
      v.vehicleType.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800 text-[10px] font-black uppercase">
                Fleet Management
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Total Fleet: {vehicles.length} Units
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Road Construction Machinery & Vehicle Fleet
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-600/30 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Construction Vehicle</span>
        </button>
      </div>

      {/* 2. Search Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by vehicle number (e.g. KA-28), type (Tipper, JCB, Jeep, Tractor)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-amber-500 placeholder-slate-500"
        />
      </div>

      {/* 3. Vehicles Cards Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <Truck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <div className="text-sm font-bold text-slate-300">No vehicles or equipment found.</div>
          <div className="text-xs">Click <strong>+ Add Construction Vehicle</strong> to register new fleet items.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] hover:border-[#2d416b] transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-black text-xs border border-amber-500/30">
                    {vehicle.vehicleNumber}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {vehicle.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {vehicle.vehicleType}
                </h3>
              </div>

              {/* Running Meter Data */}
              <div className="p-3.5 bg-[#070c18] border border-[#182643] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  {vehicle.trackingType === 'KM' ? (
                    <Gauge className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>{vehicle.trackingType === 'KM' ? 'Odometer Reading:' : 'Running Hours (HMR):'}</span>
                </div>

                <span className="font-mono font-black text-sm text-white">
                  {vehicle.currentReading.toLocaleString()}{' '}
                  <span className="text-xs text-amber-400">
                    {vehicle.trackingType === 'KM' ? 'KM' : 'Hrs'}
                  </span>
                </span>
              </div>

              {/* Card Footer with Delete Action */}
              <div className="pt-2 border-t border-[#182643] flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active on Site
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(vehicle.id, vehicle.vehicleNumber, vehicle.vehicleType)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 hover:border-rose-500 text-rose-400 text-xs font-bold transition-all cursor-pointer"
                  title="Delete Equipment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Simple Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Truck className="w-5 h-5 text-orange-500" />
                <span>Add Road Construction Vehicle</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              {/* Vehicle Number */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Vehicle Registration Number <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-28-C-8797 or MH-12-GR-7890"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold tracking-wider outline-none focus:border-amber-500"
                />
              </div>

              {/* Type of Vehicle */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Type of Construction Vehicle / Machinery <span className="text-amber-400">*</span>
                </label>
                <select
                  value={formType}
                  onChange={(e) => handleTypeSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  {CONSTRUCTION_VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Running Meter or Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Metric Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#162032] p-1 border border-[#1E293B] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormMetric('KM')}
                      className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        formMetric === 'KM'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      <span>KM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMetric('HMR')}
                      className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        formMetric === 'HMR'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hours</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {formMetric === 'KM' ? 'Odometer (KM)' : 'Running Hours (HMR)'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    placeholder={formMetric === 'KM' ? 'e.g. 14200' : 'e.g. 2850.5'}
                    value={formReading}
                    onChange={(e) => setFormReading(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black shadow-lg shadow-orange-600/30 cursor-pointer transition-all"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineryFleetModule;
