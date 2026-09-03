import { Link as RouterLink } from "@tanstack/react-router"
import {
  ArrowRight,
  BarChart3,
  LogIn,
  Play,
  Telescope,
  Zap,
} from "lucide-react"

interface QuickActionsCardProps {
  totalPlanets: number
  isLoading?: boolean
  loggedIn: boolean
  onOpenStats: () => void
}

export function QuickActionsCard({
  totalPlanets,
  isLoading,
  loggedIn,
  onOpenStats,
}: QuickActionsCardProps) {
  return (
    <div className="space-card group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 border border-white/10 hover:border-cyan-500/30">
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
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-slate-900/60 px-2 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white cursor-pointer"
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
