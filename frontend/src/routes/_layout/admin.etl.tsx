import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Database,
  Loader2,
  Play,
  RefreshCw,
  Sliders,
  Timer,
} from "lucide-react"
import { useState } from "react"

import { EtlService, type LoadMode } from "@/client"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import useCustomToast from "@/hooks/useCustomToast"

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_layout/admin/etl")({
  component: AdminETLPage,
  head: () => ({ meta: [{ title: "Admin — ETL Pipeline" }] }),
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailedETLReport {
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
  success: boolean
  errors: string[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string | number | null | undefined
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-none">
      <span className="text-xs text-space-muted">{label}</span>
      <span
        className={`text-sm font-medium ${
          highlight ? "text-space-accent" : "text-space-primary"
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-5"
      style={{
        background: "rgba(15, 25, 50, 0.6)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-space-accent" />
        <span className="text-xs uppercase tracking-widest text-space-accent">
          {title}
        </span>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}

type StageStatus = "pending" | "running" | "success" | "error"

function PipelineStage({
  label,
  duration,
  status,
}: {
  label: string
  duration?: number
  status: StageStatus
}) {
  const dot =
    status === "pending" ? (
      <div
        className="h-4 w-4 rounded-full shrink-0"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
    ) : status === "running" ? (
      <Loader2 size={16} className="animate-spin text-cyan-400 shrink-0" />
    ) : status === "success" ? (
      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
    ) : (
      <AlertCircle size={16} className="text-red-400 shrink-0" />
    )

  const labelColor =
    status === "pending"
      ? "#64748b"
      : status === "running"
        ? "#22d3ee"
        : status === "success"
          ? "#f1f5f9"
          : "#f87171"

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-none">
      <div className="flex items-center gap-3">
        {dot}
        <span className="text-sm" style={{ color: labelColor }}>
          {label}
        </span>
      </div>
      {duration != null && (
        <span className="text-xs text-space-muted">
          {duration > 0 ? `${duration.toFixed(2)}s` : "< 0.01s"}
        </span>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminETLPage() {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const queryClient = useQueryClient()

  // Configuration options matching backend ETLConfig
  const [limit, setLimit] = useState<string>("")
  const [loadMode, setLoadMode] = useState<LoadMode>("upsert")
  const [dryRun, setDryRun] = useState<boolean>(false)
  const [persistRun, setPersistRun] = useState<boolean>(true)

  const [lastReport, setLastReport] = useState<DetailedETLReport | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  const mutation = useMutation({
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
          extracted: r.extracted ?? 0,
          transformed: r.transformed ?? 0,
          load_result: {
            attempted: r.load_result?.attempted ?? 0,
            inserted: r.load_result?.inserted ?? 0,
            updated: r.load_result?.updated ?? 0,
            skipped: r.load_result?.skipped ?? 0,
          },
          started_at: r.started_at,
          finished_at: r.finished_at,
          duration_seconds: r.duration_seconds ?? 0,
          extract_time: r.extract_time ?? 0,
          transform_time: r.transform_time ?? 0,
          load_time: r.load_time ?? 0,
          success: r.success ?? r.errors?.length === 0,
          errors: r.errors ?? [],
        })
      }
      queryClient.invalidateQueries({ queryKey: ["exoplanets"] })
      queryClient.invalidateQueries({ queryKey: ["exoplanet-stats"] })
      queryClient.invalidateQueries({ queryKey: ["exoplanet"] })
      setRunError(null)
      showSuccessToast("ETL Pipeline executed successfully")
    },
    onError: (err: any) => {
      let errorMsg = "ETL execution failed."
      if (
        err?.status === 429 ||
        err?.body?.detail?.toString().includes("1 per 1 minute")
      ) {
        errorMsg =
          "Rate limit reached: The ETL pipeline can only be run once per minute. Please wait a moment before running again."
      } else if (err?.message === "Network Error") {
        errorMsg =
          "Network Error: The ETL request timed out or was interrupted by the server. If executing a full pipeline without limit, try specifying a smaller record limit or wait 1 minute before retrying."
      } else if (Array.isArray(err?.body?.detail)) {
        errorMsg = err.body.detail
          .map((d: any) => d.msg || JSON.stringify(d))
          .join(", ")
      } else if (err?.body?.detail) {
        errorMsg = String(err.body.detail)
      } else if (err?.message) {
        errorMsg = err.message
      }
      setRunError(errorMsg)
      showErrorToast(errorMsg)
    },
  })

  const isRunning = mutation.isPending

  // Derive per-stage status from the last report using timing fields + errors.
  // Using _time > 0 to know if a stage actually ran (avoids false negatives on
  // legitimate empty extractions where extracted/transformed = 0 by design).
  const stageStatuses: {
    preflight: StageStatus
    extract: StageStatus
    transform: StageStatus
    load: StageStatus
  } = (() => {
    if (isRunning) {
      return {
        preflight: "running",
        extract: "pending",
        transform: "pending",
        load: "pending",
      }
    }
    if (!lastReport) {
      return {
        preflight: "pending",
        extract: "pending",
        transform: "pending",
        load: "pending",
      }
    }

    const hasErrors = lastReport.errors.length > 0
    const extractRan = lastReport.extract_time > 0
    const transformRan = lastReport.transform_time > 0
    const loadRan = lastReport.load_time > 0

    // Pre-flight: failed if there are errors but extract never even started
    const preflight: StageStatus = !extractRan ? "error" : "success"

    // Extract: ran and failed → error; ran and no errors → success; never ran → pending
    const extract: StageStatus =
      preflight === "error"
        ? "pending"
        : !extractRan
          ? "pending"
          : hasErrors && !transformRan
            ? "error"
            : "success"

    // Transform: ran and failed → error; ran ok → success; never ran → pending
    const transform: StageStatus =
      extract === "pending" || extract === "error"
        ? "pending"
        : !transformRan
          ? "pending"
          : hasErrors && !loadRan
            ? "error"
            : "success"

    // Load: ran and failed → error; ran ok → success; never ran → pending
    const load: StageStatus =
      transform === "pending" || transform === "error"
        ? "pending"
        : !loadRan
          ? "pending"
          : hasErrors
            ? "error"
            : "success"

    return { preflight, extract, transform, load }
  })()

  return (
    <div className="relative flex min-h-full flex-col gap-6">
      <SpaceBackground />

      <div className="relative flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-space-muted">
            <span>Admin</span>
            <ChevronRight size={12} />
            <span className="text-space-accent">ETL</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-space-primary">
            ETL Pipeline Control
          </h1>
          <p className="mt-1 text-sm text-space-muted">
            Extract exoplanet records from NASA Archive, transform & enrich, and
            load into PostgreSQL.
          </p>
        </div>

        {/* Configuration Card */}
        <div
          className="flex flex-col gap-4 rounded-2xl p-5"
          style={{
            background: "rgba(15, 25, 50, 0.7)",
            border: "1px solid rgba(34,211,238,0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-space-accent" />
            <span className="text-xs uppercase tracking-widest text-space-accent">
              Execution Settings
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Record Limit */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-space-muted">Record Limit</span>
              <input
                type="number"
                min={1}
                placeholder="All records (no limit)"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                disabled={isRunning}
                className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none placeholder:text-slate-600"
                style={{
                  background: "rgba(6, 13, 31, 0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>

            {/* Load Mode */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-space-muted">Load Mode</span>
              <select
                value={loadMode}
                onChange={(e) => setLoadMode(e.target.value as LoadMode)}
                disabled={isRunning}
                className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none"
                style={{
                  background: "rgba(6, 13, 31, 0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <option value="upsert">
                  UPSERT — Insert new records or update existing ones
                </option>
                <option value="insert">
                  INSERT — Insert only new records, skip duplicates
                </option>
                <option value="reload">
                  RELOAD — Delete all records and insert new data
                </option>
              </select>
            </div>

            {/* Dry Run Toggle */}
            <div className="flex flex-col gap-1.5 justify-center">
              <span className="text-xs text-space-muted">Simulation</span>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-space-subtle">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  disabled={isRunning}
                  className="rounded border-slate-700"
                />
                Dry Run (Do not commit DB)
              </label>
            </div>

            {/* Persist Run Toggle */}
            <div className="flex flex-col gap-1.5 justify-center">
              <span className="text-xs text-space-muted">Telemetry</span>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-space-subtle">
                <input
                  type="checkbox"
                  checked={persistRun}
                  onChange={(e) => setPersistRun(e.target.checked)}
                  disabled={isRunning}
                  className="rounded border-slate-700"
                />
                Persist Run Metadata
              </label>
            </div>
          </div>

          {/* Run button */}
          <div className="flex justify-end pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: isRunning
                  ? "rgba(34,211,238,0.08)"
                  : "rgba(34,211,238,0.2)",
                border: "1px solid rgba(34,211,238,0.4)",
                color: isRunning ? "#64748b" : "#22d3ee",
              }}
            >
              {isRunning ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              {isRunning ? "Executing Pipeline..." : "Run ETL"}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {runError && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: "rgba(248, 113, 113, 0.08)",
              border: "1px solid rgba(248,113,113,0.3)",
            }}
          >
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{runError}</p>
          </div>
        )}

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Pipeline stages */}
          <SectionCard title="Pipeline Stages" icon={RefreshCw}>
            <PipelineStage
              label="Pre-flight Checks"
              status={stageStatuses.preflight}
            />
            <PipelineStage
              label="Extract"
              duration={lastReport?.extract_time}
              status={stageStatuses.extract}
            />
            <PipelineStage
              label="Transform & Enrich"
              duration={lastReport?.transform_time}
              status={stageStatuses.transform}
            />
            <PipelineStage
              label="Load"
              duration={lastReport?.load_time}
              status={stageStatuses.load}
            />
          </SectionCard>

          {/* Execution Overview */}
          <SectionCard title="Execution Overview" icon={Timer}>
            <InfoRow
              label="Status"
              value={
                lastReport == null
                  ? "Awaiting execution"
                  : lastReport.success
                    ? "✓ Success"
                    : "✕ Error"
              }
              highlight={lastReport?.success}
            />
            <InfoRow
              label="Total Duration"
              value={
                lastReport?.duration_seconds != null
                  ? `${lastReport.duration_seconds.toFixed(2)}s`
                  : undefined
              }
            />
            <InfoRow
              label="Extract Duration"
              value={
                lastReport?.extract_time != null
                  ? `${lastReport.extract_time.toFixed(2)}s`
                  : undefined
              }
            />
            <InfoRow
              label="Transform Duration"
              value={
                lastReport?.transform_time != null
                  ? `${lastReport.transform_time.toFixed(2)}s`
                  : undefined
              }
            />
            <InfoRow
              label="Load Duration"
              value={
                lastReport?.load_time != null
                  ? `${lastReport.load_time.toFixed(2)}s`
                  : undefined
              }
            />
            <InfoRow
              label="Started At"
              value={
                lastReport?.started_at
                  ? new Date(lastReport.started_at).toLocaleString()
                  : undefined
              }
            />
            <InfoRow
              label="Finished At"
              value={
                lastReport?.finished_at
                  ? new Date(lastReport.finished_at).toLocaleString()
                  : undefined
              }
            />
          </SectionCard>

          {/* Database Load Results */}
          <SectionCard title="Database Load Results" icon={Database}>
            <InfoRow
              label="Records Extracted"
              value={lastReport?.extracted?.toLocaleString()}
            />
            <InfoRow
              label="Records Transformed"
              value={lastReport?.transformed?.toLocaleString()}
            />
            <InfoRow
              label="Records Attempted"
              value={lastReport?.load_result.attempted?.toLocaleString()}
              highlight
            />
            <InfoRow
              label="Inserted"
              value={lastReport?.load_result.inserted?.toLocaleString()}
            />
            <InfoRow
              label="Updated"
              value={lastReport?.load_result.updated?.toLocaleString()}
            />
            <InfoRow
              label="Skipped"
              value={lastReport?.load_result.skipped?.toLocaleString()}
            />
          </SectionCard>
        </div>

        {/* Errors list if any */}
        {lastReport && lastReport.errors.length > 0 && (
          <div
            className="flex flex-col gap-2 rounded-2xl p-4"
            style={{
              background: "rgba(248, 113, 113, 0.08)",
              border: "1px solid rgba(248,113,113,0.3)",
            }}
          >
            <span className="text-xs uppercase tracking-widest text-red-400 font-semibold">
              Execution Errors ({lastReport.errors.length})
            </span>
            <div className="flex flex-col gap-1">
              {lastReport.errors.map((err, idx) => (
                <p key={idx} className="text-xs text-red-300">
                  • {err}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
