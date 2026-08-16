import React, { useState } from 'react';
import { Fuel, Calendar, X, Plus, Check, Edit2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sites?: string[];
  vehicles?: string[];
  onSave: (voucherData: any) => void;
}

export const RecordDieselVoucherModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sites = ['Mulwad', 'NH-50 Site Stretch', 'Quarry Site Pit'],
  vehicles = ['#KA28B8797', '#KA-28-EX-8901', '#MH-12-DT-5510', '#KA-28-TR-1092'],
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [siteName, setSiteName] = useState<string>(sites[0] || 'Mulwad');
  const [vehicleNumber, setVehicleNumber] = useState<string>(vehicles[0] || '#KA28B8797');
  const [driverName, setDriverName] = useState<string>('Santosh Kamble');
  const [litresDispensed, setLitresDispensed] = useState<number | ''>(100);
  const [ratePerLitre, setRatePerLitre] = useState<number>(92.5);

  const [isEditingRate, setIsEditingRate] = useState<boolean>(false);
  const [tempRate, setTempRate] = useState<number>(92.5);

  // New Vehicle inline add
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicleInput, setNewVehicleInput] = useState('');
  const [vehicleListState, setVehicleListState] = useState<string[]>(vehicles);

  if (!isOpen) return null;

  const totalCost = Number(litresDispensed || 0) * Number(ratePerLitre || 0);

  const handleAddNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newVehicleInput.trim().toUpperCase();
    if (!clean) return;
    const formatted = clean.startsWith('#') ? clean : `#${clean}`;
    if (!vehicleListState.includes(formatted)) {
      setVehicleListState([formatted, ...vehicleListState]);
      setVehicleNumber(formatted);
    }
    setNewVehicleInput('');
    setIsAddingVehicle(false);
  };

  const handleApplyRate = () => {
    setRatePerLitre(Number(tempRate));
    setIsEditingRate(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!litresDispensed || litresDispensed <= 0) return;

    onSave({
      date,
      siteName,
      vehicleNumber,
      driverName,
      litresDispensed: Number(litresDispensed),
      ratePerLitre: Number(ratePerLitre),
      totalCost,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Fuel className="w-5 h-5 text-amber-500" />
            <span>Record Diesel Refueling Voucher</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Row 1: Date & Site Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Voucher Date *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Site Name *
              </label>
              <select
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 cursor-pointer font-medium"
              >
                {sites.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Vehicle Number & Add Vehicle Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-bold">
                Vehicle Number *
              </label>
              <button
                type="button"
                onClick={() => setIsAddingVehicle(!isAddingVehicle)}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add New Vehicle</span>
              </button>
            </div>

            {isAddingVehicle ? (
              <div className="flex items-center gap-2 mb-2 p-2 bg-[#162032] border border-amber-500/40 rounded-xl">
                <input
                  type="text"
                  placeholder="e.g. KA28B8797"
                  value={newVehicleInput}
                  onChange={(e) => setNewVehicleInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 bg-[#0D111D] border border-[#1E293B] rounded-lg text-white font-mono font-bold text-xs outline-none focus:border-amber-500 uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddNewVehicle}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingVehicle(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <select
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-amber-500 cursor-pointer"
              >
                {vehicleListState.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Row 3: Driver / Operator Name */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              Driver / Operator Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Santosh Kamble"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Row 4: Litres Dispensed & Rate / Litre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Litres Dispensed *
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                required
                value={litresDispensed || ''}
                onChange={(e) => setLitresDispensed(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-black text-sm outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-bold">
                  Rate / Litre (₹) *
                </label>
                {!isEditingRate ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTempRate(ratePerLitre);
                      setIsEditingRate(true);
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingRate(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditingRate ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tempRate}
                    onChange={(e) => setTempRate(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-[#0D111D] border border-amber-500 rounded-xl text-white font-mono font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyRate}
                    className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <input
                  type="number"
                  readOnly
                  value={ratePerLitre}
                  className="w-full px-3.5 py-2.5 bg-[#162032]/60 border border-[#1E293B] rounded-xl text-slate-300 font-mono font-bold outline-none cursor-not-allowed"
                />
              )}
            </div>
          </div>

          {/* Computed Summary Box */}
          <div className="p-4 bg-[#080d19] border border-[#1E293B] rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">
                Rate: ₹{ratePerLitre.toFixed(2)} / Litre
              </div>
              <div className="text-xs font-bold text-slate-200">
                Total Voucher Cost:
              </div>
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black shadow-lg shadow-orange-600/30 cursor-pointer transition-all"
            >
              Save & Lock Fuel Slip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordDieselVoucherModal;
