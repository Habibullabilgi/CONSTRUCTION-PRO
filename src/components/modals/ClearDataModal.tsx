import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, RotateCcw, X, ShieldAlert, Sparkles } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useRoadERP } from '../../context/RoadERPContext';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({ isOpen, onClose }) => {
  const { clearAllData: clearERPData, resetToSampleData: resetERPData, addAuditLog } = useERP();
  const { clearAllData: clearRoadData, resetToSampleData: resetRoadData } = useRoadERP();
  const [actionStatus, setActionStatus] = useState<'idle' | 'cleared' | 'reset'>('idle');

  if (!isOpen) return null;

  const handleClearAll = () => {
    clearERPData();
    clearRoadData();
    setActionStatus('cleared');
    setTimeout(() => {
      setActionStatus('idle');
      onClose();
    }, 1200);
  };

  const handleResetSample = () => {
    resetERPData();
    resetRoadData();
    setActionStatus('reset');
    setTimeout(() => {
      setActionStatus('idle');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0A0F1D]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Database Management & Reset</h2>
              <p className="text-xs text-slate-400">Manage transaction data, trip matrices, and site logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {actionStatus === 'cleared' ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <div className="text-base font-bold text-emerald-300">All Data Cleared Successfully!</div>
              <div className="text-xs text-slate-300">All trips, diesel records, expenses, and matrix cells are now reset to 0.</div>
            </div>
          ) : actionStatus === 'reset' ? (
            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto animate-bounce" />
              <div className="text-base font-bold text-blue-300">Sample Demo Data Restored!</div>
              <div className="text-xs text-slate-300">Loaded factory highway projects, tipper fleets, and sample logs.</div>
            </div>
          ) : (
            <>
              {/* Warning Banner */}
              <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-start gap-3 text-rose-200 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-300">Caution: Irreversible Action</span>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Clearing all data will permanently wipe all haulage trip slips, diesel dispensing logs, site expense vouchers, daily matrix cell quantities, stock ledger entries, and offline queues.
                  </p>
                </div>
              </div>

              {/* What gets cleared details */}
              <div className="bg-[#162032] border border-[#1E293B] rounded-xl p-4 space-y-2 text-xs">
                <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  What will be cleared to clean slate:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    All Haulage Trips (0 Trips)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Diesel Dispense Logs (0 Litres)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Site Expense Vouchers (₹0)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Daily Trip Matrix Cells (All 0)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Stock Ledger & Material Indents
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Attendance & Measurement Logs
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Clear All Data (Clean Slate)</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetSample}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Load Demo Sample Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
