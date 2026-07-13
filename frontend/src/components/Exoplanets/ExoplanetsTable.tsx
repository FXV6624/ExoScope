import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
  Telescope,
} from "lucide-react"
import { useMemo, useState } from "react"

import type { ExoplanetPublic } from "@/client"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = keyof Pick<
  ExoplanetPublic,
  | "planet_name"
  | "host_star"
  | "discovery_method"
  | "discovery_year"
  | "planet_mass"
  | "planet_radius"
>
type SortDir = "asc" | "desc" | null

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 25, 50]

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "planet_name", label: "Planet" },
  { key: "host_star", label: "Host Star" },
  { key: "discovery_method", label: "Discovery Method" },
  { key: "discovery_year", label: "Year" },
  { key: "planet_mass", label: "Mass (M⊕)" },
  { key: "planet_radius", label: "Radius (R⊕)" },
]

const METHOD_BG: Record<string, string> = {
  Transit: "rgba(34,211,238,0.15)",
  Imaging: "rgba(168,85,247,0.15)",
  "Radial Velocity": "rgba(251,191,36,0.12)",
}

const METHOD_COLOR: Record<string, string> = {
  Transit: "#22d3ee",
  Imaging: "#c084fc",
  "Radial Velocity": "#fbbf24",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey
  sortKey: SortKey
  sortDir: SortDir
}) {
  if (sortKey !== col)
    return <ChevronsUpDown size={12} className="text-space-muted" />
  if (sortDir === "asc")
    return <ChevronUp size={12} className="text-space-accent" />
  if (sortDir === "desc")
    return <ChevronDown size={12} className="text-space-accent" />
  return <ChevronsUpDown size={12} className="text-space-muted" />
}

function MethodBadge({ method }: { method: string | null | undefined }) {
  const bg = (method && METHOD_BG[method]) || "rgba(255,255,255,0.06)"
  const color = (method && METHOD_COLOR[method]) || "#94a3b8"
  return (
    <span
      className="rounded-md px-2 py-1 text-xs"
      style={{ background: bg, color, border: `1px solid ${color}30` }}
    >
      {method || "Unknown"}
    </span>
  )
}

function NavButton({
  Icon,
  onClick,
  disabled,
}: {
  Icon: React.ElementType
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed"
      style={{
        background: disabled ? "transparent" : "rgba(34,211,238,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: disabled ? "#334155" : "#94a3b8",
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(34,211,238,0.4)"
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(255,255,255,0.08)"
      }}
    >
      <Icon size={14} />
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ExoplanetsTableProps {
  data: ExoplanetPublic[]
  onSelect: (id: string) => void
}

/**
 * Sortable, filterable, paginated table for the exoplanets list view.
 */
export function ExoplanetsTable({ data, onSelect }: ExoplanetsTableProps) {
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>("planet_name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter(
      (p) =>
        (p.planet_name || "").toLowerCase().includes(q) ||
        (p.host_star || "").toLowerCase().includes(q) ||
        (p.discovery_method || "").toLowerCase().includes(q),
    )
  }, [search, data])

  const sorted = useMemo(() => {
    if (!sortDir) return filtered
    return [...filtered].sort((a, b) => {
      const av = (a[sortKey] as number | string | null) ?? -Infinity
      const bv = (b[sortKey] as number | string | null) ?? -Infinity
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.ceil(sorted.length / pageSize)
  const pageData = sorted.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  )

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPageIndex(0)
  }

  const gridCols = "1.6fr 1fr 1.2fr 0.6fr 0.8fr 0.8fr"

  return (
    <div className="flex h-full flex-col gap-3 text-space-primary">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Telescope size={14} className="text-space-accent" />
            <span className="text-xs uppercase tracking-widest text-space-accent">
              NASA Exoplanet Archive
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-space-primary">
            Exoplanets
          </h1>
          <p className="text-xs text-space-muted">
            Discover and explore exoplanets from around the galaxy
          </p>
        </div>

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.2)",
          }}
        >
          <span className="text-xs uppercase tracking-widest text-space-muted">
            Total
          </span>
          <span className="text-base font-bold text-space-accent">
            {filtered.length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-space-muted"
        />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPageIndex(0)
          }}
          placeholder="Search exoplanets..."
          className="w-full rounded-lg py-1.5 pl-8 pr-4 text-sm outline-none placeholder:text-slate-600"
          style={{
            background: "rgba(15, 25, 50, 0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f1f5f9",
          }}
        />
      </div>

      {/* Table */}
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl"
        style={{
          border: "1px solid rgba(34,211,238,0.15)",
          background: "rgba(6, 13, 31, 0.6)",
        }}
      >
        {/* Header row */}
        <div
          className="grid shrink-0 text-xs uppercase tracking-widest"
          style={{
            gridTemplateColumns: gridCols,
            background: "rgba(34,211,238,0.06)",
            borderBottom: "1px solid rgba(34,211,238,0.12)",
          }}
        >
          {COLUMNS.map(({ key, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => handleSort(key)}
              className="flex items-center gap-1 px-4 py-2.5 text-left text-space-muted transition-colors hover:text-cyan-400"
            >
              {label}
              <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {pageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.2)",
                }}
              >
                <Search size={22} className="text-space-accent" />
              </div>
              <p className="text-space-muted">No exoplanets found</p>
            </div>
          ) : (
            pageData.map((planet, i) => (
              <button
                type="button" // Exigido por Biome para evitar recargas accidentales de formularios
                key={planet.id}
                onClick={() => onSelect(planet.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelect(planet.id)
                  }
                }}
                className="grid w-full cursor-pointer items-center text-left bg-transparent border-none p-0 outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
                style={{
                  gridTemplateColumns: gridCols,
                  borderBottom:
                    i < pageData.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background =
                    "rgba(34,211,238,0.04)"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background =
                    "transparent"
                }}
              >
                <div className="px-4 py-2 font-medium text-[#e2e8f0]">
                  {planet.planet_name}
                </div>
                <div className="px-4 py-2 text-space-subtle">
                  {planet.host_star || "—"}
                </div>
                <div className="px-4 py-2">
                  <MethodBadge method={planet.discovery_method} />
                </div>
                <div className="px-4 py-2 text-space-subtle">
                  {planet.discovery_year || "—"}
                </div>
                <div className="px-4 py-2">
                  {planet.planet_mass != null ? (
                    <span className="text-[#cbd5e1]">
                      {planet.planet_mass.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: "#334155" }}>—</span>
                  )}
                </div>
                <div className="px-4 py-2">
                  {planet.planet_radius != null ? (
                    <span className="text-[#cbd5e1]">
                      {planet.planet_radius.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: "#334155" }}>—</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5"
          style={{
            background: "rgba(15, 25, 50, 0.5)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-space-muted">
              Showing{" "}
              <span className="text-space-subtle">
                {pageIndex * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="text-space-subtle">
                {Math.min((pageIndex + 1) * pageSize, sorted.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-space-primary">
                {sorted.length}
              </span>{" "}
              entries
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-space-muted">Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPageIndex(0)
                }}
                className="rounded-md px-2 py-0.5 text-xs text-space-subtle outline-none"
                style={{
                  background: "rgba(15,25,50,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-space-muted">
              Page{" "}
              <span className="font-semibold text-space-primary">
                {pageIndex + 1}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-space-primary">
                {pageCount}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <NavButton
                Icon={ChevronsLeft}
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              />
              <NavButton
                Icon={ChevronLeft}
                onClick={() => setPageIndex((p) => p - 1)}
                disabled={pageIndex === 0}
              />
              <NavButton
                Icon={ChevronRight}
                onClick={() => setPageIndex((p) => p + 1)}
                disabled={pageIndex >= pageCount - 1}
              />
              <NavButton
                Icon={ChevronsRight}
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={pageIndex >= pageCount - 1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
