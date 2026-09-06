import type { ElementType } from "react"

interface ConfidenceCardProps {
  title: string
  value: string | number | null | undefined
  confidence: number | null | undefined
  color: string
  icon: ElementType
  badge?: boolean
}

/**
 * Uniform vertical confidence analysis card with progress bar indicator.
 */
export function ConfidenceCard({
  title,
  value,
  confidence,
  color,
  icon: Icon,
  badge = true,
}: ConfidenceCardProps) {
  const confPct =
    confidence != null ? Math.min(100, Math.max(0, confidence * 100)) : null

  return (
    <div
      className="space-card flex flex-col gap-3 rounded-2xl p-4 transition-all"
      style={{
        border: `1px solid ${color}30`,
      }}
    >
      {/* Title with Icon */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${color}15`, color }}
        >
          <Icon size={14} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-space-muted">
          {title}
        </span>
      </div>

      {/* Value displayed UNDER the title */}
      <div className="pt-0.5">
        {badge ? (
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            {value ?? "Unknown"}
          </span>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono" style={{ color }}>
              {value != null ? Number(value).toFixed(1) : "—"}
            </span>
            <span className="text-xs text-space-muted">/ 100</span>
          </div>
        )}
      </div>

      {/* Confidence with Progress Bar */}
      <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-space-muted">Confidence</span>
          <span className="font-mono font-medium" style={{ color }}>
            {confPct != null ? `${confPct.toFixed(0)}%` : "N/A"}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: confPct != null ? `${confPct}%` : "0%",
              background: color,
            }}
          />
        </div>
      </div>
    </div>
  )
}
