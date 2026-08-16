{filteredFleet.map((machine) => (
  <div
    key={machine.id}
    className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] hover:border-[#2d416b] transition-all space-y-4 shadow-xl flex flex-col justify-between"
  >
    {/* Card Header */}
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-black text-xs border border-amber-500/30">
            {machine.code}
          </span>
          <span className="font-mono text-xs text-slate-400 font-semibold">
            {machine.registrationNumber || machine.code}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Status Dropdown / Badge */}
          <select
            value={machine.status}
            onChange={(e) => {
              // optional: update machine status
            }}
            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800 outline-none cursor-pointer"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="IDLE">IDLE</option>
          </select>

          {/* Delete Icon Button (Top Right) */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete [${machine.code}] ${machine.name}?`)) {
                deleteMachinery(machine.id);
              }
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
            title="Delete Machine"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Machine Name & Ownership */}
      <h3 className="text-base font-black text-white leading-snug">
        {machine.name}
      </h3>
      <div className="text-xs text-slate-400 mt-1">
        {machine.modelDetails || 'Heavy Commercial Spec'} •{' '}
        <span className="text-amber-400 font-semibold">
          {machine.ownershipType === 'COMPANY_OWNED' ? 'Company Owned' : `Rented (₹${machine.rentalHourlyRateINR || 0}/hr)`}
        </span>
      </div>
    </div>

    {/* Metrics Box */}
    <div className="p-3.5 bg-[#070c18] border border-[#182643] rounded-2xl space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          Hour-meter (HMR):
        </span>
        <span className="font-mono font-bold text-white">
          {(machine.currentHMR || 0).toLocaleString()} hrs
        </span>
      </div>

      {machine.currentKMR !== undefined && machine.currentKMR > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            Odometer (KMR):
          </span>
          <span className="font-mono font-bold text-white">
            {machine.currentKMR.toLocaleString()} km
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Fuel className="w-3.5 h-3.5 text-amber-400" />
          Avg Benchmark:
        </span>
        <span className="font-mono font-bold text-amber-400">
          {machine.averageConsumptionBenchmark || 0} {machine.benchmarkUnit || 'L/hr'}
        </span>
      </div>

      {machine.currentLocation && (
        <div className="text-[11px] text-slate-400 pt-1.5 border-t border-[#182643] truncate flex items-center gap-1">
          <span className="text-rose-400">📍</span>
          <span>{machine.currentLocation}</span>
        </div>
      )}
    </div>

    {/* Card Footer: Operator + Update Meter + Delete */}
    <div className="pt-2 border-t border-[#182643] flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="w-8 h-8 rounded-full bg-[#162032] border border-[#1e2d4a] flex items-center justify-center text-slate-400 shrink-0">
          <UserIcon className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="font-bold text-slate-200 text-xs truncate">
            {machine.assignedOperator || 'Unassigned Operator'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {machine.operatorPhone || '+91 90000 00000'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            // handle meter update
          }}
          className="px-2.5 py-1.5 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Edit2 className="w-3 h-3 text-cyan-400" />
          <span>Update Meter</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete [${machine.code}] ${machine.name}?`)) {
              deleteMachinery(machine.id);
            }
          }}
          className="p-1.5 rounded-xl bg-[#142038] hover:bg-rose-950/50 border border-[#23355a] hover:border-rose-800/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          title="Delete Machine"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
))}
