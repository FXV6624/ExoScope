import type { ElementType } from "react"

interface DashStatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: ElementType
  accent?: "cyan" | "emerald" | "purple"
}

export function DashStatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: DashStatCardProps) {
  const accentStyles = {
    cyan: {
      border: "border-cyan-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    emerald: {
      border: "border-emerald-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    purple: {
      border: "border-purple-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  }

  const selectedAccent = accent ? accentStyles[accent] : accentStyles.cyan

  return (
    <div
      className={`space-card group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 backdrop-blur-xl transition-all duration-300 ${
        accent ? selectedAccent.border : "border-white/10"
      } ${selectedAccent.glow} border`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ${selectedAccent.iconBg}`}
        >
          <Icon size={17} />
        </span>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-400 truncate">{sub}</p>}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  )
}
