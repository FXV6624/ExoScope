import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  LogIn,
  Play,
  Radio,
  RefreshCw,
  Sparkles,
  Telescope,
  XCircle,
  Zap,
} from "lucide-react"
import { useState } from "react"

import {
  EtlService,
  type ExoplanetSortField,
  ExoplanetsService,
  type SortOrder,
} from "@/client"
import { ExoplanetStatsModal } from "@/components/Exoplanets/ExoplanetStatsModal"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { getStoredThresholds } from "@/utils"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — Data Engineering Platform" }],
  }),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently"
  const cleanStr = String(dateString).trim()
  // Ensure naive UTC timestamps from the database are parsed in UTC
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

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function DashStatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: "cyan" | "emerald" | "purple"
}) {
  const accentStyles = {
    cyan: {
      border: "border-cyan-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    emerald: {
      border: "border-emerald-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    purple: {
      border: "border-purple-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  }

  const selectedAccent = accent ? accentStyles[accent] : accentStyles.cyan

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 backdrop-blur-xl transition-all duration-300 ${
        accent ? selectedAccent.border : "border-white/10"
      } ${selectedAccent.glow} border`}
      style={{
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 30, 0.85) 100%)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ${selectedAccent.iconBg}`}
        >
          <Icon size={17} />
        </span>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-400 truncate">{sub}</p>}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  )
}

// ─── Compact Quick Actions Card ────────────────────────────────────────────────

function QuickActionsCard({
  totalPlanets,
  isLoading,
  loggedIn,
  onOpenStats,
}: {
  totalPlanets: number
  isLoading?: boolean
  loggedIn: boolean
  onOpenStats: () => void
}) {
  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 border border-white/10 hover:border-cyan-500/30"
      style={{
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 30, 0.85) 100%)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Quick Actions
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
          <Zap size={14} />
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        <RouterLink
          to="/exoplanets"
          className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-500/15 hover:text-cyan-200 no-underline"
        >
          <div className="flex items-center gap-2">
            <Telescope size={13} />
            <span>
              Catalog (
              {isLoading ? "..." : (totalPlanets ?? 0).toLocaleString()})
            </span>
          </div>
          <ArrowRight size={12} className="opacity-60" />
        </RouterLink>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenStats}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-slate-900/60 px-2 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
          >
            <BarChart3 size={13} className="text-purple-400" />
            <span>Analytics</span>
          </button>

          {loggedIn ? (
            <RouterLink
              to="/admin/etl"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-slate-900/60 px-2 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white no-underline"
            >
              <Play size={13} className="text-emerald-400" />
              <span>ETL Run</span>
            </RouterLink>
          ) : (
            <RouterLink
              to="/login"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-slate-900/60 px-2 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white no-underline"
            >
              <LogIn size={13} className="text-amber-400" />
              <span>Sign In</span>
            </RouterLink>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

function Dashboard() {
  const { user: currentUser } = useAuth()
  const loggedIn = isLoggedIn()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)

  const firstName =
    currentUser?.full_name?.split(" ")[0] || currentUser?.email?.split("@")[0]
  const greeting = getTimeOfDayGreeting()

  const thresholds = getStoredThresholds()

  // 1. Fetch Aggregated Statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["exoplanet-stats"],
    queryFn: () =>
      ExoplanetsService.getExoplanetStats({
        habitabilityScoreThreshold: thresholds.score,
        habitabilityConfidenceThreshold: thresholds.confidence,
      }),
  })

  // 2. Fetch Latest ETL Run Report (Recent Activity)
  const { data: lastEtlData, isLoading: etlLoading } = useQuery({
    queryKey: ["last-etl-run"],
    queryFn: () => EtlService.readLastEtlRun(),
    enabled: loggedIn,
    staleTime: 1000 * 30, // 30s
  })

  // 3. Fetch Recent Discoveries from DB
  const { data: recentPlanetsData, isLoading: recentLoading } = useQuery({
    queryKey: ["recent-exoplanets"],
    queryFn: () =>
      ExoplanetsService.readExoplanets({
        limit: 4,
        sortBy: "discovery_year" as ExoplanetSortField,
        order: "desc" as SortOrder,
      }),
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["exoplanet-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["recent-exoplanets"] }),
      loggedIn
        ? queryClient.invalidateQueries({ queryKey: ["last-etl-run"] })
        : Promise.resolve(),
    ])
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const totalPlanets = stats?.total ?? 0
  const habitableCount = stats?.habitability?.potentially_habitable ?? 0

  // Calculate primary discovery method
  const dominantMethodEntry = stats?.by_method
    ? Object.entries(stats.by_method).sort((a, b) => b[1] - a[1])[0]
    : null
  const dominantMethodPct =
    dominantMethodEntry && totalPlanets > 0
      ? ((dominantMethodEntry[1] / totalPlanets) * 100).toFixed(2)
      : null

  const lastReport = (lastEtlData as any)?.report

  return (
    <div className="relative flex min-h-full flex-col gap-6 pb-12">
      <SpaceBackground />

      {/* ─── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {currentUser ? (
              <>
                {greeting},{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {firstName}
                </span>
              </>
            ) : (
              <>
                Data Engineering{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Platform
                </span>
              </>
            )}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 max-w-xl">
            Real-time planetary data processing, automated ETL ingestion
            pipeline, and deep astrophysical catalog exploration.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-md transition-all hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin text-cyan-400" : ""}
            />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* ─── Top Metrics & Quick Actions (4 Columns) ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashStatCard
          label="Total Exoplanets"
          value={
            statsLoading
              ? "—"
              : typeof totalPlanets === "number"
                ? totalPlanets.toLocaleString()
                : totalPlanets
          }
          sub="Verified in NASA Archive"
          icon={Globe}
          accent="cyan"
        />
        <DashStatCard
          label="Habitable Worlds"
          value={
            statsLoading
              ? "—"
              : typeof habitableCount === "number"
                ? habitableCount.toLocaleString()
                : habitableCount
          }
          sub={`Score ≥ ${thresholds.score.toFixed(0)} | Conf ≥ ${(thresholds.confidence * 100).toFixed(0)}%`}
          icon={Telescope}
          accent="emerald"
        />
        <DashStatCard
          label="Leading Method"
          value={
            statsLoading
              ? "—"
              : dominantMethodEntry
                ? dominantMethodEntry[0]
                : "Transit"
          }
          sub={
            dominantMethodPct
              ? `${dominantMethodPct}% of catalog discoveries`
              : "Primary detection technique"
          }
          icon={Radio}
          accent="purple"
        />
        <QuickActionsCard
          totalPlanets={totalPlanets}
          isLoading={statsLoading}
          loggedIn={loggedIn}
          onOpenStats={() => setShowStatsModal(true)}
        />
      </div>

      {/* ─── Main Content (2 Balanced Columns) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ─── Left Column: Recent Pipeline Activity ─── */}
        <div
          className="group relative flex flex-col justify-between gap-5 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 h-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(10, 15, 30, 0.85) 100%)",
          }}
        >
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
                            Duration:{" "}
                            {lastReport.total_time?.toFixed(2) ?? "< 0.1"}s
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Execution Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                      <span className="text-[11px] text-slate-400">
                        Extracted
                      </span>
                      <p className="mt-1 text-lg font-bold text-white font-mono">
                        {lastReport.extracted?.toLocaleString() ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                      <span className="text-[11px] text-slate-400">
                        Transformed
                      </span>
                      <p className="mt-1 text-lg font-bold text-white font-mono">
                        {lastReport.transformed?.toLocaleString() ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                      <span className="text-[11px] text-slate-400">
                        Inserted
                      </span>
                      <p className="mt-1 text-lg font-bold text-emerald-400 font-mono">
                        +
                        {lastReport.load_result?.inserted?.toLocaleString() ??
                          0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                      <span className="text-[11px] text-slate-400">
                        Updated
                      </span>
                      <p className="mt-1 text-lg font-bold text-cyan-400 font-mono">
                        ~
                        {lastReport.load_result?.updated?.toLocaleString() ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Stage Timing Breakdown */}
                  <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/30 p-3.5">
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
                      The database has not recorded recent ETL pipeline
                      executions. Trigger your first ingest from the admin
                      control panel.
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
                    Log in with your administrator credentials to view real-time
                    ETL runs, synchronization history, and database mutation
                    benchmarks.
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

        {/* ─── Right Column: Latest Discoveries ─── */}
        <div
          className="relative flex flex-col justify-between gap-4 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl h-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(10, 15, 30, 0.85) 100%)",
          }}
        >
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  Latest Discoveries
                </h3>
              </div>
            </div>

            {recentLoading ? (
              <div className="flex flex-col gap-3 py-4 animate-pulse">
                <div className="h-14 w-full rounded-xl bg-white/5" />
                <div className="h-14 w-full rounded-xl bg-white/5" />
                <div className="h-14 w-full rounded-xl bg-white/5" />
                <div className="h-14 w-full rounded-xl bg-white/5" />
              </div>
            ) : recentPlanetsData?.data && recentPlanetsData.data.length > 0 ? (
              <div className="flex flex-col gap-3 pt-4">
                {recentPlanetsData.data.map((planet: any) => (
                  <RouterLink
                    key={planet.id}
                    to="/exoplanets/$id"
                    params={{ id: planet.id }}
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3.5 transition-all hover:border-cyan-500/30 hover:bg-slate-800/60 no-underline"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {planet.planet_name}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        Host: {planet.host_star || "Unknown Star"} • Discovered:{" "}
                        {planet.discovery_year || "—"}
                      </span>
                    </div>

                    <ChevronRight
                      size={15}
                      className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400 shrink-0"
                    />
                  </RouterLink>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                No exoplanets found in database.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Statistics Modal ─────────────────────────────────────────────────── */}
      {showStatsModal && stats && (
        <ExoplanetStatsModal
          stats={stats}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  )
}
