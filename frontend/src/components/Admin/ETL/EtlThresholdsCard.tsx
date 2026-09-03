import { RotateCcw, Sparkles, Telescope } from "lucide-react"

interface EtlThresholdsCardProps {
  scoreThreshold: number
  onScoreThresholdChange: (val: number) => void
  confidenceThreshold: number
  onConfidenceThresholdChange: (val: number) => void
  onReset: () => void
  onApply: () => void
  habitableCount: number
  statsLoading: boolean
}

export function EtlThresholdsCard({
  scoreThreshold,
  onScoreThresholdChange,
  confidenceThreshold,
  onConfidenceThresholdChange,
  onReset,
  onApply,
  habitableCount,
  statsLoading,
}: EtlThresholdsCardProps) {
  return (
    <div className="space-card flex flex-col gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Telescope size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Habitability Thresholds
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
          title="Reset to default 80 / 0.8"
        >
          <RotateCcw size={11} />
          <span>Reset</span>
        </button>
      </div>

      {/* Sliders & Inputs */}
      <div className="flex flex-col gap-4">
        {/* Score Threshold */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Score Cutoff (0 - 100):</span>
            <span className="font-mono text-cyan-300 font-bold">
              ≥ {scoreThreshold.toFixed(0)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={scoreThreshold}
            onChange={(e) => onScoreThresholdChange(Number(e.target.value))}
            className="accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Confidence Threshold */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Confidence Cutoff (0.0 - 1.0):
            </span>
            <span className="font-mono text-emerald-300 font-bold">
              ≥ {(confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) =>
              onConfidenceThresholdChange(Number(e.target.value))
            }
            className="accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Real-time Resulting Candidates Preview */}
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-3.5 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400">Potentially Habitable Worlds:</span>
          <span className="text-[11px] text-slate-500">
            Matching active thresholds
          </span>
        </div>
        <span className="text-lg font-bold font-mono text-emerald-400">
          {statsLoading ? "..." : habitableCount.toLocaleString()}
        </span>
      </div>

      {/* Apply Thresholds to System Button */}
      <button
        type="button"
        onClick={onApply}
        className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 active:scale-98 transition-all cursor-pointer"
      >
        <Sparkles size={14} />
        <span>Apply Thresholds to System & Dashboard</span>
      </button>
    </div>
  )
}
