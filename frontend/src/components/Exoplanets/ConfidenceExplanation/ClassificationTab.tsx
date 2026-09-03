import { Droplets, Layers, Sparkles } from "lucide-react"

export function ClassificationTab() {
  return (
    <>
      {/* Intro Banner */}
      <div className="rounded-xl p-4 text-xs leading-relaxed bg-cyan-50 border border-cyan-200 text-cyan-950 dark:bg-cyan-950/40 dark:border-cyan-500/30 dark:text-cyan-200">
        Our enrichment pipeline classifies exoplanets using peer-reviewed
        astrophysical models from <strong>Chen & Kipping (2017)</strong>,{" "}
        <strong>Zeng et al. (2016, 2019)</strong>, and{" "}
        <strong>Kopparapu et al. (2013)</strong>. Each classification includes a
        confidence score reflecting data quality, measurement availability, and
        model certainty.
      </div>

      {/* 1. Planet Class — Chen & Kipping 2017 */}
      <div className="space-card rounded-xl p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Layers size={14} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            1. Planet Class — Chen & Kipping (2017)
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Classification uses <strong>joint mass-radius analysis</strong> based
          on the piecewise power-law regime boundaries from the Chen & Kipping
          probabilistic forecaster model. When both measurements are available,
          mass-radius consistency is checked:
        </p>
        <ul className="list-inside list-disc text-xs space-y-1.5 text-foreground">
          <li>
            <span className="font-semibold text-cyan-600 dark:text-cyan-300">
              Both Mass + Radius:
            </span>{" "}
            <strong>90%</strong> base confidence. Radius sets the primary class;
            mass consistency check modulates confidence (±15–35%).
          </li>
          <li>
            <span className="font-semibold text-cyan-600 dark:text-cyan-300">
              Radius Only:
            </span>{" "}
            <strong>70%</strong> base confidence.
          </li>
          <li>
            <span className="font-semibold text-cyan-600 dark:text-cyan-300">
              Mass Only:
            </span>{" "}
            <strong>60%</strong> base confidence.
          </li>
          <li>
            <span className="font-semibold text-amber-600 dark:text-amber-300">
              Boundary Proximity:
            </span>{" "}
            A <strong>sigmoid penalty</strong> smoothly reduces confidence near
            class transition boundaries (up to −30%).
          </li>
        </ul>
      </div>

      {/* 2. Composition — Zeng et al. 2016/2019 */}
      <div className="space-card rounded-xl p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">
            <Droplets size={14} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            2. Bulk Composition — Zeng et al. (2016, 2019)
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Composition is determined by comparing the planet&apos;s position on
          the <strong>mass-radius diagram</strong> against Zeng&apos;s
          theoretical interior structure curves (Pure Iron, Earth-like Rocky,
          Water World, Ice, H₂/He):
        </p>
        <ul className="list-inside list-disc text-xs space-y-1.5 text-foreground">
          <li>
            <span className="font-semibold text-purple-600 dark:text-purple-300">
              Mass + Radius (Zeng Curves):
            </span>{" "}
            <strong>90%</strong> base confidence. Distance from nearest
            theoretical curve determines final confidence.
          </li>
          <li>
            <span className="font-semibold text-purple-600 dark:text-purple-300">
              Measured Density:
            </span>{" "}
            <strong>85%</strong> base confidence using NASA archive density
            values.
          </li>
          <li>
            <span className="font-semibold text-purple-600 dark:text-purple-300">
              Estimated Density (M/R³ × ρ⊕):
            </span>{" "}
            <strong>70%</strong> base confidence. Uses the correct Earth-density
            conversion factor (5.514 g/cm³).
          </li>
          <li>
            <span className="font-semibold text-purple-600 dark:text-purple-300">
              Radius Only:
            </span>{" "}
            <strong>50%</strong> base confidence from population statistics.
          </li>
          <li>
            <span className="font-semibold text-cyan-600 dark:text-cyan-300">
              Zeng 2019 Interpretation:
            </span>{" "}
            Planets between the Water and H₂/He curves are classified as{" "}
            <strong>Water Worlds</strong> rather than &quot;gas dwarfs&quot;,
            following the water world hypothesis.
          </li>
        </ul>
      </div>

      {/* 3. Habitability — Kopparapu et al. 2013 */}
      <div className="space-card rounded-xl p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Sparkles size={14} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            3. Habitability — Kopparapu et al. (2013)
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Two-tier scoring system combining{" "}
          <strong>Habitable Zone position</strong> with{" "}
          <strong>planetary property analysis</strong>. Confidence = data
          completeness × model precision.
        </p>

        {/* Tier 1 */}
        <div className="rounded-lg bg-card border border-border p-3 space-y-1.5 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            Tier 1 — Habitable Zone Position (40% weight)
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Uses the Kopparapu polynomial to compute HZ boundaries for each star
            type based on stellar effective temperature. Conservative HZ
            (Runaway → Maximum Greenhouse) scores 1.0; Optimistic HZ (Recent
            Venus → Early Mars) scores 0.7; outside decays exponentially.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When incident flux is missing, it is computed from stellar
            luminosity and semi-major axis:{" "}
            <code className="text-cyan-600 dark:text-cyan-400 text-[11px] font-mono">
              S = 10^(L_star) / a²
            </code>
          </p>
        </div>

        {/* Tier 2 */}
        <div className="rounded-lg bg-card border border-border p-3 space-y-1.5 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            Tier 2 — Planetary Properties (60% weight)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-foreground pt-1">
            <div className="rounded bg-muted/60 border border-border p-2">
              🌡️ Eq. Temp: <strong>15%</strong>
              <div className="text-[10px] text-muted-foreground">
                255 K (σ=50)
              </div>
            </div>
            <div className="rounded bg-muted/60 border border-border p-2">
              🪐 Radius: <strong>10%</strong>
              <div className="text-[10px] text-muted-foreground">
                1.0 R⊕ (σ=0.7)
              </div>
            </div>
            <div className="rounded bg-muted/60 border border-border p-2">
              ⚖️ Mass: <strong>8%</strong>
              <div className="text-[10px] text-muted-foreground">
                1.0 M⊕ (σ=2.5)
              </div>
            </div>
            <div className="rounded bg-muted/60 border border-border p-2">
              💎 Density: <strong>7%</strong>
              <div className="text-[10px] text-muted-foreground">
                5.5 g/cm³ (σ=2.0)
              </div>
            </div>
            <div className="rounded bg-muted/60 border border-border p-2">
              🌀 Eccentricity: <strong>8%</strong>
              <div className="text-[10px] text-muted-foreground">
                0.0 (σ=0.20)
              </div>
            </div>
            <div className="rounded bg-muted/60 border border-border p-2">
              ☀️ Stellar Mass: <strong>5%</strong>
              <div className="text-[10px] text-muted-foreground">
                0.85 M☉ (σ=0.50)
              </div>
            </div>
            <div className="rounded bg-muted/60 border border-border p-2">
              ⏳ Stellar Age: <strong>4%</strong>
              <div className="text-[10px] text-muted-foreground">
                4.0 Gyr (σ=2.5)
              </div>
            </div>
            <div className="rounded bg-muted/60 border border-border p-2">
              🔥 Stellar Temp: <strong>3%</strong>
              <div className="text-[10px] text-muted-foreground">
                5300 K (σ=1200)
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
