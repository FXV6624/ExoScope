import type { ElementType, ReactNode } from "react"

interface StatRowProps {
  label: string
  value: string | number | null | undefined
  sub?: string
}

export function StatRow({ label, value, sub }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-none">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-baseline gap-1 text-right">
        <span className="text-sm font-semibold font-mono text-slate-200">
          {value ?? "—"}
        </span>
        {sub && (
          <span className="text-[11px] text-slate-500 font-sans">{sub}</span>
        )}
      </div>
    </div>
  )
}

interface StatsSectionProps {
  title: string
  icon?: ElementType
  className?: string
  children: ReactNode
}

export function StatsSection({
  title,
  icon: Icon,
  className,
  children,
}: StatsSectionProps) {
  return (
    <div
      className={`space-card flex flex-col rounded-xl p-4 transition-all border border-white/10 ${className || ""}`}
    >
      <div className="mb-2.5 flex items-center gap-2">
        {Icon && <Icon size={14} className="text-cyan-400" />}
        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
          {title}
        </p>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}

interface SummaryGroupProps {
  label: string
  summary?: {
    average?: number | null
    minimum?: number | null
    maximum?: number | null
  }
  unit?: string
}

export function SummaryGroup({ label, summary, unit }: SummaryGroupProps) {
  const formatVal = (v?: number | null) => {
    if (v == null) return "—"
    if (Math.abs(v) >= 1000)
      return v.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    return v.toFixed(2)
  }

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-white/5 last:border-none">
      <span className="text-xs font-medium text-slate-300">
        {label}{" "}
        {unit && <span className="text-slate-500 font-normal">({unit})</span>}
      </span>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-white/5 p-1.5">
          <span className="text-[10px] text-slate-400 block">Min</span>
          <span className="font-mono text-slate-200">
            {formatVal(summary?.minimum)}
          </span>
        </div>
        <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-1.5">
          <span className="text-[10px] text-cyan-400 block font-medium">
            Avg
          </span>
          <span className="font-mono text-cyan-300 font-semibold">
            {formatVal(summary?.average)}
          </span>
        </div>
        <div className="rounded-lg bg-white/5 p-1.5">
          <span className="text-[10px] text-slate-400 block">Max</span>
          <span className="font-mono text-slate-200">
            {formatVal(summary?.maximum)}
          </span>
        </div>
      </div>
    </div>
  )
}
