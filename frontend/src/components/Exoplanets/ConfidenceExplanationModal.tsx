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
                How planetary classifications and confidence levels are computed
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
            Boundaries & Formulas
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
                Our pipeline assigns physical classifications based on
                astrophysical boundary thresholds, accompanied by a statistical
                confidence rating reflecting measurement availability and
                proximity to category transitions.
              </div>

              {/* 1. Planet Class Classification & Confidence */}
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
                    1. Planet Class (Physical Radius Boundaries)
                  </h3>
                </div>
                <p className="text-xs text-space-muted leading-relaxed">
                  A planet’s class is defined strictly by its physical radius
                  ($R_\oplus$) within astrophysical boundary intervals. Mass is
                  not used to change the category, but possessing a verified
                  mass increases confidence in the structural determination:
                </p>
                <ul className="list-inside list-disc text-xs space-y-1.5 text-slate-300">
                  <li>
                    <span className="font-semibold text-cyan-300">
                      Physical Boundaries:
                    </span>{" "}
                    &lt;1.25 R⊕ (Terrestrial), 1.25–2.0 R⊕ (Super Earth),
                    2.0–4.0 R⊕ (Sub-Neptune), 4.0–6.0 R⊕ (Neptune), 6.0–10.0 R⊕
                    (Ice Giant), ≥10.0 R⊕ (Gas Giant).
                  </li>
                  <li>
                    <span className="font-semibold text-cyan-300">
                      Base Confidence:
                    </span>{" "}
                    <strong>95%</strong> when both radius and mass are measured;{" "}
                    <strong>75%</strong> when only radius is available.
                  </li>
                  <li>
                    <span className="font-semibold text-amber-300">
                      Boundary Proximity Penalty:
                    </span>{" "}
                    A penalty of up to <strong>-20%</strong> is deducted if the
                    radius lies within a ±0.25 R⊕ margin of any transition
                    boundary (where classification uncertainty is higher).
                  </li>
                </ul>
              </div>

              {/* 2. Composition Classification & Confidence */}
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
                    2. Bulk Composition (Density Boundaries)
                  </h3>
                </div>
                <p className="text-xs text-space-muted leading-relaxed">
                  Bulk composition estimates the internal structure (Rocky-Iron,
                  Rocky, Water World, Ice, Hydrogen-Helium) derived
                  hierarchically:
                </p>
                <ul className="list-inside list-disc text-xs space-y-1.5 text-slate-300">
                  <li>
                    <span className="font-semibold text-purple-300">
                      Measured Density:
                    </span>{" "}
                    <strong>95% base confidence</strong> using direct
                    observational density from NASA archive.
                  </li>
                  <li>
                    <span className="font-semibold text-purple-300">
                      Calculated Density ($M/R^3$):
                    </span>{" "}
                    <strong>80% base confidence</strong> when bulk density is
                    derived from mass and radius.
                  </li>
                  <li>
                    <span className="font-semibold text-purple-300">
                      Radius Boundary Fallback:
                    </span>{" "}
                    <strong>60% base confidence</strong> when only radius is
                    known.
                  </li>
                  <li>
                    <span className="font-semibold text-amber-300">
                      Boundary Penalty:
                    </span>{" "}
                    Up to <strong>-20%</strong> penalty when density is within
                    0.5 g/cm³ of a boundary (1.0, 2.0, 4.0, 6.0 g/cm³).
                  </li>
                </ul>
              </div>

              {/* 3. Habitability Score & Confidence */}
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
                    3. Habitability Score & Parameter Completeness
                  </h3>
                </div>
                <p className="text-xs text-space-muted leading-relaxed">
                  The habitability score evaluates Earth-similarity across 7
                  criteria. The <strong>confidence percentage</strong> matches
                  the exact sum of weights of parameters available for this
                  planet:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-1">
                  <div className="rounded bg-slate-800/60 p-2">
                    🌡️ Eq. Temp: <strong>30%</strong>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    🔥 Incident Flux: <strong>20%</strong>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    🪐 Planet Radius: <strong>15%</strong>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    ⚖️ Planet Mass: <strong>10%</strong>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    ⏳ Stellar Age: <strong>10%</strong>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    🌀 Eccentricity: <strong>10%</strong>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2 col-span-2">
                    ☀️ Stellar Mass: <strong>5%</strong>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Boundaries & Formulas Tab */}
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
                    Planet Class Radius Boundaries
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-cyan-400 font-bold">Terrestrial</div>
                    <div className="text-space-muted">&lt; 1.25 R⊕</div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-emerald-400 font-bold">
                      Super Earth
                    </div>
                    <div className="text-space-muted">1.25 – 2.0 R⊕</div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-purple-400 font-bold">Sub-Neptune</div>
                    <div className="text-space-muted">2.0 – 4.0 R⊕</div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-blue-400 font-bold">Neptune</div>
                    <div className="text-space-muted">4.0 – 6.0 R⊕</div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-sky-400 font-bold">Ice Giant</div>
                    <div className="text-space-muted">6.0 – 10.0 R⊕</div>
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <div className="text-amber-400 font-bold">Gas Giant</div>
                    <div className="text-space-muted">≥ 10.0 R⊕</div>
                  </div>
                </div>
              </div>

              {/* 2. Bulk Composition Boundaries */}
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
                    Bulk Composition Density Boundaries
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="rounded bg-slate-800/60 p-2">
                    <span className="text-red-400 font-bold">Rocky-Iron:</span>{" "}
                    Density ≥ 6.0 g/cm³
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <span className="text-orange-400 font-bold">Rocky:</span>{" "}
                    Density ≥ 4.0 g/cm³ (or R &lt; 1.6 R⊕)
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <span className="text-sky-400 font-bold">Water World:</span>{" "}
                    Density ≥ 2.0 g/cm³ (or R &lt; 2.4 R⊕)
                  </div>
                  <div className="rounded bg-slate-800/60 p-2">
                    <span className="text-cyan-400 font-bold">Ice:</span>{" "}
                    Density ≥ 1.0 g/cm³ (or R &lt; 6.0 R⊕)
                  </div>
                  <div className="rounded bg-slate-800/60 p-2 sm:col-span-2">
                    <span className="text-purple-400 font-bold">
                      Hydrogen-Helium:
                    </span>{" "}
                    Density &lt; 1.0 g/cm³ (or R ≥ 6.0 R⊕)
                  </div>
                </div>
              </div>

              {/* 3. Habitability Score Formula */}
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
                    Habitability Score Formula (Gaussian Similarity)
                  </h3>
                </div>
                <p className="text-xs text-space-muted leading-relaxed">
                  Weighted sum of individual Gaussian similarity curves relative
                  to Earth-like optimums:
                </p>
                <div className="rounded-lg bg-slate-950/80 p-3 font-mono text-xs text-cyan-300">
                  Similarity = exp( - (value - optimum)² / (2 · σ²) )
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>
                    <strong>Optimal Values & Tolerances (σ):</strong>
                  </p>
                  <ul className="list-inside list-disc space-y-0.5 text-space-muted">
                    <li>Equilibrium Temp: 288 K (σ = 30 K)</li>
                    <li>Incident Flux: 1.0 F⊕ (σ = 0.3)</li>
                    <li>Radius: 1.0 R⊕ (σ = 0.3 R⊕)</li>
                    <li>Mass: 1.0 M⊕ (σ = 0.5 M⊕)</li>
                    <li>Eccentricity: 0.0 (σ = 0.05)</li>
                    <li>Stellar Age: 4.6 Gyr (σ = 2.0 Gyr)</li>
                    <li>Stellar Mass: 1.0 M☉ (σ = 0.2 M☉)</li>
                  </ul>
                </div>
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
