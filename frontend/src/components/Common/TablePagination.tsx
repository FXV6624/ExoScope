import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

interface TablePaginationProps {
  skip: number
  limit: number
  total: number
  pageSizes?: number[]
  itemLabel?: string
  onLimitChange: (limit: number) => void
  onPageChange: (skip: number) => void
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100]

export function TablePagination({
  skip,
  limit,
  total,
  pageSizes = DEFAULT_PAGE_SIZES,
  itemLabel = "items",
  onLimitChange,
  onPageChange,
}: TablePaginationProps) {
  if (total <= 0) return null

  const pageIndex = Math.floor(skip / limit)
  const pageCount = Math.ceil(total / limit)

  return (
    <div className="space-card flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="text-foreground font-medium">{skip + 1}</span> to{" "}
          <span className="text-foreground font-medium">
            {Math.min(skip + limit, total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {total.toLocaleString()}
          </span>{" "}
          {itemLabel}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows per page</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-md px-2 py-1 text-xs outline-none bg-card border border-border text-foreground cursor-pointer"
          >
            {pageSizes.map((sz) => (
              <option key={sz} value={sz} className="bg-card text-foreground">
                {sz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Page{" "}
          <span className="font-semibold text-foreground">{pageIndex + 1}</span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {Math.max(1, pageCount)}
          </span>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(0)}
            disabled={pageIndex === 0}
            aria-label="First page"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:border-cyan-500/50 text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, skip - limit))}
            disabled={pageIndex === 0}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:border-cyan-500/50 text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(skip + limit)}
            disabled={pageIndex >= pageCount - 1}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:border-cyan-500/50 text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange((pageCount - 1) * limit)}
            disabled={pageIndex >= pageCount - 1}
            aria-label="Last page"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:border-cyan-500/50 text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
