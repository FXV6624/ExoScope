import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Maximize2,
  Star,
  Telescope,
  Thermometer,
  Weight,
} from "lucide-react"

import type { ExoplanetPublic } from "@/client"
import { StatCard } from "./StatCard"

interface ExoplanetProfileProps {
  exoplanet: ExoplanetPublic
  onBack: () => void
}

/**
 * Full-detail profile view of a single exoplanet.
 */
export function ExoplanetProfile({ exoplanet, onBack }: ExoplanetProfileProps) {
  return (
    <div className="relative mx-auto max-w-6xl px-6 py-8 text-space-primary">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-sm text-space-muted">
        <button type="button"
          onClick={onBack}
          className="flex items-center gap-1 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft size={14} />
          Exoplanets
        </button>
        <span>/</span>
        <span className="text-space-subtle">{exoplanet.planet_name}</span>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        {/* Left panel — planet visual */}
        <div
          className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, #0c2340 0%, #06101e 100%)",
            border: "1px solid rgba(34, 211, 238, 0.15)",
          }}
        >
          {/* Glow */}
          <div
            className="absolute h-52 w-52 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
          <span className="absolute bottom-3 right-3 text-xs text-space-muted">
            NASA Exoplanet Archive
          </span>
        </div>

        {/* Right panel — details */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-space-accent">
              Exoplanet Detailed Profile
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-space-primary">
              {exoplanet.planet_name}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              icon={<Globe size={16} />}
              label="Planet Name"
              value={exoplanet.planet_name || "N/A"}
            />
            <StatCard
              icon={<Star size={16} />}
              label="Host Star"
              value={exoplanet.host_star || "N/A"}
            />
            <StatCard
              icon={<Telescope size={16} />}
              label="Discovery Method"
              value={exoplanet.discovery_method || "N/A"}
            />
            <StatCard
              icon={<Calendar size={16} />}
              label="Year Discovered"
              value={exoplanet.discovery_year || "N/A"}
              accent
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Orbital Period"
              value={exoplanet.orbital_period || "N/A"}
              unit="days"
              accent
            />
            <StatCard
              icon={<Maximize2 size={16} />}
              label="Planet Radius"
              value={exoplanet.planet_radius || "N/A"}
              unit="R⊕"
            />
            <StatCard
              icon={<Weight size={16} />}
              label="Planet Mass"
              value={exoplanet.planet_mass || "N/A"}
              unit="M⊕"
            />
            <StatCard
              icon={<MapPin size={16} />}
              label="Distance"
              value={exoplanet.distance_from_earth || "N/A"}
              unit="pc"
              accent
            />
            <StatCard
              icon={<Thermometer size={16} />}
              label="Equilibrium Temperature"
              value={exoplanet.equilibrium_temperature || "N/A"}
              unit="K"
              accent
            />
          </div>
        </div>
      </div>
    </div>
  )
}
