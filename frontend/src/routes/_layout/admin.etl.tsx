import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import {
  type ApiError,
  EtlService,
  ExoplanetsService,
  type LoadMode,
  SchedulerService,
} from "@/client"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request as __request } from "@/client/core/request"
import { EtlExecutionReportCard } from "@/components/Admin/ETL/EtlExecutionReportCard"
import { EtlHeader } from "@/components/Admin/ETL/EtlHeader"
import { EtlLaunchCard } from "@/components/Admin/ETL/EtlLaunchCard"
import { EtlSchedulerCard } from "@/components/Admin/ETL/EtlSchedulerCard"
import { EtlThresholdsCard } from "@/components/Admin/ETL/EtlThresholdsCard"
import type { DetailedETLReport } from "@/components/Admin/ETL/types"
import { EtlHistoryModal } from "@/components/Exoplanets/EtlHistoryModal"
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
    meta: [{ title: "Admin Control Center — ExoScope" }],
  }),
})

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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false)

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
    const r = (initialLastRun as { report?: DetailedETLReport } | undefined)
      ?.report
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
            ? (r.errors as string).trim()
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

  const scheduler = (
    schedulerData as
      | {
          scheduler?: {
            running?: boolean
            interval_seconds?: number
            next_run_time?: string
            next_run?: string
          }
        }
      | undefined
  )?.scheduler
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
    onSuccess: (data) => {
      const r = (data as { report?: DetailedETLReport } | undefined)?.report
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
              ? (r.errors as string).trim()
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
      queryClient.invalidateQueries({ queryKey: ["all-etl-runs"] })
      setRunError(null)
    },
    onError: (err: ApiError | Error | unknown) => {
      const apiErr = err as ApiError
      let errorMsg = "ETL execution failed."
      if (
        apiErr?.status === 429 ||
        (apiErr?.body as { detail?: string })?.detail
          ?.toString()
          .includes("1 per 1 minute")
      ) {
        errorMsg =
          "Rate limit reached: The ETL pipeline can only be run once per minute."
      } else if ((apiErr?.body as { detail?: string })?.detail) {
        errorMsg = String((apiErr.body as { detail?: string }).detail)
      } else if (err instanceof Error) {
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
    onError: (err: ApiError | Error | unknown) => {
      const apiErr = err as ApiError
      showErrorToast(
        (apiErr?.body as { detail?: string })?.detail ||
          "Could not start scheduler",
      )
    },
  })

  // Stop Scheduler Mutation
  const stopSchedulerMutation = useMutation({
    mutationFn: () => SchedulerService.stopSchedulerRoute(),
    onSuccess: () => {
      refetchScheduler()
      showSuccessToast("Scheduler stopped")
    },
    onError: (err: ApiError | Error | unknown) => {
      const apiErr = err as ApiError
      showErrorToast(
        (apiErr?.body as { detail?: string })?.detail ||
          "Could not stop scheduler",
      )
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
    onError: (err: ApiError | Error | unknown) => {
      const apiErr = err as ApiError
      showErrorToast(
        (apiErr?.body as { detail?: string })?.detail ||
          "Failed to update interval",
      )
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
    onError: (err: ApiError | Error | unknown) => {
      const apiErr = err as ApiError
      showErrorToast(
        (apiErr?.body as { detail?: string })?.detail ||
          "Failed to purge cache",
      )
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
      <EtlHeader
        onPurgeCache={() => purgeCacheMutation.mutate()}
        isPurging={purgeCacheMutation.isPending}
      />

      {/* ─── Top Control Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SECTION 1: ETL Pipeline Ingestion & Complete Live Report (7 Cols) */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <EtlLaunchCard
            limit={limit}
            onLimitChange={setLimit}
            loadMode={loadMode}
            onLoadModeChange={setLoadMode}
            dryRun={dryRun}
            onDryRunChange={setDryRun}
            persistRun={persistRun}
            onPersistRunChange={setPersistRun}
            isRunningETL={isRunningETL}
            runError={runError}
            onRunETL={() => etlMutation.mutate()}
          />

          <EtlExecutionReportCard
            lastReport={lastReport}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
          />
        </div>

        {/* SECTION 2 & 3: Scheduler Automation & Habitability Parameters (5 Cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <EtlSchedulerCard
            scheduler={scheduler}
            nextRunTimestamp={nextRunTimestamp}
            intervalInput={intervalInput}
            onIntervalInputChange={setIntervalInput}
            onApplyInterval={(secs) => updateIntervalMutation.mutate(secs)}
            isUpdatingInterval={updateIntervalMutation.isPending}
            onStartScheduler={() => startSchedulerMutation.mutate()}
            isStarting={startSchedulerMutation.isPending}
            onStopScheduler={() => stopSchedulerMutation.mutate()}
            isStopping={stopSchedulerMutation.isPending}
          />

          <EtlThresholdsCard
            scoreThreshold={scoreThreshold}
            onScoreThresholdChange={setScoreThreshold}
            confidenceThreshold={confidenceThreshold}
            onConfidenceThresholdChange={setConfidenceThreshold}
            onReset={handleResetThresholds}
            onApply={handleApplyThresholds}
            habitableCount={
              customStats?.habitability?.potentially_habitable ?? 0
            }
            statsLoading={statsLoading}
          />
        </div>
      </div>

      <EtlHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  )
}
export default AdminControlPage
