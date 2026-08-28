import { Trash2, X } from "lucide-react"

import type { BackendFilters } from "./ExoplanetFiltersPanel"

interface ActiveFilterChipsProps {
  filters: BackendFilters
  onRemoveFilter: (key: keyof BackendFilters | (keyof BackendFilters)[]) => void
  onClearAll: () => void
}

interface FilterChip {
  id: string
  label: string
  keys: (keyof BackendFilters)[]
}

export function ActiveFilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips: FilterChip[] = []

  // General
  if (filters.planet_name) {
    chips.push({
      id: "planet_name",
      label: `Planet: ${filters.planet_name}`,
      keys: ["planet_name"],
    })
  }
  if (filters.host_star) {
    chips.push({
      id: "host_star",
      label: `Host Star: ${filters.host_star}`,
      keys: ["host_star"],
    })
  }
  if (filters.discovery_method) {
    chips.push({
      id: "discovery_method",
      label: `Method: ${filters.discovery_method}`,
      keys: ["discovery_method"],
    })
  }
  if (
    filters.min_discovery_year != null ||
    filters.max_discovery_year != null
  ) {
    const min = filters.min_discovery_year ?? ""
    const max = filters.max_discovery_year ?? ""
    chips.push({
      id: "discovery_year",
      label: `Year: ${min}–${max}`,
      keys: ["min_discovery_year", "max_discovery_year"],
    })
  }

  // Planet
  if (filters.planet_class) {
    chips.push({
      id: "planet_class",
      label: `Class: ${filters.planet_class}`,
      keys: ["planet_class"],
    })
  }
  if (filters.composition) {
    chips.push({
      id: "composition",
      label: `Composition: ${filters.composition}`,
      keys: ["composition"],
    })
  }
  if (filters.min_planet_radius != null || filters.max_planet_radius != null) {
    const min = filters.min_planet_radius ?? ""
    const max = filters.max_planet_radius ?? ""
    chips.push({
      id: "planet_radius",
      label: `Radius: ${min}–${max} R⊕`,
      keys: ["min_planet_radius", "max_planet_radius"],
    })
  }
  if (filters.min_planet_mass != null || filters.max_planet_mass != null) {
    const min = filters.min_planet_mass ?? ""
    const max = filters.max_planet_mass ?? ""
    chips.push({
      id: "planet_mass",
      label: `Mass: ${min}–${max} M⊕`,
      keys: ["min_planet_mass", "max_planet_mass"],
    })
  }
  if (
    filters.min_orbital_period != null ||
    filters.max_orbital_period != null
  ) {
    const min = filters.min_orbital_period ?? ""
    const max = filters.max_orbital_period ?? ""
    chips.push({
      id: "orbital_period",
      label: `Period: ${min}–${max} d`,
      keys: ["min_orbital_period", "max_orbital_period"],
    })
  }

  // Environment
  if (
    filters.min_habitability_score != null ||
    filters.max_habitability_score != null
  ) {
    const min = filters.min_habitability_score ?? 0
    const max = filters.max_habitability_score ?? 100
    chips.push({
      id: "habitability_score",
      label: `Habitability: ${min}–${max}`,
      keys: ["min_habitability_score", "max_habitability_score"],
    })
  }
  if (
    filters.min_distance_from_earth != null ||
    filters.max_distance_from_earth != null
  ) {
    const min = filters.min_distance_from_earth ?? ""
    const max = filters.max_distance_from_earth ?? ""
    chips.push({
      id: "distance_from_earth",
      label: `Distance: ${min}–${max} pc`,
      keys: ["min_distance_from_earth", "max_distance_from_earth"],
    })
  }
  if (
    filters.min_equilibrium_temperature != null ||
    filters.max_equilibrium_temperature != null
  ) {
    const min = filters.min_equilibrium_temperature ?? ""
    const max = filters.max_equilibrium_temperature ?? ""
    chips.push({
      id: "equilibrium_temperature",
      label: `Eq. Temp: ${min}–${max} K`,
      keys: ["min_equilibrium_temperature", "max_equilibrium_temperature"],
    })
  }

  // System
  if (filters.system_planet_count != null) {
    chips.push({
      id: "system_planet_count",
      label: `System Planets: ${filters.system_planet_count}`,
      keys: ["system_planet_count"],
    })
  }
  if (filters.min_system_planet_count != null) {
    chips.push({
      id: "min_system_planet_count",
      label: `Min System Planets: ${filters.min_system_planet_count}`,
      keys: ["min_system_planet_count"],
    })
  }
  if (
    filters.min_orbital_eccentricity != null ||
    filters.max_orbital_eccentricity != null
  ) {
    const min = filters.min_orbital_eccentricity ?? ""
    const max = filters.max_orbital_eccentricity ?? ""
    chips.push({
      id: "orbital_eccentricity",
      label: `Eccentricity: ${min}–${max}`,
      keys: ["min_orbital_eccentricity", "max_orbital_eccentricity"],
    })
  }

  // Photo
  if (filters.has_nasa_photo != null) {
    chips.push({
      id: "has_nasa_photo",
      label: `NASA Photo: ${filters.has_nasa_photo ? "Yes" : "No"}`,
      keys: ["has_nasa_photo"],
    })
  }

  // Advanced
  if (
    filters.min_planet_class_confidence != null ||
    filters.max_planet_class_confidence != null
  ) {
    const min = filters.min_planet_class_confidence ?? ""
    const max = filters.max_planet_class_confidence ?? ""
    chips.push({
      id: "planet_class_confidence",
      label: `Class Conf: ${min}–${max}`,
      keys: ["min_planet_class_confidence", "max_planet_class_confidence"],
    })
  }
  if (
    filters.min_composition_confidence != null ||
    filters.max_composition_confidence != null
  ) {
    const min = filters.min_composition_confidence ?? ""
    const max = filters.max_composition_confidence ?? ""
    chips.push({
      id: "composition_confidence",
      label: `Comp Conf: ${min}–${max}`,
      keys: ["min_composition_confidence", "max_composition_confidence"],
    })
  }
  if (
    filters.min_habitability_confidence != null ||
    filters.max_habitability_confidence != null
  ) {
    const min = filters.min_habitability_confidence ?? ""
    const max = filters.max_habitability_confidence ?? ""
    chips.push({
      id: "habitability_confidence",
      label: `Hab Conf: ${min}–${max}`,
      keys: ["min_habitability_confidence", "max_habitability_confidence"],
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
      <span className="text-xs text-space-muted">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors"
          style={{
            background: "rgba(34,211,238,0.1)",
            border: "1px solid rgba(34,211,238,0.3)",
            color: "#22d3ee",
          }}
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.keys)}
            aria-label={`Remove filter ${chip.label}`}
            className="rounded hover:bg-white/10 p-0.5 transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="flex items-center gap-1 text-xs text-space-muted hover:text-red-400 transition-colors ml-1 cursor-pointer"
      >
        <Trash2 size={12} />
        Clear filters
      </button>
    </div>
  )
}
