import { BarChart3, X } from "lucide-react"

import type { ExoplanetStats } from "@/client"

interface StatsModalProps {
  stats: ExoplanetStats
  onClose: () => void
}

function StatRow({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-space-muted">{label}</span>
      <span className="text-sm font-medium text-space-primary">
        {value ?? "—"}
      </span>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col rounded-xl p-4"
      style={{
        background: "rgba(15, 25, 50, 0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p className="mb-2 text-xs uppercase tracking-widest text-space-accent">
        {title}
      </p>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  )
}

export function ExoplanetStatsModal({ stats, onClose }: StatsModalProps) {
  const topMethods = Object.entries(stats.by_method)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topClasses = Object.entries(stats.planet_class.by_class)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topComps = Object.entries(stats.composition.by_composition)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6"
        style={{
          maxHeight: "85vh",
          background: "rgba(6, 13, 31, 0.97)",
          border: "1px solid rgba(34,211,238,0.25)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-space-accent" />
            <h2 className="text-lg font-bold text-space-primary">
              Exoplanet Statistics
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-space-muted transition-colors hover:text-space-subtle"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Overview */}
          <Section title="Overview">
            <StatRow
              label="Total Planets"
              value={stats.total.toLocaleString()}
            />
            <StatRow
              label="Potentially Habitable"
              value={stats.habitability.potentially_habitable?.toLocaleString()}
            />
            <StatRow
              label="Avg Habitability Score"
              value={
                stats.habitability.average != null
                  ? stats.habitability.average.toFixed(1)
                  : null
              }
            />
          </Section>

          {/* Discovery Methods */}
          <Section title="By Discovery Method">
            {topMethods.map(([method, count]) => (
              <StatRow
                key={method}
                label={method}
                value={count.toLocaleString()}
              />
            ))}
          </Section>

          {/* Planet Classes */}
          <Section title="Planet Class">
            {topClasses.map(([cls, count]) => (
              <StatRow key={cls} label={cls} value={count.toLocaleString()} />
            ))}
          </Section>

          {/* Composition */}
          <Section title="Composition">
            {topComps.map(([comp, count]) => (
              <StatRow key={comp} label={comp} value={count.toLocaleString()} />
            ))}
          </Section>

          {/* Radius Stats */}
          <Section title="Radius (R⊕)">
            <StatRow
              label="Average"
              value={
                stats.radius.average != null
                  ? stats.radius.average.toFixed(2)
                  : null
              }
            />
            <StatRow
              label="Minimum"
              value={
                stats.radius.minimum != null
                  ? stats.radius.minimum.toFixed(2)
                  : null
              }
            />
            <StatRow
              label="Maximum"
              value={
                stats.radius.maximum != null
                  ? stats.radius.maximum.toFixed(2)
                  : null
              }
            />
          </Section>

          {/* Distance Stats */}
          <Section title="Distance from Earth (pc)">
            <StatRow
              label="Average"
              value={
                stats.distance.average != null
                  ? stats.distance.average.toFixed(1)
                  : null
              }
            />
            <StatRow
              label="Minimum"
              value={
                stats.distance.minimum != null
                  ? stats.distance.minimum.toFixed(1)
                  : null
              }
            />
            <StatRow
              label="Maximum"
              value={
                stats.distance.maximum != null
                  ? stats.distance.maximum.toFixed(1)
                  : null
              }
            />
          </Section>
        </div>
      </div>
    </>
  )
}
