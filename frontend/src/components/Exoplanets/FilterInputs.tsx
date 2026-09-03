import type { PlanetClass, PlanetComposition } from "@/client"

export const PLANET_CLASSES: PlanetClass[] = [
  "Terrestrial",
  "Super Earth",
  "Sub-Neptune",
  "Neptune",
  "Ice Giant",
  "Gas Giant",
  "Unknown",
]

export const COMPOSITIONS: PlanetComposition[] = [
  "Rocky",
  "Rocky-Iron",
  "Water World",
  "Ice",
  "Hydrogen-Helium",
  "Unknown",
]

export const DISCOVERY_METHODS = [
  "Transit",
  "Radial Velocity",
  "Imaging",
  "Microlensing",
  "Astrometry",
  "Timing",
  "Eclipse Timing Variations",
  "Pulsar Timing",
  "Disk Kinematics",
  "Other",
]

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-border pb-1.5 pt-2">
      <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
        {title}
      </span>
    </div>
  )
}

export function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string | null | undefined
  placeholder?: string
  onChange: (v: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type="text"
        placeholder={placeholder || label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? e.target.value : null)}
        className="w-full rounded-lg px-3 py-1.5 text-sm bg-card border border-border text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

export function NumberRangeInput({
  label,
  minValue,
  maxValue,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  onMinChange,
  onMaxChange,
}: {
  label: string
  minValue: number | null | undefined
  maxValue: number | null | undefined
  minPlaceholder?: string
  maxPlaceholder?: string
  onMinChange: (v: number | null) => void
  onMaxChange: (v: number | null) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          placeholder={minPlaceholder}
          value={minValue ?? ""}
          onChange={(e) =>
            onMinChange(e.target.value !== "" ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg px-3 py-1.5 text-sm bg-card border border-border text-foreground outline-none placeholder:text-muted-foreground"
        />
        <span className="text-muted-foreground">–</span>
        <input
          type="number"
          step="any"
          placeholder={maxPlaceholder}
          value={maxValue ?? ""}
          onChange={(e) =>
            onMaxChange(e.target.value !== "" ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg px-3 py-1.5 text-sm bg-card border border-border text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}

export function ConfidenceSliderInput({
  label,
  minValue,
  maxValue,
  accentColor = "accent-cyan-400",
  onMinChange,
  onMaxChange,
}: {
  label: string
  minValue: number | null | undefined
  maxValue: number | null | undefined
  accentColor?: string
  onMinChange: (v: number | null) => void
  onMaxChange: (v: number | null) => void
}) {
  const minPercent = minValue != null ? Math.round(minValue * 100) : 0
  const maxPercent = maxValue != null ? Math.round(maxValue * 100) : 100
  const isFiltered = minValue != null || maxValue != null

  return (
    <div
      className={`flex flex-col gap-2.5 rounded-xl p-3.5 transition-all shadow-xs ${
        isFiltered
          ? "bg-cyan-50 border border-cyan-300 dark:bg-cyan-950/40 dark:border-cyan-500/30"
          : "space-card"
      }`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground font-semibold">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold text-xs">
            {minValue != null ? `${minPercent}%` : "0%"}
            {" – "}
            {maxValue != null ? `${maxPercent}%` : "100%"}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                onMinChange(null)
                onMaxChange(null)
              }}
              className="text-[10px] text-muted-foreground hover:text-cyan-500 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Min Confidence Slider */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Minimum Confidence:</span>
          <span className="font-mono text-foreground font-medium">
            ≥ {minPercent}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={minPercent}
          onChange={(e) => {
            const val = Number(e.target.value)
            onMinChange(val > 0 ? val / 100 : null)
          }}
          className={`w-full ${accentColor} cursor-pointer`}
        />
      </div>

      {/* Max Confidence Slider */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Maximum Confidence:</span>
          <span className="font-mono text-foreground font-medium">
            ≤ {maxPercent}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={maxPercent}
          onChange={(e) => {
            const val = Number(e.target.value)
            onMaxChange(val < 100 ? val / 100 : null)
          }}
          className={`w-full ${accentColor} cursor-pointer`}
        />
      </div>
    </div>
  )
}
