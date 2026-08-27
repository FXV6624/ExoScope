import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Layers,
  Loader2,
  X,
} from "lucide-react"
import { useState } from "react"

import type { ExportFormat } from "@/client"

interface ExportModalProps {
  onExport: (
    format: ExportFormat,
    compress: boolean,
    filename: string,
  ) => Promise<void>
  onClose: () => void
  isLoading: boolean
  activeFilterCount: number
  selectedColumnCount: number
}

export function ExportModal({
  onExport,
  onClose,
  isLoading,
  activeFilterCount,
  selectedColumnCount,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv")
  const [compress, setCompress] = useState<boolean>(false)
  const [filename, setFilename] = useState<string>("exoplanets")

  const formats: {
    format: ExportFormat
    label: string
    ext: string
    icon: React.ElementType
  }[] = [
    {
      format: "csv",
      label: "CSV",
      ext: ".csv",
      icon: FileSpreadsheet,
    },
    {
      format: "json",
      label: "JSON",
      ext: ".json",
      icon: FileText,
    },
    {
      format: "parquet",
      label: "Parquet",
      ext: ".parquet",
      icon: Layers,
    },
  ]

  const handleDownload = async () => {
    await onExport(selectedFormat, compress, filename.trim() || "exoplanets")
  }

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close export modal backdrop"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Compact Modal Dialog (Fits without scroll) */}
      <div
        className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "rgba(6, 13, 31, 0.98)",
          border: "1px solid rgba(34,211,238,0.3)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-space-accent" />
            <h2 className="text-sm font-bold text-space-primary">
              Export Exoplanet Dataset
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-space-muted transition-colors hover:text-space-primary cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Compact Form Body */}
        <div className="p-5 space-y-4">
          {/* Scope Notice Banner */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-xs"
            style={{
              background: "rgba(34,211,238,0.06)",
              border: "1px solid rgba(34,211,238,0.2)",
            }}
          >
            <div className="flex items-center gap-1.5 text-space-accent font-medium">
              <AlertCircle size={13} />
              <span>Exporting current view only:</span>
            </div>
            <div className="flex items-center gap-2 text-space-subtle">
              <span className="font-semibold text-space-primary">
                {activeFilterCount > 0
                  ? `${activeFilterCount} active filters`
                  : "All records"}
              </span>
              <span>•</span>
              <span className="font-semibold text-space-primary">
                {selectedColumnCount} columns
              </span>
            </div>
          </div>

          {/* Format Selection (Horizontal Row) */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-space-muted">
              File Format
            </span>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((fmt) => {
                const Icon = fmt.icon
                const isSelected = selectedFormat === fmt.format
                return (
                  <button
                    key={fmt.format}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.format)}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 text-center transition-all cursor-pointer"
                    style={{
                      background: isSelected
                        ? "rgba(34,211,238,0.15)"
                        : "rgba(15,25,50,0.6)",
                      border: isSelected
                        ? "1px solid rgba(34,211,238,0.5)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icon
                      size={18}
                      className={
                        isSelected ? "text-space-accent" : "text-space-muted"
                      }
                    />
                    <span
                      className={`text-xs font-medium ${
                        isSelected
                          ? "text-space-primary font-semibold"
                          : "text-space-subtle"
                      }`}
                    >
                      {fmt.label}
                    </span>
                    <span className="text-[10px] text-space-muted font-mono">
                      {fmt.ext}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filename & Compression (Inline Side-by-Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-1">
              <span className="text-xs text-space-muted">Filename</span>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="exoplanets"
                className="w-full rounded-lg px-3 py-2 text-sm text-space-subtle outline-none placeholder:text-slate-600"
                style={{
                  background: "rgba(15,25,50,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <label
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 transition-colors cursor-pointer text-xs select-none"
              style={{
                background: compress
                  ? "rgba(251,191,36,0.1)"
                  : "rgba(15,25,50,0.8)",
                borderColor: compress
                  ? "rgba(251,191,36,0.3)"
                  : "rgba(255,255,255,0.1)",
              }}
            >
              <input
                type="checkbox"
                checked={compress}
                onChange={(e) => setCompress(e.target.checked)}
                className="rounded border-slate-700"
              />
              <FolderArchive size={14} className="text-amber-400" />
              <span className="text-space-primary font-medium">ZIP (.zip)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3.5 bg-black/20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-space-muted hover:text-space-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: isLoading
                ? "rgba(34,211,238,0.08)"
                : "rgba(34,211,238,0.2)",
              border: "1px solid rgba(34,211,238,0.4)",
              color: isLoading ? "#64748b" : "#22d3ee",
            }}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            {isLoading
              ? "Downloading..."
              : `Download ${selectedFormat.toUpperCase()}${compress ? " (ZIP)" : ""}`}
          </button>
        </div>
      </div>
    </>
  )
}
