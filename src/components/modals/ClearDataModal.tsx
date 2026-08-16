import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({ isOpen, onClose }) => {
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClear = () => {
    setIsResetting(true);
    
    // 1. Wipe all local storage & session storage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Reload the application after a brief delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121927] border border-[#1E293B] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Reset & Clear ERP Data</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#162032] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <p>
            This action will <strong className="text-white">permanently delete all entered site logs</strong>, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Vehicle trip counts & weighbridge entries</li>
            <li>Diesel dispensing logs</li>
            <li>Daily progress reports (DPR)</li>
            <li>Site petty cash & expense records</li>
          </ul>
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300">
            ⚠️ The site will be restored to its default starting template values.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3 border-t border-[#1E293B] bg-[#0D111D] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#162032] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmClear}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Data</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
