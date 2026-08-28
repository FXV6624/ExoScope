import type { ExoplanetField } from "@/client"

export interface FieldDefinition {
  key: ExoplanetField
  label: string
  category: "General" | "Planetary" | "Environment" | "Stellar & System"
  unit?: string
}

export const ALL_EXOPLANET_FIELDS: FieldDefinition[] = [
  // General
  { key: "planet_name", label: "Planet Name", category: "General" },
  { key: "host_star", label: "Host Star", category: "General" },
  { key: "discovery_year", label: "Discovery Year", category: "General" },
  { key: "discovery_method", label: "Discovery Method", category: "General" },
  { key: "photo_url", label: "NASA Photo", category: "General" },

  // Planetary
  { key: "planet_class", label: "Planet Class", category: "Planetary" },
  {
    key: "planet_class_confidence",
    label: "Class Confidence",
    category: "Planetary",
  },
  { key: "composition", label: "Composition", category: "Planetary" },
  {
    key: "composition_confidence",
    label: "Composition Confidence",
    category: "Planetary",
  },
  {
    key: "planet_radius",
    label: "Planet Radius",
    category: "Planetary",
    unit: "R⊕",
  },
  {
    key: "planet_mass",
    label: "Planet Mass",
    category: "Planetary",
    unit: "M⊕",
  },
  {
    key: "planet_density",
    label: "Planet Density",
    category: "Planetary",
    unit: "g/cm³",
  },
  {
    key: "orbital_period",
    label: "Orbital Period",
    category: "Planetary",
    unit: "days",
  },
  {
    key: "semi_major_axis",
    label: "Semi-major Axis",
    category: "Planetary",
    unit: "AU",
  },
  {
    key: "orbital_eccentricity",
    label: "Orbital Eccentricity",
    category: "Planetary",
  },

  // Environment
  {
    key: "habitability_score",
    label: "Habitability Score",
    category: "Environment",
  },
  {
    key: "habitability_confidence",
    label: "Habitability Confidence",
    category: "Environment",
  },
  {
    key: "equilibrium_temperature",
    label: "Eq. Temperature",
    category: "Environment",
    unit: "K",
  },
  {
    key: "incident_flux",
    label: "Incident Flux",
    category: "Environment",
    unit: "F⊕",
  },
  {
    key: "distance_from_earth",
    label: "Distance from Earth",
    category: "Environment",
    unit: "pc",
  },

  // Stellar & System
  {
    key: "stellar_effective_temperature",
    label: "Stellar Teff",
    category: "Stellar & System",
    unit: "K",
  },
  {
    key: "stellar_radius",
    label: "Stellar Radius",
    category: "Stellar & System",
    unit: "R☉",
  },
  {
    key: "stellar_mass",
    label: "Stellar Mass",
    category: "Stellar & System",
    unit: "M☉",
  },
  {
    key: "stellar_luminosity",
    label: "Stellar Luminosity",
    category: "Stellar & System",
    unit: "log L☉",
  },
  {
    key: "stellar_age",
    label: "Stellar Age",
    category: "Stellar & System",
    unit: "Gyr",
  },
  {
    key: "system_planet_count",
    label: "Planets in System",
    category: "Stellar & System",
  },
  {
    key: "system_star_count",
    label: "Stars in System",
    category: "Stellar & System",
  },
]

export const DEFAULT_COLUMNS: ExoplanetField[] = [
  "planet_name",
  "host_star",
  "discovery_method",
  "discovery_year",
  "planet_class",
  "planet_radius",
  "habitability_score",
]
