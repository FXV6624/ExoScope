import { Columns, Download, Filter, Search, Sparkles, X } from "lucide-react"

interface CatalogToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  isHabitableFilterActive: boolean
  onToggleHabitableFilter: () => void
  habitableTitle: string
  activeFiltersCount: number
  onOpenFilters: () => void
  columnsCount: number
  onOpenColumns: () => void
  onOpenExport: () => void
}

export function CatalogToolbar({
  search,
  onSearchChange,
  isHabitableFilterActive,
  onToggleHabitableFilter,
  habitableTitle,
  activeFiltersCount,
  onOpenFilters,
  columnsCount,
  onOpenColumns,
  onOpenExport,
}: CatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-space-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search exoplanets by name..."
          className="space-card w-full rounded-xl py-2 pl-9 pr-8 text-sm outline-none placeholder:text-muted-foreground text-foreground"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
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
          onClick={onToggleHabitableFilter}
          title={habitableTitle}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer select-none shadow-xs ${
            isHabitableFilterActive
              ? "bg-emerald-50 border border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
              : "space-card text-foreground hover:border-emerald-500/50"
          }`}
        >
          <Sparkles
            size={14}
            className={
              isHabitableFilterActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }
          />
          <span>Habitable</span>
          {isHabitableFilterActive && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ml-0.5 bg-emerald-200 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-300">
              ✓
            </span>
          )}
        </button>

        {/* Filters Button */}
        <button
          type="button"
          onClick={onOpenFilters}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer select-none shadow-xs ${
            activeFiltersCount > 0
              ? "bg-cyan-50 border border-cyan-500 text-cyan-700 dark:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-300"
              : "space-card text-foreground hover:border-cyan-500/50"
          }`}
        >
          <Filter size={14} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold bg-cyan-200 text-cyan-800 dark:bg-cyan-500/30 dark:text-cyan-300">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Columns Button */}
        <button
          type="button"
          onClick={onOpenColumns}
          className="space-card flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer select-none shadow-xs text-foreground hover:border-cyan-500/50"
        >
          <Columns size={14} />
          <span>Columns ({columnsCount})</span>
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="space-card flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer select-none shadow-xs text-foreground hover:border-cyan-500/50"
        >
          <Download size={14} />
          <span>Export</span>
        </button>
      </div>
    </div>
  )
}
