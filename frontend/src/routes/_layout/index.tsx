import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Download,
  Globe,
  LayoutDashboard,
  Play,
  Telescope,
} from "lucide-react"

import { ExoplanetsService } from "@/client"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — Data Engineering Platform" }],
  }),
})

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
  accent?: boolean
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-5 transition-colors"
      style={{
        background: "rgba(15, 25, 50, 0.6)",
        border: `1px solid ${accent ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-space-muted">
          {label}
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: accent
              ? "rgba(34,211,238,0.12)"
              : "rgba(255,255,255,0.05)",
          }}
        >
          <Icon
            size={15}
            className={accent ? "text-space-accent" : "text-space-subtle"}
          />
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-space-primary">
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-space-muted">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Quick Action Button ───────────────────────────────────────────────────────

function QuickAction({
  label,
  icon: Icon,
  to,
}: {
  label: string
  icon: React.ElementType
  to: string
}) {
  return (
    <RouterLink
      to={to}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: "rgba(34,211,238,0.06)",
        border: "1px solid rgba(34,211,238,0.15)",
        color: "#94a3b8",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background =
          "rgba(34,211,238,0.12)"
        ;(e.currentTarget as HTMLElement).style.borderColor =
          "rgba(34,211,238,0.4)"
        ;(e.currentTarget as HTMLElement).style.color = "#22d3ee"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background =
          "rgba(34,211,238,0.06)"
        ;(e.currentTarget as HTMLElement).style.borderColor =
          "rgba(34,211,238,0.15)"
        ;(e.currentTarget as HTMLElement).style.color = "#94a3b8"
      }}
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{label}</span>
      <ChevronRight size={14} className="ml-auto opacity-50" />
    </RouterLink>
  )
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

function Dashboard() {
  const { user: currentUser } = useAuth()
  const firstName = currentUser?.full_name?.split(" ")[0] || currentUser?.email

  const { data: stats } = useQuery({
    queryKey: ["exoplanet-stats"],
    queryFn: () => ExoplanetsService.getExoplanetStats({}),
  })

  const totalPlanets = stats?.total ?? "—"
  const habitable = stats?.habitability?.potentially_habitable ?? "—"

  return (
    <div className="relative flex min-h-full flex-col gap-6">
      <SpaceBackground />

      <div className="relative flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <LayoutDashboard size={13} className="text-space-accent" />
            <span className="text-xs uppercase tracking-widest text-space-accent">
              Overview
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-space-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-space-muted">
            Hi,{" "}
            <span className="text-space-subtle font-medium">{firstName}</span>{" "}
            👋🏼
          </p>
          <p className="text-xs text-space-muted">
            Welcome back, nice to see you again!
          </p>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashStatCard
            label="Total Exoplanets"
            value={
              typeof totalPlanets === "number"
                ? totalPlanets.toLocaleString()
                : totalPlanets
            }
            sub="NASA Exoplanet Archive"
            icon={Globe}
            accent
          />
          <DashStatCard
            label="Potentially Habitable"
            value={
              typeof habitable === "number"
                ? habitable.toLocaleString()
                : habitable
            }
            sub="Habitability score ≥ 80"
            icon={Telescope}
          />
          <DashStatCard
            label="Data Source"
            value="NASA"
            sub="Exoplanet Archive"
            icon={Activity}
          />
        </div>

        {/* Bottom two-column section */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* ETL Status card */}
          <div
            className="flex flex-col gap-4 rounded-2xl p-5"
            style={{
              background: "rgba(15, 25, 50, 0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-space-muted">
                ETL Status
              </span>
              <Download size={14} className="text-space-muted" />
            </div>

            {currentUser?.is_superuser ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span className="text-sm text-space-subtle">
                    Pipeline ready to run
                  </span>
                </div>
                <p className="text-xs text-space-muted">
                  Go to Admin → ETL to run the pipeline and view the latest
                  report.
                </p>
              </div>
            ) : (
              <p className="text-sm text-space-muted">
                ETL management is available to administrators.
              </p>
            )}
          </div>

          {/* Quick actions card */}
          <div
            className="flex flex-col gap-4 rounded-2xl p-5"
            style={{
              background: "rgba(15, 25, 50, 0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-xs uppercase tracking-widest text-space-muted">
              Quick Actions
            </span>
            <div className="flex flex-col gap-2">
              <QuickAction
                label="Explore Exoplanets"
                icon={Telescope}
                to="/exoplanets"
              />
              {currentUser?.is_superuser && (
                <QuickAction
                  label="Run ETL Pipeline"
                  icon={Play}
                  to="/admin/etl"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
