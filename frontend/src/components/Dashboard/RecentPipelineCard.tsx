import { Link as RouterLink } from "@tanstack/react-router"
import {
  Activity,
  CheckCircle2,
  Clock,
  LogIn,
  Play,
  XCircle,
} from "lucide-react"

import { formatRelativeTime } from "@/utils"

export interface PipelineReport {
  success?: boolean
  started_at?: string
  finished_at?: string
  total_time?: number
  extracted?: number
  transformed?: number
  load_result?: {
    attempted?: number
    inserted?: number
    updated?: number
    skipped?: number
  }
  extract_time?: number
  transform_time?: number
  load_time?: number
  errors?: string[]
}

interface RecentPipelineCardProps {
  loggedIn: boolean
  etlLoading: boolean
  lastReport?: PipelineReport | null
}

export function RecentPipelineCard({
  loggedIn,
  etlLoading,
  lastReport,
}: RecentPipelineCardProps) {
  return (
    <div className="space-card group relative flex flex-col justify-between gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Recent Pipeline Activity
              </h2>
              <p className="text-xs text-slate-400">
                Latest database ingestion and ETL synchronization report
              </p>
            </div>
          </div>
        </div>

        {/* Content based on login / report state */}
        {loggedIn ? (
          etlLoading ? (
            <div className="flex flex-col gap-3 py-6 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-white/10" />
              <div className="h-16 w-full rounded-xl bg-white/5" />
              <div className="h-12 w-full rounded-xl bg-white/5" />
            </div>
          ) : lastReport ? (
            <div className="flex flex-col gap-5 pt-4">
              {/* Status Banner */}
              <div className="space-card flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {lastReport.success ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={18} />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle size={18} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {lastReport.success
                          ? "Pipeline Ingest Completed"
                          : "Ingest Encountered Errors"}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          lastReport.success
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {lastReport.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock size={11} />
                      <span>
                        {formatRelativeTime(
                          lastReport.finished_at || lastReport.started_at,
                        )}
                      </span>
                      <span>•</span>
                      <span>
                        Duration: {lastReport.total_time?.toFixed(2) ?? "< 0.1"}
                        s
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-card rounded-xl p-3">
                  <span className="text-[11px] text-slate-400">Extracted</span>
                  <p className="mt-1 text-lg font-bold text-white font-mono">
                    {lastReport.extracted?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className="space-card rounded-xl p-3">
                  <span className="text-[11px] text-slate-400">
                    Transformed
                  </span>
                  <p className="mt-1 text-lg font-bold text-white font-mono">
                    {lastReport.transformed?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className="space-card rounded-xl p-3">
                  <span className="text-[11px] text-slate-400">
                    Loaded (New)
                  </span>
                  <p className="mt-1 text-lg font-bold text-emerald-400 font-mono">
                    +{lastReport.load_result?.inserted?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className="space-card rounded-xl p-3">
                  <span className="text-[11px] text-slate-400">Updated</span>
                  <p className="mt-1 text-lg font-bold text-cyan-400 font-mono">
                    ~{lastReport.load_result?.updated?.toLocaleString() ?? 0}
                  </p>
                </div>
              </div>

              {/* Stage Timing Breakdown */}
              <div className="space-card flex flex-col gap-2 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300">
                    Phase Latency Breakdown
                  </span>
                  <span className="font-mono text-[11px]">
                    Total: {lastReport.total_time?.toFixed(2) ?? 0}s
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5">
                    <span className="text-slate-400">Extract</span>
                    <span className="font-mono text-cyan-300">
                      {lastReport.extract_time?.toFixed(2) ?? 0}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5">
                    <span className="text-slate-400">Transform</span>
                    <span className="font-mono text-purple-300">
                      {lastReport.transform_time?.toFixed(2) ?? 0}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5">
                    <span className="text-slate-400">Load</span>
                    <span className="font-mono text-emerald-300">
                      {lastReport.load_time?.toFixed(2) ?? 0}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Play size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  No Ingestion Runs Recorded Yet
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                  The database has not recorded recent ETL pipeline executions.
                  Trigger your first ingest from the admin control panel.
                </p>
              </div>
              <RouterLink
                to="/admin/etl"
                className="mt-2 flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-all hover:bg-cyan-400 active:scale-95 no-underline"
              >
                <Play size={13} />
                <span>Run ETL Ingest</span>
              </RouterLink>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400 border border-white/10">
              <LogIn size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Administrator Access Required
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Authenticate with administrator credentials to manage ETL
                workflows and platform settings.
              </p>
            </div>
            <RouterLink
              to="/login"
              className="mt-2 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-500/25 hover:text-white no-underline"
            >
              <LogIn size={13} />
              <span>Admin Sign In</span>
            </RouterLink>
          </div>
        )}
      </div>
    </div>
  )
}
