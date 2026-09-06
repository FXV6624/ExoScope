import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Telescope } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  type ExoplanetField,
  type ExoplanetPublic,
  type ExoplanetSortField,
  ExoplanetsService,
  type SortOrder,
} from "@/client"
import { ActiveFilterChips } from "@/components/Exoplanets/ActiveFilterChips"
import { CatalogSortBar } from "@/components/Exoplanets/CatalogSortBar"
import { CatalogToolbar } from "@/components/Exoplanets/CatalogToolbar"
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
import { useExoplanetExport } from "@/hooks/useExoplanetExport"
import { getStoredThresholds } from "@/utils"

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_layout/exoplanets/")({
  component: ExoplanetsPage,
  head: () => ({ meta: [{ title: "Exoplanets — ExoScope" }] }),
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

  const thresholds = useMemo(() => getStoredThresholds(), [])

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

  const handleSelectPlanet = (planet: ExoplanetPublic) => {
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
  const { isExporting: exportLoading, handleExport } = useExoplanetExport({
    columns,
    queryParams,
    onSuccess: () => setExportOpen(false),
  })

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
      <CatalogToolbar
        search={search}
        onSearchChange={handleSearchChange}
        isHabitableFilterActive={isHabitableFilterActive}
        onToggleHabitableFilter={handleToggleHabitableFilter}
        habitableTitle={
          isHabitableFilterActive
            ? "Clear Potentially Habitable filter"
            : `Filter Potentially Habitable worlds (Score ≥ ${thresholds.score}, Conf ≥ ${(thresholds.confidence * 100).toFixed(0)}%)`
        }
        activeFiltersCount={activeFiltersCount}
        onOpenFilters={() => setFiltersOpen(true)}
        columnsCount={columns.length}
        onOpenColumns={() => setColumnsOpen(true)}
        onOpenExport={() => setExportOpen(true)}
      />

      {/* Active Filter Badges */}
      <ActiveFilterChips
        filters={filters}
        onRemoveFilter={handleRemoveSingleFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Table Sorting & Status Bar */}
      <CatalogSortBar
        sortBy={sortBy}
        order={order}
        sortableFields={SORTABLE_FIELDS}
        onSortChange={handleSortChange}
        total={total}
      />

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
