/**
 * Centralized badge color tokens and scoring color helpers.
 */

export const METHOD_BADGE_CLASSES: Record<string, string> = {
  Transit:
    "bg-cyan-100 text-cyan-800 border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40",
  Imaging:
    "bg-pink-100 text-pink-800 border-pink-400 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40",
  "Radial Velocity":
    "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
  Microlensing:
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-400 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:border-fuchsia-500/40",
  Astrometry:
    "bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
  Timing:
    "bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
  "Eclipse Timing Variations":
    "bg-indigo-100 text-indigo-800 border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40",
  "Pulsar Timing":
    "bg-violet-100 text-violet-800 border-violet-400 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40",
  "Disk Kinematics":
    "bg-teal-100 text-teal-800 border-teal-400 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40",
}

export const CLASS_BADGE_CLASSES: Record<string, string> = {
  Terrestrial:
    "bg-cyan-100 text-cyan-800 border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40",
  "Super Earth":
    "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40",
  "Sub-Neptune":
    "bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
  Neptune:
    "bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
  "Ice Giant":
    "bg-sky-100 text-sky-800 border-sky-400 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40",
  "Gas Giant":
    "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
  Unknown:
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700",
}

export const COMPOSITION_BADGE_CLASSES: Record<string, string> = {
  Rocky:
    "bg-orange-100 text-orange-800 border-orange-400 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/40",
  "Rocky-Iron":
    "bg-red-100 text-red-800 border-red-400 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40",
  "Water World":
    "bg-sky-100 text-sky-800 border-sky-400 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40",
  Ice: "bg-teal-100 text-teal-800 border-teal-400 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40",
  "Hydrogen-Helium":
    "bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
  Unknown:
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700",
}

export const DEFAULT_BADGE_CLASS =
  "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700"

export function getHabitabilityScoreColor(score: number): string {
  const pct = Math.min(100, Math.max(0, score))
  if (pct >= 70) return "#059669"
  if (pct >= 40) return "#d97706"
  return "#dc2626"
}

export const CLASS_HEX_COLORS: Record<string, string> = {
  Terrestrial: "#22d3ee",
  "Super Earth": "#34d399",
  "Sub-Neptune": "#c084fc",
  Neptune: "#60a5fa",
  "Ice Giant": "#93c5fd",
  "Gas Giant": "#fbbf24",
  Unknown: "#94a3b8",
}

export const COMPOSITION_HEX_COLORS: Record<string, string> = {
  Rocky: "#fb923c",
  "Rocky-Iron": "#f87171",
  "Water World": "#38bdf8",
  Ice: "#a5f3fc",
  "Hydrogen-Helium": "#c084fc",
  Unknown: "#94a3b8",
}
