import { SlidersHorizontal, X } from "lucide-react"
import { useEffect, useState } from "react"

import type { ExoplanetFilters, PlanetClass, PlanetComposition } from "@/client"
import {
  COMPOSITIONS,
  ConfidenceSliderInput,
  DISCOVERY_METHODS,
  NumberRangeInput,
  PLANET_CLASSES,
  SectionHeader,
  TextInput,
} from "./FilterInputs"

export type BackendFilters = Omit<ExoplanetFilters, "sort_by" | "order">

interface FiltersProps {
  filters: BackendFilters
  onFiltersChange: (f: BackendFilters) => void
  onClose: () => void
}

export function ExoplanetFiltersPanel({
  filters,
  onFiltersChange,
  onClose,
}: FiltersProps) {
  const [draftFilters, setDraftFilters] = useState<BackendFilters>(filters)

  // Synchronize draftFilters whenever the panel is opened with active filters
  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const update = (patch: Partial<BackendFilters>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }))
  }

  const clearAll = () => {
    setDraftFilters({})
  }

  const handleApply = () => {
    onFiltersChange(draftFilters)
    onClose()
  }

  const handleResetAndApply = () => {
    setDraftFilters({})
    onFiltersChange({})
    onClose()
  }

  const activeCount = Object.values(draftFilters).filter(
    (v) => v !== null && v !== undefined && v !== "",
  ).length

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close filter panel backdrop"
        className="fixed inset-0 z-40 bg-black/75 cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className="space-modal fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col overflow-hidden shadow-2xl"
        style={{
          borderLeft: "1px solid rgba(34,211,238,0.25)",
          transform: "translateZ(0)",
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
                value={draftFilters.planet_name}
                placeholder="e.g. Kepler-452 b"
                onChange={(v) => update({ planet_name: v })}
              />
              <TextInput
                label="Host Star"
                value={draftFilters.host_star}
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
                  value={draftFilters.discovery_method ?? ""}
                  onChange={(e) =>
                    update({ discovery_method: e.target.value || null })
                  }
                  className="rounded-lg px-3 py-1.5 text-sm bg-card border border-border text-foreground outline-none cursor-pointer"
                >
                  <option value="">All Methods</option>
                  {DISCOVERY_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <NumberRangeInput
                label="Discovery Year"
                minValue={draftFilters.min_discovery_year}
                maxValue={draftFilters.max_discovery_year}
                minPlaceholder="1992"
                maxPlaceholder="2026"
                onMinChange={(v) => update({ min_discovery_year: v })}
                onMaxChange={(v) => update({ max_discovery_year: v })}
              />
            </div>
          </div>

          {/* 2. PLANET CLASSIFICATION */}
          <div className="space-y-3">
            <SectionHeader title="Planet Classification" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Planet Class
                </span>
                <select
                  value={draftFilters.planet_class ?? ""}
                  onChange={(e) =>
                    update({
                      planet_class: (e.target.value as PlanetClass) || null,
                    })
                  }
                  className="rounded-lg px-3 py-1.5 text-sm bg-card border border-border text-foreground outline-none cursor-pointer"
                >
                  <option value="">All Classes</option>
                  {PLANET_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Composition
                </span>
                <select
                  value={draftFilters.composition ?? ""}
                  onChange={(e) =>
                    update({
                      composition:
                        (e.target.value as PlanetComposition) || null,
                    })
                  }
                  className="rounded-lg px-3 py-1.5 text-sm bg-card border border-border text-foreground outline-none cursor-pointer"
                >
                  <option value="">All Compositions</option>
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
                label="Planet Radius (R⊕ Earth Radii)"
                minValue={draftFilters.min_planet_radius}
                maxValue={draftFilters.max_planet_radius}
                onMinChange={(v) => update({ min_planet_radius: v })}
                onMaxChange={(v) => update({ max_planet_radius: v })}
              />
              <NumberRangeInput
                label="Planet Mass (M⊕ Earth Masses)"
                minValue={draftFilters.min_planet_mass}
                maxValue={draftFilters.max_planet_mass}
                onMinChange={(v) => update({ min_planet_mass: v })}
                onMaxChange={(v) => update({ max_planet_mass: v })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <NumberRangeInput
                label="Orbital Period (days)"
                minValue={draftFilters.min_orbital_period}
                maxValue={draftFilters.max_orbital_period}
                onMinChange={(v) => update({ min_orbital_period: v })}
                onMaxChange={(v) => update({ max_orbital_period: v })}
              />
            </div>
          </div>

          {/* 3. ENVIRONMENT & HABITABILITY */}
          <div className="space-y-3">
            <SectionHeader title="Environment & Habitability" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberRangeInput
                label="Habitability Score (0 – 100)"
                minValue={draftFilters.min_habitability_score}
                maxValue={draftFilters.max_habitability_score}
                minPlaceholder="0"
                maxPlaceholder="100"
                onMinChange={(v) => update({ min_habitability_score: v })}
                onMaxChange={(v) => update({ max_habitability_score: v })}
              />
              <NumberRangeInput
                label="Equilibrium Temp (K)"
                minValue={draftFilters.min_equilibrium_temperature}
                maxValue={draftFilters.max_equilibrium_temperature}
                minPlaceholder="0"
                maxPlaceholder="4000"
                onMinChange={(v) => update({ min_equilibrium_temperature: v })}
                onMaxChange={(v) => update({ max_equilibrium_temperature: v })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <NumberRangeInput
                label="Distance from Earth (pc)"
                minValue={draftFilters.min_distance_from_earth}
                maxValue={draftFilters.max_distance_from_earth}
                onMinChange={(v) => update({ min_distance_from_earth: v })}
                onMaxChange={(v) => update({ max_distance_from_earth: v })}
              />
            </div>
          </div>

          {/* 4. SYSTEM & ORBIT */}
          <div className="space-y-3">
            <SectionHeader title="System & Orbit" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput
                label="Exact Planet Count in System"
                value={
                  draftFilters.system_planet_count != null
                    ? String(draftFilters.system_planet_count)
                    : ""
                }
                placeholder="e.g. 7"
                onChange={(v) =>
                  update({
                    system_planet_count: v ? Number.parseInt(v, 10) : null,
                  })
                }
              />
              <TextInput
                label="Min Planets in System"
                value={
                  draftFilters.min_system_planet_count != null
                    ? String(draftFilters.min_system_planet_count)
                    : ""
                }
                placeholder="e.g. 2 (multi-planet systems)"
                onChange={(v) =>
                  update({
                    min_system_planet_count: v ? Number.parseInt(v, 10) : null,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <NumberRangeInput
                label="Orbital Eccentricity (0.0 – 1.0)"
                minValue={draftFilters.min_orbital_eccentricity}
                maxValue={draftFilters.max_orbital_eccentricity}
                minPlaceholder="0.0"
                maxPlaceholder="1.0"
                onMinChange={(v) => update({ min_orbital_eccentricity: v })}
                onMaxChange={(v) => update({ max_orbital_eccentricity: v })}
              />
            </div>
          </div>

          {/* 5. CONFIDENCE THRESHOLDS */}
          <div className="space-y-3">
            <SectionHeader title="Confidence Thresholds (0% – 100%)" />
            <div className="space-y-3">
              <ConfidenceSliderInput
                label="Planet Class Confidence"
                minValue={draftFilters.min_planet_class_confidence}
                maxValue={draftFilters.max_planet_class_confidence}
                accentColor="accent-cyan-400"
                onMinChange={(v) => update({ min_planet_class_confidence: v })}
                onMaxChange={(v) => update({ max_planet_class_confidence: v })}
              />

              <ConfidenceSliderInput
                label="Composition Confidence"
                minValue={draftFilters.min_composition_confidence}
                maxValue={draftFilters.max_composition_confidence}
                accentColor="accent-purple-400"
                onMinChange={(v) => update({ min_composition_confidence: v })}
                onMaxChange={(v) => update({ max_composition_confidence: v })}
              />

              <ConfidenceSliderInput
                label="Habitability Confidence"
                minValue={draftFilters.min_habitability_confidence}
                maxValue={draftFilters.max_habitability_confidence}
                accentColor="accent-emerald-400"
                onMinChange={(v) => update({ min_habitability_confidence: v })}
                onMaxChange={(v) => update({ max_habitability_confidence: v })}
              />
            </div>
          </div>

          {/* 6. PHOTO */}
          <div className="space-y-3">
            <SectionHeader title="Photo" />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">NASA Photo</span>
              <select
                value={
                  draftFilters.has_nasa_photo === null ||
                  draftFilters.has_nasa_photo === undefined
                    ? ""
                    : draftFilters.has_nasa_photo
                      ? "true"
                      : "false"
                }
                onChange={(e) => {
                  const val = e.target.value
                  update({
                    has_nasa_photo: val === "" ? null : val === "true",
                  })
                }}
                className="rounded-lg px-3 py-1.5 text-sm bg-card border border-border text-foreground outline-none cursor-pointer"
              >
                <option value="">All planets</option>
                <option value="true">Has NASA photo </option>
                <option value="false">Has default photo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-card">
          <button
            type="button"
            onClick={handleResetAndApply}
            className="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl px-5 py-2 text-sm font-semibold transition-all cursor-pointer shadow-md bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  )
}
