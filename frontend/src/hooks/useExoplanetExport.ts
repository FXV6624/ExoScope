import { useCallback, useState } from "react"

import type { ExoplanetField, ExportFormat } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

interface UseExoplanetExportOptions {
  columns: ExoplanetField[]
  queryParams: Record<string, unknown>
  onSuccess?: () => void
}

/**
 * Hook to handle streaming exoplanet exports with auth, column filtering, and feedback.
 */
export function useExoplanetExport({
  columns,
  queryParams,
  onSuccess,
}: UseExoplanetExportOptions) {
  const [isExporting, setIsExporting] = useState(false)
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const handleExport = useCallback(
    async (format: ExportFormat, compress: boolean, filename: string) => {
      setIsExporting(true)
      try {
        const baseUrl = import.meta.env.VITE_API_URL || ""
        const params = new URLSearchParams()
        params.set("format", format)
        params.set("filename", filename)
        params.set("compress", String(compress))

        // Selected visible columns only
        for (const col of columns) {
          params.append("fields", col)
        }

        // Active filters mapping
        const filterMappings: Record<string, string> = {
          planetName: "planet_name",
          hostStar: "host_star",
          discoveryMethod: "discovery_method",
          minDiscoveryYear: "min_discovery_year",
          maxDiscoveryYear: "max_discovery_year",
          minOrbitalPeriod: "min_orbital_period",
          maxOrbitalPeriod: "max_orbital_period",
          minPlanetRadius: "min_planet_radius",
          maxPlanetRadius: "max_planet_radius",
          minPlanetMass: "min_planet_mass",
          maxPlanetMass: "max_planet_mass",
          planetClass: "planet_class",
          minPlanetClassConfidence: "min_planet_class_confidence",
          maxPlanetClassConfidence: "max_planet_class_confidence",
          composition: "composition",
          minCompositionConfidence: "min_composition_confidence",
          maxCompositionConfidence: "max_composition_confidence",
          minHabitabilityScore: "min_habitability_score",
          maxHabitabilityScore: "max_habitability_score",
          minHabitabilityConfidence: "min_habitability_confidence",
          maxHabitabilityConfidence: "max_habitability_confidence",
          minDistanceFromEarth: "min_distance_from_earth",
          maxDistanceFromEarth: "max_distance_from_earth",
          minEquilibriumTemperature: "min_equilibrium_temperature",
          maxEquilibriumTemperature: "max_equilibrium_temperature",
          systemPlanetCount: "system_planet_count",
          minSystemPlanetCount: "min_system_planet_count",
          minOrbitalEccentricity: "min_orbital_eccentricity",
          maxOrbitalEccentricity: "max_orbital_eccentricity",
          hasNasaPhoto: "has_nasa_photo",
        }

        for (const [key, paramName] of Object.entries(filterMappings)) {
          const val = queryParams[key]
          if (val !== undefined && val !== null && val !== "") {
            params.set(paramName, String(val))
          }
        }

        const token = localStorage.getItem("access_token")
        const response = await fetch(
          `${baseUrl}/api/v1/exports/export?${params.toString()}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        )

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(
            errData.detail || `Export failed with HTTP ${response.status}`,
          )
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        const downloadExt = compress ? "zip" : format
        a.download = `${filename}.${downloadExt}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showSuccessToast(`Export downloaded: ${filename}.${downloadExt}`)
        onSuccess?.()
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to download export."
        showErrorToast(message)
      } finally {
        setIsExporting(false)
      }
    },
    [columns, queryParams, onSuccess, showSuccessToast, showErrorToast],
  )

  return { isExporting, handleExport }
}
