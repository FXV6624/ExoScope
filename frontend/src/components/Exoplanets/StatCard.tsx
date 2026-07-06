import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  unit?: string
  accent?: boolean
}

/**
 * Displays a single numeric or text stat inside a space-themed card.
 */
export function StatCard({ icon, label, value, unit, accent }: StatCardProps) {
  return (
    <div
      className={`space-card flex flex-col gap-2 p-4 transition-colors hover:border-cyan-500/50 ${
        accent ? "space-card-accent" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-space-accent">{icon}</span>
        <span className="text-xs uppercase tracking-widest text-space-subtle">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold text-space-primary">
          {value}
        </span>
        {unit && <span className="text-xs text-space-muted">{unit}</span>}
      </div>
    </div>
  )
}
