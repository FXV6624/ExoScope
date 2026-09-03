import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Globe, Radio, RefreshCw, Telescope } from "lucide-react"
import { useState } from "react"

import {
  EtlService,
  type ExoplanetSortField,
  ExoplanetsService,
  type SortOrder,
} from "@/client"
import { DashStatCard } from "@/components/Dashboard/DashStatCard"
import { QuickActionsCard } from "@/components/Dashboard/QuickActionsCard"
import { RecentDiscoveriesSection } from "@/components/Dashboard/RecentDiscoveriesSection"
import {
  type PipelineReport,
  RecentPipelineCard,
} from "@/components/Dashboard/RecentPipelineCard"
import { ExoplanetStatsModal } from "@/components/Exoplanets/ExoplanetStatsModal"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { getStoredThresholds } from "@/utils"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — ExoScope" }],
  }),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

// ─── Dashboard Route ──────────────────────────────────────────────────────────

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

  const lastReport = (lastEtlData as { report?: PipelineReport } | undefined)
    ?.report

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
                Exo
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Scope
                </span>
              </>
            )}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 max-w-xl">
            Real-time exoplanet data processing, automated ETL ingestion
            pipeline, and deep catalog exploration.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-md transition-all hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-50 cursor-pointer"
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
        <RecentPipelineCard
          loggedIn={loggedIn}
          etlLoading={etlLoading}
          lastReport={lastReport}
        />

        {/* ─── Right Column: Latest Discoveries ─── */}
        <RecentDiscoveriesSection
          recentLoading={recentLoading}
          planets={recentPlanetsData?.data}
        />
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
export default Dashboard
