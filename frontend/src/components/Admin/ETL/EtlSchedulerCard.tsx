import { Pause, Play, Timer } from "lucide-react"

import { formatExactDateTime, formatFutureOrRelativeTime } from "@/utils"

export interface SchedulerInfo {
  running?: boolean
  interval_seconds?: number
  next_run_time?: string
  next_run?: string
}

interface EtlSchedulerCardProps {
  scheduler?: SchedulerInfo
  nextRunTimestamp?: string
  intervalInput: string
  onIntervalInputChange: (val: string) => void
  onApplyInterval: (secs: number) => void
  isUpdatingInterval: boolean
  onStartScheduler: () => void
  isStarting: boolean
  onStopScheduler: () => void
  isStopping: boolean
}

const INTERVAL_PRESETS = [
  { label: "1h", secs: 3600 },
  { label: "6h", secs: 21600 },
  { label: "12h", secs: 43200 },
  { label: "24h", secs: 86400 },
]

export function EtlSchedulerCard({
  scheduler,
  nextRunTimestamp,
  intervalInput,
  onIntervalInputChange,
  onApplyInterval,
  isUpdatingInterval,
  onStartScheduler,
  isStarting,
  onStopScheduler,
  isStopping,
}: EtlSchedulerCardProps) {
  return (
    <div className="space-card flex flex-col gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Timer size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Scheduler Automation
            </h2>
          </div>
        </div>

        {/* Status Pill */}
        {scheduler?.running ? (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Running</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Stopped</span>
          </span>
        )}
      </div>

      {/* Scheduler Status Details */}
      <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/40 p-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Current Interval:</span>
          <span className="font-mono text-white font-semibold">
            {scheduler?.interval_seconds
              ? `${scheduler.interval_seconds.toLocaleString()}s (${(scheduler.interval_seconds / 3600).toFixed(1)}h)`
              : "86,400s (24h)"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Next Scheduled Run:</span>
          <span className="font-mono text-cyan-300 font-semibold">
            {nextRunTimestamp
              ? formatFutureOrRelativeTime(nextRunTimestamp)
              : "—"}
          </span>
        </div>
        {nextRunTimestamp && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-white/5">
            <span>Exact Next Time:</span>
            <span className="font-mono">
              {formatExactDateTime(nextRunTimestamp)}
            </span>
          </div>
        )}
      </div>

      {/* Interval Configuration Form */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="cron-interval-input"
          className="text-xs font-medium text-slate-300"
        >
          Update Cron Interval (Seconds)
        </label>
        <div className="flex items-center gap-2">
          <input
            id="cron-interval-input"
            type="number"
            value={intervalInput}
            onChange={(e) => onIntervalInputChange(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const secs = Number(intervalInput)
              if (secs > 0) onApplyInterval(secs)
            }}
            disabled={isUpdatingInterval}
            className="rounded-xl border border-purple-500/30 bg-purple-500/15 px-3.5 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            Apply
          </button>
        </div>

        {/* Interval Presets */}
        <div className="flex items-center gap-1.5 pt-1">
          {INTERVAL_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onIntervalInputChange(String(preset.secs))
                onApplyInterval(preset.secs)
              }}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start / Stop Toggle Actions */}
      <div className="flex items-center gap-3 pt-2">
        {scheduler?.running ? (
          <button
            type="button"
            onClick={onStopScheduler}
            disabled={isStopping}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Pause size={14} />
            <span>Stop Scheduler</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartScheduler}
            disabled={isStarting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-98 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Play size={14} />
            <span>Start Scheduler</span>
          </button>
        )}
      </div>
    </div>
  )
}
