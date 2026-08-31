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
      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "#060d1f",
          border: "1px solid rgba(34,211,238,0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Columns size={16} className="text-space-accent" />
            <h2 className="text-base font-bold text-space-primary">
              Display Columns ({currentSelection.length} selected)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-space-muted transition-colors hover:text-space-primary cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-space-accent hover:underline cursor-pointer"
            >
              Select all
            </button>
            <span className="text-space-muted">•</span>
            <button
              type="button"
              onClick={resetDefault}
              className="flex items-center gap-1 text-xs font-medium text-space-muted hover:text-space-primary cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset to default
            </button>
          </div>
          <span className="text-xs text-space-muted">
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
                <h3 className="text-xs font-bold uppercase tracking-widest text-space-accent border-b border-white/10 pb-1">
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
                            ? "bg-cyan-950/40 border border-cyan-500/40"
                            : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]"
                        } ${isRequired ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="mt-0.5 shrink-0 text-cyan-400">
                          {selected ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} className="text-space-muted" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-space-primary truncate">
                            {f.label}
                            {f.unit && (
                              <span className="text-space-muted font-normal ml-1">
                                ({f.unit})
                              </span>
                            )}
                            {isRequired && (
                              <span className="ml-1 text-[10px] text-space-accent font-normal">
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
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02]">
          <span className="text-xs text-space-muted">
            {currentSelection.length} columns active
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-space-muted hover:text-space-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyColumns(currentSelection)
                onClose()
              }}
              className="rounded-xl px-5 py-2 text-sm font-medium transition-colors cursor-pointer"
              style={{
                background: "rgba(34,211,238,0.2)",
                border: "1px solid rgba(34,211,238,0.4)",
                color: "#22d3ee",
              }}
            >
              Apply Columns
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
