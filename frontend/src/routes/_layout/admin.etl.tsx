import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Telescope,
  Timer,
  Trash2,
  XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"

import {
  EtlService,
  ExoplanetsService,
  type LoadMode,
  SchedulerService,
} from "@/client"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request as __request } from "@/client/core/request"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import useCustomToast from "@/hooks/useCustomToast"
import {
  DEFAULT_HABITABILITY_CONFIDENCE_THRESHOLD,
  DEFAULT_HABITABILITY_SCORE_THRESHOLD,
  getStoredThresholds,
  saveStoredThresholds,
} from "@/utils"

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_layout/admin/etl")({
  component: AdminControlPage,
  head: () => ({
    meta: [{ title: "Admin Control Center — Data Engineering Platform" }],
  }),
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailedETLReport {
  id?: string
  extracted: number
  transformed: number
  load_result: {
    attempted: number
    inserted: number
    updated: number
    skipped: number
  }
  started_at?: string
  finished_at?: string
  duration_seconds: number
  extract_time: number
  transform_time: number
  load_time: number
  total_time?: number
  success: boolean
  errors: string[]
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently"
  const cleanStr = String(dateString).trim()
  const utcStr =
    cleanStr.endsWith("Z") || /[+-]\d{2}(:\d{2})?$/.test(cleanStr)
      ? cleanStr
      : `${cleanStr}Z`
  const date = new Date(utcStr)
  if (Number.isNaN(date.getTime())) return "Recently"

  const now = new Date()
  const diffSec = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  )

  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatFutureOrRelativeTime(dateString?: string): string {
  if (!dateString) return "—"
  const cleanStr = String(dateString).trim()
  const utcStr =
    cleanStr.endsWith("Z") || /[+-]\d{2}(:\d{2})?$/.test(cleanStr)
      ? cleanStr
      : `${cleanStr}Z`
  const date = new Date(utcStr)
  if (Number.isNaN(date.getTime())) return "—"

  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSec = Math.floor(Math.abs(diffMs) / 1000)

  if (diffMs > 0) {
    if (diffSec < 60) return "In < 1 min"
    const min = Math.floor(diffSec / 60)
    if (min < 60) return `In ${min}m`
    const hours = Math.floor(min / 60)
    if (hours < 24) {
      const remainingMin = min % 60
      return remainingMin > 0 ? `In ${hours}h ${remainingMin}m` : `In ${hours}h`
    }
    const days = Math.floor(hours / 24)
    return `In ${days}d`
  }

  if (diffSec < 60) return "Just now"
  const min = Math.floor(diffSec / 60)
  if (min < 60) return `${min}m ago`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatExactDateTime(dateString?: string): string {
  if (!dateString) return "—"
  const cleanStr = String(dateString).trim()
  const utcStr =
    cleanStr.endsWith("Z") || /[+-]\d{2}(:\d{2})?$/.test(cleanStr)
      ? cleanStr
      : `${cleanStr}Z`
  const date = new Date(utcStr)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// ─── Main Admin Control Page Component ────────────────────────────────────────

function AdminControlPage() {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const queryClient = useQueryClient()

  // 1. ETL Configuration state
  const [limit, setLimit] = useState<string>("")
  const [loadMode, setLoadMode] = useState<LoadMode>("upsert")
  const [dryRun, setDryRun] = useState<boolean>(false)
  const [persistRun, setPersistRun] = useState<boolean>(true)
  const [lastReport, setLastReport] = useState<DetailedETLReport | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  // 2. Scheduler State
  const [intervalInput, setIntervalInput] = useState<string>("86400")

  // 3. Habitability Thresholds State (Loaded from stored preferences)
  const initialThresholds = getStoredThresholds()
  const [scoreThreshold, setScoreThreshold] = useState<number>(
    initialThresholds.score,
  )
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(
    initialThresholds.confidence,
  )

  // Fetch initial last run report from DB
  const { data: initialLastRun } = useQuery({
    queryKey: ["last-etl-run"],
    queryFn: () => EtlService.readLastEtlRun(),
  })

  useEffect(() => {
    const r = (initialLastRun as any)?.report
    if (r && !lastReport) {
      setLastReport({
        id: r.id,
        extracted: r.extracted ?? 0,
        transformed: r.transformed ?? 0,
        load_result: {
          attempted:
            r.load_result?.attempted ??
            (r.load_result?.inserted ?? 0) +
              (r.load_result?.updated ?? 0) +
              (r.load_result?.skipped ?? 0),
          inserted: r.load_result?.inserted ?? 0,
          updated: r.load_result?.updated ?? 0,
          skipped: r.load_result?.skipped ?? 0,
        },
        started_at: r.started_at,
        finished_at: r.finished_at,
        duration_seconds: r.total_time ?? r.duration_seconds ?? 0,
        total_time: r.total_time ?? r.duration_seconds ?? 0,
        extract_time: r.extract_time ?? 0,
        transform_time: r.transform_time ?? 0,
        load_time: r.load_time ?? 0,
        success: r.success ?? r.errors?.length === 0,
        errors: r.errors
          ? typeof r.errors === "string"
            ? r.errors.trim()
              ? [r.errors]
              : []
            : r.errors
          : [],
      })
    }
  }, [initialLastRun, lastReport])

  // Fetch Scheduler Status
  const { data: schedulerData, refetch: refetchScheduler } = useQuery({
    queryKey: ["scheduler-status"],
    queryFn: () => SchedulerService.readSchedulerStatus(),
    refetchInterval: 10000,
  })

  const scheduler = (schedulerData as any)?.scheduler
  const nextRunTimestamp = scheduler?.next_run_time || scheduler?.next_run

  useEffect(() => {
    if (scheduler?.interval_seconds) {
      setIntervalInput(String(scheduler.interval_seconds))
    }
  }, [scheduler?.interval_seconds])

  // Fetch Stats with custom habitability thresholds
  const { data: customStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-exoplanet-stats", scoreThreshold, confidenceThreshold],
    queryFn: () =>
      ExoplanetsService.getExoplanetStats({
        habitabilityScoreThreshold: scoreThreshold,
        habitabilityConfidenceThreshold: confidenceThreshold,
      }),
  })

  // ─── Mutations ───────────────────────────────────────────────────────────────

  // ETL Run Mutation
  const etlMutation = useMutation({
    mutationFn: () => {
      const parsedLimit = limit.trim() ? Number(limit.trim()) : undefined
      return EtlService.runExoplanetEtl({
        requestBody: {
          limit: parsedLimit && parsedLimit > 0 ? parsedLimit : undefined,
          load_mode: loadMode,
          dry_run: dryRun,
          persist_run: persistRun,
        },
      })
    },
    onSuccess: (data: any) => {
      const r = data?.report
      if (r) {
        setLastReport({
          id: r.id,
          extracted: r.extracted ?? 0,
          transformed: r.transformed ?? 0,
          load_result: {
            attempted:
              r.load_result?.attempted ??
              (r.load_result?.inserted ?? 0) +
                (r.load_result?.updated ?? 0) +
                (r.load_result?.skipped ?? 0),
            inserted: r.load_result?.inserted ?? 0,
            updated: r.load_result?.updated ?? 0,
            skipped: r.load_result?.skipped ?? 0,
          },
          started_at: r.started_at,
          finished_at: r.finished_at,
          duration_seconds: r.duration_seconds ?? r.total_time ?? 0,
          total_time: r.total_time ?? r.duration_seconds ?? 0,
          extract_time: r.extract_time ?? 0,
          transform_time: r.transform_time ?? 0,
          load_time: r.load_time ?? 0,
          success: r.success ?? r.errors?.length === 0,
          errors: r.errors
            ? typeof r.errors === "string"
              ? r.errors
                ? [r.errors]
                : []
              : r.errors
            : [],
        })
      }
      queryClient.invalidateQueries({ queryKey: ["exoplanets"] })
      queryClient.invalidateQueries({ queryKey: ["exoplanet-stats"] })
      queryClient.invalidateQueries({ queryKey: ["admin-exoplanet-stats"] })
      queryClient.invalidateQueries({ queryKey: ["last-etl-run"] })
      setRunError(null)
    },
    onError: (err: any) => {
      let errorMsg = "ETL execution failed."
      if (
        err?.status === 429 ||
        err?.body?.detail?.toString().includes("1 per 1 minute")
      ) {
        errorMsg =
          "Rate limit reached: The ETL pipeline can only be run once per minute."
      } else if (err?.body?.detail) {
        errorMsg = String(err.body.detail)
      } else if (err?.message) {
        errorMsg = err.message
      }
      setRunError(errorMsg)
    },
  })

  // Start Scheduler Mutation
  const startSchedulerMutation = useMutation({
    mutationFn: () => SchedulerService.startSchedulerRoute(),
    onSuccess: () => {
      refetchScheduler()
      showSuccessToast("Scheduler started successfully")
    },
    onError: (err: any) => {
      showErrorToast(err?.body?.detail || "Could not start scheduler")
    },
  })

  // Stop Scheduler Mutation
  const stopSchedulerMutation = useMutation({
    mutationFn: () => SchedulerService.stopSchedulerRoute(),
    onSuccess: () => {
      refetchScheduler()
      showSuccessToast("Scheduler stopped")
    },
    onError: (err: any) => {
      showErrorToast(err?.body?.detail || "Could not stop scheduler")
    },
  })

  // Update Scheduler Interval Mutation
  const updateIntervalMutation = useMutation({
    mutationFn: (seconds: number) =>
      SchedulerService.updateScheduler({
        requestBody: { interval_seconds: seconds },
      }),
    onSuccess: () => {
      refetchScheduler()
      showSuccessToast("Scheduler interval updated successfully")
    },
    onError: (err: any) => {
      showErrorToast(err?.body?.detail || "Failed to update interval")
    },
  })

  // Purge Cache Mutation
  const purgeCacheMutation = useMutation({
    mutationFn: () =>
      __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/utils/purge-cache/",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      showSuccessToast("System cache (Redis & In-memory) purged successfully")
    },
    onError: (err: any) => {
      showErrorToast(err?.body?.detail || "Failed to purge cache")
    },
  })

  const handleApplyThresholds = () => {
    saveStoredThresholds(scoreThreshold, confidenceThreshold)
    queryClient.invalidateQueries({ queryKey: ["exoplanet-stats"] })
    queryClient.invalidateQueries({ queryKey: ["admin-exoplanet-stats"] })
    showSuccessToast("Habitability thresholds applied to Dashboard & Stats")
  }

  const handleResetThresholds = () => {
    setScoreThreshold(DEFAULT_HABITABILITY_SCORE_THRESHOLD)
    setConfidenceThreshold(DEFAULT_HABITABILITY_CONFIDENCE_THRESHOLD)
    saveStoredThresholds(
      DEFAULT_HABITABILITY_SCORE_THRESHOLD,
      DEFAULT_HABITABILITY_CONFIDENCE_THRESHOLD,
    )
    queryClient.invalidateQueries({ queryKey: ["exoplanet-stats"] })
    queryClient.invalidateQueries({ queryKey: ["admin-exoplanet-stats"] })
    showSuccessToast("Thresholds reset to default (80.0 / 80%)")
  }

  const isRunningETL = etlMutation.isPending

  return (
    <div className="relative flex min-h-full flex-col gap-6 pb-12">
      <SpaceBackground />

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sliders size={13} className="text-cyan-400" />
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              System Control
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Admin Control Center
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Orchestrate live ETL ingestion, automate synchronization schedules,
            tune astrophysical habitability thresholds, and purge system cache.
          </p>
        </div>

        {/* Global Purge Cache Quick Action */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => purgeCacheMutation.mutate()}
            disabled={purgeCacheMutation.isPending}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300 backdrop-blur-md transition-all hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-200 active:scale-95 disabled:opacity-50"
            title="Purge Redis and in-memory cache"
          >
            {purgeCacheMutation.isPending ? (
              <Loader2 size={14} className="animate-spin text-red-400" />
            ) : (
              <Trash2 size={14} className="text-red-400" />
            )}
            <span>Purge Cache</span>
          </button>
        </div>
      </div>

      {/* ─── Top Control Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: ETL Pipeline Ingestion & Complete Live Report (7 Cols)     */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Card: Launch Controls */}
          <div
            className="flex flex-col gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 30, 0.85) 100%)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Database size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    ETL Pipeline Trigger
                  </h2>
                  <p className="text-xs text-slate-400">
                    Extract NASA Exoplanet Archive, transform, classify & load
                    into database
                  </p>
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
                  className="text-xs font-medium text-slate-300 block mb-1.5"
                >
                  Record Ingestion Limit
                </label>
                <input
                  id="record-limit-input"
                  type="number"
                  placeholder="All records (no limit)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  disabled={isRunningETL}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Leave empty to extract the full catalog.
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
                  onChange={(e) => setLoadMode(e.target.value as LoadMode)}
                  disabled={isRunningETL}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                >
                  <option value="upsert">
                    Upsert (Insert new & update existing)
                  </option>
                  <option value="append">
                    Append (Insert new records only)
                  </option>
                  <option value="replace">
                    Replace (Clear table & reload catalog)
                  </option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Strategy for handling record collisions.
                </span>
              </div>
            </div>

            {/* Checkboxes for Dry-Run & Persist */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  disabled={isRunningETL}
                  className="rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Dry Run (Skip database mutations)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={persistRun}
                  onChange={(e) => setPersistRun(e.target.checked)}
                  disabled={isRunningETL}
                  className="rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
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
              onClick={() => etlMutation.mutate()}
              disabled={isRunningETL}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-xs font-bold text-slate-950 transition-all hover:from-cyan-400 hover:to-blue-400 active:scale-98 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
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

          {/* Card: Complete Ingestion Execution Report (All ETLRun model fields) */}
          <div
            className="flex flex-col gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 30, 0.85) 100%)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  Execution Report
                </h3>
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
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-900/60 p-4">
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
                      {(
                        lastReport.total_time ?? lastReport.duration_seconds
                      ).toFixed(2)}
                      s
                    </span>
                  </div>
                </div>

                {/* Timestamps Row */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/40 px-3 py-2">
                    <span className="text-slate-400">Started At:</span>
                    <span className="font-mono text-slate-200">
                      {formatExactDateTime(lastReport.started_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/40 px-3 py-2">
                    <span className="text-slate-400">Finished At:</span>
                    <span className="font-mono text-slate-200">
                      {formatExactDateTime(lastReport.finished_at)}
                    </span>
                  </div>
                </div>

                {/* Ingestion & Transformation Counts */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                    <span className="text-[11px] text-slate-400">
                      Extracted
                    </span>
                    <p className="mt-1 text-lg font-bold text-white font-mono">
                      {lastReport.extracted.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                    <span className="text-[11px] text-slate-400">
                      Transformed
                    </span>
                    <p className="mt-1 text-lg font-bold text-white font-mono">
                      {lastReport.transformed.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                    <span className="text-[11px] text-slate-400">
                      Attempted
                    </span>
                    <p className="mt-1 text-lg font-bold text-slate-300 font-mono">
                      {lastReport.load_result.attempted.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                    <span className="text-[11px] text-slate-400">
                      Inserted (New)
                    </span>
                    <p className="mt-1 text-lg font-bold text-emerald-400 font-mono">
                      +{lastReport.load_result.inserted.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Database Load Results Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3 text-xs">
                    <span className="text-slate-400">Updated Records:</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {lastReport.load_result.updated.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3 text-xs">
                    <span className="text-slate-400">Skipped Records:</span>
                    <span className="font-mono text-slate-400 font-bold">
                      {lastReport.load_result.skipped.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Phase Latency Breakdown */}
                <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/30 p-3.5">
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
                No ingestion report available. Trigger a pipeline above to
                generate a real-time report.
              </p>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 & 3: Scheduler Automation & Habitability Parameters (5 Cols) */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Card: Scheduler Automation */}
          <div
            className="flex flex-col gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 30, 0.85) 100%)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Timer size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Scheduler Automation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Autonomous background synchronization cron
                  </p>
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
                  onChange={(e) => setIntervalInput(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const secs = Number(intervalInput)
                    if (secs > 0) updateIntervalMutation.mutate(secs)
                  }}
                  disabled={updateIntervalMutation.isPending}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/15 px-3.5 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/25 active:scale-95 transition-all disabled:opacity-50"
                >
                  Apply
                </button>
              </div>

              {/* Interval Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { label: "1h", secs: 3600 },
                  { label: "6h", secs: 21600 },
                  { label: "12h", secs: 43200 },
                  { label: "24h", secs: 86400 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setIntervalInput(String(preset.secs))
                      updateIntervalMutation.mutate(preset.secs)
                    }}
                    className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white"
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
                  onClick={() => stopSchedulerMutation.mutate()}
                  disabled={stopSchedulerMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
                >
                  <Pause size={14} />
                  <span>Stop Scheduler</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startSchedulerMutation.mutate()}
                  disabled={startSchedulerMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-98 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  <Play size={14} />
                  <span>Start Scheduler</span>
                </button>
              )}
            </div>
          </div>

          {/* Card: Habitability Thresholds & Criteria Tuning */}
          <div
            className="flex flex-col gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 30, 0.85) 100%)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Telescope size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Habitability Thresholds
                  </h2>
                  <p className="text-xs text-slate-400">
                    Astrobiological filtering parameters for planetary
                    habitability
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetThresholds}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
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
                  <span className="text-slate-300">
                    Score Cutoff (0 - 100):
                  </span>
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
                  onChange={(e) => setScoreThreshold(Number(e.target.value))}
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
                    setConfidenceThreshold(Number(e.target.value))
                  }
                  className="accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Real-time Resulting Candidates Preview */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-3.5 text-xs">
              <div className="flex flex-col">
                <span className="text-slate-400">
                  Potentially Habitable Worlds:
                </span>
                <span className="text-[11px] text-slate-500">
                  Matching active thresholds
                </span>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {statsLoading
                  ? "..."
                  : (
                      customStats?.habitability?.potentially_habitable ?? 0
                    ).toLocaleString()}
              </span>
            </div>

            {/* Apply Thresholds to System Button */}
            <button
              type="button"
              onClick={handleApplyThresholds}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 active:scale-98 transition-all"
            >
              <Sparkles size={14} />
              <span>Apply Thresholds to System & Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
