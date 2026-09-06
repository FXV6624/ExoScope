import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  History,
  Loader2,
  RefreshCw,
  Timer,
  X,
  XCircle,
} from "lucide-react"
import { useState } from "react"

import { EtlService } from "@/client"
import { formatExactDateTime, formatRelativeTime } from "@/utils"

export interface EtlRunItem {
  id: string
  started_at: string
  finished_at?: string
  extracted: number
  transformed: number
  extract_time: number
  transform_time: number
  load_time: number
  total_time: number
  success: boolean
  errors?: string
  load_result?: {
    inserted?: number
    updated?: number
    discarded?: number
    skipped?: number
    strategy?: string
    duration_seconds?: number
    [key: string]: any
  }
}

interface EtlHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EtlHistoryModal({ isOpen, onClose }: EtlHistoryModalProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)

  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ["all-etl-runs"],
    queryFn: () => EtlService.readEtlRuns({ limit: 100 }),
    enabled: isOpen,
  })

  if (!isOpen) return null

  const runs: EtlRunItem[] = (data as any)?.runs ?? []
  const count: number = (data as any)?.count ?? runs.length
  const successRuns = runs.filter((r) => r.success).length
  const successRate =
    runs.length > 0 ? Math.round((successRuns / runs.length) * 100) : 0

  const toggleExpand = (id: string) => {
    setExpandedRunId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close history modal backdrop"
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="space-modal relative z-10 flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <History size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Database ETL Execution Reports
                </h2>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-mono font-medium text-cyan-300 border border-cyan-500/30">
                  {count} {count === 1 ? "run" : "runs"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              title="Refresh reports"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                size={13}
                className={isRefetching ? "animate-spin text-cyan-400" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Global Summary Bar */}
        {runs.length > 0 && (
          <div className="grid grid-cols-3 border-b border-white/5 bg-white/[0.02] px-5 py-3 text-xs">
            <div>
              <span className="text-slate-400">Total Recorded Runs:</span>{" "}
              <span className="font-semibold text-white font-mono">
                {count}
              </span>
            </div>
            <div className="text-center">
              <span className="text-slate-400">Success Rate:</span>{" "}
              <span
                className={`font-semibold font-mono ${
                  successRate >= 90
                    ? "text-emerald-400"
                    : successRate >= 70
                      ? "text-amber-400"
                      : "text-rose-400"
                }`}
              >
                {successRate}% ({successRuns}/{runs.length})
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Latest Run:</span>{" "}
              <span className="font-semibold text-white font-mono">
                {formatRelativeTime(
                  runs[0]?.finished_at || runs[0]?.started_at,
                )}
              </span>
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={32} className="animate-spin text-cyan-400 mb-3" />
              <p className="text-sm text-slate-400">
                Loading ETL reports from database...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 text-center text-sm text-rose-300">
              <AlertTriangle size={24} className="mx-auto mb-2 text-rose-400" />
              <p className="font-semibold">
                Failed to load ETL execution reports
              </p>
              <p className="text-xs text-rose-400/80 mt-1">
                {(error as any)?.message ||
                  "An unexpected error occurred while querying the server."}
              </p>
            </div>
          ) : runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 mb-3">
                <Database size={24} />
              </div>
              <p className="text-sm font-semibold text-white">
                No ETL Reports Found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                No pipeline executions have been persisted to the database yet.
                Trigger a run with "Persist Execution Report to Database"
                enabled.
              </p>
            </div>
          ) : (
            runs.map((run) => {
              const isExpanded = expandedRunId === run.id
              const hasErrors =
                !run.success || (run.errors && run.errors.trim().length > 0)
              const loadRes = run.load_result || {}

              return (
                <div
                  key={run.id}
                  className={`group rounded-xl border transition-all ${
                    isExpanded
                      ? "border-cyan-500/40 bg-slate-900/80 shadow-lg shadow-cyan-950/30"
                      : "border-white/5 bg-slate-900/40 hover:border-white/15 hover:bg-slate-900/60"
                  }`}
                >
                  {/* Item Header / Summary */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(run.id)}
                    className="w-full flex items-center justify-between gap-3 p-3.5 sm:p-4 text-left cursor-pointer bg-transparent border-none select-none"
                    aria-label={
                      isExpanded ? "Collapse run details" : "Expand run details"
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {run.success ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          <CheckCircle2 size={15} />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                          <XCircle size={15} />
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-xs font-bold text-white font-mono">
                          {formatExactDateTime(
                            run.finished_at || run.started_at,
                          )}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (
                          {formatRelativeTime(
                            run.finished_at || run.started_at,
                          )}
                          )
                        </span>
                      </div>
                    </div>

                    <div className="p-1 text-slate-400 group-hover:text-slate-200 shrink-0">
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detailed Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-white/5 bg-black/20 p-4 space-y-4">
                      {/* Run ID Banner */}
                      <div className="flex items-center justify-between text-xs text-slate-400 bg-white/[0.03] px-3 py-2 rounded-lg border border-white/5 font-mono">
                        <span>
                          Report ID:{" "}
                          <span className="text-slate-300">{run.id}</span>
                        </span>
                        <span>
                          Started: {formatExactDateTime(run.started_at)}
                        </span>
                      </div>

                      {/* Ingest Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Extracted
                          </span>
                          <p className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                            {run.extracted?.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Transformed
                          </span>
                          <p className="text-base font-bold font-mono text-blue-400 mt-0.5">
                            {run.transformed?.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Inserted
                          </span>
                          <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                            +{loadRes.inserted?.toLocaleString() ?? 0}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Updated / Skipped
                          </span>
                          <p className="text-base font-bold font-mono text-amber-400 mt-0.5">
                            {loadRes.updated ?? 0} / {loadRes.skipped ?? 0}
                          </p>
                        </div>
                      </div>

                      {/* Latencies */}
                      <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                          <Timer size={13} className="text-cyan-400" />
                          <span>Phase Execution Latencies</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                          <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] text-slate-400 block font-sans">
                              Extract
                            </span>
                            <span className="text-slate-200 font-bold">
                              {(run.extract_time ?? 0).toFixed(3)}s
                            </span>
                          </div>
                          <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] text-slate-400 block font-sans">
                              Transform
                            </span>
                            <span className="text-slate-200 font-bold">
                              {(run.transform_time ?? 0).toFixed(3)}s
                            </span>
                          </div>
                          <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] text-slate-400 block font-sans">
                              Load
                            </span>
                            <span className="text-slate-200 font-bold">
                              {(run.load_time ?? 0).toFixed(3)}s
                            </span>
                          </div>
                          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                            <span className="text-[10px] text-cyan-300 block font-sans">
                              Total
                            </span>
                            <span className="text-cyan-400 font-bold">
                              {(run.total_time ?? 0).toFixed(3)}s
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Errors display if any */}
                      {hasErrors && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
                          <div className="flex items-center gap-1.5 font-semibold text-rose-400 mb-1">
                            <AlertTriangle size={14} />
                            <span>Execution Errors</span>
                          </div>
                          <p className="font-mono whitespace-pre-wrap">
                            {run.errors ||
                              "Unknown error occurred during execution."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 bg-slate-900/60 text-xs text-slate-400">
          <span>Showing up to 100 historical executions</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
