import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"

import type { ExoplanetFilters, PlanetClass, PlanetComposition } from "@/client"

export type BackendFilters = Omit<ExoplanetFilters, "sort_by" | "order">

const PLANET_CLASSES: PlanetClass[] = [
  "Terrestrial",
  "Super Earth",
  "Sub-Neptune",
  "Neptune",
  "Ice Giant",
  "Gas Giant",
  "Unknown",
]

const COMPOSITIONS: PlanetComposition[] = [
  "Rocky",
  "Rocky-Iron",
  "Water World",
  "Ice",
  "Hydrogen-Helium",
  "Unknown",
]

const DISCOVERY_METHODS = [
  "Transit",
  "Radial Velocity",
  "Imaging",
  "Microlensing",
  "Astrometry",
  "Timing",
  "Eclipse Timing Variations",
  "Pulsar Timing",
  "Disk Kinematics",
  "Other",
]

interface FiltersProps {
  filters: BackendFilters
  onFiltersChange: (f: BackendFilters) => void
  onClose: () => void
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-white/10 pb-1.5 pt-2">
      <span className="text-xs font-bold uppercase tracking-widest text-space-accent">
        {title}
      </span>
    </div>
  )
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string | null | undefined
  placeholder?: string
  onChange: (v: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-space-muted">{label}</span>
      <input
        type="text"
        placeholder={placeholder || label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? e.target.value : null)}
        className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none placeholder:text-slate-600"
        style={{
          background: "rgba(15,25,50,0.8)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
    </div>
  )
}

function NumberRangeInput({
  label,
  minValue,
  maxValue,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  onMinChange,
  onMaxChange,
}: {
  label: string
  minValue: number | null | undefined
  maxValue: number | null | undefined
  minPlaceholder?: string
  maxPlaceholder?: string
  onMinChange: (v: number | null) => void
  onMaxChange: (v: number | null) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-space-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          placeholder={minPlaceholder}
          value={minValue ?? ""}
          onChange={(e) =>
            onMinChange(e.target.value !== "" ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none placeholder:text-slate-600"
          style={{
            background: "rgba(15,25,50,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        <span className="text-space-muted">–</span>
        <input
          type="number"
          step="any"
          placeholder={maxPlaceholder}
          value={maxValue ?? ""}
          onChange={(e) =>
            onMaxChange(e.target.value !== "" ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none placeholder:text-slate-600"
          style={{
            background: "rgba(15,25,50,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      </div>
    </div>
  )
}

function ConfidenceRangeInput({
  label,
  minValue,
  maxValue,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  onMinChange,
  onMaxChange,
}: {
  label: string
  minValue: number | null | undefined
  maxValue: number | null | undefined
  minPlaceholder?: string
  maxPlaceholder?: string
  onMinChange: (v: number | null) => void
  onMaxChange: (v: number | null) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-space-muted">{label}</span>

      <div className="flex items-center gap-2">
        <input
          type="number"
          step={0.1}
          min={0}
          max={1}
          placeholder={minPlaceholder}
          value={minValue ?? ""}
          onChange={(e) =>
            onMinChange(e.target.value !== "" ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none placeholder:text-slate-600"
          style={{
            background: "rgba(15,25,50,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />

        <span className="text-space-muted">–</span>

        <input
          type="number"
          step={0.1}
          min={0}
          max={1}
          placeholder={maxPlaceholder}
          value={maxValue ?? ""}
          onChange={(e) =>
            onMaxChange(e.target.value !== "" ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none placeholder:text-slate-600"
          style={{
            background: "rgba(15,25,50,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      </div>
    </div>
  )
}

export function ExoplanetFiltersPanel({
  filters,
  onFiltersChange,
  onClose,
}: FiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const update = (patch: Partial<BackendFilters>) =>
    onFiltersChange({ ...filters, ...patch })

  const clearAll = () => onFiltersChange({})

  const activeCount = Object.values(filters).filter(
    (v) => v !== null && v !== undefined && v !== "",
  ).length

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close filter panel backdrop"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col overflow-hidden shadow-2xl"
        style={{
          background: "rgba(6, 13, 31, 0.98)",
          borderLeft: "1px solid rgba(34,211,238,0.25)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-space-accent" />
            <h2 className="text-base font-bold text-space-primary">
              Filter Exoplanets
            </h2>
            {activeCount > 0 && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: "rgba(34,211,238,0.2)",
                  color: "#22d3ee",
                }}
              >
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-space-muted transition-colors hover:text-space-accent cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-space-muted transition-colors hover:text-space-primary cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 1. GENERAL */}
          <div className="space-y-3">
            <SectionHeader title="General" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput
                label="Planet Name"
                value={filters.planet_name}
                placeholder="e.g. Kepler-452 b"
                onChange={(v) => update({ planet_name: v })}
              />
              <TextInput
                label="Host Star"
                value={filters.host_star}
                placeholder="e.g. Kepler-452"
                onChange={(v) => update({ host_star: v })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-space-muted">
                  Discovery Method
                </span>
                <select
                  value={filters.discovery_method ?? ""}
                  onChange={(e) =>
                    update({ discovery_method: e.target.value || null })
                  }
                  className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none"
                  style={{
                    background: "rgba(15,25,50,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <option value="">All methods</option>
                  {DISCOVERY_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <NumberRangeInput
                label="Discovery Year"
                minValue={filters.min_discovery_year}
                maxValue={filters.max_discovery_year}
                minPlaceholder="Min year"
                maxPlaceholder="Max year"
                onMinChange={(v) => update({ min_discovery_year: v })}
                onMaxChange={(v) => update({ max_discovery_year: v })}
              />
            </div>
          </div>

          {/* 2. PLANET */}
          <div className="space-y-3">
            <SectionHeader title="Planet" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-space-muted">Planet Class</span>
                <select
                  value={filters.planet_class ?? ""}
                  onChange={(e) =>
                    update({
                      planet_class: (e.target.value as PlanetClass) || null,
                    })
                  }
                  className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none"
                  style={{
                    background: "rgba(15,25,50,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <option value="">All classes</option>
                  {PLANET_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-space-muted">Composition</span>
                <select
                  value={filters.composition ?? ""}
                  onChange={(e) =>
                    update({
                      composition:
                        (e.target.value as PlanetComposition) || null,
                    })
                  }
                  className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none"
                  style={{
                    background: "rgba(15,25,50,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <option value="">All compositions</option>
                  {COMPOSITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberRangeInput
                label="Planet Radius (R⊕)"
                minValue={filters.min_planet_radius}
                maxValue={filters.max_planet_radius}
                onMinChange={(v) => update({ min_planet_radius: v })}
                onMaxChange={(v) => update({ max_planet_radius: v })}
              />
              <NumberRangeInput
                label="Planet Mass (M⊕)"
                minValue={filters.min_planet_mass}
                maxValue={filters.max_planet_mass}
                onMinChange={(v) => update({ min_planet_mass: v })}
                onMaxChange={(v) => update({ max_planet_mass: v })}
              />
            </div>

            <NumberRangeInput
              label="Orbital Period (days)"
              minValue={filters.min_orbital_period}
              maxValue={filters.max_orbital_period}
              onMinChange={(v) => update({ min_orbital_period: v })}
              onMaxChange={(v) => update({ max_orbital_period: v })}
            />
          </div>

          {/* 3. ENVIRONMENT */}
          <div className="space-y-3">
            <SectionHeader title="Environment" />
            <NumberRangeInput
              label="Habitability Score (0 – 100)"
              minValue={filters.min_habitability_score}
              maxValue={filters.max_habitability_score}
              minPlaceholder="0"
              maxPlaceholder="100"
              onMinChange={(v) => update({ min_habitability_score: v })}
              onMaxChange={(v) => update({ max_habitability_score: v })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberRangeInput
                label="Distance from Earth (pc)"
                minValue={filters.min_distance_from_earth}
                maxValue={filters.max_distance_from_earth}
                onMinChange={(v) => update({ min_distance_from_earth: v })}
                onMaxChange={(v) => update({ max_distance_from_earth: v })}
              />
              <NumberRangeInput
                label="Eq. Temperature (K)"
                minValue={filters.min_equilibrium_temperature}
                maxValue={filters.max_equilibrium_temperature}
                onMinChange={(v) => update({ min_equilibrium_temperature: v })}
                onMaxChange={(v) => update({ max_equilibrium_temperature: v })}
              />
            </div>
          </div>

          {/* 4. SYSTEM */}
          <div className="space-y-3">
            <SectionHeader title="System" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-space-muted">
                  Exact System Planet Count
                </span>
                <input
                  type="number"
                  min={1}
                  placeholder="Exact count"
                  value={filters.system_planet_count ?? ""}
                  onChange={(e) =>
                    update({
                      system_planet_count:
                        e.target.value !== "" ? Number(e.target.value) : null,
                    })
                  }
                  className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none placeholder:text-slate-600"
                  style={{
                    background: "rgba(15,25,50,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-space-muted">
                  Min System Planet Count
                </span>
                <input
                  type="number"
                  min={1}
                  placeholder="Min count"
                  value={filters.min_system_planet_count ?? ""}
                  onChange={(e) =>
                    update({
                      min_system_planet_count:
                        e.target.value !== "" ? Number(e.target.value) : null,
                    })
                  }
                  className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none placeholder:text-slate-600"
                  style={{
                    background: "rgba(15,25,50,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </div>
            <NumberRangeInput
              label="Orbital Eccentricity"
              minValue={filters.min_orbital_eccentricity}
              maxValue={filters.max_orbital_eccentricity}
              onMinChange={(v) => update({ min_orbital_eccentricity: v })}
              onMaxChange={(v) => update({ max_orbital_eccentricity: v })}
            />
          </div>

          {/* 5. PHOTO */}
          <div className="space-y-3">
            <SectionHeader title="Photo" />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-space-muted">NASA Photo</span>
              <select
                value={
                  filters.has_nasa_photo === null ||
                  filters.has_nasa_photo === undefined
                    ? ""
                    : filters.has_nasa_photo
                      ? "true"
                      : "false"
                }
                onChange={(e) => {
                  const val = e.target.value
                  update({
                    has_nasa_photo: val === "" ? null : val === "true",
                  })
                }}
                className="rounded-lg px-3 py-1.5 text-sm text-space-subtle outline-none"
                style={{
                  background: "rgba(15,25,50,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <option value="">All planets</option>
                <option value="true">Has NASA photo </option>
                <option value="false">No NASA photo</option>
              </select>
            </div>
          </div>

          {/* 6. ADVANCED (Accordion) */}
          <div className="rounded-xl border border-white/10 p-3 space-y-3">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-widest text-space-accent cursor-pointer"
            >
              <span>Advanced Filters (Confidence Thresholds)</span>
              {advancedOpen ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {advancedOpen && (
              <div className="pt-2 space-y-3">
                <ConfidenceRangeInput
                  label="Planet Class Confidence (0.0 – 1.0)"
                  minValue={filters.min_planet_class_confidence}
                  maxValue={filters.max_planet_class_confidence}
                  minPlaceholder="0.0"
                  maxPlaceholder="1.0"
                  onMinChange={(v) =>
                    update({ min_planet_class_confidence: v })
                  }
                  onMaxChange={(v) =>
                    update({ max_planet_class_confidence: v })
                  }
                />

                <ConfidenceRangeInput
                  label="Composition Confidence (0.0 – 1.0)"
                  minValue={filters.min_composition_confidence}
                  maxValue={filters.max_composition_confidence}
                  minPlaceholder="0.0"
                  maxPlaceholder="1.0"
                  onMinChange={(v) => update({ min_composition_confidence: v })}
                  onMaxChange={(v) => update({ max_composition_confidence: v })}
                />

                <ConfidenceRangeInput
                  label="Habitability Confidence (0.0 – 1.0)"
                  minValue={filters.min_habitability_confidence}
                  maxValue={filters.max_habitability_confidence}
                  minPlaceholder="0.0"
                  maxPlaceholder="1.0"
                  onMinChange={(v) =>
                    update({ min_habitability_confidence: v })
                  }
                  onMaxChange={(v) =>
                    update({ max_habitability_confidence: v })
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl px-4 py-2 text-xs font-medium text-space-muted transition-colors hover:text-space-primary cursor-pointer"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2 text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: "rgba(34,211,238,0.2)",
              border: "1px solid rgba(34,211,238,0.4)",
              color: "#22d3ee",
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  )
}
