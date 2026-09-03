import {
  BarChart3,
  CheckCircle2,
  Compass,
  Globe,
  Orbit,
  Sparkles,
  Thermometer,
  Trophy,
  X,
} from "lucide-react"

import type { ExoplanetStats } from "@/client"
import { getStoredThresholds } from "@/utils"

interface StatsModalProps {
  stats: ExoplanetStats
  onClose: () => void
}

import {
  StatsSection as Section,
  StatRow,
  SummaryGroup,
} from "./StatsComponents"

export function ExoplanetStatsModal({ stats, onClose }: StatsModalProps) {
  // Sort discovery methods
  const methods = Object.entries(stats.by_method || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  // Sort discovery decades
  const decades = Object.entries(stats.by_decade || {}).sort((a, b) =>
    a[0].localeCompare(b[0]),
  )

  // Planet classes
  const classes = Object.entries(stats.planet_class?.by_class || {}).sort(
    (a, b) => b[1] - a[1],
  )

  // Compositions
  const compositions = Object.entries(
    stats.composition?.by_composition || {},
  ).sort((a, b) => b[1] - a[1])

  // Completeness items
  const completenessEntries = Object.entries(stats.completeness || {}).sort(
    (a, b) => b[1] - a[1],
  )

  // Option 1 Calculations: Catalog Insights & Highlights
  const dominantClass = classes[0]
  const dominantClassPct =
    dominantClass && stats.total > 0
      ? ((dominantClass[1] / stats.total) * 100).toFixed(2)
      : "0.00"

  const dominantComposition = compositions[0]
  const dominantCompositionPct =
    dominantComposition && stats.total > 0
      ? ((dominantComposition[1] / stats.total) * 100).toFixed(2)
      : "0.00"

  const peakDecade = [...decades].sort((a, b) => b[1] - a[1])[0]
  const peakDecadePct =
    peakDecade && stats.total > 0
      ? ((peakDecade[1] / stats.total) * 100).toFixed(2)
      : "0.00"

  const avgCompleteness =
    completenessEntries.length > 0
      ? (
          completenessEntries.reduce((acc, [, val]) => acc + val, 0) /
          completenessEntries.length
        ).toFixed(2)
      : "0.00"

  const thresholds = getStoredThresholds()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 bg-black/75 cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="space-modal relative z-10 w-full max-w-5xl overflow-y-auto rounded-2xl p-6 sm:p-7 shadow-2xl"
        style={{
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Exoplanet Statistics
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Grid: 3 rows of 3 symmetric cards + 1 full width footer */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* ─── Row 1 ─── */}
          {/* 1. Overview & Habitability */}
          <Section title="Overview & Habitability" icon={Globe}>
            <StatRow
              label="Total Planets in DB"
              value={stats.total.toLocaleString()}
            />
            <StatRow
              label="Potentially Habitable"
              value={stats.habitability?.potentially_habitable?.toLocaleString()}
              sub={`(Score ≥ ${thresholds.score.toFixed(0)} | Conf ≥ ${(thresholds.confidence * 100).toFixed(0)}%)`}
            />
            <StatRow
              label="Avg Habitability Score"
              value={
                stats.habitability?.average != null
                  ? stats.habitability.average.toFixed(2)
                  : null
              }
              sub="/ 100"
            />
            <StatRow
              label="Habitability Confidence"
              value={
                stats.habitability?.average_confidence != null
                  ? `${(stats.habitability.average_confidence * 100).toFixed(2)}%`
                  : null
              }
            />
            <StatRow
              label="Score Range"
              value={
                stats.habitability?.minimum != null &&
                stats.habitability?.maximum != null
                  ? `${stats.habitability.minimum.toFixed(2)} - ${stats.habitability.maximum.toFixed(2)}`
                  : "—"
              }
            />
          </Section>

          {/* 2. Discoveries by Decade */}
          <Section title="Discoveries by Decade" icon={Sparkles}>
            {decades.length > 0 ? (
              decades.map(([decade, count]) => {
                const pct =
                  stats.total > 0
                    ? ((count / stats.total) * 100).toFixed(2)
                    : "0.00"
                return (
                  <StatRow
                    key={decade}
                    label={`${decade}s`}
                    value={count.toLocaleString()}
                    sub={`(${pct}%)`}
                  />
                )
              })
            ) : (
              <p className="text-xs text-slate-400 py-2">No decadal data</p>
            )}
          </Section>

          {/* 3. Discovery Methods */}
          <Section title="Discovery Methods" icon={Orbit}>
            {methods.map(([method, count]) => {
              const pct =
                stats.total > 0
                  ? ((count / stats.total) * 100).toFixed(2)
                  : "0.00"
              return (
                <StatRow
                  key={method}
                  label={method}
                  value={count.toLocaleString()}
                  sub={`(${pct}%)`}
                />
              )
            })}
          </Section>

          {/* ─── Row 2 ─── */}
          {/* 4. Planet Class Taxonomy */}
          <Section title="Planet Classification" icon={Globe}>
            {classes.map(([cls, count]) => {
              const pct =
                stats.total > 0
                  ? ((count / stats.total) * 100).toFixed(2)
                  : "0.00"
              return (
                <StatRow
                  key={cls}
                  label={cls}
                  value={count.toLocaleString()}
                  sub={`(${pct}%)`}
                />
              )
            })}
            {stats.planet_class?.average_confidence != null && (
              <StatRow
                label="Class Confidence"
                value={`${(stats.planet_class.average_confidence * 100).toFixed(2)}%`}
              />
            )}
          </Section>

          {/* 5. Planetary Composition */}
          <Section title="Composition Breakdown" icon={Sparkles}>
            {compositions.map(([comp, count]) => {
              const pct =
                stats.total > 0
                  ? ((count / stats.total) * 100).toFixed(2)
                  : "0.00"
              return (
                <StatRow
                  key={comp}
                  label={comp}
                  value={count.toLocaleString()}
                  sub={`(${pct}%)`}
                />
              )
            })}
            {stats.composition?.average_confidence != null && (
              <StatRow
                label="Comp. Confidence"
                value={`${(stats.composition.average_confidence * 100).toFixed(2)}%`}
              />
            )}
          </Section>

          {/* 6. Catalog Insights & Highlights (Option 1) */}
          <Section title="Catalog Highlights" icon={Trophy}>
            <StatRow
              label="Dominant Class"
              value={dominantClass ? dominantClass[0] : "—"}
              sub={`(${dominantClassPct}%)`}
            />
            <StatRow
              label="Dominant Composition"
              value={dominantComposition ? dominantComposition[0] : "—"}
              sub={`(${dominantCompositionPct}%)`}
            />
            <StatRow
              label="Peak Discovery Era"
              value={peakDecade ? `${peakDecade[0]}s` : "—"}
              sub={`(${peakDecadePct}%)`}
            />
            <StatRow
              label="Mean Data Completeness"
              value={`${avgCompleteness}%`}
              sub="across all fields"
            />
          </Section>

          {/* ─── Row 3 ─── */}
          {/* 7. Physical Dimensions (Radius & Mass & Density) */}
          <Section title="Physical Properties" icon={Globe}>
            <SummaryGroup
              label="Planet Radius"
              summary={stats.radius}
              unit="R⊕ Earth Radii"
            />
            <SummaryGroup
              label="Planet Mass"
              summary={stats.mass}
              unit="M⊕ Earth Masses"
            />
            <SummaryGroup
              label="Planet Density"
              summary={stats.density}
              unit="g/cm³"
            />
          </Section>

          {/* 8. Orbital & Thermal Parameters */}
          <Section title="Orbital & Thermal" icon={Thermometer}>
            <SummaryGroup
              label="Equilibrium Temp"
              summary={stats.equilibrium_temperature}
              unit="Kelvin"
            />
            <SummaryGroup
              label="Orbital Period"
              summary={stats.orbital_period}
              unit="days"
            />
          </Section>

          {/* 9. Distance from Earth */}
          <Section title="Distance from Earth" icon={Compass}>
            <SummaryGroup
              label="Distance"
              summary={stats.distance}
              unit="parsecs"
            />
            {stats.distance?.average != null && (
              <StatRow
                label="Avg Light-Years"
                value={`~${Math.round(stats.distance.average * 3.262).toLocaleString()} ly`}
              />
            )}
          </Section>

          {/* ─── Bottom Full-Width ─── */}
          {/* 10. Data Quality & Completeness Stats */}
          <Section
            title="Parameter Completeness (Data Quality)"
            icon={CheckCircle2}
            className="col-span-1 sm:col-span-2 lg:col-span-3"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 pt-1">
              {completenessEntries.map(([field, ratio]) => {
                const rawVal = typeof ratio === "number" ? ratio : 0
                const pct = Math.min(100, Math.max(0, rawVal))
                const formattedField = field
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")

                return (
                  <div
                    key={field}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-white/5"
                  >
                    <span
                      className="text-slate-400 truncate pr-2"
                      title={formattedField}
                    >
                      {formattedField}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80
                              ? "bg-emerald-400"
                              : pct >= 50
                                ? "bg-cyan-400"
                                : "bg-amber-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-200 w-14 text-right font-medium">
                        {pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
