import { ArrowDownAZ, ArrowUpAZ } from "lucide-react"
import type { ExoplanetSortField } from "@/client"

interface CatalogSortBarProps {
  sortBy: ExoplanetSortField
  order: "asc" | "desc"
  sortableFields: { key: ExoplanetSortField; label: string }[]
  onSortChange: (field: ExoplanetSortField, order: "asc" | "desc") => void
  total: number
}

export function CatalogSortBar({
  sortBy,
  order,
  sortableFields,
  onSortChange,
  total,
}: CatalogSortBarProps) {
  return (
    <div className="space-card flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-2.5 shadow-xs">
      {/* Sort Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground font-semibold">
          Sort by:
        </span>
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as ExoplanetSortField, order)
          }
          className="rounded-lg px-2.5 py-1 text-xs bg-card border border-border text-foreground outline-none cursor-pointer"
        >
          {sortableFields.map((f) => (
            <option
              key={f.key}
              value={f.key}
              className="bg-card text-foreground"
            >
              {f.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onSortChange(sortBy, order === "asc" ? "desc" : "asc")}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-card border border-border text-foreground hover:border-cyan-500/50 transition-colors cursor-pointer shadow-xs"
        >
          {order === "asc" ? (
            <>
              <ArrowUpAZ
                size={13}
                className="text-cyan-600 dark:text-cyan-400"
              />
              <span>Ascending</span>
            </>
          ) : (
            <>
              <ArrowDownAZ
                size={13}
                className="text-cyan-600 dark:text-cyan-400"
              />
              <span>Descending</span>
            </>
          )}
        </button>
      </div>

      {/* Results Counter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">
          Total Results:
        </span>
        <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
          {total.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
