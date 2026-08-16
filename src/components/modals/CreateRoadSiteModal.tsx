import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Building2,
  Milestone,
  Plus,
  Truck,
  HardHat,
  MapPin,
  Compass,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (siteId: string) => void;
}

export const CreateRoadSiteModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { projects, selectedProjectId, addRoadSiteSection } = useERP();

  const [projectId, setProjectId] = useState(selectedProjectId || (projects[0]?.id ?? ''));
  const [siteName, setSiteName] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [location, setLocation] = useState('Vijayapura - Bagalkot Highway, Karnataka');
  const [supervisor, setSupervisor] = useState('Ibrahim (Site Supervisor)');
  const [startChainageKm, setStartChainageKm] = useState<number>(24.0);
  const [endChainageKm, setEndChainageKm] = useState<number>(38.5);
  const [carriagewayWidthMeters, setCarriagewayWidthMeters] = useState<number>(7.5);
  const [carriagewayType, setCarriagewayType] = useState('4-Lane Divided Highway');
  const [quarrySource, setQuarrySource] = useState('Bilgi Crusher Pit #2');
  const [vehicleInput, setVehicleInput] = useState('8797, 7352, 7353, 9579, 9580');

  if (!isOpen) return null;

  const stretchLengthKm = Math.abs(endChainageKm - startChainageKm);
  const stretchLengthM = Math.round(stretchLengthKm * 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return;

    const vehicles = vehicleInput
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const generatedCode = siteCode.trim() || 'ST-' + Math.floor(100 + Math.random() * 900);

    const newId = addRoadSiteSection({
      projectId,
      siteName: siteName.trim(),
      siteCode: generatedCode,
      location: location.trim(),
      supervisor: supervisor.trim(),
      startChainageKm: Number(startChainageKm),
      endChainageKm: Number(endChainageKm),
      carriagewayWidthMeters: Number(carriagewayWidthMeters),
      carriagewayType,
      vehicles: vehicles.length > 0 ? vehicles : ['8797', '7352', '7353', '9579', '9580']
    });

    if (onSuccess) {
      onSuccess(newId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0D111D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Milestone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Add New Road Site Section / Stretch
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Provision highway chainage stretch, daily matrix sheet, and tipper roster
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162032] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin scrollbar-thumb-[#1E293B]">
          {/* 1. Parent Project & Site Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                Parent Highway Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs font-semibold focus:border-blue-500 outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                Section Code / Package ID
              </label>
              <input
                type="text"
                placeholder="e.g. NH48-PKG4-BTB"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              Road Site / Stretch Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NH-48 Package 4: Babaleshwar to Tikota Bypass Stretch"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold text-xs focus:border-blue-500 outline-none"
            />
          </div>

          {/* 2. Chainage & Geometry Details */}
          <div className="p-4 rounded-2xl bg-[#0D111D] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Chainage & Carriageway Specification</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#064E3B] text-[#34D399] border border-[#065F46] text-[10px] font-black font-mono">
                {stretchLengthKm.toFixed(2)} KM ({stretchLengthM.toLocaleString()} M)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#94A3B8] font-semibold mb-1">
                  Start Chainage (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={startChainageKm}
                  onChange={(e) => setStartChainageKm(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] font-semibold mb-1">
                  End Chainage (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={endChainageKm}
                  onChange={(e) => setEndChainageKm(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] font-semibold mb-1">
                  Carriageway Width (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={carriagewayWidthMeters}
                  onChange={(e) => setCarriagewayWidthMeters(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#94A3B8] font-semibold mb-1">
                  Carriageway Type
                </label>
                <select
                  value={carriagewayType}
                  onChange={(e) => setCarriagewayType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none"
                >
                  <option value="4-Lane Divided Highway">4-Lane Divided Highway (Flexible)</option>
                  <option value="2-Lane with Paved Shoulders">2-Lane with Paved Shoulders (MoRTH)</option>
                  <option value="6-Lane Expressway Corridor">6-Lane Expressway Corridor</option>
                  <option value="Single Lane Service Road">Single Lane Service Road</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] font-semibold mb-1">
                  Primary Quarry / Plant Source
                </label>
                <input
                  type="text"
                  value={quarrySource}
                  onChange={(e) => setQuarrySource(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Site Supervision & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                Assigned Site Incharge / Supervisor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ibrahim (Site Supervisor)"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                Site Location & District
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* 4. Active Tipper Vehicle Fleet */}
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Active Tipper Numbers (Comma separated)</span>
              <span className="text-[10px] text-blue-400 font-mono">For Daily Matrix Columns</span>
            </label>
            <input
              type="text"
              value={vehicleInput}
              onChange={(e) => setVehicleInput(e.target.value)}
              placeholder="8797, 7352, 7353, 9579, 9580, 2828"
              className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono text-xs focus:border-blue-500 outline-none"
            />
          </div>

          {/* Auto-provisioning Notice */}
          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Automatic ERP Setup:</strong> Creating this road site will auto-generate its <strong>Daily Trip Matrix Sheet</strong>, <strong>MoRTH Pavement Cross-Section Layers</strong>, and <strong>Cost-Center Allocation Ledger</strong>.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#162032] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Road Site Section</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateRoadSiteModal;
