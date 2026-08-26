import {
  ArrowLeftRight,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Loader2,
  Search,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { ExoplanetField, ExoplanetSortField } from "@/client"
import { ALL_EXOPLANET_FIELDS } from "./fieldDefinitions"

// ─── Badges & Formatters ───────────────────────────────────────────────────────

const METHOD_COLOR: Record<string, { bg: string; color: string }> = {
  Transit: { bg: "rgba(34,211,238,0.15)", color: "#22d3ee" },
  Imaging: { bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
  "Radial Velocity": { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  Microlensing: { bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
  Astrometry: { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
}

const CLASS_COLOR: Record<string, { bg: string; color: string }> = {
  Terrestrial: { bg: "rgba(34,211,238,0.12)", color: "#22d3ee" },
  "Super Earth": { bg: "rgba(52,211,153,0.12)", color: "#34d399" },
  "Sub-Neptune": { bg: "rgba(168,85,247,0.12)", color: "#c084fc" },
  Neptune: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" },
  "Ice Giant": { bg: "rgba(147,197,253,0.12)", color: "#93c5fd" },
  "Gas Giant": { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  Unknown: { bg: "rgba(100,116,139,0.12)", color: "#64748b" },
}

const COMPOSITION_COLOR: Record<string, { bg: string; color: string }> = {
  Rocky: { bg: "rgba(251,146,60,0.12)", color: "#fb923c" },
  "Rocky-Iron": { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
  "Water World": { bg: "rgba(56,189,248,0.12)", color: "#38bdf8" },
  Ice: { bg: "rgba(165,243,252,0.12)", color: "#a5f3fc" },
  "Hydrogen-Helium": { bg: "rgba(192,132,252,0.12)", color: "#c084fc" },
  Unknown: { bg: "rgba(100,116,139,0.12)", color: "#64748b" },
}

function renderCellContent(fieldKey: ExoplanetField, val: any) {
  if (val === null || val === undefined || val === "") {
    if (fieldKey === "photo_url") {
      return <span className="text-slate-500 font-mono text-xs">No</span>
    }
    return <span style={{ color: "#475569" }}>—</span>
  }

  // 1. Planet Name
  if (fieldKey === "planet_name") {
    return <span className="font-semibold text-slate-100">{String(val)}</span>
  }

  // 2. Photo Status (Indicator whether photo exists or not)
  if (fieldKey === "photo_url") {
    const hasPhoto = Boolean(val)
    return hasPhoto ? (
      <span
        className="rounded-md px-2 py-0.5 text-xs font-medium"
        style={{
          background: "rgba(52, 211, 153, 0.15)",
          color: "#34d399",
          border: "1px solid rgba(52, 211, 153, 0.3)",
        }}
      >
        Yes
      </span>
    ) : (
      <span className="text-slate-500 font-mono text-xs">No</span>
    )
  }

  // 3. Planet Class Badge
  if (fieldKey === "planet_class") {
    const style = CLASS_COLOR[val] || {
      bg: "rgba(100,116,139,0.12)",
      color: "#94a3b8",
    }
    return (
      <span
        className="rounded-md px-2 py-0.5 text-xs font-medium"
        style={{
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.color}35`,
        }}
      >
        {String(val)}
      </span>
    )
  }

  // 4. Composition Badge
  if (fieldKey === "composition") {
    const style = COMPOSITION_COLOR[val] || {
      bg: "rgba(100,116,139,0.12)",
      color: "#94a3b8",
    }
    return (
      <span
        className="rounded-md px-2 py-0.5 text-xs font-medium"
        style={{
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.color}35`,
        }}
      >
        {String(val)}
      </span>
    )
  }

  // 5. Discovery Method Badge
  if (fieldKey === "discovery_method") {
    const style = METHOD_COLOR[val] || {
      bg: "rgba(255,255,255,0.06)",
      color: "#94a3b8",
    }
    return (
      <span
        className="rounded-md px-2 py-0.5 text-xs"
        style={{
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.color}30`,
        }}
      >
        {String(val)}
      </span>
    )
  }

  // 6. Habitability Score with Mini Bar
  if (fieldKey === "habitability_score") {
    const score = Number(val)
    const pct = Math.min(100, Math.max(0, score))
    const color = pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#f87171"
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 w-12 overflow-hidden rounded-full shrink-0"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color }}>
          {pct.toFixed(0)}
        </span>
      </div>
    )
  }

  // 7. Confidences (0.0 - 1.0)
  if (
    fieldKey === "planet_class_confidence" ||
    fieldKey === "composition_confidence" ||
    fieldKey === "habitability_confidence"
  ) {
    const num = Number(val)
    return (
      <span className="text-slate-300 font-mono text-xs">
        {(num * 100).toFixed(0)}%
      </span>
    )
  }

  // 8. Numeric Decimals
  if (typeof val === "number") {
    return (
      <span className="text-slate-300 font-mono text-xs">
        {Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)}
      </span>
    )
  }

  return <span className="text-slate-300 text-xs">{String(val)}</span>
}

// ─── Table Component ──────────────────────────────────────────────────────────

interface ExoplanetsTableProps {
  data: any[]
  total: number
  skip: number
  limit: number
  sortBy: ExoplanetSortField
  order: "asc" | "desc"
  columns: ExoplanetField[]
  isLoading: boolean
  onSelectPlanet: (item: any) => void
  onSortChange: (field: ExoplanetSortField, order: "asc" | "desc") => void
  onPageChange: (skip: number) => void
  onLimitChange: (limit: number) => void
}

const PAGE_SIZES = [10, 25, 50, 100]

export function ExoplanetsTable({
  data,
  total,
  skip,
  limit,
  sortBy,
  order,
  columns,
  isLoading,
  onSelectPlanet,
  onSortChange,
  onPageChange,
  onLimitChange,
}: ExoplanetsTableProps) {
  const pageIndex = Math.floor(skip / limit)
  const pageCount = Math.ceil(total / limit)

  // ── Synchronized Horizontal Scrollbars
  const topScrollRef = useRef<HTMLDivElement>(null)
  const mainScrollRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [tableScrollWidth, setTableScrollWidth] = useState<number>(0)
  const [canScrollHorizontally, setCanScrollHorizontally] =
    useState<boolean>(false)
  const isSyncing = useRef<boolean>(false)

  // Update table scroll width & overflow state on resize or layout change
  useEffect(() => {
    const updateMetrics = () => {
      if (tableRef.current && mainScrollRef.current) {
        const scrollW = tableRef.current.scrollWidth
        const clientW = mainScrollRef.current.clientWidth
        setTableScrollWidth(scrollW)
        setCanScrollHorizontally(scrollW > clientW + 4)
      }
    }

    updateMetrics()

    const observer = new ResizeObserver(() => {
      updateMetrics()
    })

    if (tableRef.current) observer.observe(tableRef.current)
    if (mainScrollRef.current) observer.observe(mainScrollRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleTopScroll = () => {
    if (isSyncing.current) return
    isSyncing.current = true
    if (topScrollRef.current && mainScrollRef.current) {
      mainScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
    }
    requestAnimationFrame(() => {
      isSyncing.current = false
    })
  }

  const handleMainScroll = () => {
    if (isSyncing.current) return
    isSyncing.current = true
    if (topScrollRef.current && mainScrollRef.current) {
      topScrollRef.current.scrollLeft = mainScrollRef.current.scrollLeft
    }
    requestAnimationFrame(() => {
      isSyncing.current = false
    })
  }

  const scrollHorizontally = (delta: number) => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollBy({ left: delta, behavior: "smooth" })
    }
  }

  const handleHeaderClick = (field: ExoplanetField) => {
    if (field === "photo_url") return

    const sortKey = field as unknown as ExoplanetSortField
    if (sortBy === sortKey) {
      onSortChange(sortKey, order === "asc" ? "desc" : "asc")
    } else {
      onSortChange(sortKey, "asc")
    }
  }

  return (
    <div className="flex flex-col gap-2 text-space-primary w-full min-w-0 max-w-full">
      {/* Top Synchronized Horizontal Scrollbar Strip (Only shown when scroll is needed) */}
      {canScrollHorizontally && !isLoading && data.length > 0 && (
        <div
          className="flex items-center justify-between gap-2 rounded-xl px-3 py-1.5"
          style={{
            background: "rgba(15, 25, 50, 0.6)",
            border: "1px solid rgba(34,211,238,0.15)",
          }}
        >
          <div className="flex items-center gap-1.5 text-xs text-space-muted shrink-0">
            <ArrowLeftRight size={13} className="text-space-accent" />
            <span className="hidden sm:inline">Horizontal Scroll:</span>
          </div>

          {/* Top Scrollbar Container */}
          <div
            ref={topScrollRef}
            onScroll={handleTopScroll}
            className="flex-1 overflow-x-auto overflow-y-hidden py-1"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(34,211,238,0.4) rgba(15,25,50,0.5)",
            }}
          >
            <div style={{ width: Math.max(tableScrollWidth, 1), height: 4 }} />
          </div>

          {/* Quick Pan Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => scrollHorizontally(-280)}
              aria-label="Scroll table left"
              title="Scroll columns left"
              className="flex h-6 w-6 items-center justify-center rounded border border-white/10 hover:border-cyan-400/40 text-space-subtle hover:text-space-accent transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => scrollHorizontally(280)}
              aria-label="Scroll table right"
              title="Scroll columns right"
              className="flex h-6 w-6 items-center justify-center rounded border border-white/10 hover:border-cyan-400/40 text-space-subtle hover:text-space-accent transition-colors cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container with Sticky Header */}
      <div
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        className="rounded-2xl overflow-x-hidden w-full max-w-full"
        style={{
          border: "1px solid rgba(34,211,238,0.18)",
          background: "rgba(6, 13, 31, 0.7)",
          scrollbarWidth: "none",
        }}
      >
        <table
          ref={tableRef}
          className="w-max min-w-full text-left border-collapse table-auto"
        >
          <thead className="sticky top-0 z-10 backdrop-blur-md">
            <tr
              style={{
                background: "rgba(6, 18, 42, 0.95)",
                borderBottom: "1px solid rgba(34,211,238,0.25)",
              }}
            >
              {columns.map((colKey) => {
                const def = ALL_EXOPLANET_FIELDS.find((f) => f.key === colKey)
                const label = def ? def.label : colKey
                const isSorted = sortBy === colKey
                const isSortable = colKey !== "photo_url"

                return (
                  <th
                    key={colKey}
                    className="px-4 py-3 text-xs uppercase tracking-widest font-semibold text-space-muted whitespace-nowrap"
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleHeaderClick(colKey)}
                        className="flex items-center gap-1.5 transition-colors hover:text-space-accent cursor-pointer"
                      >
                        <span>{label}</span>
                        {isSorted ? (
                          order === "asc" ? (
                            <ChevronUp
                              size={13}
                              className="text-space-accent"
                            />
                          ) : (
                            <ChevronDown
                              size={13}
                              className="text-space-accent"
                            />
                          )
                        ) : (
                          <ArrowUpDown size={11} className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      <span>{label}</span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2
                      size={28}
                      className="animate-spin text-space-accent"
                    />
                    <span className="text-sm text-space-muted">
                      Fetching exoplanets...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(34,211,238,0.08)",
                        border: "1px solid rgba(34,211,238,0.2)",
                      }}
                    >
                      <Search size={20} className="text-space-accent" />
                    </div>
                    <p className="text-sm text-space-muted font-medium">
                      No exoplanets match your filters
                    </p>
                    <p className="text-xs text-slate-600">
                      Try clearing or loosening your filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => {
                const id = item.id || item.planet_name
                return (
                  <tr
                    key={id || rowIdx}
                    onClick={() => onSelectPlanet(item)}
                    className="transition-colors cursor-pointer"
                    style={{
                      borderBottom:
                        rowIdx < data.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background =
                        "rgba(34,211,238,0.05)"
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background =
                        "transparent"
                    }}
                  >
                    {columns.map((colKey) => (
                      <td
                        key={colKey}
                        className="px-4 py-3 text-sm whitespace-nowrap"
                      >
                        {renderCellContent(colKey, item[colKey])}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {total > 0 && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
          style={{
            background: "rgba(15, 25, 50, 0.5)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-space-muted">
              Showing{" "}
              <span className="text-space-subtle font-medium">{skip + 1}</span>{" "}
              to{" "}
              <span className="text-space-subtle font-medium">
                {Math.min(skip + limit, total)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-space-primary">
                {total.toLocaleString()}
              </span>{" "}
              exoplanets
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-space-muted">Rows per page</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="rounded-md px-2 py-1 text-xs text-space-subtle outline-none"
                style={{
                  background: "rgba(6,13,31,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {PAGE_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-space-muted">
              Page{" "}
              <span className="font-semibold text-space-primary">
                {pageIndex + 1}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-space-primary">
                {Math.max(1, pageCount)}
              </span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(0)}
                disabled={pageIndex === 0}
                aria-label="First page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyan-400/40 text-space-subtle transition-colors cursor-pointer"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => onPageChange(Math.max(0, skip - limit))}
                disabled={pageIndex === 0}
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyan-400/40 text-space-subtle transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => onPageChange(skip + limit)}
                disabled={pageIndex >= pageCount - 1}
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyan-400/40 text-space-subtle transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onPageChange((pageCount - 1) * limit)}
                disabled={pageIndex >= pageCount - 1}
                aria-label="Last page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyan-400/40 text-space-subtle transition-colors cursor-pointer"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
