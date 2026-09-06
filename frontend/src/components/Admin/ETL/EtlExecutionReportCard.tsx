import { Activity, CheckCircle2, Clock, History, XCircle } from "lucide-react"

import { formatExactDateTime, formatRelativeTime } from "@/utils"
import type { DetailedETLReport } from "./types"

interface EtlExecutionReportCardProps {
  lastReport: DetailedETLReport | null
  onOpenHistory: () => void
}

export function EtlExecutionReportCard({
  lastReport,
  onOpenHistory,
}: EtlExecutionReportCardProps) {
  return (
    <div className="space-card flex flex-col gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Execution Report
            </h3>
          </div>
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors cursor-pointer"
            title="View all database execution reports"
          >
            <History size={12} />
            <span>History</span>
          </button>
        </div>
        {lastReport && (
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <Clock size={12} />
            <span>
              {formatRelativeTime(
                lastReport.finished_at || lastReport.started_at,
              )}
            </span>
          </span>
        )}
      </div>

      {lastReport ? (
        <div className="flex flex-col gap-4">
          {/* Status Header Banner */}
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
                      ? "Pipeline Completed Successfully"
                      : "Pipeline Completed with Errors"}
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
              </div>
            </div>

            <div className="flex flex-col text-right text-xs">
              <span className="font-mono text-slate-200 font-bold">
                Total:{" "}
                {(lastReport.total_time ?? lastReport.duration_seconds).toFixed(
                  2,
                )}
                s
              </span>
            </div>
          </div>

          {/* Timestamps Row */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
            <div className="space-card flex items-center justify-between rounded-lg px-3 py-2">
              <span className="text-slate-400">Started At:</span>
              <span className="font-mono text-slate-200">
                {formatExactDateTime(lastReport.started_at)}
              </span>
            </div>
            <div className="space-card flex items-center justify-between rounded-lg px-3 py-2">
              <span className="text-slate-400">Finished At:</span>
              <span className="font-mono text-slate-200">
                {formatExactDateTime(lastReport.finished_at)}
              </span>
            </div>
          </div>

          {/* Ingestion & Transformation Counts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-card rounded-xl p-3">
              <span className="text-[11px] text-slate-400">Extracted</span>
              <p className="mt-1 text-lg font-bold text-white font-mono">
                {lastReport.extracted.toLocaleString()}
              </p>
            </div>
            <div className="space-card rounded-xl p-3">
              <span className="text-[11px] text-slate-400">Transformed</span>
              <p className="mt-1 text-lg font-bold text-white font-mono">
                {lastReport.transformed.toLocaleString()}
              </p>
            </div>
            <div className="space-card rounded-xl p-3">
              <span className="text-[11px] text-slate-400">Attempted</span>
              <p className="mt-1 text-lg font-bold text-slate-300 font-mono">
                {lastReport.load_result.attempted.toLocaleString()}
              </p>
            </div>
            <div className="space-card rounded-xl p-3">
              <span className="text-[11px] text-slate-400">Inserted (New)</span>
              <p className="mt-1 text-lg font-bold text-emerald-400 font-mono">
                +{lastReport.load_result.inserted.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Database Load Results Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-card flex items-center justify-between rounded-xl p-3 text-xs">
              <span className="text-slate-400">Updated Records:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {lastReport.load_result.updated.toLocaleString()}
              </span>
            </div>
            <div className="space-card flex items-center justify-between rounded-xl p-3 text-xs">
              <span className="text-slate-400">Skipped Records:</span>
              <span className="font-mono text-slate-400 font-bold">
                {lastReport.load_result.skipped.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Phase Latency Breakdown */}
          <div className="space-card flex flex-col gap-2 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">
                Phase Execution Latencies
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-2">
                <span className="text-slate-400">Extract</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {lastReport.extract_time.toFixed(2)}s
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-2">
                <span className="text-slate-400">Transform</span>
                <span className="font-mono text-purple-300 font-semibold">
                  {lastReport.transform_time.toFixed(2)}s
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-2">
                <span className="text-slate-400">Load</span>
                <span className="font-mono text-emerald-300 font-semibold">
                  {lastReport.load_time.toFixed(2)}s
                </span>
              </div>
            </div>
          </div>

          {/* Errors Section if any */}
          {lastReport.errors && lastReport.errors.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
              <span className="font-semibold text-red-400">
                Execution Errors Encountered:
              </span>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[11px]">
                {lastReport.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 py-6 text-center">
          No ingestion report available. Trigger a pipeline above to generate a
          real-time report.
        </p>
      )}
    </div>
  )
}
