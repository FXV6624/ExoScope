import { Droplets, Layers, Sparkles } from "lucide-react"

export function FormulasTab() {
  return (
    <>
      {/* 1. Planet Class Boundaries */}
      <div className="space-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Layers size={14} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Planet Class Boundaries (Chen & Kipping 2017)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="rounded bg-card border border-border p-2 shadow-xs">
            <div className="text-cyan-600 dark:text-cyan-400 font-bold">
              Terrestrial
            </div>
            <div className="text-muted-foreground">
              &lt; 1.23 R⊕ / &lt; 2.04 M⊕
            </div>
          </div>
          <div className="rounded bg-card border border-border p-2 shadow-xs">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">
              Super Earth
            </div>
            <div className="text-muted-foreground">
              1.23 – 1.80 R⊕ / 2.04 – 6.0 M⊕
            </div>
          </div>
          <div className="rounded bg-card border border-border p-2 shadow-xs">
            <div className="text-purple-600 dark:text-purple-400 font-bold">
              Sub-Neptune
            </div>
            <div className="text-muted-foreground">
              1.80 – 3.90 R⊕ / 6.0 – 25 M⊕
            </div>
          </div>
          <div className="rounded bg-card border border-border p-2 shadow-xs">
            <div className="text-blue-600 dark:text-blue-400 font-bold">
              Neptune
            </div>
            <div className="text-muted-foreground">
              3.90 – 6.0 R⊕ / 25 – 130 M⊕
            </div>
          </div>
          <div className="rounded bg-card border border-border p-2 sm:col-span-2 shadow-xs">
            <div className="text-amber-600 dark:text-amber-400 font-bold">
              Gas Giant
            </div>
            <div className="text-muted-foreground">≥ 6.0 R⊕ / ≥ 130 M⊕</div>
          </div>
        </div>
      </div>

      {/* 2. Zeng Composition Curves */}
      <div className="space-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">
            <Droplets size={14} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Zeng Composition Curves (M-R Diagram)
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Theoretical mass-radius relationships: R = coefficient × M^exponent
          (R⊕, M⊕)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="rounded bg-card border border-border p-2 shadow-xs">
            <span className="text-red-600 dark:text-red-400 font-bold">
              Rocky-Iron:
            </span>{" "}
            R = 0.774 × M^0.274
          </div>
          <div className="rounded bg-card border border-border p-2 shadow-xs">
            <span className="text-orange-600 dark:text-orange-400 font-bold">
              Rocky (Earth-like):
            </span>{" "}
            R = 1.008 × M^0.279
          </div>
          <div className="rounded bg-card border border-border p-2 shadow-xs">
            <span className="text-sky-600 dark:text-sky-400 font-bold">
              Water World (50% H₂O):
            </span>{" "}
            R = 1.321 × M^0.284
          </div>
          <div className="rounded bg-card border border-border p-2 shadow-xs">
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">
              Ice (100% H₂O):
            </span>{" "}
            R = 1.557 × M^0.306
          </div>
          <div className="rounded bg-card border border-border p-2 sm:col-span-2 shadow-xs">
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              H₂/He Envelope:
            </span>{" "}
            R = 2.150 × M^0.320
          </div>
        </div>
      </div>

      {/* 3. Kopparapu HZ Formula */}
      <div className="space-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Sparkles size={14} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Habitable Zone Formula (Kopparapu et al. 2013)
          </h3>
        </div>
        <div className="rounded-lg bg-muted/60 border border-border p-3 font-mono text-xs text-cyan-700 dark:text-cyan-300 space-y-1">
          <p>S_eff = S_eff☉ + a·T* + b·T*² + c·T*³ + d·T*⁴</p>
          <p className="text-muted-foreground">where T* = T_eff − 5780 K</p>
        </div>
        <div className="space-y-2 text-xs text-foreground">
          <p>
            <strong>HZ Boundary Coefficients (S_eff☉):</strong>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
            <div className="rounded bg-card border border-border p-2 shadow-xs">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                Conservative Inner
              </div>
              <div className="text-muted-foreground text-[10px]">
                Runaway Greenhouse: 1.0466
              </div>
            </div>
            <div className="rounded bg-card border border-border p-2 shadow-xs">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                Conservative Outer
              </div>
              <div className="text-muted-foreground text-[10px]">
                Maximum Greenhouse: 0.3507
              </div>
            </div>
            <div className="rounded bg-card border border-border p-2 shadow-xs">
              <div className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                Optimistic Inner
              </div>
              <div className="text-muted-foreground text-[10px]">
                Recent Venus: 1.7763
              </div>
            </div>
            <div className="rounded bg-card border border-border p-2 shadow-xs">
              <div className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                Optimistic Outer
              </div>
              <div className="text-muted-foreground text-[10px]">
                Early Mars: 0.3207
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-muted/60 border border-border p-3 font-mono text-xs text-cyan-700 dark:text-cyan-300">
          Similarity = exp( − (value − optimum)² / (2 · σ²) )
        </div>
      </div>

      {/* References */}
      <div className="space-card rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Academic References
        </h3>
        <ul className="list-inside list-disc text-[11px] space-y-1 text-muted-foreground">
          <li>
            Chen & Kipping, 2017.{" "}
            <em>
              Probabilistic Forecasting of the Masses and Radii of Other Worlds
            </em>
            . ApJ 834, 17.
          </li>
          <li>
            Zeng et al., 2016.{" "}
            <em>Mass-Radius Relation for Rocky Planets based on PREM</em>. ApJ
            819, 127.
          </li>
          <li>
            Zeng et al., 2019.{" "}
            <em>Growth Model Interpretation of Planet Size Distribution</em>.
            PNAS 116, 9723.
          </li>
          <li>
            Kopparapu et al., 2013.{" "}
            <em>Habitable Zones Around Main-Sequence Stars: New Estimates</em>.
            ApJ 765, 131.
          </li>
        </ul>
      </div>
    </>
  )
}
