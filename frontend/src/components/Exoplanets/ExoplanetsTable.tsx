import {
  ArrowLeftRight,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  Search,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type {
  ExoplanetField,
  ExoplanetPublic,
  ExoplanetSortField,
} from "@/client"
import { TablePagination } from "@/components/Common/TablePagination"
import {
  CLASS_BADGE_CLASSES,
  COMPOSITION_BADGE_CLASSES,
  DEFAULT_BADGE_CLASS,
  getHabitabilityScoreColor,
  METHOD_BADGE_CLASSES,
} from "./badgeUtils"
import { ALL_EXOPLANET_FIELDS } from "./fieldDefinitions"

// ─── Badges & Formatters ───────────────────────────────────────────────────────

function renderCellContent(fieldKey: ExoplanetField, val: unknown) {
  if (val === null || val === undefined || val === "") {
    if (fieldKey === "photo_url") {
      return <span className="text-muted-foreground font-mono text-xs">No</span>
    }
    return <span className="text-muted-foreground/60">—</span>
  }

  // 1. Planet Name
  if (fieldKey === "planet_name") {
    return <span className="font-semibold text-foreground">{String(val)}</span>
  }

  // 2. Photo Status (Indicator whether photo exists or not)
  if (fieldKey === "photo_url") {
    const hasPhoto = !String(val).startsWith("/assets")
    return hasPhoto ? (
      <span className="rounded-md px-2 py-0.5 text-xs font-semibold border bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40">
        Yes
      </span>
    ) : (
      <span className="text-muted-foreground font-mono text-xs">No</span>
    )
  }

  // 3. Planet Class Badge
  if (fieldKey === "planet_class") {
    const key = String(val)
    const cls = CLASS_BADGE_CLASSES[key] || DEFAULT_BADGE_CLASS
    return (
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${cls}`}
      >
        {key}
      </span>
    )
  }

  // 4. Composition Badge
  if (fieldKey === "composition") {
    const key = String(val)
    const cls = COMPOSITION_BADGE_CLASSES[key] || DEFAULT_BADGE_CLASS
    return (
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${cls}`}
      >
        {key}
      </span>
    )
  }

  // 5. Discovery Method Badge
  if (fieldKey === "discovery_method") {
    const key = String(val)
    const cls = METHOD_BADGE_CLASSES[key] || DEFAULT_BADGE_CLASS
    return (
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${cls}`}
      >
        {key}
      </span>
    )
  }

  // 6. Habitability Score with Mini Bar
  if (fieldKey === "habitability_score") {
    const score = Number(val)
    const pct = Math.min(100, Math.max(0, score))
    const color = getHabitabilityScoreColor(pct)
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-12 overflow-hidden rounded-full shrink-0 bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-xs font-bold font-mono" style={{ color }}>
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
      <span className="text-foreground font-mono text-xs font-medium">
        {(num * 100).toFixed(0)}%
      </span>
    )
  }

  // 8. Numeric Decimals
  if (typeof val === "number") {
    return (
      <span className="text-foreground font-mono text-xs font-medium">
        {Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)}
      </span>
    )
  }

  return <span className="text-foreground text-xs">{String(val)}</span>
}

// ─── Table Component ──────────────────────────────────────────────────────────

interface ExoplanetsTableProps {
  data: ExoplanetPublic[]
  total: number
  skip: number
  limit: number
  sortBy: ExoplanetSortField
  order: "asc" | "desc"
  columns: ExoplanetField[]
  isLoading: boolean
  onSelectPlanet: (item: ExoplanetPublic) => void
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
        className="space-card rounded-2xl overflow-x-hidden w-full max-w-full"
        style={{
          scrollbarWidth: "none",
        }}
      >
        <table
          ref={tableRef}
          className="w-max min-w-full text-left border-collapse table-auto"
        >
          <thead className="sticky top-0 z-10 backdrop-blur-md">
            <tr className="border-b border-border bg-slate-100/90 dark:bg-slate-900/95">
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
                    className="transition-colors cursor-pointer border-b border-border/40 hover:bg-slate-100/70 dark:hover:bg-cyan-500/10"
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
      <TablePagination
        skip={skip}
        limit={limit}
        total={total}
        itemLabel="exoplanets"
        pageSizes={PAGE_SIZES}
        onLimitChange={onLimitChange}
        onPageChange={onPageChange}
      />
    </div>
  )
}
