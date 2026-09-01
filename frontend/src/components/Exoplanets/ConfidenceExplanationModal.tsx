import {
  Calculator,
  Droplets,
  HelpCircle,
  Layers,
  Sparkles,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"

interface ConfidenceExplanationModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = "classification" | "formulas"

export function ConfidenceExplanationModal({
  isOpen,
  onClose,
}: ConfidenceExplanationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("classification")

  // Lock body scroll when modal is open so background cannot scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close classification explanation modal backdrop"
        className="fixed inset-0 bg-black/75 cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "#060d1f",
          border: "1px solid rgba(34, 211, 238, 0.3)",
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: "rgba(34,211,238,0.15)",
                color: "#22d3ee",
              }}
            >
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-space-primary">
                Methodology & Scientific Calculations
              </h2>
              <p className="text-xs text-space-muted">
                Peer-reviewed models for planetary classification and
                habitability assessment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-space-muted transition-colors hover:bg-white/10 hover:text-space-primary cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-900/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("classification")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "classification"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-space-muted hover:text-space-primary"
            }`}
          >
            <Sparkles size={14} />
            How Classification Works
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("formulas")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "formulas"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-space-muted hover:text-space-primary"
            }`}
          >
            <Calculator size={14} />
            Scientific References
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-space-subtle">
          {activeTab === "classification" ? (
            <>
              {/* Intro Banner */}
              <div
                className="rounded-xl p-4 text-xs leading-relaxed"
                style={{
                  background: "rgba(34,211,238,0.06)",
                  border: "1px solid rgba(34,211,238,0.2)",
                  color: "#93c5fd",
                }}
              >
                Our enrichment pipeline classifies exoplanets using
                peer-reviewed astrophysical models from{" "}
                <strong>Chen & Kipping (2017)</strong>,{" "}
                <strong>Zeng et al. (2016, 2019)</strong>, and{" "}
                <strong>Kopparapu et al. (2013)</strong>. Each classification
                includes a confidence score reflecting data quality, measurement
                availability, and model certainty.
              </div>

              {/* 1. Planet Class — Chen & Kipping 2017 */}
              <div
                className="rounded-xl p-4 space-y-2.5"
                style={{
                  background: "rgba(15,25,50,0.6)",
                  border: "1px solid rgba(34,211,238,0.15)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/20 text-cyan-400">
                    <Layers size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-space-primary">
                    1. Planet Class — Chen & Kipping (2017)
                  </h3>
                </div>
                <p className="text-xs text-space-muted leading-relaxed">
                  Classification uses{" "}
                  <strong>joint mass-radius analysis</strong> based on the
                  piecewise power-law regime boundaries from the Chen & Kipping
                  probabilistic forecaster model. When both measurements are
                  available, mass-radius consistency is checked:
                </p>
                <ul className="list-inside list-disc text-xs space-y-1.5 text-slate-300">
                  <li>
                    <span className="font-semibold text-cyan-300">
                      Both Mass + Radius:
                    </span>{" "}
                    <strong>90%</strong> base confidence. Radius sets the
                    primary class; mass consistency check modulates confidence
                    (±15–35%).
                  </li>
                  <li>
                    <span className="font-semibold text-cyan-300">
                      Radius Only:
                    </span>{" "}
                    <strong>70%</strong> base confidence.
                  </li>
                  <li>
                    <span className="font-semibold text-cyan-300">
                      Mass Only:
                    </span>{" "}
                    <strong>60%</strong> base confidence.
                  </li>
                  <li>
                    <span className="font-semibold text-amber-300">
                      Boundary Proximity:
                    </span>{" "}
                    A <strong>sigmoid penalty</strong> smoothly reduces
                    confidence near class transition boundaries (up to −30%).
                  </li>
                </ul>
              </div>

              {/* 2. Composition — Zeng et al. 2016/2019 */}
              <div
                className="rounded-xl p-4 space-y-2.5"
                style={{
                  background: "rgba(15,25,50,0.6)",
                  border: "1px solid rgba(192,132,252,0.15)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/20 text-purple-400">
                    <Droplets size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-space-primary">
                    2. Bulk Composition — Zeng et al. (2016, 2019)
                  </h3>
                </div>
                <p className="text-xs text-space-muted leading-relaxed">
                  Composition is determined by comparing the planet&apos;s
                  position on the <strong>mass-radius diagram</strong> against
                  Zeng&apos;s theoretical interior structure curves (Pure Iron,
                  Earth-like Rocky, Water World, Ice, H₂/He):
                </p>
                <ul className="list-inside list-disc text-xs space-y-1.5 text-slate-300">
                  <li>
                    <span className="font-semibold text-purple-300">
                      Mass + Radius (Zeng Curves):
                    </span>{" "}
                    <strong>90%</strong> base confidence. Distance from nearest
                    theoretical curve determines final confidence.
                  </li>
                  <li>
                    <span className="font-semibold text-purple-300">
                      Measured Density:
                    </span>{" "}
                    <strong>85%</strong> base confidence using NASA archive
                    density values.
                  </li>
                  <li>
                    <span className="font-semibold text-purple-300">
                      Estimated Density (M/R³ × ρ⊕):
                    </span>{" "}
                    <strong>70%</strong> base confidence. Uses the correct
                    Earth-density conversion factor (5.514 g/cm³).
                  </li>
                  <li>
                    <span className="font-semibold text-purple-300">
                      Radius Only:
                    </span>{" "}
                    <strong>50%</strong> base confidence from population
                    statistics.
                  </li>
                  <li>
                    <span className="font-semibold text-sky-300">
                      Zeng 2019 Interpretation:
                    </span>{" "}
                    Planets between the Water and H₂/He curves are classified as{" "}
                    <strong>Water Worlds</strong> rather than &quot;gas
                    dwarfs&quot;, following the water world hypothesis.
                  </li>
                </ul>
              </div>

              {/* 3. Habitability — Kopparapu et al. 2013 */}
              <div
                className="rounded-xl p-4 space-y-2.5"
                style={{
                  background: "rgba(15,25,50,0.6)",
                  border: "1px solid rgba(52,211,153,0.15)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-space-primary">
                    3. Habitability — Kopparapu et al. (2013)
                  </h3>
                </div>
                <p className="text-xs text-space-muted leading-relaxed">
                  Two-tier scoring system combining{" "}
                  <strong>Habitable Zone position</strong> with{" "}
                  <strong>planetary property analysis</strong>. Confidence =
                  data completeness × model precision.
                </p>

                {/* Tier 1 */}
                <div className="rounded-lg bg-slate-800/40 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-emerald-300">
                    Tier 1 — Habitable Zone Position (40% weight)
                  </p>
                  <p className="text-xs text-space-muted leading-relaxed">
                    Uses the Kopparapu polynomial to compute HZ boundaries for
                    each star type based on stellar effective temperature.
                    Conservative HZ (Runaway → Maximum Greenhouse) scores 1.0;
                    Optimistic HZ (Recent Venus → Early Mars) scores 0.7;
                    outside decays exponentially.
                  </p>
                  <p className="text-xs text-space-muted leading-relaxed">
                    When incident flux is missing, it is computed from stellar
                    luminosity and semi-major axis:{" "}
                    <code className="text-cyan-400 text-[11px]">
                      S = 10^(L_star) / a²
                    </code>
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="rounded-lg bg-slate-800/40 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-emerald-300">
                    Tier 2 — Planetary Properties (60% weight)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-1">
                    <div className="rounded bg-slate-900/60 p-2">
                      🌡️ Eq. Temp: <strong>15%</strong>
                      <div className="text-[10px] text-space-muted">
                        255 K (σ=50)
                      </div>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2">
                      🪐 Radius: <strong>10%</strong>
                      <div className="text-[10px] text-space-muted">
                        1.0 R⊕ (σ=0.7)
                      </div>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2">
                      ⚖️ Mass: <strong>8%</strong>
                      <div className="text-[10px] text-space-muted">
                        1.0 M⊕ (σ=2.5)
                      </div>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2">
                      💎 Density: <strong>7%</strong>
                      <div className="text-[10px] text-space-muted">
                        5.5 g/cm³ (σ=2.0)
                      </div>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2">
                      🌀 Eccentricity: <strong>8%</strong>
                      <div className="text-[10px] text-space-muted">
                        0.0 (σ=0.20)
                      </div>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2">
                      ☀️ Stellar Mass: <strong>5%</strong>
                      <div className="text-[10px] text-space-muted">
                        0.85 M☉ (σ=0.50)
                      </div>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2">
                      ⏳ Stellar Age: <strong>4%</strong>
                      <div className="text-[10px] text-space-muted">
                        4.0 Gyr (σ=2.5)
                      </div>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2">
                      🔥 Stellar Temp: <strong>3%</strong>
                      <div className="text-[10px] text-space-muted">
                        5300 K (σ=1200)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Scientific References Tab */}

              {/* 1. Planet Class Boundaries */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "rgba(15,25,50,0.6)",
                  border: "1px solid rgba(34,211,238,0.15)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/20 text-cyan-400">
                    <Layers size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-space-primary">
                    Planet Class Boundaries (Chen & Kipping 2017)
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-cyan-400 font-bold">Terrestrial</div>
                    <div className="text-space-muted">
                      &lt; 1.23 R⊕ / &lt; 2.04 M⊕
                    </div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-emerald-400 font-bold">
                      Super Earth
                    </div>
                    <div className="text-space-muted">
                      1.23 – 1.80 R⊕ / 2.04 – 6.0 M⊕
                    </div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-purple-400 font-bold">Sub-Neptune</div>
                    <div className="text-space-muted">
                      1.80 – 3.90 R⊕ / 6.0 – 25 M⊕
                    </div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-blue-400 font-bold">Neptune</div>
                    <div className="text-space-muted">
                      3.90 – 6.0 R⊕ / 25 – 130 M⊕
                    </div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2 sm:col-span-2">
                    <div className="text-amber-400 font-bold">Gas Giant</div>
                    <div className="text-space-muted">≥ 6.0 R⊕ / ≥ 130 M⊕</div>
                  </div>
                </div>
              </div>

              {/* 2. Zeng Composition Curves */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "rgba(15,25,50,0.6)",
                  border: "1px solid rgba(192,132,252,0.15)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/20 text-purple-400">
                    <Droplets size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-space-primary">
                    Zeng Composition Curves (M-R Diagram)
                  </h3>
                </div>
                <p className="text-xs text-space-muted leading-relaxed">
                  Theoretical mass-radius relationships: R = coefficient ×
                  M^exponent (R⊕, M⊕)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="rounded bg-slate-800/60 p-2">
                    <span className="text-red-400 font-bold">Rocky-Iron:</span>{" "}
                    R = 0.774 × M^0.274
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <span className="text-orange-400 font-bold">
                      Rocky (Earth-like):
                    </span>{" "}
                    R = 1.008 × M^0.279
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <span className="text-sky-400 font-bold">
                      Water World (50% H₂O):
                    </span>{" "}
                    R = 1.321 × M^0.284
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <span className="text-cyan-400 font-bold">
                      Ice (100% H₂O):
                    </span>{" "}
                    R = 1.557 × M^0.306
                  </div>
                  <div className="rounded bg-slate-800/60 p-2 sm:col-span-2">
                    <span className="text-purple-400 font-bold">
                      H₂/He Envelope:
                    </span>{" "}
                    R = 2.150 × M^0.320
                  </div>
                </div>
              </div>

              {/* 3. Kopparapu HZ Formula */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "rgba(15,25,50,0.6)",
                  border: "1px solid rgba(52,211,153,0.15)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-space-primary">
                    Habitable Zone Formula (Kopparapu et al. 2013)
                  </h3>
                </div>
                <div className="rounded-lg bg-slate-950/80 p-3 font-mono text-xs text-cyan-300 space-y-1">
                  <p>S_eff = S_eff☉ + a·T* + b·T*² + c·T*³ + d·T*⁴</p>
                  <p className="text-space-muted">where T* = T_eff − 5780 K</p>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    <strong>HZ Boundary Coefficients (S_eff☉):</strong>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                    <div className="rounded bg-slate-800/60 p-2">
                      <div className="text-emerald-400 font-bold text-[11px]">
                        Conservative Inner
                      </div>
                      <div className="text-space-muted text-[10px]">
                        Runaway Greenhouse: 1.0466
                      </div>
                    </div>
                    <div className="rounded bg-slate-800/60 p-2">
                      <div className="text-emerald-400 font-bold text-[11px]">
                        Conservative Outer
                      </div>
                      <div className="text-space-muted text-[10px]">
                        Maximum Greenhouse: 0.3507
                      </div>
                    </div>
                    <div className="rounded bg-slate-800/60 p-2">
                      <div className="text-amber-400 font-bold text-[11px]">
                        Optimistic Inner
                      </div>
                      <div className="text-space-muted text-[10px]">
                        Recent Venus: 1.7763
                      </div>
                    </div>
                    <div className="rounded bg-slate-800/60 p-2">
                      <div className="text-amber-400 font-bold text-[11px]">
                        Optimistic Outer
                      </div>
                      <div className="text-space-muted text-[10px]">
                        Early Mars: 0.3207
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-950/80 p-3 font-mono text-xs text-cyan-300">
                  Similarity = exp( − (value − optimum)² / (2 · σ²) )
                </div>
              </div>

              {/* References */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{
                  background: "rgba(15,25,50,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h3 className="text-xs font-semibold text-space-muted uppercase tracking-wider">
                  Academic References
                </h3>
                <ul className="list-inside list-disc text-[11px] space-y-1 text-slate-400">
                  <li>
                    Chen & Kipping, 2017.{" "}
                    <em>
                      Probabilistic Forecasting of the Masses and Radii of Other
                      Worlds
                    </em>
                    . ApJ 834, 17.
                  </li>
                  <li>
                    Zeng et al., 2016.{" "}
                    <em>
                      Mass-Radius Relation for Rocky Planets based on PREM
                    </em>
                    . ApJ 819, 127.
                  </li>
                  <li>
                    Zeng et al., 2019.{" "}
                    <em>
                      Growth Model Interpretation of Planet Size Distribution
                    </em>
                    . PNAS 116, 9723.
                  </li>
                  <li>
                    Kopparapu et al., 2013.{" "}
                    <em>
                      Habitable Zones Around Main-Sequence Stars: New Estimates
                    </em>
                    . ApJ 765, 131.
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-white/10 px-6 py-3.5 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2 text-xs font-medium text-space-primary transition-all cursor-pointer hover:bg-white/10"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
