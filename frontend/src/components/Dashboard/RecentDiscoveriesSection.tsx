import { Link as RouterLink } from "@tanstack/react-router"
import { ChevronRight, Sparkles } from "lucide-react"

import type { ExoplanetPublic } from "@/client"

interface RecentDiscoveriesSectionProps {
  recentLoading: boolean
  planets?: ExoplanetPublic[] | unknown[]
}

export function RecentDiscoveriesSection({
  recentLoading,
  planets,
}: RecentDiscoveriesSectionProps) {
  return (
    <div className="space-card relative flex flex-col justify-between gap-4 rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl h-full">
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
        ) : planets && planets.length > 0 ? (
          <div className="flex flex-col gap-3 pt-4">
            {planets.map((item) => {
              const planet = item as ExoplanetPublic
              return (
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
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-8 text-center">
            No exoplanets found in database.
          </p>
        )}
      </div>
    </div>
  )
}
