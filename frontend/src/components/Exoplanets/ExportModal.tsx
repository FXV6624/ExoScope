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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close export modal backdrop"
        className="fixed inset-0 bg-black/75 cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Compact Modal Dialog (Fits without scroll) */}
      <div className="space-modal relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl">
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
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-xs bg-cyan-50 border border-cyan-200 text-cyan-950 dark:bg-cyan-950/40 dark:border-cyan-500/30 dark:text-cyan-200">
            <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-medium">
              <AlertCircle size={13} />
              <span>Exporting current view only:</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-foreground">
                {activeFilterCount > 0
                  ? `${activeFilterCount} active filters`
                  : "All records"}
              </span>
              <span>•</span>
              <span className="font-semibold text-foreground">
                {selectedColumnCount} columns
              </span>
            </div>
          </div>

          {/* Format Selection (Horizontal Row) */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 text-center transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? "bg-cyan-50 border-2 border-cyan-500 text-cyan-800 dark:bg-cyan-500/20 dark:border-cyan-400 dark:text-cyan-300"
                        : "space-card text-foreground hover:border-cyan-500/40"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        isSelected
                          ? "text-cyan-600 dark:text-cyan-400"
                          : "text-muted-foreground"
                      }
                    />
                    <span
                      className={`text-xs font-medium ${
                        isSelected
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {fmt.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
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
              <span className="text-xs text-muted-foreground">Filename</span>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="exoplanets"
                className="w-full rounded-lg px-3 py-2 text-sm bg-card border border-border text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <label
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer text-xs select-none ${
                compress
                  ? "bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300"
                  : "bg-card border-border text-foreground"
              }`}
            >
              <input
                type="checkbox"
                checked={compress}
                onChange={(e) => setCompress(e.target.checked)}
                className="rounded border-slate-700"
              />
              <FolderArchive size={14} className="text-amber-500" />
              <span className="font-medium">ZIP (.zip)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-card">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all cursor-pointer shadow-md bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
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
    </div>
  )
}
