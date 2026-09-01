import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Columns,
  Download,
  Filter,
  Search,
  Sparkles,
  Telescope,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  type ExoplanetField,
  type ExoplanetSortField,
  ExoplanetsService,
  type ExportFormat,
  type SortOrder,
} from "@/client"
import { ActiveFilterChips } from "@/components/Exoplanets/ActiveFilterChips"
import { ColumnsModal } from "@/components/Exoplanets/ColumnsModal"
import {
  type BackendFilters,
  ExoplanetFiltersPanel,
} from "@/components/Exoplanets/ExoplanetFiltersPanel"
import { ExoplanetsTable } from "@/components/Exoplanets/ExoplanetsTable"
import { ExportModal } from "@/components/Exoplanets/ExportModal"
import {
  ALL_EXOPLANET_FIELDS,
  DEFAULT_COLUMNS,
} from "@/components/Exoplanets/fieldDefinitions"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import useCustomToast from "@/hooks/useCustomToast"
import { getStoredThresholds } from "@/utils"

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_layout/exoplanets/")({
  component: ExoplanetsPage,
  head: () => ({ meta: [{ title: "Exoplanets — Data Engineering Platform" }] }),
})

// ─── Sortable Fields List ─────────────────────────────────────────────────────

const SORTABLE_FIELDS: { key: ExoplanetSortField; label: string }[] =
  ALL_EXOPLANET_FIELDS.filter((f) => f.key !== "photo_url").map((f) => ({
    key: f.key as ExoplanetSortField,
    label: f.label,
  }))

const SESSION_STORAGE_KEY = "exoplanets_catalog_state"

interface SavedCatalogState {
  skip?: number
  limit?: number
  sortBy?: ExoplanetSortField
  order?: SortOrder
  search?: string
  filters?: BackendFilters
  columns?: ExoplanetField[]
}

function getInitialCatalogState(): SavedCatalogState {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ExoplanetsPage() {
  const navigate = useNavigate()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const savedState = useMemo(() => getInitialCatalogState(), [])

  // ── Pagination & Sorting
  const [skip, setSkip] = useState<number>(savedState.skip ?? 0)
  const [limit, setLimit] = useState<number>(savedState.limit ?? 25)
  const [sortBy, setSortBy] = useState<ExoplanetSortField>(
    savedState.sortBy ?? "planet_name",
  )
  const [order, setOrder] = useState<SortOrder>(savedState.order ?? "asc")

  // ── Search & Filter State
  const [search, setSearch] = useState<string>(savedState.search ?? "")
  const [filters, setFilters] = useState<BackendFilters>(
    savedState.filters ?? {},
  )

  // ── Dynamic Visible Columns
  const [columns, setColumns] = useState<ExoplanetField[]>(
    savedState.columns && savedState.columns.length > 0
      ? savedState.columns
      : DEFAULT_COLUMNS,
  )

  // ── Save state changes to sessionStorage so navigating to planet details doesn't clear filters/columns
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          skip,
          limit,
          sortBy,
          order,
          search,
          filters,
          columns,
        }),
      )
    } catch {}
  }, [skip, limit, sortBy, order, search, filters, columns])

  // ── Modals & Drawers State
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false)
  const [columnsOpen, setColumnsOpen] = useState<boolean>(false)
  const [exportOpen, setExportOpen] = useState<boolean>(false)
  const [exportLoading, setExportLoading] = useState<boolean>(false)

  // ── Lock background scrolling when any modal/drawer is open
  const isAnyModalOpen = filtersOpen || columnsOpen || exportOpen
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isAnyModalOpen])

  // ── Active Filters Count
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== null && v !== undefined && v !== "",
  ).length

  // ── Combined Query Parameters
  const queryParams = useMemo(
    () => ({
      skip,
      limit,
      sortBy,
      order,
      planetName: search.trim()
        ? search.trim()
        : filters.planet_name || undefined,
      hostStar: filters.host_star || undefined,
      discoveryMethod: filters.discovery_method || undefined,
      minDiscoveryYear: filters.min_discovery_year ?? undefined,
      maxDiscoveryYear: filters.max_discovery_year ?? undefined,
      minOrbitalPeriod: filters.min_orbital_period ?? undefined,
      maxOrbitalPeriod: filters.max_orbital_period ?? undefined,
      minPlanetRadius: filters.min_planet_radius ?? undefined,
      maxPlanetRadius: filters.max_planet_radius ?? undefined,
      minPlanetMass: filters.min_planet_mass ?? undefined,
      maxPlanetMass: filters.max_planet_mass ?? undefined,
      planetClass: filters.planet_class || undefined,
      minPlanetClassConfidence:
        filters.min_planet_class_confidence ?? undefined,
      maxPlanetClassConfidence:
        filters.max_planet_class_confidence ?? undefined,
      composition: filters.composition || undefined,
      minCompositionConfidence: filters.min_composition_confidence ?? undefined,
      maxCompositionConfidence: filters.max_composition_confidence ?? undefined,
      minHabitabilityScore: filters.min_habitability_score ?? undefined,
      maxHabitabilityScore: filters.max_habitability_score ?? undefined,
      minHabitabilityConfidence:
        filters.min_habitability_confidence ?? undefined,
      maxHabitabilityConfidence:
        filters.max_habitability_confidence ?? undefined,
      minDistanceFromEarth: filters.min_distance_from_earth ?? undefined,
      maxDistanceFromEarth: filters.max_distance_from_earth ?? undefined,
      minEquilibriumTemperature:
        filters.min_equilibrium_temperature ?? undefined,
      maxEquilibriumTemperature:
        filters.max_equilibrium_temperature ?? undefined,
      systemPlanetCount: filters.system_planet_count ?? undefined,
      minSystemPlanetCount: filters.min_system_planet_count ?? undefined,
      minOrbitalEccentricity: filters.min_orbital_eccentricity ?? undefined,
      maxOrbitalEccentricity: filters.max_orbital_eccentricity ?? undefined,
      hasNasaPhoto: filters.has_nasa_photo ?? undefined,
    }),
    [skip, limit, sortBy, order, search, filters],
  )

  // ── Ensure planet_name is always fetched for row navigation
  const fieldsWithName = useMemo(
    () =>
      columns.includes("planet_name")
        ? columns
        : (["planet_name", ...columns] as ExoplanetField[]),
    [columns],
  )

  // ── React Query with Backend Fields Endpoint
  const { data: response, isLoading } = useQuery({
    queryKey: ["exoplanets", queryParams, fieldsWithName],
    queryFn: () => {
      return ExoplanetsService.readExoplanetsFields({
        ...queryParams,
        fields: fieldsWithName,
      })
    },
  })

  // ── Callbacks
  const handleSearchChange = (val: string) => {
    setSearch(val)
    setSkip(0)
  }

  const isHabitableFilterActive = useMemo(() => {
    return (
      filters.min_habitability_score != null &&
      filters.min_habitability_confidence != null
    )
  }, [filters.min_habitability_score, filters.min_habitability_confidence])

  const handleToggleHabitableFilter = () => {
    if (isHabitableFilterActive) {
      const updated = { ...filters }
      delete updated.min_habitability_score
      delete updated.min_habitability_confidence
      setFilters(updated)
      setSkip(0)
    } else {
      const thresholds = getStoredThresholds()
      setFilters((prev) => ({
        ...prev,
        min_habitability_score: thresholds.score,
        min_habitability_confidence: thresholds.confidence,
      }))
      setSkip(0)
    }
  }

  const handleFiltersChange = (newFilters: BackendFilters) => {
    setFilters(newFilters)
    setSkip(0)
  }

  const handleRemoveSingleFilter = (
    keys: keyof BackendFilters | (keyof BackendFilters)[],
  ) => {
    const updated = { ...filters }
    const keyArray = Array.isArray(keys) ? keys : [keys]
    for (const k of keyArray) {
      delete updated[k]
    }
    setFilters(updated)
    setSkip(0)
  }

  const handleClearAllFilters = () => {
    setFilters({})
    setSearch("")
    setSkip(0)
  }

  const handleSortChange = (
    newSortBy: ExoplanetSortField,
    newOrder: "asc" | "desc",
  ) => {
    setSortBy(newSortBy)
    setOrder(newOrder as SortOrder)
    setSkip(0)
  }

  const handleSelectPlanet = (planet: any) => {
    // Always navigate by planet_name (guaranteed to be present in every row)
    const name = planet.planet_name || planet.id
    if (name) {
      navigate({
        to: "/exoplanets/$id",
        params: { id: encodeURIComponent(String(name)) },
      })
    }
  }

  // ── Robust Streaming Export Implementation
  const handleExport = useCallback(
    async (format: ExportFormat, compress: boolean, filename: string) => {
      setExportLoading(true)
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

        // Active filters only
        if (queryParams.planetName)
          params.set("planet_name", queryParams.planetName)
        if (queryParams.hostStar) params.set("host_star", queryParams.hostStar)
        if (queryParams.discoveryMethod)
          params.set("discovery_method", queryParams.discoveryMethod)
        if (queryParams.minDiscoveryYear != null)
          params.set("min_discovery_year", String(queryParams.minDiscoveryYear))
        if (queryParams.maxDiscoveryYear != null)
          params.set("max_discovery_year", String(queryParams.maxDiscoveryYear))
        if (queryParams.minOrbitalPeriod != null)
          params.set("min_orbital_period", String(queryParams.minOrbitalPeriod))
        if (queryParams.maxOrbitalPeriod != null)
          params.set("max_orbital_period", String(queryParams.maxOrbitalPeriod))
        if (queryParams.minPlanetRadius != null)
          params.set("min_planet_radius", String(queryParams.minPlanetRadius))
        if (queryParams.maxPlanetRadius != null)
          params.set("max_planet_radius", String(queryParams.maxPlanetRadius))
        if (queryParams.minPlanetMass != null)
          params.set("min_planet_mass", String(queryParams.minPlanetMass))
        if (queryParams.maxPlanetMass != null)
          params.set("max_planet_mass", String(queryParams.maxPlanetMass))
        if (queryParams.planetClass)
          params.set("planet_class", queryParams.planetClass)
        if (queryParams.minPlanetClassConfidence != null)
          params.set(
            "min_planet_class_confidence",
            String(queryParams.minPlanetClassConfidence),
          )
        if (queryParams.maxPlanetClassConfidence != null)
          params.set(
            "max_planet_class_confidence",
            String(queryParams.maxPlanetClassConfidence),
          )
        if (queryParams.composition)
          params.set("composition", queryParams.composition)
        if (queryParams.minCompositionConfidence != null)
          params.set(
            "min_composition_confidence",
            String(queryParams.minCompositionConfidence),
          )
        if (queryParams.maxCompositionConfidence != null)
          params.set(
            "max_composition_confidence",
            String(queryParams.maxCompositionConfidence),
          )
        if (queryParams.minHabitabilityScore != null)
          params.set(
            "min_habitability_score",
            String(queryParams.minHabitabilityScore),
          )
        if (queryParams.maxHabitabilityScore != null)
          params.set(
            "max_habitability_score",
            String(queryParams.maxHabitabilityScore),
          )
        if (queryParams.minHabitabilityConfidence != null)
          params.set(
            "min_habitability_confidence",
            String(queryParams.minHabitabilityConfidence),
          )
        if (queryParams.maxHabitabilityConfidence != null)
          params.set(
            "max_habitability_confidence",
            String(queryParams.maxHabitabilityConfidence),
          )
        if (queryParams.minDistanceFromEarth != null)
          params.set(
            "min_distance_from_earth",
            String(queryParams.minDistanceFromEarth),
          )
        if (queryParams.maxDistanceFromEarth != null)
          params.set(
            "max_distance_from_earth",
            String(queryParams.maxDistanceFromEarth),
          )
        if (queryParams.minEquilibriumTemperature != null)
          params.set(
            "min_equilibrium_temperature",
            String(queryParams.minEquilibriumTemperature),
          )
        if (queryParams.maxEquilibriumTemperature != null)
          params.set(
            "max_equilibrium_temperature",
            String(queryParams.maxEquilibriumTemperature),
          )
        if (queryParams.systemPlanetCount != null)
          params.set(
            "system_planet_count",
            String(queryParams.systemPlanetCount),
          )
        if (queryParams.minSystemPlanetCount != null)
          params.set(
            "min_system_planet_count",
            String(queryParams.minSystemPlanetCount),
          )
        if (queryParams.minOrbitalEccentricity != null)
          params.set(
            "min_orbital_eccentricity",
            String(queryParams.minOrbitalEccentricity),
          )
        if (queryParams.maxOrbitalEccentricity != null)
          params.set(
            "max_orbital_eccentricity",
            String(queryParams.maxOrbitalEccentricity),
          )
        if (queryParams.hasNasaPhoto != null)
          params.set("has_nasa_photo", String(queryParams.hasNasaPhoto))

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
        setExportOpen(false)
      } catch (err: any) {
        showErrorToast(err?.message || "Failed to download export.")
      } finally {
        setExportLoading(false)
      }
    },
    [columns, queryParams, showSuccessToast, showErrorToast],
  )

  const planets = (response?.data ?? []) as any[]
  const total = response?.meta?.count ?? 0

  return (
    <div className="relative flex min-h-full flex-col gap-5 text-space-primary">
      <SpaceBackground />

      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Telescope size={14} className="text-space-accent" />
          <span className="text-xs uppercase tracking-widest text-space-accent">
            Catalog & Explorer
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-space-primary">
          Exoplanets
        </h1>
        <p className="text-xs text-space-muted">
          Search, filter, and inspect discovered worlds from the NASA Exoplanet
          Archive.
        </p>
      </div>

      {/* Main Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-space-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search exoplanets by name..."
            className="w-full rounded-xl py-2 pl-9 pr-8 text-sm outline-none placeholder:text-slate-600"
            style={{
              background: "rgba(15, 25, 50, 0.7)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#f1f5f9",
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-space-muted hover:text-space-subtle cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Habitable Quick Filter Toggle Button */}
          <button
            type="button"
            onClick={handleToggleHabitableFilter}
            title={
              isHabitableFilterActive
                ? "Clear Potentially Habitable filter"
                : `Filter Potentially Habitable worlds (Score ≥ ${getStoredThresholds().score}, Conf ≥ ${(getStoredThresholds().confidence * 100).toFixed(0)}%)`
            }
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all cursor-pointer select-none"
            style={{
              background: isHabitableFilterActive
                ? "rgba(16, 185, 129, 0.18)"
                : "rgba(15, 25, 50, 0.7)",
              border: `1px solid ${
                isHabitableFilterActive
                  ? "rgba(16, 185, 129, 0.5)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
              color: isHabitableFilterActive ? "#34d399" : "#94a3b8",
              boxShadow: isHabitableFilterActive
                ? "0 0 14px rgba(16, 185, 129, 0.22)"
                : "none",
            }}
          >
            <Sparkles
              size={14}
              className={
                isHabitableFilterActive
                  ? "text-emerald-400"
                  : "text-space-muted"
              }
            />
            <span>Habitable</span>
            {isHabitableFilterActive && (
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ml-0.5"
                style={{
                  background: "rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                }}
              >
                ✓
              </span>
            )}
          </button>

          {/* Filters Button */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer"
            style={{
              background:
                activeFiltersCount > 0
                  ? "rgba(34,211,238,0.15)"
                  : "rgba(15,25,50,0.7)",
              border: `1px solid ${
                activeFiltersCount > 0
                  ? "rgba(34,211,238,0.4)"
                  : "rgba(255,255,255,0.1)"
              }`,
              color: activeFiltersCount > 0 ? "#22d3ee" : "#94a3b8",
            }}
          >
            <Filter size={14} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: "rgba(34,211,238,0.25)",
                  color: "#22d3ee",
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Columns Button */}
          <button
            type="button"
            onClick={() => setColumnsOpen(true)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: "rgba(15,25,50,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
            }}
          >
            <Columns size={14} />
            <span>Columns ({columns.length})</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: "rgba(15,25,50,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
            }}
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      <ActiveFilterChips
        filters={filters}
        onRemoveFilter={handleRemoveSingleFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Table Sorting & Status Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-2.5"
        style={{
          background: "rgba(15, 25, 50, 0.4)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-space-muted font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) =>
              handleSortChange(e.target.value as ExoplanetSortField, order)
            }
            className="rounded-lg px-2.5 py-1 text-xs text-space-subtle outline-none"
            style={{
              background: "rgba(6,13,31,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {SORTABLE_FIELDS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              handleSortChange(sortBy, order === "asc" ? "desc" : "asc")
            }
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-space-subtle hover:text-space-accent transition-colors cursor-pointer"
            style={{
              background: "rgba(6,13,31,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {order === "asc" ? (
              <>
                <ArrowUpAZ size={13} className="text-space-accent" />
                <span>Ascending</span>
              </>
            ) : (
              <>
                <ArrowDownAZ size={13} className="text-space-accent" />
                <span>Descending</span>
              </>
            )}
          </button>
        </div>

        {/* Results Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-space-muted">Total Results:</span>
          <span className="text-sm font-bold text-space-accent font-mono">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Dynamic Results Table */}
      <ExoplanetsTable
        data={planets}
        total={total}
        skip={skip}
        limit={limit}
        sortBy={sortBy}
        order={order}
        columns={columns}
        isLoading={isLoading}
        onSelectPlanet={handleSelectPlanet}
        onSortChange={handleSortChange}
        onPageChange={setSkip}
        onLimitChange={(newLimit) => {
          setLimit(newLimit)
          setSkip(0)
        }}
      />

      {/* ── Modals & Drawers ── */}

      {/* Filters Drawer */}
      {filtersOpen && (
        <ExoplanetFiltersPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      {/* Columns Selection Modal */}
      {columnsOpen && (
        <ColumnsModal
          selectedColumns={columns}
          onApplyColumns={setColumns}
          onClose={() => setColumnsOpen(false)}
        />
      )}

      {/* Export Modal */}
      {exportOpen && (
        <ExportModal
          onExport={handleExport}
          onClose={() => setExportOpen(false)}
          isLoading={exportLoading}
          activeFilterCount={activeFiltersCount}
          selectedColumnCount={columns.length}
        />
      )}
    </div>
  )
}
