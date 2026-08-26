import { CheckSquare, Columns, RotateCcw, Square, X } from "lucide-react"

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
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close column selection backdrop"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Modal dialog */}
      <div
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "rgba(6, 13, 31, 0.98)",
          border: "1px solid rgba(34,211,238,0.3)",
          backdropFilter: "blur(20px)",
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

        {/* Category-based Selection Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {categories.map((category) => {
            const fieldsInCategory = ALL_EXOPLANET_FIELDS.filter(
              (f) => f.category === category,
            )
            return (
              <div key={category} className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-widest text-space-accent">
                  {category}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fieldsInCategory.map((field) => {
                    const isChecked = currentSelection.includes(field.key)
                    return (
                      <button
                        type="button"
                        key={field.key}
                        onClick={() => toggleField(field.key)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all cursor-pointer"
                        style={{
                          background: isChecked
                            ? "rgba(34,211,238,0.1)"
                            : "rgba(15,25,50,0.6)",
                          border: isChecked
                            ? "1px solid rgba(34,211,238,0.4)"
                            : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare
                            size={16}
                            className="text-space-accent shrink-0"
                          />
                        ) : (
                          <Square
                            size={16}
                            className="text-space-muted shrink-0"
                          />
                        )}
                        <span
                          className={`text-sm ${
                            isChecked
                              ? "text-space-primary font-medium"
                              : "text-space-muted"
                          }`}
                        >
                          {field.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-lg px-2.5 py-1 text-xs text-space-muted hover:text-space-accent transition-colors cursor-pointer"
            >
              Select All
            </button>
            <span className="text-white/20">|</span>
            <button
              type="button"
              onClick={resetDefault}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-space-muted hover:text-space-accent transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset Default
            </button>
          </div>
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
    </>
  )
}

import { useState } from "react"
