import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  Flame,
  Globe,
  Hash,
  MapPin,
  Maximize2,
  Orbit,
  Star,
  Sun,
  Telescope,
  Thermometer,
  Weight,
  Zap,
} from "lucide-react"
import { useState } from "react"

import type { ExoplanetPublic } from "@/client"
import {
  CLASS_HEX_COLORS,
  COMPOSITION_HEX_COLORS,
  getHabitabilityScoreColor,
} from "./badgeUtils"
import { ConfidenceExplanationModal } from "./ConfidenceExplanationModal"
import { PlanetVisualCard } from "./PlanetVisualCard"
import { StatCard } from "./StatCard"

interface ExoplanetProfileProps {
  exoplanet: ExoplanetPublic
  onBack: () => void
}

function SectionHeading({
  title,
  icon: Icon,
}: {
  title: string
  icon: React.ElementType
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
      <Icon size={16} className="text-space-accent" />
      <h2 className="text-xs font-semibold uppercase tracking-wider text-space-muted">
        {title}
      </h2>
    </div>
  )
}

export function ExoplanetProfile({ exoplanet, onBack }: ExoplanetProfileProps) {
  const [confidenceModalOpen, setConfidenceModalOpen] = useState(false)

  const classColor =
    (exoplanet.planet_class && CLASS_HEX_COLORS[exoplanet.planet_class]) ||
    "#22d3ee"
  const compColor =
    (exoplanet.composition && COMPOSITION_HEX_COLORS[exoplanet.composition]) ||
    "#38bdf8"
  const habColor =
    exoplanet.habitability_score != null
      ? getHabitabilityScoreColor(exoplanet.habitability_score)
      : "#94a3b8"

  const isRealNasaPhoto = Boolean(
    exoplanet.photo_url &&
      (exoplanet.photo_url.includes("images-assets.nasa.gov") ||
        exoplanet.photo_url.includes("nasa.gov") ||
        exoplanet.photo_url.includes("archive.org")),
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-slate-800/80 hover:text-white active:scale-95 cursor-pointer"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-space-muted">
          <span>Catalog</span>
          <span>/</span>
          <span className="font-semibold text-space-primary">
            {exoplanet.planet_name}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        {/* Left panel — Planet Visual & Vertical Confidence Cards */}
        <PlanetVisualCard
          exoplanet={exoplanet}
          classColor={classColor}
          compColor={compColor}
          habColor={habColor}
          isRealNasaPhoto={isRealNasaPhoto}
          onOpenClassificationModal={() => setConfidenceModalOpen(true)}
        />

        {/* Modal: Confidence and Model Details */}
        <ConfidenceExplanationModal
          isOpen={confidenceModalOpen}
          onClose={() => setConfidenceModalOpen(false)}
        />

        {/* Right panel — Detailed Attributes & Analysis */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-space-accent font-semibold">
              Exoplanet Profile
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-space-primary">
              {exoplanet.planet_name}
            </h1>
            {exoplanet.host_star && (
              <p className="mt-1 text-sm text-space-muted">
                Orbits host star{" "}
                <span className="text-space-subtle font-medium">
                  {exoplanet.host_star}
                </span>
                {exoplanet.distance_from_earth != null && (
                  <span>
                    {" "}
                    • Located{" "}
                    <span className="text-space-subtle font-medium">
                      {exoplanet.distance_from_earth.toFixed(1)} pc
                    </span>{" "}
                    from Earth
                  </span>
                )}
              </p>
            )}
          </div>

          {/* 1. Planetary Physical Attributes */}
          <div className="flex flex-col gap-3">
            <SectionHeading
              title="Planetary Physical Attributes"
              icon={Globe}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Maximize2 size={15} />}
                label="Planet Radius"
                value={
                  exoplanet.planet_radius != null
                    ? exoplanet.planet_radius.toFixed(2)
                    : "N/A"
                }
                unit="R⊕"
                accent
              />
              <StatCard
                icon={<Weight size={15} />}
                label="Planet Mass"
                value={
                  exoplanet.planet_mass != null
                    ? exoplanet.planet_mass.toFixed(2)
                    : "N/A"
                }
                unit="M⊕"
                accent
              />
              <StatCard
                icon={<Activity size={15} />}
                label="Planet Density"
                value={
                  exoplanet.planet_density != null
                    ? exoplanet.planet_density.toFixed(2)
                    : "N/A"
                }
                unit="g/cm³"
              />
              <StatCard
                icon={<Thermometer size={15} />}
                label="Eq. Temperature"
                value={
                  exoplanet.equilibrium_temperature != null
                    ? exoplanet.equilibrium_temperature.toFixed(0)
                    : "N/A"
                }
                unit="K"
                accent
              />
              <StatCard
                icon={<Flame size={15} />}
                label="Incident Flux"
                value={
                  exoplanet.incident_flux != null
                    ? exoplanet.incident_flux.toFixed(2)
                    : "N/A"
                }
                unit="F⊕"
              />
            </div>
          </div>

          {/* 2. Orbital Dynamics */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Orbital Dynamics" icon={Orbit} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Clock size={15} />}
                label="Orbital Period"
                value={
                  exoplanet.orbital_period != null
                    ? exoplanet.orbital_period.toFixed(2)
                    : "N/A"
                }
                unit="days"
                accent
              />
              <StatCard
                icon={<Compass size={15} />}
                label="Semi-major Axis"
                value={
                  exoplanet.semi_major_axis != null
                    ? exoplanet.semi_major_axis.toFixed(3)
                    : "N/A"
                }
                unit="AU"
              />
              <StatCard
                icon={<Orbit size={15} />}
                label="Orbital Eccentricity"
                value={
                  exoplanet.orbital_eccentricity != null
                    ? exoplanet.orbital_eccentricity.toFixed(3)
                    : "N/A"
                }
              />
            </div>
          </div>

          {/* 3. Host Star Properties */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Host Star" icon={Sun} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Star size={15} />}
                label="Host Star"
                value={exoplanet.host_star || "N/A"}
              />
              <StatCard
                icon={<Thermometer size={15} />}
                label="Stellar Teff"
                value={
                  exoplanet.stellar_effective_temperature != null
                    ? exoplanet.stellar_effective_temperature.toFixed(0)
                    : "N/A"
                }
                unit="K"
              />
              <StatCard
                icon={<Maximize2 size={15} />}
                label="Stellar Radius"
                value={
                  exoplanet.stellar_radius != null
                    ? exoplanet.stellar_radius.toFixed(2)
                    : "N/A"
                }
                unit="R☉"
              />
              <StatCard
                icon={<Weight size={15} />}
                label="Stellar Mass"
                value={
                  exoplanet.stellar_mass != null
                    ? exoplanet.stellar_mass.toFixed(2)
                    : "N/A"
                }
                unit="M☉"
              />
              <StatCard
                icon={<Zap size={15} />}
                label="Stellar Luminosity"
                value={
                  exoplanet.stellar_luminosity != null
                    ? exoplanet.stellar_luminosity.toFixed(2)
                    : "N/A"
                }
                unit="log L☉"
              />
              <StatCard
                icon={<Clock size={15} />}
                label="Stellar Age"
                value={
                  exoplanet.stellar_age != null
                    ? exoplanet.stellar_age.toFixed(1)
                    : "N/A"
                }
                unit="Gyr"
              />
            </div>
          </div>

          {/* 4. System Architecture & Discovery Context */}
          <div className="flex flex-col gap-3">
            <SectionHeading
              title="System Architecture & Discovery Context"
              icon={Telescope}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Telescope size={15} />}
                label="Discovery Method"
                value={exoplanet.discovery_method || "N/A"}
              />
              <StatCard
                icon={<Calendar size={15} />}
                label="Discovery Year"
                value={exoplanet.discovery_year || "N/A"}
                accent
              />
              <StatCard
                icon={<MapPin size={15} />}
                label="Distance from Earth"
                value={
                  exoplanet.distance_from_earth != null
                    ? exoplanet.distance_from_earth.toFixed(1)
                    : "N/A"
                }
                unit="pc"
                accent
              />
              <StatCard
                icon={<Hash size={15} />}
                label="Planets in System"
                value={
                  exoplanet.system_planet_count != null
                    ? exoplanet.system_planet_count
                    : "N/A"
                }
              />
              <StatCard
                icon={<Star size={15} />}
                label="Stars in System"
                value={
                  exoplanet.system_star_count != null
                    ? exoplanet.system_star_count
                    : "N/A"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
