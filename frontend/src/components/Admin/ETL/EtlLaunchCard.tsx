import {
  AlertCircle,
  AlertTriangle,
  Database,
  Info,
  Loader2,
  Play,
} from "lucide-react"

import type { LoadMode } from "@/client"

interface EtlLaunchCardProps {
  limit: string
  onLimitChange: (val: string) => void
  loadMode: LoadMode
  onLoadModeChange: (mode: LoadMode) => void
  dryRun: boolean
  onDryRunChange: (val: boolean) => void
  persistRun: boolean
  onPersistRunChange: (val: boolean) => void
  isRunningETL: boolean
  runError: string | null
  onRunETL: () => void
}

export function EtlLaunchCard({
  limit,
  onLimitChange,
  loadMode,
  onLoadModeChange,
  dryRun,
  onDryRunChange,
  persistRun,
  onPersistRunChange,
  isRunningETL,
  runError,
  onRunETL,
}: EtlLaunchCardProps) {
  return (
    <div className="space-card flex flex-col gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              ETL Pipeline Trigger
            </h2>
          </div>
        </div>

        {isRunningETL && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse">
            <Loader2 size={13} className="animate-spin" />
            <span>Executing Pipeline...</span>
          </div>
        )}
      </div>

      {/* Ingestion Parameters Form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="record-limit-input"
            className="text-xs font-medium text-slate-300 flex items-center justify-between mb-1.5"
          >
            <span>Record Ingestion Limit</span>
          </label>
          <input
            id="record-limit-input"
            type="number"
            placeholder="All records (no limit)"
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            disabled={isRunningETL}
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
          />
          <span className="text-[11px] text-slate-400 mt-1.5 flex items-start gap-1">
            <Info size={13} className="shrink-0 text-cyan-400 mt-0.5" />
            <span>
              Extracts the latest discoveries ordered by discovery year
              descending and name. Leave empty for the full catalog.
            </span>
          </span>
        </div>

        <div>
          <label
            htmlFor="load-mode-select"
            className="text-xs font-medium text-slate-300 block mb-1.5"
          >
            Database Load Mode
          </label>
          <select
            id="load-mode-select"
            value={loadMode}
            onChange={(e) => onLoadModeChange(e.target.value as LoadMode)}
            disabled={isRunningETL}
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 cursor-pointer"
          >
            <option value="upsert">Upsert</option>
            <option value="insert">Insert</option>
            <option value="reload">Reload</option>
          </select>
          <span className="text-[11px] text-slate-400 mt-1.5 block">
            {loadMode === "upsert" && (
              <span className="text-slate-400">
                <strong>Upsert:</strong> Inserts new exoplanets & updates
                existing records if NASA parameters changed. Safe for recurring
                runs.
              </span>
            )}
            {loadMode === "insert" && (
              <span className="text-slate-400">
                <strong>Insert:</strong> Only inserts brand-new exoplanets;
                silently skips records that already exist without modifying
                them.
              </span>
            )}
            {loadMode === "reload" && (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle size={12} className="shrink-0" />
                <strong>Reload:</strong> Truncates & wipes the entire local
                database table before inserting.
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Dynamic Load Mode Warnings */}
      {loadMode === "reload" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <AlertTriangle size={16} className="shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-300 mb-0.5">
              Destructive Load Strategy Warning
            </strong>
            {limit && Number(limit) > 0 ? (
              <span>
                You selected <strong>Reload</strong> with a limit of{" "}
                <strong>{limit}</strong> records. This will completely erase all
                existing exoplanets in the database and leave{" "}
                <strong>ONLY</strong> these {limit} newly extracted records.
              </span>
            ) : (
              <span>
                <strong>Reload</strong> will wipe the entire exoplanet database
                table and re-populate it from scratch with the complete NASA
                catalog.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Checkboxes for Dry-Run & Persist */}
      <div className="flex flex-wrap items-center gap-6 pt-1">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => onDryRunChange(e.target.checked)}
            disabled={isRunningETL}
            className="rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
          />
          <span>Dry Run (Skip database mutations)</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={persistRun}
            onChange={(e) => onPersistRunChange(e.target.checked)}
            disabled={isRunningETL}
            className="rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
          />
          <span>Persist Execution Report to Database</span>
        </label>
      </div>

      {/* Trigger Button & Error Banner */}
      {runError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span>{runError}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onRunETL}
        disabled={isRunningETL}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-xs font-bold text-slate-950 transition-all hover:from-cyan-400 hover:to-blue-400 active:scale-98 disabled:opacity-50 shadow-lg shadow-cyan-500/20 cursor-pointer"
      >
        {isRunningETL ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>Running Ingestion Pipeline...</span>
          </>
        ) : (
          <>
            <Play size={15} />
            <span>Run Pipeline Ingest</span>
          </>
        )}
      </button>
    </div>
  )
}
