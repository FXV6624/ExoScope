import { Calculator, HelpCircle, Sparkles, X } from "lucide-react"
import { useEffect, useState } from "react"

import { ClassificationTab } from "./ConfidenceExplanation/ClassificationTab"
import { FormulasTab } from "./ConfidenceExplanation/FormulasTab"

interface ConfidenceExplanationModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = "classification" | "formulas"

export function ConfidenceExplanationModal({
  isOpen,
  onClose,
}: ConfidenceExplanationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("classification")

  // Lock body scroll when modal is open so background cannot scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close classification explanation modal backdrop"
        className="fixed inset-0 bg-black/75 cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="space-modal relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Methodology & Scientific Calculations
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-muted/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("classification")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "classification"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles size={14} />
            How Classification Works
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("formulas")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "formulas"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calculator size={14} />
            Scientific References
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-foreground">
          {activeTab === "classification" ? (
            <ClassificationTab />
          ) : (
            <FormulasTab />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-3.5 bg-card">
          <button
            type="button"
            onClick={onClose}
            className="space-card rounded-xl px-5 py-2 text-xs font-semibold text-foreground transition-all cursor-pointer hover:border-cyan-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
