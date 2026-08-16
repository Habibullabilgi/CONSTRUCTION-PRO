import React, { useState, useMemo } from 'react';
import { useRoadERP } from '../../context/RoadERPContext';
import { PavementLayerType, RoadLayerYieldCalculation } from '../../types/roadERP';
import {
  Calculator,
  Plus,
  Layers,
  Scale,
  Truck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  Flame,
  Droplets,
  Ruler,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';

interface LayerPreset {
  name: string;
  defaultThicknessMm: number;
  defaultDensity: number; // tons/m³
  defaultWastagePct: number;
  hasBitumenBreakdown?: boolean;
  defaultBitumenPct?: number;
  unitLabel: string;
  category: 'GRANULAR' | 'BITUMINOUS' | 'CONCRETE' | 'EMULSION';
}

const LAYER_PRESETS: Record<PavementLayerType, LayerPreset> = {
  SUBGRADE_MURUM: {
    name: 'Subgrade / Selected Soil (Murum Fill)',
    defaultThicknessMm: 300,
    defaultDensity: 1.95,
    defaultWastagePct: 8.0,
    unitLabel: 'Tons',
    category: 'GRANULAR'
  },
  GRANULAR_SUB_BASE_GSB: {
    name: 'Granular Sub-Base (GSB Graded Aggregates)',
    defaultThicknessMm: 200,
    defaultDensity: 2.2,
    defaultWastagePct: 6.0,
    unitLabel: 'Tons',
    category: 'GRANULAR'
  },
  WET_MIX_MACADAM_WMM: {
    name: 'Wet Mix Macadam (WMM Base Layer)',
    defaultThicknessMm: 250,
    defaultDensity: 2.25,
    defaultWastagePct: 5.0,
    unitLabel: 'Tons',
    category: 'GRANULAR'
  },
  DENSE_BITUMINOUS_MACADAM_DBM: {
    name: 'Dense Bituminous Macadam (DBM Binder Course)',
    defaultThicknessMm: 100,
    defaultDensity: 2.4,
    defaultWastagePct: 3.5,
    hasBitumenBreakdown: true,
    defaultBitumenPct: 4.8,
    unitLabel: 'Tons',
    category: 'BITUMINOUS'
  },
  BITUMINOUS_CONCRETE_BC: {
    name: 'Bituminous Concrete (BC Wearing Surface)',
    defaultThicknessMm: 40,
    defaultDensity: 2.45,
    defaultWastagePct: 3.0,
    hasBitumenBreakdown: true,
    defaultBitumenPct: 5.4,
    unitLabel: 'Tons',
    category: 'BITUMINOUS'
  },
  DRY_LEAN_CONCRETE_DLC: {
    name: 'Dry Lean Concrete (DLC Sub-Base)',
    defaultThicknessMm: 150,
    defaultDensity: 2.35,
    defaultWastagePct: 4.0,
    unitLabel: 'm³ & Bags',
    category: 'CONCRETE'
  },
  PAVEMENT_QUALITY_CONCRETE_PQC: {
    name: 'Pavement Quality Concrete (PQC Rigid Pavement)',
    defaultThicknessMm: 300,
    defaultDensity: 2.4,
    defaultWastagePct: 3.0,
    unitLabel: 'm³ & Bags',
    category: 'CONCRETE'
  },
  PRIME_COAT_EMULSION: {
    name: 'Prime Coat (SS-1 Bitumen Emulsion on WMM)',
    defaultThicknessMm: 1, // nominal
    defaultDensity: 1.0, // kg/m² conversion
    defaultWastagePct: 3.0,
    unitLabel: 'Litres / kg',
    category: 'EMULSION'
  },
  TACK_COAT_EMULSION: {
    name: 'Tack Coat (RS-1 Rapid Setting Emulsion between DBM & BC)',
    defaultThicknessMm: 1,
    defaultDensity: 1.0,
    defaultWastagePct: 3.0,
    unitLabel: 'Litres / kg',
    category: 'EMULSION'
  }
};

export const RoadYieldCalculatorModule: React.FC = () => {
  const { yieldCalculations, saveYieldCalculation, recalculateYieldWithActuals, project, trips } =
    useRoadERP();

  // Calculator Form State
  const [selectedLayer, setSelectedLayer] =
    useState<PavementLayerType>('WET_MIX_MACADAM_WMM');
  const [startChKm, setStartChKm] = useState<number>(10.0);
  const [endChKm, setEndChKm] = useState<number>(12.5);
  const [carriagewayWidth, setCarriagewayWidth] = useState<number>(9.0); // meters
  const [layerThicknessMm, setLayerThicknessMm] = useState<number>(250); // mm
  const [bulkDensity, setBulkDensity] = useState<number>(2.25); // t/m³
  const [wastagePct, setWastagePct] = useState<number>(5.0); // %
  const [tipperPayloadTons, setTipperPayloadTons] = useState<number>(26.0); // tons
  const [bitumenContentPct, setBitumenContentPct] = useState<number>(4.8); // for asphalt

  // Handle Layer Selection Preset switch
  const handleLayerChange = (layer: PavementLayerType) => {
    setSelectedLayer(layer);
    const preset = LAYER_PRESETS[layer];
    setLayerThicknessMm(preset.defaultThicknessMm);
    setBulkDensity(preset.defaultDensity);
    setWastagePct(preset.defaultWastagePct);
    if (preset.defaultBitumenPct) {
      setBitumenContentPct(preset.defaultBitumenPct);
    }
  };

  // Real-time live math calculations based on formulas in spec
  const liveCalculations = useMemo(() => {
    const lengthM = Math.max(0, (endChKm - startChKm) * 1000);
    const thicknessM = layerThicknessMm / 1000;
    const volumeM3 = lengthM * carriagewayWidth * thicknessM;

    // Weight = Volume * Density * (1 + Wastage/100)
    const wastageMultiplier = 1 + wastagePct / 100;
    const totalWeightTons = volumeM3 * bulkDensity * wastageMultiplier;

    // Number of Tipper Trips Needed = ceil(Total Weight / Payload)
    const tripsNeeded =
      tipperPayloadTons > 0 ? Math.ceil(totalWeightTons / tipperPayloadTons) : 0;

    // Bitumen & Aggregate breakdown if bituminous
    const isBituminous = LAYER_PRESETS[selectedLayer].hasBitumenBreakdown;
    let bitumenTons = 0;
    let aggregateTons = 0;
    if (isBituminous) {
      bitumenTons = totalWeightTons * (bitumenContentPct / 100);
      aggregateTons = totalWeightTons - bitumenTons;
    }

    return {
      lengthM,
      thicknessM,
      volumeM3: Number(volumeM3.toFixed(2)),
      totalWeightTons: Number(totalWeightTons.toFixed(2)),
      tripsNeeded,
      isBituminous,
      bitumenTons: Number(bitumenTons.toFixed(2)),
      aggregateTons: Number(aggregateTons.toFixed(2))
    };
  }, [
    startChKm,
    endChKm,
    carriagewayWidth,
    layerThicknessMm,
    bulkDensity,
    wastagePct,
    tipperPayloadTons,
    bitumenContentPct,
    selectedLayer
  ]);

  // Handle saving this section calculation to project cross-section register
  const handleSaveCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCh = `Ch. ${startChKm.toFixed(3).replace('.', '+')} to Ch. ${endChKm.toFixed(3).replace('.', '+')}`;
    const preset = LAYER_PRESETS[selectedLayer];

    saveYieldCalculation({
      layerType: selectedLayer,
      layerName: preset.name,
      chainageStartKm: startChKm,
      chainageEndKm: endChKm,
      formattedChainage: formattedCh,
      lengthMeters: liveCalculations.lengthM,
      carriagewayWidthMeters: carriagewayWidth,
      compactedThicknessMm: layerThicknessMm,
      compactedThicknessMeters: liveCalculations.thicknessM,
      compactedBulkDensityTonsPerM3: bulkDensity,
      wastageFactorPercent: wastagePct,
      compactedVolumeM3: liveCalculations.volumeM3,
      totalWeightTonsRequired: liveCalculations.totalWeightTons,
      averageTipperPayloadTons: tipperPayloadTons,
      tripsNeeded: liveCalculations.tripsNeeded,
      bitumenContentPercentage: liveCalculations.isBituminous
        ? bitumenContentPct
        : undefined,
      bitumenTonsRequired: liveCalculations.isBituminous
        ? liveCalculations.bitumenTons
        : undefined,
      aggregateTonsRequired: liveCalculations.isBituminous
        ? liveCalculations.aggregateTons
        : undefined
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#1b2845] shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  MODULE E • SPECIFICATION COMPLIANT
                </span>
                <span className="text-xs text-slate-400">
                  MoRTH Pavement Density & Trippage Matching
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Road Material Quantity & Pavement Yield Calculator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-[#070c18] px-3 py-2 rounded-xl border border-[#1b2845]">
            <span>Active Project:</span>
            <span className="text-amber-400 font-mono font-bold">
              {project.highwayCode} (Ch. {project.startChainageKm} - {project.endChainageKm})
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Left Input Form + Real-time Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT FORM (5 Cols): Layer-by-Layer Dimension Inputs */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#182643] pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-400" />
              <span>Cross-Section Dimension Parameters</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Section Inputs</span>
          </div>

          <form onSubmit={handleSaveCalculation} className="space-y-3.5 text-xs">
            {/* 1. Pavement Layer Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Select Pavement Layer & Material Preset *
              </label>
              <select
                value={selectedLayer}
                onChange={(e) => handleLayerChange(e.target.value as PavementLayerType)}
                className="w-full px-3 py-2.5 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-medium outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                {Object.entries(LAYER_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    [{item.category}] {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Chainage Range (Start to End) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Start Chainage (Km) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={startChKm}
                    onChange={(e) => setStartChKm(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    Km
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Ch. {startChKm.toFixed(3).replace('.', '+')}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  End Chainage (Km) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={endChKm}
                    onChange={(e) => setEndChKm(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    Km
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Ch. {endChKm.toFixed(3).replace('.', '+')}
                </span>
              </div>
            </div>

            {/* 3. Width and Compacted Layer Thickness */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Carriageway Width (W) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={carriagewayWidth}
                    onChange={(e) =>
                      setCarriagewayWidth(parseFloat(e.target.value) || 0)
                    }
                    className="w-full pl-3 pr-8 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    m
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  e.g. 7.5m main or 9.0m w/ shoulder
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Compacted Thickness (T) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    required
                    value={layerThicknessMm}
                    onChange={(e) =>
                      setLayerThicknessMm(parseFloat(e.target.value) || 0)
                    }
                    className="w-full pl-3 pr-8 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-cyan-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    mm
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  = {(layerThicknessMm / 1000).toFixed(3)} meters
                </span>
              </div>
            </div>

            {/* 4. Compacted Bulk Density & Wastage Factor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Compacted Density (ρ) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bulkDensity}
                    onChange={(e) =>
                      setBulkDensity(parseFloat(e.target.value) || 0)
                    }
                    className="w-full pl-3 pr-12 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    t/m³
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  MoRTH bulk density
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Wastage & Handling (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={wastagePct}
                    onChange={(e) =>
                      setWastagePct(parseFloat(e.target.value) || 0)
                    }
                    className="w-full pl-3 pr-8 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    %
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Site tolerance (3% - 8%)
                </span>
              </div>
            </div>

            {/* 5. Tipper Payload Capacity & Bitumen % */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Avg Tipper Payload *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={tipperPayloadTons}
                    onChange={(e) =>
                      setTipperPayloadTons(parseFloat(e.target.value) || 0)
                    }
                    className="w-full pl-3 pr-12 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    Tons
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  e.g. 16m³ BharatBenz / Tata
                </span>
              </div>

              {liveCalculations.isBituminous ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Bitumen Content (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={bitumenContentPct}
                      onChange={(e) =>
                        setBitumenContentPct(parseFloat(e.target.value) || 0)
                      }
                      className="w-full pl-3 pr-8 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-orange-400 font-mono font-bold outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                      %
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    VG-30 / VG-40 Binder
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center p-2 bg-[#070c18] rounded-xl border border-[#182643] text-slate-500 text-[11px] text-center">
                  Non-bituminous granular layer
                </div>
              )}
            </div>

            {/* Submit / Add Section */}
            <div className="pt-3 border-t border-[#182643] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Length: <strong className="text-white font-mono">{liveCalculations.lengthM}m</strong>
              </span>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Save Layer Target</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT METRICS (7 Cols): Real-time Output & Formula Engine */}
        <div className="lg:col-span-7 space-y-4">
          {/* Output Card 1: Compacted Volume & Weight Required */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845] space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Compacted Volume (V)</span>
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono">
                {liveCalculations.volumeM3.toLocaleString()} <span className="text-xs text-slate-400 font-sans">m³</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                V = L({liveCalculations.lengthM}m) × W({carriagewayWidth}m) × T({liveCalculations.thicknessM}m)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845] space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Total Weight Needed (W)</span>
                <Scale className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {liveCalculations.totalWeightTons.toLocaleString()} <span className="text-xs text-slate-400 font-sans">Tons</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Incl. +{wastagePct}% site handling
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1427] border border-amber-500/30 bg-gradient-to-br from-[#0c1427] to-[#1e1509] space-y-1">
              <div className="text-[11px] font-semibold text-amber-400 flex items-center justify-between">
                <span>Dump Truck Trips Needed</span>
                <Truck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {liveCalculations.tripsNeeded} <span className="text-xs text-amber-300 font-sans">Trips</span>
              </div>
              <div className="text-[10px] text-amber-400/80 font-mono">
                Based on {tipperPayloadTons}T payload
              </div>
            </div>
          </div>

          {/* Bituminous Breakdown Box (if DBM / BC) */}
          {liveCalculations.isBituminous && (
            <div className="p-4 rounded-2xl bg-[#0c1427] border border-orange-500/20 bg-gradient-to-r from-[#0c1427] via-[#1a0f0a] to-[#0c1427] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Bitumen vs Aggregate Mix Split ({bitumenContentPct}% Binder)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Theoretical batching recipe requirements for hot mix plant
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Bitumen VG-30/40:</span>
                  <span className="text-orange-400 font-extrabold text-sm">
                    {liveCalculations.bitumenTons.toLocaleString()} Tons
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Aggregates (Graded):</span>
                  <span className="text-slate-200 font-extrabold text-sm">
                    {liveCalculations.aggregateTons.toLocaleString()} Tons
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Theoretical vs Actual Real-Time Variance Table */}
          <div className="rounded-3xl bg-[#0c1427] border border-[#1b2845] overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#0e172a] border-b border-[#182643] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Section Yield & Material Reconciliation Ledger
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {yieldCalculations.length} Tracked Sections
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#090f1d] text-slate-400 font-semibold border-b border-[#182643]">
                  <tr>
                    <th className="py-3 px-4">CHAINAGE & LAYER</th>
                    <th className="py-3 px-3 text-right">THEORETICAL REQ</th>
                    <th className="py-3 px-3 text-right">ACTUAL RECEIVED</th>
                    <th className="py-3 px-3 text-right">VARIANCE (TONS)</th>
                    <th className="py-3 px-3 text-center">TRIPS DONE / REQ</th>
                    <th className="py-3 px-3 text-center">YIELD STATUS</th>
                    <th className="py-3 px-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15223c] text-slate-200">
                  {yieldCalculations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        No active pavement sections saved yet.
                      </td>
                    </tr>
                  ) : (
                    yieldCalculations.map((item) => {
                      const isOptimal = item.yieldStatus === 'OPTIMAL';
                      const isOver = item.yieldStatus === 'OVER_CONSUMPTION';
                      const isProgress = item.yieldStatus === 'IN_PROGRESS';

                      return (
                        <tr key={item.id} className="hover:bg-[#0e172e] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white font-mono">
                              {item.formattedChainage}
                            </div>
                            <div className="text-[11px] text-amber-400/90">{item.layerName}</div>
                            <div className="text-[10px] text-slate-500">
                              L: {item.lengthMeters}m | W: {item.carriagewayWidthMeters}m | T: {item.compactedThicknessMm}mm
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-300">
                            {item.totalWeightTonsRequired.toLocaleString()} T
                            <span className="text-[10px] text-slate-500 block">
                              ({item.compactedVolumeM3.toLocaleString()} m³)
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-cyan-400">
                            {item.actualMaterialReceivedTons.toLocaleString()} T
                            <span className="text-[10px] text-slate-500 block">
                              via Challan entries
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold">
                            <span
                              className={`${
                                item.varianceTons > 0
                                  ? 'text-rose-400'
                                  : item.varianceTons === 0
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {item.varianceTons > 0 ? `+${item.varianceTons}` : item.varianceTons} T
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              ({item.variancePercentage > 0 ? `+${item.variancePercentage}` : item.variancePercentage}%)
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-mono">
                            <span className="text-white font-bold">{item.actualTripsReceivedCount}</span>
                            <span className="text-slate-500"> / {item.tripsNeeded}</span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                isOptimal
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : isOver
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}
                            >
                              {item.yieldStatus.replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => recalculateYieldWithActuals(item.id)}
                              title="Re-match against latest trip slips"
                              className="p-1.5 rounded-lg bg-[#142038] hover:bg-[#1f3156] text-slate-300 hover:text-white transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
