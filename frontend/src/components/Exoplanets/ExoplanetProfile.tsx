import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  Droplets,
  Flame,
  Globe,
  Hash,
  HelpCircle,
  Layers,
  MapPin,
  Maximize2,
  Orbit,
  Sparkles,
  Star,
  Sun,
  Telescope,
  Thermometer,
  Weight,
  Zap,
} from "lucide-react"
import { useState } from "react"

import type { ExoplanetPublic } from "@/client"
import { ConfidenceExplanationModal } from "./ConfidenceExplanationModal"
import { StatCard } from "./StatCard"

interface ExoplanetProfileProps {
  exoplanet: ExoplanetPublic
  onBack: () => void
}

// ─── Color mappings ──────────────────────────────────────────────────────────

const CLASS_COLORS: Record<string, string> = {
  Terrestrial: "#22d3ee",
  "Super Earth": "#34d399",
  "Sub-Neptune": "#c084fc",
  Neptune: "#60a5fa",
  "Ice Giant": "#93c5fd",
  "Gas Giant": "#fbbf24",
  Unknown: "#94a3b8",
}

const COMPOSITION_COLORS: Record<string, string> = {
  Rocky: "#fb923c",
  "Rocky-Iron": "#f87171",
  "Water World": "#38bdf8",
  Ice: "#a5f3fc",
  "Hydrogen-Helium": "#c084fc",
  Unknown: "#94a3b8",
}

// ─── Confidence Card (Uniform Vertical Layout) ────────────────────────────────

function ConfidenceCard({
  title,
  value,
  confidence,
  color,
  icon: Icon,
  badge = true,
}: {
  title: string
  value: string | number | null | undefined
  confidence: number | null | undefined
  color: string
  icon: React.ElementType
  badge?: boolean
}) {
  const confPct =
    confidence != null ? Math.min(100, Math.max(0, confidence * 100)) : null

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-4 transition-all"
      style={{
        background: "rgba(15, 25, 50, 0.65)",
        border: `1px solid ${color}30`,
      }}
    >
      {/* Title with Icon */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${color}15`, color }}
        >
          <Icon size={14} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-space-muted">
          {title}
        </span>
      </div>

      {/* Value displayed UNDER the title */}
      <div className="pt-0.5">
        {badge ? (
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            {value ?? "Unknown"}
          </span>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono" style={{ color }}>
              {value != null ? Number(value).toFixed(1) : "—"}
            </span>
            <span className="text-xs text-space-muted">/ 100</span>
          </div>
        )}
      </div>

      {/* Confidence with Progress Bar */}
      <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-space-muted">Confidence</span>
          <span className="font-mono font-medium" style={{ color }}>
            {confPct != null ? `${confPct.toFixed(0)}%` : "N/A"}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: confPct != null ? `${confPct}%` : "0%",
              background: color,
            }}
          />
        </div>
      </div>
    </div>
  )
}

function SectionHeading({
  title,
  icon: Icon,
}: {
  title: string
  icon: React.ElementType
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-2 first:pt-0">
      <Icon size={16} className="text-space-accent" />
      <h3 className="text-xs font-semibold uppercase tracking-widest text-space-accent">
        {title}
      </h3>
    </div>
  )
}

/**
 * Full-detail profile view of a single exoplanet with all entity attributes.
 */
export function ExoplanetProfile({ exoplanet, onBack }: ExoplanetProfileProps) {
  const classColor = CLASS_COLORS[exoplanet.planet_class || ""] || "#22d3ee"
  const compColor = COMPOSITION_COLORS[exoplanet.composition || ""] || "#c084fc"
  const habScore = exoplanet.habitability_score
  const habColor =
    habScore == null
      ? "#94a3b8"
      : habScore >= 70
        ? "#34d399"
        : habScore >= 40
          ? "#fbbf24"
          : "#f87171"

  const isRealNasaPhoto = Boolean(
    exoplanet.photo_url &&
      (exoplanet.photo_url.startsWith("http://") ||
        exoplanet.photo_url.startsWith("https://")),
  )

  const [confidenceModalOpen, setConfidenceModalOpen] = useState(false)

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 text-space-primary">
      {/* Top Navigation & Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-lg active:scale-95 hover:shadow-cyan-500/20"
          style={{
            background: "rgba(15, 25, 50, 0.85)",
            border: "1px solid rgba(34, 211, 238, 0.4)",
            color: "#22d3ee",
          }}
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span>Back to Exoplanets</span>
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
        <div className="flex flex-col gap-4">
          {/* Planet image / NASA visualization */}
          <div
            className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-2xl"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, #0c2340 0%, #06101e 100%)",
              border: "1px solid rgba(34, 211, 238, 0.25)",
            }}
          >
            {exoplanet.photo_url ? (
              <img
                src={exoplanet.photo_url}
                alt={exoplanet.planet_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(34,211,238,0.08)",
                    border: "1px solid rgba(34,211,238,0.2)",
                  }}
                >
                  <Globe size={36} className="text-space-accent opacity-80" />
                </div>
                <p className="text-xs text-space-muted">
                  No direct NASA imagery on record
                </p>
              </div>
            )}
            {isRealNasaPhoto ? (
              <span
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono tracking-wide backdrop-blur-md shadow-md"
                style={{
                  background: "rgba(6, 13, 31, 0.85)",
                  border: "1px solid rgba(34, 211, 238, 0.5)",
                  color: "#22d3ee",
                }}
              >
                <Sparkles size={12} className="text-cyan-400" />
                NASA Archive Photo
              </span>
            ) : (
              <span
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono tracking-wide backdrop-blur-md shadow-md text-slate-300"
                style={{
                  background: "rgba(6, 13, 31, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                Default photo based in composition
              </span>
            )}
          </div>

          {/* Vertical Confidence Analysis Cards */}
          <ConfidenceCard
            title="Planet Class"
            value={exoplanet.planet_class}
            confidence={exoplanet.planet_class_confidence}
            color={classColor}
            icon={Layers}
            badge
          />
          <ConfidenceCard
            title="Composition"
            value={exoplanet.composition}
            confidence={exoplanet.composition_confidence}
            color={compColor}
            icon={Droplets}
            badge
          />
          <ConfidenceCard
            title="Habitability Score"
            value={exoplanet.habitability_score}
            confidence={exoplanet.habitability_confidence}
            color={habColor}
            icon={Sparkles}
            badge={false}
          />

          {/* How Classification Works Button */}
          <button
            type="button"
            onClick={() => setConfidenceModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 py-2.5 px-3 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-950/60 hover:border-cyan-400 hover:text-cyan-100 cursor-pointer active:scale-98 shadow-sm"
          >
            <HelpCircle size={14} className="text-cyan-400" />
            <span>How classification works</span>
          </button>
        </div>

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
            <SectionHeading title="Host Star & Astrophysical Data" icon={Sun} />
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
