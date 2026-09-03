import { CheckSquare, Columns, RotateCcw, Square, X } from "lucide-react"
import { useState } from "react"

import type { ExoplanetField } from "@/client"
import { ALL_EXOPLANET_FIELDS, DEFAULT_COLUMNS } from "./fieldDefinitions"

interface ColumnsModalProps {
  selectedColumns: ExoplanetField[]
  onApplyColumns: (cols: ExoplanetField[]) => void
  onClose: () => void
}

export function ColumnsModal({
  selectedColumns,
  onApplyColumns,
  onClose,
}: ColumnsModalProps) {
  const [currentSelection, setCurrentSelection] =
    useState<ExoplanetField[]>(selectedColumns)

  const toggleField = (field: ExoplanetField) => {
    if (currentSelection.includes(field)) {
      if (currentSelection.length <= 1) return // Keep at least one column
      setCurrentSelection(currentSelection.filter((f) => f !== field))
    } else {
      setCurrentSelection([...currentSelection, field])
    }
  }

  const selectAll = () => {
    setCurrentSelection(ALL_EXOPLANET_FIELDS.map((f) => f.key))
  }

  const resetDefault = () => {
    setCurrentSelection(DEFAULT_COLUMNS)
  }

  const categories = [
    "General",
    "Planetary",
    "Environment",
    "Stellar & System",
  ] as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close column selection backdrop"
        className="fixed inset-0 bg-black/75 cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Modal dialog */}
      <div className="space-modal relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl bg-background border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-2">
            <Columns size={16} className="text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-foreground">
              Display Columns ({currentSelection.length} selected)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3 bg-muted/40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              Select all
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              type="button"
              onClick={resetDefault}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset to default
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            {ALL_EXOPLANET_FIELDS.length} available
          </span>
        </div>

        {/* Scrollable Column Groups */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {categories.map((cat) => {
            const fieldsInCat = ALL_EXOPLANET_FIELDS.filter(
              (f) => f.category === cat,
            )
            return (
              <div key={cat} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 border-b border-border pb-1">
                  {cat}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fieldsInCat.map((f) => {
                    const selected = currentSelection.includes(f.key)
                    const isRequired = f.key === "planet_name"
                    return (
                      <button
                        type="button"
                        key={f.key}
                        disabled={isRequired}
                        onClick={() => toggleField(f.key)}
                        className={`flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-all ${
                          selected
                            ? "bg-cyan-50 border-2 border-cyan-500 text-cyan-950 dark:bg-cyan-950/40 dark:border-cyan-500/40 dark:text-cyan-200"
                            : "space-card bg-muted/50 border border-transparent hover:border-cyan-500/40 text-foreground"
                        } ${isRequired ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="mt-0.5 shrink-0 text-cyan-600 dark:text-cyan-400">
                          {selected ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square
                              size={16}
                              className="text-muted-foreground"
                            />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {f.label}
                            {f.unit && (
                              <span className="text-muted-foreground font-normal ml-1">
                                ({f.unit})
                              </span>
                            )}
                            {isRequired && (
                              <span className="ml-1.5 text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                                (Required)
                              </span>
                            )}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-card">
          <span className="text-xs text-muted-foreground">
            {currentSelection.length} columns active
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyColumns(currentSelection)
                onClose()
              }}
              className="rounded-xl px-5 py-2 text-sm font-semibold transition-all cursor-pointer shadow-md bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Apply Columns
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
